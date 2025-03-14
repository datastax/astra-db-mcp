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

// Mock the database module
vi.mock("../util/db.js", () => {
  const mockDb = {
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
    collection: vi.fn().mockImplementation((collectionName) => {
      return {
        find: vi.fn().mockResolvedValue([
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
        ]),
        findOne: vi.fn().mockImplementation(({ _id }) => {
          if (_id === "1") {
            return Promise.resolve({
              _id: "1",
              title: "Record 1",
              content: "Content 1",
              vector: [0.1, 0.2, 0.3],
            });
          }
          return Promise.resolve(null);
        }),
        findOneBy: vi.fn().mockImplementation((field, value) => {
          if (field === "title" && value === "Record 1") {
            return Promise.resolve({
              _id: "1",
              title: "Record 1",
              content: "Content 1",
              vector: [0.1, 0.2, 0.3],
            });
          }
          return Promise.resolve(null);
        }),
        insertOne: vi.fn().mockImplementation((record) => {
          return Promise.resolve({ ...record, _id: record._id || "new-id" });
        }),
        updateOne: vi.fn().mockImplementation(({ _id }, record) => {
          return Promise.resolve({ ...record, _id });
        }),
        deleteOne: vi.fn().mockImplementation(({ _id }) => {
          return Promise.resolve({ _id, deleted: true });
        }),
      };
    }),
  };

  return {
    db: mockDb,
  };
});
