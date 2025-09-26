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
 * Error codes for Astra DB operations
 */
export enum AstraErrorCode {
  // Authentication errors
  AUTH_MISSING_CREDENTIALS = "AUTH_MISSING_CREDENTIALS",
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  
  // Collection errors
  COLLECTION_NOT_FOUND = "COLLECTION_NOT_FOUND",
  COLLECTION_ALREADY_EXISTS = "COLLECTION_ALREADY_EXISTS",
  COLLECTION_INVALID_NAME = "COLLECTION_INVALID_NAME",
  
  // Record errors
  RECORD_NOT_FOUND = "RECORD_NOT_FOUND",
  RECORD_INVALID_ID = "RECORD_INVALID_ID",
  RECORD_VALIDATION_ERROR = "RECORD_VALIDATION_ERROR",
  
  // Vector errors
  VECTOR_DIMENSION_MISMATCH = "VECTOR_DIMENSION_MISMATCH",
  VECTOR_COLLECTION_REQUIRED = "VECTOR_COLLECTION_REQUIRED",
  
  // Operation errors
  OPERATION_TIMEOUT = "OPERATION_TIMEOUT",
  OPERATION_RATE_LIMITED = "OPERATION_RATE_LIMITED",
  OPERATION_NOT_SUPPORTED = "OPERATION_NOT_SUPPORTED",
  
  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  
  // Unknown errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

/**
 * Base class for Astra DB errors
 */
export class AstraError extends Error {
  code: AstraErrorCode;
  details?: Record<string, any>;
  
  constructor(code: AstraErrorCode, message: string, details?: Record<string, any>) {
    super(message);
    this.name = "AstraError";
    this.code = code;
    this.details = details;
  }
  
  /**
   * Convert the error to a structured response object
   */
  toResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      }
    };
  }
  
  /**
   * Convert the error to a user-friendly message
   */
  toUserMessage() {
    return `Error [${this.code}]: ${this.message}`;
  }
}

/**
 * Create an appropriate error from any caught exception
 */
export function createErrorFromException(error: unknown): AstraError {
  if (error instanceof AstraError) {
    return error;
  }
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Authentication errors
  if (
    errorMessage.includes("ASTRA_DB_API_ENDPOINT") ||
    errorMessage.includes("ASTRA_DB_APPLICATION_TOKEN") ||
    !process.env.ASTRA_DB_API_ENDPOINT ||
    !process.env.ASTRA_DB_APPLICATION_TOKEN
  ) {
    return new AstraError(
      AstraErrorCode.AUTH_MISSING_CREDENTIALS,
      "Missing Astra DB credentials. Please configure your ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN.",
      { needsConfiguration: true }
    );
  }
  
  // Network errors
  if (
    errorMessage.includes("Invalid URL") ||
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("Network error")
  ) {
    return new AstraError(
      AstraErrorCode.NETWORK_ERROR,
      "Network error while connecting to Astra DB. Please check your connection and API endpoint.",
      { originalError: errorMessage }
    );
  }
  
  // Collection not found
  if (errorMessage.includes("collection not found") || errorMessage.includes("namespace not found")) {
    return new AstraError(
      AstraErrorCode.COLLECTION_NOT_FOUND,
      "The specified collection was not found.",
      { originalError: errorMessage }
    );
  }
  
  // Record not found
  if (errorMessage.includes("document not found") || errorMessage.includes("not found")) {
    return new AstraError(
      AstraErrorCode.RECORD_NOT_FOUND,
      "The specified record was not found.",
      { originalError: errorMessage }
    );
  }
  
  // Default to unknown error
  return new AstraError(
    AstraErrorCode.UNKNOWN_ERROR,
    `An unexpected error occurred: ${errorMessage}`,
    { originalError: errorMessage }
  );
}

// Made with Bob
