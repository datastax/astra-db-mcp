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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetRecord } from "../../tools/GetRecord.js";
import { db } from "../../util/db.js";

// Make TypeScript happy with the mocked module
const mockDb = db as unknown as {
  collection: ReturnType<typeof vi.fn>;
};

// Mock the collection's findOne method
const mockFindOne = vi.fn();
mockDb.collection.mockReturnValue({
  findOne: mockFindOne
});

// Set up the mock implementation for findOne
mockFindOne.mockImplementation(({ _id }) => {
  if (_id === "1") {
    return Promise.resolve({
      _id: "1",
      title: "Record 1",
      content: "Content 1",
      vector: [0.1, 0.2, 0.3],
    });
  }
  return Promise.resolve(null);
});

describe("GetRecord Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    mockDb.collection.mockClear();
  });

  it("should get a record by ID", async () => {
    const collectionName = "test_collection1";
    const recordId = "1";
    // No need to get mockCollection, it's already set up

    // Call the function
    const result = await GetRecord({
      collectionName,
      recordId,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: recordId });

    // Verify the result
    expect(result).toEqual({
      _id: "1",
      title: "Record 1",
      content: "Content 1",
      vector: [0.1, 0.2, 0.3],
    });
  });

  it("should return null for a non-existent record", async () => {
    const collectionName = "test_collection1";
    const recordId = "non_existent_id";
    // For this test, we'll override the mock to return null
    mockFindOne.mockResolvedValueOnce(null);

    // Call the function
    const result = await GetRecord({
      collectionName,
      recordId,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
    expect(mockFindOne).toHaveBeenCalledWith({ _id: recordId });

    // Verify the result is null
    expect(result).toBeNull();
  });
});
