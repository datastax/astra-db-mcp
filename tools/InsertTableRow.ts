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

export interface InsertTableRowParams {
  tableName: string;
  row?: Record<string, any>;
  rows?: Record<string, any>[];
}

export async function InsertTableRow(params: InsertTableRowParams) {
  const { tableName, row, rows } = params;
  const table = db.table(tableName);

  if (rows && Array.isArray(rows)) {
    const result = await table.insertMany(rows as any);
    return {
      success: true,
      message: `Successfully inserted ${result.insertedIds.length} rows into table '${tableName}'`,
      insertedIds: result.insertedIds,
    };
  } else if (row) {
    const result = await table.insertOne(row as any);
    return {
      success: true,
      message: `Successfully inserted row into table '${tableName}'`,
      insertedId: result.insertedId,
    };
  } else {
    throw new Error("Must provide either 'row' or 'rows' to insert into table.");
  }
}
