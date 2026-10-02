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

import { vi } from "vitest";

// Mock environment variables
process.env.ASTRA_DB_APPLICATION_TOKEN = "test-token";
process.env.ASTRA_DB_API_ENDPOINT = "test-endpoint";

function createMockCursor(items: any[]) {
  const cursor: any = {
    _items: [...items],
    sort: vi.fn().mockImplementation(() => cursor),
    limit: vi.fn().mockImplementation((n: number) => {
      cursor._items = cursor._items.slice(0, n);
      return cursor;
    }),
    skip: vi.fn().mockImplementation((n: number) => {
      cursor._items = cursor._items.slice(n);
      return cursor;
    }),
    includeSimilarity: vi.fn().mockImplementation(() => cursor),
    includeScores: vi.fn().mockImplementation(() => cursor),
    rerankQuery: vi.fn().mockImplementation(() => cursor),
    rerankOn: vi.fn().mockImplementation(() => cursor),
    toArray: vi.fn().mockImplementation(() => Promise.resolve(cursor._items)),
  };
  return cursor;
}

const mockTables = ["test_table1", "test_table2"];

export const mockDbAdmin = {
  listKeyspaces: vi.fn().mockResolvedValue(["default_keyspace", "custom_keyspace"]),
  createKeyspace: vi.fn().mockImplementation((name: string) => Promise.resolve({ keyspace: name })),
  dropKeyspace: vi.fn().mockResolvedValue({ success: true }),
  findEmbeddingProviders: vi.fn().mockResolvedValue({
    providers: [{ name: "openai", models: ["text-embedding-3-small"] }],
  }),
  findRerankingProviders: vi.fn().mockResolvedValue({
    providers: [{ name: "cohere", models: ["rerank-english-v3.0"] }],
  }),
  info: vi.fn().mockResolvedValue({
    id: "mock-db-id",
    name: "mock-db",
    region: "us-east-1",
    status: "ACTIVE",
  }),
};

let activeMockKeyspace = "default_keyspace";

export const mockDb = {
  keyspace: "default_keyspace",
  listCollections: vi.fn().mockResolvedValue([
    { name: "test_collection1", type: "vector" },
    { name: "test_collection2", type: "document" },
  ]),
  createCollection: vi.fn().mockImplementation((name, options) => {
    return Promise.resolve({ name, ...options });
  }),
  updateCollection: vi.fn().mockImplementation((name, newName) => {
    return Promise.resolve({ oldName: name, newName });
  }),
  deleteCollection: vi.fn().mockResolvedValue({ success: true }),
  dropCollection: vi.fn().mockImplementation((collectionName) => {
    return Promise.resolve({ success: true });
  }),
  listTables: vi.fn().mockResolvedValue(mockTables),
  createTable: vi.fn().mockImplementation((name: string, options: any) => {
    return Promise.resolve({ name, ...options });
  }),
  dropTable: vi.fn().mockResolvedValue({ success: true }),
  admin: vi.fn().mockReturnValue(mockDbAdmin),
  collection: vi.fn().mockImplementation((collectionName) => {
    const isNonExistentCollection = collectionName === "non_existent_collection";
    const sampleDocs = isNonExistentCollection
      ? []
      : [
          {
            _id: "1",
            title: "Record 1",
            content: "Content 1",
            vector: [0.1, 0.2, 0.3],
          },
          {
            _id: "2",
            title: "Record 2",
            content: "Content 2",
            vector: [0.4, 0.5, 0.6],
          },
        ];

    return {
      options: vi.fn().mockResolvedValue({
        vector: { dimension: 1536, metric: "cosine" },
      }),
      find: vi.fn().mockImplementation(() => {
        return createMockCursor(sampleDocs);
      }),
      findAndRerank: vi.fn().mockImplementation(() => {
        return createMockCursor(sampleDocs);
      }),
      estimatedDocumentCount: vi.fn().mockResolvedValue(10),
      findOne: vi.fn().mockImplementation(({ _id }) => {
        if (_id === "1") {
          return Promise.resolve(sampleDocs[0]);
        }
        return Promise.resolve(null);
      }),
      findOneBy: vi.fn().mockImplementation((field, value) => {
        if (field === "title" && value === "Record 1") {
          return Promise.resolve(sampleDocs[0]);
        }
        return Promise.resolve(null);
      }),
      insertOne: vi.fn().mockImplementation((record) => {
        return Promise.resolve({ ...record, _id: record._id || "new-id", insertedId: record._id || "new-id" });
      }),
      insertMany: vi.fn().mockImplementation((records) => {
        return Promise.resolve({ insertedIds: records.map((r: any, i: number) => r._id || `id-${i}`) });
      }),
      updateOne: vi.fn().mockImplementation(({ _id }, record) => {
        return Promise.resolve({ ...record, _id, matchedCount: 1, modifiedCount: 1 });
      }),
      updateMany: vi.fn().mockImplementation(() => {
        return Promise.resolve({ matchedCount: 2, modifiedCount: 2 });
      }),
      deleteOne: vi.fn().mockImplementation(({ _id }) => {
        return Promise.resolve({ _id, deleted: true, deletedCount: 1 });
      }),
      deleteMany: vi.fn().mockImplementation(() => {
        return Promise.resolve({ deletedCount: 2 });
      }),
    };
  }),
  table: vi.fn().mockImplementation((tableName: string) => {
    return {
      name: tableName,
      alter: vi.fn().mockResolvedValue({ success: true }),
      createIndex: vi.fn().mockResolvedValue({ success: true }),
      createVectorIndex: vi.fn().mockResolvedValue({ success: true }),
      find: vi.fn().mockImplementation(() => {
        return createMockCursor([{ id: 1, name: "Row 1" }]);
      }),
      findOne: vi.fn().mockResolvedValue({ id: 1, name: "Row 1" }),
      insertOne: vi.fn().mockResolvedValue({ insertedId: "row-1" }),
      insertMany: vi.fn().mockResolvedValue({ insertedIds: ["row-1", "row-2"] }),
      updateOne: vi.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
      updateMany: vi.fn().mockResolvedValue({ matchedCount: 2, modifiedCount: 2 }),
      deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteMany: vi.fn().mockResolvedValue({ deletedCount: 2 }),
    };
  }),
};

// Mock the database module
vi.mock("../util/db.js", () => {
  return {
    db: mockDb,
    getDbAdmin: () => mockDbAdmin,
    setDbKeyspace: (name: string) => { activeMockKeyspace = name; },
    getDbKeyspace: () => activeMockKeyspace,
  };
});
