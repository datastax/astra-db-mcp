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

export interface ListRecordsParams {
  collectionName: string;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, any>;
}

export async function ListRecords(params: ListRecordsParams) {
  const { collectionName, limit = 10, skip = 0, sort, projection } = params;

  const collection = db.collection(collectionName);
  try {
    let cursor = collection.find({}, { projection });
    if (!cursor || typeof cursor.toArray !== "function") {
      console.warn(`cursor.toArray is not available for collection '${collectionName}'`);
      return sanitizeRecordData([]);
    }

    if (typeof cursor.limit === "function") {
      cursor = cursor.limit(limit);
    }
    if (skip > 0 && typeof cursor.skip === "function") {
      cursor = cursor.skip(skip);
    }
    if (sort && Object.keys(sort).length > 0 && typeof cursor.sort === "function") {
      cursor = cursor.sort(sort as any);
    }

    const records = await cursor.toArray();
    return sanitizeRecordData(records);
  } catch (error) {
    console.error(`Error listing records from collection '${collectionName}':`, error);
    return sanitizeRecordData([]);
  }
}
