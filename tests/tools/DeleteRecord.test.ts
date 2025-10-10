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
import { DeleteRecord } from "../../tools/DeleteRecord.js";
import { db } from "../../util/db.js";

// Make TypeScript happy with the mocked module
const mockDb = db as unknown as {
  collection: ReturnType<typeof vi.fn>;
};

// Define the type for mockCollection
type MockCollection = {
  deleteOne: ReturnType<typeof vi.fn>;
};

describe("DeleteRecord Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  it("should delete a record from a collection", async () => {
    const collectionName = "test_collection1";
    const recordId = "1";

    const mockCollection = mockDb.collection(collectionName) as unknown as MockCollection;

    // Call the function
    const result = await DeleteRecord({
      collectionName,
      recordId,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledTimes(2);
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
    expect(mockCollection.deleteOne).toHaveBeenCalledTimes(1);
    expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: recordId });

    // Verify the result
    expect(result).toEqual({
      _id: recordId,
      deleted: true,
    });
  });
});
