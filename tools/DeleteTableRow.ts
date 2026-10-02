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

export interface DeleteTableRowParams {
  tableName: string;
  filter: Record<string, any>;
  many?: boolean;
}

export async function DeleteTableRow(params: DeleteTableRowParams) {
  const { tableName, filter, many = false } = params;
  const table = db.table(tableName);

  if (many) {
    const result = (await table.deleteMany(filter)) as any;
    return {
      success: true,
      message: `Deleted ${result?.deletedCount ?? 0} rows from table '${tableName}'`,
      deletedCount: result?.deletedCount ?? 0,
    };
  } else {
    const result = (await table.deleteOne(filter)) as any;
    return {
      success: true,
      message: `Deleted row from table '${tableName}'`,
      deletedCount: result?.deletedCount ?? 0,
    };
  }
}
