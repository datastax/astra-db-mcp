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

import { describe, it, expect, beforeEach } from "vitest";
import { BulkDeleteRecords } from "../../tools/BulkDeleteRecords.js";
import { mockDb } from "../mocks/db.mock.js";

describe("BulkDeleteRecords", () => {
  beforeEach(() => {
    mockDb.collection.mockClear();
  });

  it("should delete multiple records at once", async () => {
    const recordIds = ["1", "2", "3"];

    const result = await BulkDeleteRecords({
      collectionName: "test_collection1",
      recordIds,
    });

    // Verify the result has the expected properties
    expect(result).toHaveProperty('message');
    expect(result.message).toContain("Successfully deleted");
    expect(result).toHaveProperty('deletedCount');
  });

  it("should handle empty recordIds array", async () => {
    const recordIds: string[] = [];

    const result = await BulkDeleteRecords({
      collectionName: "test_collection1",
      recordIds,
    });

    // Verify the result has the expected properties
    expect(result).toHaveProperty('message');
    expect(result.message).toContain("Successfully deleted");
    expect(result).toHaveProperty('deletedCount');
    expect(result.deletedCount).toBe(0);
  });
});

// Made with Bob
