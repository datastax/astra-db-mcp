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
import { FindRecord } from "../../tools/FindRecord.js";
import { db } from "../../util/db.js";

// Make TypeScript happy with the mocked module
const mockDb = db as unknown as {
  collection: ReturnType<typeof vi.fn>;
};

describe("FindRecord Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  it("should find a record by field value", async () => {
    const collectionName = "test_collection1";
    const field = "title";
    const value = "Record 1";

    // Call the function
    const result = await FindRecord({
      collectionName,
      field,
      value,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledTimes(1);
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);

    // Our mock is set up to return records
    expect(result).toEqual([
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
    ]);
  });

  it("should return empty array when no record matches", async () => {
    const collectionName = "non_existent_collection";
    const field = "title";
    const value = "Non-existent Record";

    // Call the function
    const result = await FindRecord({
      collectionName,
      field,
      value,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledTimes(1);
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);

    // Verify the result is an empty array
    expect(result).toEqual([]);
  });
});
