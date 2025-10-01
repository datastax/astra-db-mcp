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

type VectorMetric = "cosine" | "euclidean" | "dot_product";

export async function CreateCollection(params: {
  collectionName: string;
  vector?: boolean;
  dimension?: number;
  metric?: VectorMetric;
}) {
  const { 
    collectionName, 
    vector = true, 
    dimension = 1536,
    metric = "cosine" as VectorMetric
  } = params;

  if (vector) {
    await db.createCollection(collectionName, {
      vector: {
        dimension: dimension,
        metric: metric
      },
    });
  } else {
    await db.createCollection(collectionName);
  }

  return {
    success: true,
    message: `Collection '${collectionName}' created successfully`,
  };
}

// Made with Bob
