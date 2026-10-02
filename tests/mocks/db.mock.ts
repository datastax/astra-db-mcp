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

// Define types for mock data
interface Collection {
  name: string;
  type?: string;
}

interface RecordType {
  _id: string;
  [key: string]: any;
}

interface RecordCollection {
  [collectionName: string]: RecordType[];
}

// Mock collections data
const mockCollections: Collection[] = [
  { name: "test_collection1", type: "vector" },
  { name: "test_collection2", type: "document" },
  { name: "old_collection", type: "vector" },
];

// Mock records data
const mockRecords: RecordCollection = {
  test_collection1: [
    {
      _id: "1",
      title: "Record 1",
      content: "Content 1",
      $vector: [0.1, 0.2, 0.3],
      $similarity: 0.95,
    },
    {
      _id: "2",
      title: "Record 2",
      content: "Content 2",
      $vector: [0.4, 0.5, 0.6],
      $similarity: 0.88,
    },
  ],
  test_collection2: [
    {
      _id: "3",
      name: "Document 1",
      data: { field1: "value1", field2: "value2" },
    },
    {
      _id: "4",
      name: "Document 2",
      data: { field1: "value3", field2: "value4" },
    },
  ],
};

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

// Mock Table
const mockTables = ["test_table1", "test_table2"];

// Mock DB Admin
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

// Create mock DB client
export const mockDb = {
  keyspace: "default_keyspace",
  listCollections: vi.fn().mockResolvedValue(mockCollections),
  createCollection: vi.fn().mockImplementation((name: string, options: any) => {
    return Promise.resolve({ name, ...options });
  }),
  updateCollection: vi
    .fn()
    .mockImplementation((name: string, newName: string) => {
      return Promise.resolve({ oldName: name, newName });
    }),
  deleteCollection: vi.fn().mockResolvedValue({ success: true }),
  dropCollection: vi.fn().mockResolvedValue({ success: true }),
  listTables: vi.fn().mockResolvedValue(mockTables),
  createTable: vi.fn().mockImplementation((name: string, options: any) => {
    return Promise.resolve({ name, ...options });
  }),
  dropTable: vi.fn().mockResolvedValue({ success: true }),
  admin: vi.fn().mockReturnValue(mockDbAdmin),
  collection: vi.fn().mockImplementation((collectionName: string) => {
    return {
      options: vi.fn().mockResolvedValue({
        vector: { dimension: 1536, metric: "cosine" },
      }),
      find: vi.fn().mockImplementation(() => {
        return createMockCursor(mockRecords[collectionName] || []);
      }),
      findAndRerank: vi.fn().mockImplementation(() => {
        return createMockCursor(mockRecords[collectionName] || []);
      }),
      findOne: vi.fn().mockImplementation(({ _id }: { _id: string }) => {
        const records = mockRecords[collectionName] || [];
        return Promise.resolve(
          records.find((record) => record._id === _id) || null
        );
      }),
      insertOne: vi.fn().mockImplementation((record: RecordType) => {
        return Promise.resolve({
          ...record,
          insertedId: record._id || "new-id",
        });
      }),
      insertMany: vi.fn().mockImplementation((records: RecordType[]) => {
        return Promise.resolve({
          insertedIds: records.map((r, i) => r._id || `id-${i}`),
        });
      }),
      updateOne: vi
        .fn()
        .mockImplementation((filter: any, update: any) => {
          return Promise.resolve({ matchedCount: 1, modifiedCount: 1 });
        }),
      updateMany: vi
        .fn()
        .mockImplementation((filter: any, update: any) => {
          return Promise.resolve({ matchedCount: 2, modifiedCount: 2 });
        }),
      deleteOne: vi.fn().mockImplementation((filter: any) => {
        return Promise.resolve({ deletedCount: 1 });
      }),
      deleteMany: vi.fn().mockImplementation((filter: any) => {
        return Promise.resolve({ deletedCount: 2 });
      }),
      estimatedDocumentCount: vi.fn().mockResolvedValue(42),
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

let activeMockKeyspace = "default_keyspace";

export function setDbKeyspace(keyspaceName: string): void {
  activeMockKeyspace = keyspaceName;
}

export function getDbKeyspace(): string | undefined {
  return activeMockKeyspace;
}

export function getDbAdmin() {
  return mockDbAdmin;
}

// Create vi.mock for the db module
vi.mock("../../util/db.js", () => {
  return {
    db: mockDb,
    getDbAdmin: () => mockDbAdmin,
    setDbKeyspace: (name: string) => { activeMockKeyspace = name; },
    getDbKeyspace: () => activeMockKeyspace,
  };
});
