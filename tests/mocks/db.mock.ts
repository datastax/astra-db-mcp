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
    project: vi.fn().mockImplementation(() => cursor),
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
  listDatabases: vi.fn().mockResolvedValue([{ name: "test_db", sizeOnDisk: 1000 }]),
};

// Create mock collection methods
const createMockCollection = (collectionName: string) => {
  const collectionRecords = mockRecords[collectionName] || [];

  const collectionMock = {
    options: vi.fn().mockResolvedValue({
      vector: { dimension: 1536, metric: "cosine" },
    }),
    indexes: vi.fn().mockResolvedValue([]),
    find: vi.fn().mockImplementation((query: any = {}) => {
      if (query?.$vector?.limit) {
        return createMockCursor(collectionRecords.slice(0, query.$vector.limit));
      }
      if (query?.$hybrid?.limit) {
        return createMockCursor(collectionRecords.slice(0, query.$hybrid.limit));
      }
      return createMockCursor(collectionRecords);
    }),
    findAndRerank: vi.fn().mockImplementation(() => {
      return createMockCursor(collectionRecords);
    }),
    findOne: vi.fn().mockImplementation(({ _id }: { _id: string }) => {
      return Promise.resolve(
        collectionRecords.find((record) => record._id === _id) || null
      );
    }),
    findOneBy: vi.fn().mockImplementation((field: string, value: any) => {
      return Promise.resolve(
        collectionRecords.find((record) => record[field] === value) || null
      );
    }),
    insertOne: vi.fn().mockImplementation((record: RecordType) => {
      return Promise.resolve({
        ...record,
        insertedId: record._id || "new-id",
        acknowledged: true,
      });
    }),
    insertMany: vi.fn().mockImplementation((records: RecordType[]) => {
      const insertedIds: { [key: string]: string } = {};
      records.forEach((record, index) => {
        insertedIds[index.toString()] = record._id || `new-id-${index}`;
      });
      return Promise.resolve({
        insertedCount: records.length,
        insertedIds,
        acknowledged: true,
      });
    }),
    updateOne: vi.fn().mockImplementation((filter: any, update: any) => {
      return Promise.resolve({
        modifiedCount: 1,
        matchedCount: 1,
        acknowledged: true,
      });
    }),
    updateMany: vi.fn().mockImplementation((filter: any, update: any) => {
      return Promise.resolve({
        modifiedCount: 2,
        matchedCount: 2,
        acknowledged: true,
      });
    }),
    deleteOne: vi.fn().mockImplementation((filter: any) => {
      return Promise.resolve({
        deletedCount: 1,
        acknowledged: true,
      });
    }),
    deleteMany: vi.fn().mockImplementation((filter: any) => {
      return Promise.resolve({
        deletedCount: 2,
        acknowledged: true,
      });
    }),
    distinct: vi.fn().mockImplementation((field: string) => {
      const values = new Set();
      for (const record of collectionRecords) {
        if (record[field] !== undefined) {
          values.add(record[field]);
        }
      }
      return Promise.resolve(Array.from(values));
    }),
    estimatedDocumentCount: vi.fn().mockResolvedValue(42),
    countDocuments: vi.fn().mockResolvedValue(42),
    vectorSearch: vi.fn().mockImplementation((vector: number[], options: any = {}) => {
      const limit = options.limit || 10;
      return Promise.resolve(collectionRecords.slice(0, limit));
    }),
  };

  return collectionMock;
};

// Create mock DB client
export const mockDb = {
  keyspace: "default_keyspace",
  listCollections: vi.fn().mockResolvedValue(mockCollections),
  createCollection: vi.fn().mockImplementation((name: string, options: any = {}) => {
    return Promise.resolve({ name, ...options });
  }),
  updateCollection: vi.fn().mockImplementation((name: string, newName: string) => {
    return Promise.resolve({ oldName: name, newName });
  }),
  deleteCollection: vi.fn().mockImplementation((collectionName: string) => {
    return Promise.resolve({ success: true, message: `Collection '${collectionName}' deleted successfully` });
  }),
  dropCollection: vi.fn().mockImplementation((collectionName: string) => {
    return Promise.resolve({ success: true, message: `Collection '${collectionName}' dropped successfully` });
  }),
  collectionExists: vi.fn().mockImplementation((collectionName: string) => {
    if (collectionName === "old_collection") return Promise.resolve(true);
    if (collectionName === "test_collection") return Promise.resolve(true);
    return Promise.resolve(mockCollections.some(c => c.name === collectionName));
  }),
  listTables: vi.fn().mockResolvedValue(mockTables),
  createTable: vi.fn().mockImplementation((name: string, options: any) => {
    return Promise.resolve({ name, ...options });
  }),
  dropTable: vi.fn().mockResolvedValue({ success: true }),
  admin: vi.fn().mockReturnValue(mockDbAdmin),
  collection: vi.fn().mockImplementation((collectionName: string) => {
    return createMockCollection(collectionName);
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

// Mock the DataAPIClient
vi.mock("@datastax/astra-db-ts", () => {
  return {
    vector: vi.fn().mockImplementation((arr: number[]) => arr),
    DataAPIClient: vi.fn().mockImplementation(() => {
      return {
        db: vi.fn().mockReturnValue(mockDb),
      };
    }),
  };
});

// Mock dotenv/config
vi.mock("dotenv/config", () => {
  return {};
});
