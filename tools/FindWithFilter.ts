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

export interface FindWithFilterParams {
  collectionName: string;
  filter: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, any>;
  limit?: number;
  skip?: number;
}

export async function FindWithFilter(params: FindWithFilterParams) {
  const {
    collectionName,
    filter,
    sort,
    projection,
    limit = 10,
    skip = 0,
  } = params;

  const collection = db.collection(collectionName);
  let cursor = collection.find(filter, { projection }).limit(limit);

  if (skip > 0) {
    cursor = cursor.skip(skip);
  }

  if (sort && Object.keys(sort).length > 0) {
    cursor = cursor.sort(sort as any);
  }

  const records = await cursor.toArray();
  return sanitizeRecordData(records);
}
