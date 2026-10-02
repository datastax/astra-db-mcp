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
import { ListRecords } from "../../tools/ListRecords.js";
import { mockDb } from "../mocks/db.mock.js";

describe("ListRecords Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  it("should list records from a collection", async () => {
    const collectionName = "test_collection1";
    
    // Call the function
    const result = await ListRecords({
      collectionName,
      limit: 10,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);

    // Verify the result is an array
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return an empty array for a non-existent collection", async () => {
    const collectionName = "non_existent_collection";

    // Call the function
    const result = await ListRecords({
      collectionName,
      limit: 10,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);

    // Verify the result is an empty array
    expect(result).toEqual([]);
  });
});
