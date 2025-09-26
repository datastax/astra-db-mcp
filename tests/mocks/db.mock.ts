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

// Define types for our mock data
interface Collection {
  name: string;
  type: string;
}

interface Record {
  _id: string;
  [key: string]: any;
}

interface RecordCollection {
  [collectionName: string]: Record[];
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
      vector: [0.1, 0.2, 0.3],
    },
    {
      _id: "2",
      title: "Record 2",
      content: "Content 2",
      vector: [0.4, 0.5, 0.6],
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

// Create mock collection methods
const createMockCollection = (collectionName: string) => {
  // Create a mock cursor that properly supports chaining
  const createMockCursor = (records?: any[]) => {
    const cursor = {
      toArray: vi.fn().mockImplementation(() => {
        return Promise.resolve(records || mockRecords[collectionName] || []);
      }),
      limit: vi.fn(),
      project: vi.fn(),
      sort: vi.fn(),
      skip: vi.fn(),
    };
    
    // Make all methods return the cursor for chaining
    cursor.limit.mockReturnValue(cursor);
    cursor.project.mockReturnValue(cursor);
    cursor.sort.mockReturnValue(cursor);
    cursor.skip.mockReturnValue(cursor);
    
    return cursor;
  };

  // Create the collection mock with all required methods
  const collectionMock = {
    // Basic CRUD operations
    find: vi.fn().mockImplementation((query = {}) => {
      // Handle vector search queries
      if (query.$vector) {
        const limit = query.$vector.limit || 10;
        const records = mockRecords[collectionName] || [];
        return createMockCursor(records.slice(0, limit));
      }
      
      // Handle hybrid search queries
      if (query.$hybrid) {
        const limit = query.$hybrid.limit || 10;
        const records = mockRecords[collectionName] || [];
        return createMockCursor(records.slice(0, limit));
      }
      
      // Handle regular find queries
      return createMockCursor();
    }),
    findOne: vi.fn().mockImplementation(({ _id }: { _id: string }) => {
      const records = mockRecords[collectionName] || [];
      return Promise.resolve(
        records.find((record) => record._id === _id) || null
      );
    }),
    findOneBy: vi.fn().mockImplementation((field: string, value: any) => {
      const records = mockRecords[collectionName] || [];
      return Promise.resolve(
        records.find((record) => record[field] === value) || null
      );
    }),
    insertOne: vi.fn().mockImplementation((record: Record) => {
      return Promise.resolve({ 
        insertedId: record._id || "new-id",
        acknowledged: true
      });
    }),
    updateOne: vi.fn().mockImplementation(({ _id }: { _id: string }, update: any) => {
      return Promise.resolve({ 
        modifiedCount: 1,
        matchedCount: 1,
        acknowledged: true
      });
    }),
    deleteOne: vi.fn().mockImplementation(({ _id }: { _id: string }) => {
      return Promise.resolve({ 
        deletedCount: 1,
        acknowledged: true
      });
    }),
    
    // Bulk operations
    insertMany: vi.fn().mockImplementation((records: Record[]) => {
      const insertedIds: { [key: string]: string } = {};
      records.forEach((record, index) => {
        insertedIds[index.toString()] = record._id || `new-id-${index}`;
      });
      return Promise.resolve({ 
        insertedCount: records.length,
        insertedIds,
        acknowledged: true
      });
    }),
    bulkWrite: vi.fn().mockImplementation((operations: any[]) => {
      const result = {
        insertedCount: 0,
        modifiedCount: 0,
        deletedCount: 0,
        upsertedCount: 0,
        insertedIds: {} as { [key: string]: string },
        upsertedIds: {} as { [key: string]: string },
        acknowledged: true
      };
      
      operations.forEach((op, index) => {
        if (op.insertOne) {
          result.insertedCount++;
          result.insertedIds[index.toString()] = op.insertOne.document._id || `new-id-${index}`;
        } else if (op.updateOne) {
          result.modifiedCount++;
        } else if (op.deleteOne) {
          result.deletedCount++;
        }
      });
      
      return Promise.resolve(result);
    }),
    
    // Aggregation and utility methods
    distinct: vi.fn().mockImplementation((field: string, filter: any = {}) => {
      const records = mockRecords[collectionName] || [];
      const distinctValues = new Set<any>();
      
      // Filter records if filter is provided
      const filteredRecords = Object.keys(filter).length > 0
        ? records.filter(record => {
            for (const key in filter) {
              if (record[key] !== filter[key]) return false;
            }
            return true;
          })
        : records;
      
      filteredRecords.forEach(record => {
        if (record[field] !== undefined) {
          distinctValues.add(record[field]);
        }
      });
      
      return Promise.resolve(Array.from(distinctValues));
    }),
    estimatedDocumentCount: vi.fn().mockImplementation(() => {
      return Promise.resolve(mockRecords[collectionName]?.length || 0);
    }),
    countDocuments: vi.fn().mockImplementation((query = {}) => {
      return Promise.resolve(mockRecords[collectionName]?.length || 0);
    }),
    
    // Vector search specific methods
    createIndex: vi.fn().mockResolvedValue({ acknowledged: true }),
    dropIndex: vi.fn().mockResolvedValue({ acknowledged: true }),
    indexes: vi.fn().mockResolvedValue([]),
  };

  return collectionMock;
};

// Create mock DB client
export const mockDb = {
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
  collection: vi.fn().mockImplementation((collectionName: string) => {
    // Store the mock collection so it can be accessed in tests
    const mockCollection = createMockCollection(collectionName);
    
    // Reset the mock methods to ensure they're properly tracked
    // Use type assertion to avoid TypeScript errors
    const mockCollectionAny = mockCollection as any;
    Object.keys(mockCollection).forEach(key => {
      if (typeof mockCollectionAny[key] === 'function' && typeof mockCollectionAny[key].mockClear === 'function') {
        mockCollectionAny[key].mockClear();
      }
    });
    
    return mockCollection;
  }),
  collectionExists: vi.fn().mockImplementation((collectionName: string) => {
    // For testing purposes, always return true for "old_collection" to make UpdateCollection test pass
    if (collectionName === "old_collection") return Promise.resolve(true);
    // Also return true for test_collection to make DeleteCollection test pass
    if (collectionName === "test_collection") return Promise.resolve(true);
    return Promise.resolve(mockCollections.some(c => c.name === collectionName));
  }),
  admin: vi.fn().mockReturnValue({
    listDatabases: vi.fn().mockResolvedValue([{ name: "test_db", sizeOnDisk: 1000 }]),
  }),
};

// Create vi.mock for the db module
vi.mock("../../util/db.js", () => {
  return {
    db: mockDb,
  };
});

// Mock the DataAPIClient
vi.mock("@datastax/astra-db-ts", () => {
  return {
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

// Made with Bob
