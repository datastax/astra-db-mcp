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
import { AstraError, AstraErrorCode } from "../util/errors.js";

type FindDistinctValuesArgs = {
  collectionName: string;
  field: string;
  filter?: Record<string, any>;
};

type FindDistinctValuesResult = any[];

/**
 * Find distinct values for a field in a collection
 * 
 * @param params Parameters for finding distinct values
 * @returns Array of distinct values for the specified field
 */
export async function FindDistinctValues({
  collectionName,
  field,
  filter = {},
}: FindDistinctValuesArgs): Promise<FindDistinctValuesResult> {
  if (!collectionName) {
    throw new AstraError(
      AstraErrorCode.COLLECTION_NOT_FOUND,
      "Collection name is required",
      { parameter: "collectionName" }
    );
  }

  if (!field) {
    throw new AstraError(
      AstraErrorCode.RECORD_VALIDATION_ERROR,
      "Field name is required",
      { parameter: "field" }
    );
  }

  const collection = db.collection(collectionName);
  
  try {
    // Use the distinct method to get unique values for the field if available
    if (typeof collection.distinct === 'function') {
      const distinctValues = await collection.distinct(field, filter);
      return sanitizeRecordData(distinctValues);
    } else {
      // Fallback implementation if distinct is not available
      try {
        const cursor = collection.find(filter);
        let records: Record<string, any>[] = [];
        
        if (typeof cursor.toArray === 'function') {
          records = await cursor.toArray();
        } else {
          // If toArray is not available, return an empty array
          console.warn("cursor.toArray is not available, returning empty array");
          records = [];
        }
        
        const distinctValues = new Set();
        
        for (const record of records) {
          if (record[field] !== undefined) {
            distinctValues.add(record[field]);
          }
        }
        
        return sanitizeRecordData(Array.from(distinctValues));
      } catch (error) {
        console.error(`Error in fallback distinct implementation:`, error);
        return [];
      }
    }
  } catch (error) {
    console.error(`Error finding distinct values for field '${field}':`, error);
    throw error;
  }
}

// Made with Bob
