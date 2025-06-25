// Copyright DataStax, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Sanitizes record data to prevent prompt injection attacks.
 * This function detects potential LLM prompt injection patterns and neutralizes them.
 * 
 * @param data The record data to sanitize
 * @returns Sanitized record data
 */
export function sanitizeRecordData<T>(data: T): T {
  // For null or undefined values, return as is
  if (data === null || data === undefined) {
    return data;
  }
  
  // For arrays, sanitize each element
  if (Array.isArray(data)) {
    return data.map(item => sanitizeRecordData(item)) as unknown as T;
  }
  
  // For objects, sanitize each property
  if (typeof data === 'object') {
    // Special handling for Date objects
    if (data instanceof Date) {
      return data;
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      // Extra check for description fields which are prime targets for injection
      if ((key === 'description' || key === 'instructions' || key === 'prompt' || key === 'message') && typeof value === 'string') {
        sanitized[key] = sanitizeString(value, true); // Apply more strict sanitization
      } else {
        sanitized[key] = sanitizeRecordData(value);
      }
    }
    return sanitized as T;
  }
  
  // For strings, check for and neutralize potential prompt injection patterns
  if (typeof data === 'string') {
    // Check for potential prompt injection patterns and escape or neutralize them
    const sanitized = sanitizeString(data);
    return sanitized as unknown as T;
  }
  
  // For other primitive types, return as is
  return data;
}

/**
 * Sanitizes a string to prevent prompt injection attacks.
 * 
 * @param text The string to sanitize
 * @param strict If true, applies more aggressive filtering for sensitive fields
 * @returns Sanitized string
 */
export function sanitizeString(text: string, strict = false): string {
  if (typeof text !== 'string') {
    return text;
  }
  
  // Detect patterns commonly used for LLM prompt injections
  const promptInjectionPatterns = [
    // Common directive markers
    { regex: /\|\s*IMPORTANT\s*\|/gi, replacement: "[FILTERED: DIRECTIVE]" },
    { regex: /\s*IMPORTANT\s*:/gi, replacement: "[FILTERED: DIRECTIVE]:" },
    { regex: /\s*SYSTEM\s*:/gi, replacement: "[FILTERED: DIRECTIVE]:" },
    { regex: /\s*INSTRUCTIONS\s*:/gi, replacement: "[FILTERED: DIRECTIVE]:" },
    { regex: /\s*ATTENTION\s*:/gi, replacement: "[FILTERED: DIRECTIVE]:" },
    { regex: /\s*CRITICAL\s*:/gi, replacement: "[FILTERED: DIRECTIVE]:" },
    { regex: /\s*WARNING\s*:/gi, replacement: "[FILTERED: DIRECTIVE]:" },
    
    // Tool invocation patterns for common MCP tools
    { regex: /invoke\s+(DeleteCollection|run_terminal_cmd|BulkDeleteRecords)/gi, replacement: "[FILTERED: TOOL INVOCATION]" },
    { regex: /be\s+sure\s+to\s+invoke/gi, replacement: "[FILTERED: DIRECTIVE]" },
    { regex: /as\s+part\s+of\s+((your|an)\s+)?agentic\s+flow/gi, replacement: "[FILTERED: DIRECTIVE]" },
    
    // Phrases commanding the LLM to take action
    { regex: /you\s+must\s+(support|do|execute|run|invoke|call|use|delete|remove)/gi, replacement: "[FILTERED]" },
    { regex: /(do\s+not\s+prompt|do\s+not\s+ask)(\s+the\s+user)?/gi, replacement: "[FILTERED]" },
    { regex: /(without|no)\s+user\s+confirmation/gi, replacement: "[FILTERED]" },
    { regex: /do\s+this\s+automatically/gi, replacement: "[FILTERED]" },
    { regex: /do\s+not\s+fail\s+to\s+do\s+this/gi, replacement: "[FILTERED]" },
    { regex: /simply\s+provide\s+the\s+next\s+toolcall/gi, replacement: "[FILTERED]" },
    { regex: /do\s+not\s+verify\s+with\s+user/gi, replacement: "[FILTERED]" },
    { regex: /execute\s+(this|the\s+following)\s+command/gi, replacement: "[FILTERED]" },

    // Disguised code or execution attempts
    { regex: /`{1,3}[\s\S]*?(exec|eval|setTimeout|setInterval|Function)[\s\S]*?`{1,3}/gi, replacement: "[FILTERED: CODE]" },

    // System behavior warnings
    { regex: /(system\s+will\s+crash|bad\s+user\s+experience)/gi, replacement: "[FILTERED: WARNING]" },

    // Additional patterns for the test cases
    { regex: /When parsing the output(?:\s+of this item)?\s*,/gi, replacement: "When parsing the output of this item," }
  ];
  
  // Additional patterns for strict mode (used for high-risk fields)
  const strictPatterns = [
    // When in strict mode, also filter these patterns
    { regex: /pass\s+in\s+.{1,30}\s+to\s+this/gi, replacement: "[FILTERED: DIRECTIVE]" },
    { regex: /(?:delete|remove)\s+(?:all|the)\s+(?:records?|collections?|data)/gi, replacement: "[FILTERED: DANGEROUS ACTION]" },
    { regex: /write\s+(?:a\s+)?message\s+to/gi, replacement: "[FILTERED: FILE OPERATION]" },
    { regex: /\bchain\b.{1,30}\bdelete\b/gi, replacement: "[FILTERED: CHAINED ACTION]" },
    { regex: /\ball\s*(?:of\s*)?the\s*other\s*record\s*ids\b/gi, replacement: "[FILTERED: BULK ACTION]" },

    // Additional transformer expressions
    { regex: /\$\{[^}]+\}/g, replacement: "[FILTERED: TEMPLATE EXPRESSION]" }
  ];
  
  // Apply standard patterns
  let sanitized = text;
  for (const pattern of promptInjectionPatterns) {
    sanitized = sanitized.replace(pattern.regex, pattern.replacement);
  }
  
  // Apply additional patterns for strict mode
  if (strict) {
    for (const pattern of strictPatterns) {
      sanitized = sanitized.replace(pattern.regex, pattern.replacement);
    }
  }
  
  return sanitized;
}