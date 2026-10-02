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

import { describe, it, expect, vi } from "vitest";
import { ListTables } from "../../tools/ListTables.js";
import { CreateTable } from "../../tools/CreateTable.js";
import { AlterTable } from "../../tools/AlterTable.js";
import { DropTable } from "../../tools/DropTable.js";
import { QueryTable } from "../../tools/QueryTable.js";
import { InsertTableRow } from "../../tools/InsertTableRow.js";
import { UpdateTableRow } from "../../tools/UpdateTableRow.js";
import { DeleteTableRow } from "../../tools/DeleteTableRow.js";
import { CreateTableIndex } from "../../tools/CreateTableIndex.js";
import { CreateTableVectorIndex } from "../../tools/CreateTableVectorIndex.js";
import "../mocks/db.mock.js";

describe("Table Support Tools", () => {
  it("ListTables returns all tables", async () => {
    const tables = await ListTables();
    expect(tables).toContain("test_table1");
  });

  it("CreateTable creates a table with definition", async () => {
    const res = await CreateTable({
      tableName: "users",
      definition: {
        columns: { id: "int", name: "text" },
        primaryKey: "id",
      },
    });
    expect(res.success).toBe(true);
  });

  it("AlterTable alters schema", async () => {
    const res = await AlterTable({
      tableName: "users",
      operation: { addColumns: { email: "text" } },
    });
    expect(res.success).toBe(true);
  });

  it("DropTable drops a table", async () => {
    const res = await DropTable({ tableName: "users" });
    expect(res.success).toBe(true);
  });

  it("QueryTable retrieves rows", async () => {
    const rows = await QueryTable({ tableName: "users", limit: 5 });
    expect(Array.isArray(rows)).toBe(true);
  });

  it("InsertTableRow inserts single row and batch rows", async () => {
    const single = await InsertTableRow({
      tableName: "users",
      row: { id: 1, name: "Alice" },
    });
    expect(single.success).toBe(true);

    const batch = await InsertTableRow({
      tableName: "users",
      rows: [
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ],
    });
    expect(batch.success).toBe(true);
  });

  it("UpdateTableRow updates rows", async () => {
    const res = await UpdateTableRow({
      tableName: "users",
      filter: { id: 1 },
      update: { $set: { name: "Alicia" } },
    });
    expect(res.success).toBe(true);
  });

  it("DeleteTableRow deletes rows", async () => {
    const res = await DeleteTableRow({
      tableName: "users",
      filter: { id: 1 },
    });
    expect(res.success).toBe(true);
  });

  it("CreateTableIndex creates secondary index", async () => {
    const res = await CreateTableIndex({
      tableName: "users",
      indexName: "idx_name",
      column: "name",
    });
    expect(res.success).toBe(true);
  });

  it("CreateTableVectorIndex creates vector index", async () => {
    const res = await CreateTableVectorIndex({
      tableName: "users",
      indexName: "idx_vec",
      column: "vector",
      metric: "cosine",
    });
    expect(res.success).toBe(true);
  });
});
