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

export interface FindWithVectorizeParams {
  collectionName: string;
  vectorize: string;
  filter?: Record<string, any>;
  limit?: number;
  skip?: number;
  includeSimilarity?: boolean;
  projection?: Record<string, any>;
}

export async function FindWithVectorize(params: FindWithVectorizeParams) {
  const {
    collectionName,
    vectorize,
    filter = {},
    limit = 10,
    skip = 0,
    includeSimilarity = true,
    projection,
  } = params;

  const collection = db.collection(collectionName);
  let cursor = collection
    .find(filter, { projection })
    .sort({ $vectorize: vectorize } as any)
    .limit(limit);

  if (skip > 0) {
    cursor = cursor.skip(skip);
  }

  if (includeSimilarity) {
    cursor = cursor.includeSimilarity(true);
  }

  return await cursor.toArray();
}
