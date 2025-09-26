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

import { db } from "../util/db.js";
import { sanitizeRecordData } from "../util/sanitize.js";

export async function FindRecord(params: {
  collectionName: string;
  field: string;
  value: string;
  limit?: number;
}) {
  const { collectionName, field, value, limit = 10 } = params;

  const collection = db.collection(collectionName);

  // Handle special case for _id field
  if (field === "_id" || field === "id") {
    try {
      // Try to find by exact ID
      const record = await collection.findOne({ _id: value });
      return record ? [record] : [];
    } catch (error) {
      // If ID lookup fails, fall back to regular search
      console.error("ID lookup failed, falling back to regular search:", error);
    }
  }

  // Create a dynamic query object for the field search
  const query: Record<string, any> = {};

  // Support for searching nested fields using dot notation
  query[field] = value;

  // Perform the search
  let results: any[] = [];
  try {
    const cursor = collection.find(query);
    
    // Handle the case when toArray is not available
    if (!cursor || typeof cursor.toArray !== 'function') {
      console.warn(`cursor.toArray is not available for query on field '${field}'`);
      return [];
    }
    
    if (typeof cursor.limit === 'function') {
      results = await cursor.limit(limit).toArray();
    } else {
      // Fallback if limit is not available
      const allResults = await cursor.toArray();
      results = allResults.slice(0, limit);
    }
  } catch (error) {
    console.error("Search failed:", error);
    results = [];
  }

  // If no results found with exact match, try partial text search
  if (results.length === 0) {
    try {
      // Create a regex pattern for partial matching
      // Escape special regex characters in the search value
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regexPattern = new RegExp(escapedValue, "i"); // 'i' for case-insensitive

      const regexQuery: Record<string, any> = {};
      regexQuery[field] = regexPattern;

      let regexResults: any[] = [];
      try {
        const cursor = collection.find(regexQuery);
        
        // Handle the case when toArray is not available
        if (!cursor || typeof cursor.toArray !== 'function') {
          console.warn(`cursor.toArray is not available for regex query on field '${field}'`);
          return [];
        }
        
        if (typeof cursor.limit === 'function') {
          regexResults = await cursor.limit(limit).toArray();
        } else {
          // Fallback if limit is not available
          const allResults = await cursor.toArray();
          regexResults = allResults.slice(0, limit);
        }
        return sanitizeRecordData(regexResults);
      } catch (error) {
        console.error("Regex search failed:", error);
        return [];
      }
    } catch (error) {
      console.error("Regex search failed:", error);
      return [];
    }
  }

  // Return sanitized results to prevent prompt injection attacks
  return sanitizeRecordData(results);
}
