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
import { mockDb } from "../mocks/db.mock.js";

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

    // Verify the collection was accessed
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
    expect(Array.isArray(result)).toBe(true);
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

    // Verify the collection was accessed
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
    expect(Array.isArray(result)).toBe(true);
  });
});
