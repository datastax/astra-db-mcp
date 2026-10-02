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
import { vector } from "@datastax/astra-db-ts";

export interface FindAndRerankParams {
  collectionName: string;
  filter?: Record<string, any>;
  hybrid: {
    vector?: number[];
    vectorize?: string;
    lexical?: string;
  };
  rerankQuery?: string;
  rerankOn?: string;
  limit?: number;
  includeScores?: boolean;
  projection?: Record<string, any>;
}

export async function FindAndRerank(params: FindAndRerankParams) {
  const {
    collectionName,
    filter = {},
    hybrid,
    rerankQuery,
    rerankOn,
    limit = 10,
    includeScores = true,
    projection,
  } = params;

  const collection = db.collection(collectionName);

  const hybridSort: Record<string, any> = {};
  if (hybrid.vector) {
    hybridSort.$vector = typeof vector === "function" ? vector(hybrid.vector) : hybrid.vector;
  }
  if (hybrid.vectorize) {
    hybridSort.$vectorize = hybrid.vectorize;
  }
  if (hybrid.lexical) {
    hybridSort.$lexical = hybrid.lexical;
  }

  let cursor = (collection as any)
    .findAndRerank(filter, { projection })
    .sort({ $hybrid: hybridSort })
    .limit(limit);

  if (rerankQuery) {
    cursor = cursor.rerankQuery(rerankQuery);
  }

  if (rerankOn) {
    cursor = cursor.rerankOn(rerankOn);
  }

  if (includeScores) {
    cursor = cursor.includeScores(true);
  }

  return await cursor.toArray();
}
