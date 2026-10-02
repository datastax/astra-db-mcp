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

export interface CreateTableVectorIndexParams {
  tableName: string;
  indexName: string;
  column: string;
  metric?: "cosine" | "euclidean" | "dot_product";
  service?: {
    provider: string;
    modelName: string;
    parameters?: Record<string, any>;
    authentication?: Record<string, any>;
  };
}

export async function CreateTableVectorIndex(params: CreateTableVectorIndexParams) {
  const { tableName, indexName, column, metric = "cosine", service } = params;
  const table = db.table(tableName);

  const indexOptions: Record<string, any> = {
    metric,
  };

  if (service) {
    indexOptions.service = service;
  }

  await table.createVectorIndex(indexName, {
    column,
    options: indexOptions,
  } as any);

  return {
    success: true,
    message: `Vector index '${indexName}' created successfully on table '${tableName}' (column: ${column})`,
  };
}
