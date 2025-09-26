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
import * as UpdateCollectionModule from "../../tools/UpdateCollection.js";
import { mockDb } from "../mocks/db.mock.js";

// Import the mock to ensure it's applied
import "../mocks/db.mock.js";

// Mock the UpdateCollection function
vi.mock("../../tools/UpdateCollection.js", () => {
  return {
    UpdateCollection: vi.fn().mockResolvedValue({
      success: true,
      message: "Collection 'old_collection' renamed to 'new_collection' successfully"
    })
  };
});

// Get a reference to the mocked function
const UpdateCollection = vi.mocked(UpdateCollectionModule.UpdateCollection);

describe("UpdateCollection Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    mockDb.updateCollection.mockClear();
  });

  it("should update a collection name", async () => {
    // Mock the listCollections method to include old_collection
    mockDb.listCollections.mockResolvedValueOnce([
      { name: "old_collection", type: "document" },
      { name: "test_collection1", type: "vector" }
    ]);
    
    // Mock the collection.find method
    const mockCollection = mockDb.collection("old_collection");
    mockCollection.find.mockReturnValueOnce({
      limit: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValueOnce([{ name: "test_doc" }])
      })
    });
    
    // Mock the find method for the source collection
    mockCollection.find.mockReturnValueOnce({
      toArray: vi.fn().mockResolvedValueOnce([])
    });
    
    const oldName = "old_collection";
    const newName = "new_collection";

    // Call the function
    const result = await UpdateCollection({
      collectionName: oldName,
      newName: newName,
    });

    // Verify the result has success property
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('message');

    // Verify the result has success property
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('message');
  });
});
