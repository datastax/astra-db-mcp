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

export interface UpdateTableRowParams {
  tableName: string;
  filter: Record<string, any>;
  update: Record<string, any>;
  many?: boolean;
}

export async function UpdateTableRow(params: UpdateTableRowParams) {
  const { tableName, filter, update, many = false } = params;
  const table = db.table(tableName);

  if (many) {
    const result = (await (table as any).updateMany(filter, update as any)) as any;
    return {
      success: true,
      message: `Updated ${result?.modifiedCount ?? 0} rows in table '${tableName}'`,
      matchedCount: result?.matchedCount ?? 0,
      modifiedCount: result?.modifiedCount ?? 0,
    };
  } else {
    const result = (await table.updateOne(filter, update as any)) as any;
    return {
      success: true,
      message: `Updated row in table '${tableName}'`,
      matchedCount: result?.matchedCount ?? 0,
      modifiedCount: result?.modifiedCount ?? 0,
    };
  }
}
