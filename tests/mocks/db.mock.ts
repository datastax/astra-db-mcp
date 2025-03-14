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

// Create mock DB client
export const mockDb = {
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
  collection: vi.fn().mockImplementation((collectionName: string) => {
    return {
      find: vi.fn().mockResolvedValue(mockRecords[collectionName] || []),
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
        return Promise.resolve({ ...record, _id: record._id || "new-id" });
      }),
      updateOne: vi
        .fn()
        .mockImplementation(({ _id }: { _id: string }, record: Record) => {
          return Promise.resolve({ ...record, _id });
        }),
      deleteOne: vi.fn().mockImplementation(({ _id }: { _id: string }) => {
        return Promise.resolve({ _id, deleted: true });
      }),
    };
  }),
};

// Create vi.mock for the db module
vi.mock("../../util/db.js", () => {
  return {
    db: mockDb,
  };
});
