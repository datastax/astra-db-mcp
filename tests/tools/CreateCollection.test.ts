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
import { CreateCollection } from "../../tools/CreateCollection.js";
import { db } from "../../util/db.js";

// Make TypeScript happy with the mocked module
const mockDb = db as unknown as {
  createCollection: ReturnType<typeof vi.fn>;
};

describe("CreateCollection Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  it("should create a vector collection with default dimensions", async () => {
    // Call the function with just the collection name
    const result = await CreateCollection({
      collectionName: "new_collection",
    });

    // Verify the mock was called with correct parameters
    expect(mockDb.createCollection).toHaveBeenCalledTimes(1);
    expect(mockDb.createCollection).toHaveBeenCalledWith("new_collection", {
      vector: true,
      dimension: 1536,
    });

    // Verify the result
    expect(result).toEqual({
      name: "new_collection",
      vector: true,
      dimension: 1536,
    });
  });

  it("should create a non-vector collection", async () => {
    // Call the function with vector set to false
    const result = await CreateCollection({
      collectionName: "new_document_collection",
      vector: false,
    });

    // Verify the mock was called with correct parameters
    expect(mockDb.createCollection).toHaveBeenCalledTimes(1);
    expect(mockDb.createCollection).toHaveBeenCalledWith(
      "new_document_collection",
      {
        vector: false,
      }
    );

    // Verify the result
    expect(result).toEqual({
      name: "new_document_collection",
      vector: false,
    });
  });

  it("should create a vector collection with custom dimensions", async () => {
    // Call the function with custom dimensions
    const result = await CreateCollection({
      collectionName: "custom_vector_collection",
      vector: true,
      dimension: 768,
    });

    // Verify the mock was called with correct parameters
    expect(mockDb.createCollection).toHaveBeenCalledTimes(1);
    expect(mockDb.createCollection).toHaveBeenCalledWith(
      "custom_vector_collection",
      {
        vector: true,
        dimension: 768,
      }
    );

    // Verify the result
    expect(result).toEqual({
      name: "custom_vector_collection",
      vector: true,
      dimension: 768,
    });
  });
});
