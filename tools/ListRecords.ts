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

export async function ListRecords(params: {
  collectionName: string;
  limit?: number;
}) {
  const { collectionName, limit = 10 } = params;

  const collection = db.collection(collectionName);
  
  try {
    // Try to use the limit method if available
    const cursor = collection.find({});
    
    // Handle the case when toArray is not available
    if (!cursor || typeof cursor.toArray !== 'function') {
      console.warn(`cursor.toArray is not available for collection '${collectionName}'`);
      return sanitizeRecordData([]);
    }
    
    if (typeof cursor.limit === 'function') {
      const records = await cursor.limit(limit).toArray();
      return sanitizeRecordData(records);
    } else {
      // Fallback if limit is not available
      const allRecords = await cursor.toArray();
      const limitedRecords = allRecords.slice(0, limit);
      return sanitizeRecordData(limitedRecords);
    }
  } catch (error) {
    console.error(`Error listing records from collection '${collectionName}':`, error);
    return sanitizeRecordData([]);
  }
}
