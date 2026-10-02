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
import { BulkUpdateRecords } from "../../tools/BulkUpdateRecords.js";
import { mockDb } from "../mocks/db.mock.js";

describe("BulkUpdateRecords", () => {
  beforeEach(() => {
    mockDb.collection.mockClear();
  });

  it("should update multiple records at once", async () => {
    const records = [
      { id: "1", record: { title: "Updated Record 1" } },
      { id: "2", record: { title: "Updated Record 2" } },
    ];

    const result = await BulkUpdateRecords({
      collectionName: "test_collection1",
      records,
    });

    // Verify the result has the expected properties
    expect(result).toHaveProperty('message');
    expect(result.message).toContain("Successfully updated");
    expect(result).toHaveProperty('updatedCount');
  });

  it("should handle empty records array", async () => {
    const records: Array<{ id: string; record: Record<string, any> }> = [];

    const result = await BulkUpdateRecords({
      collectionName: "test_collection1",
      records,
    });

    // Verify the result has the expected properties
    expect(result).toHaveProperty('message');
    expect(result.message).toContain("Successfully updated");
    expect(result).toHaveProperty('updatedCount');
    expect(result.updatedCount).toBe(0);
  });
});

// Made with Bob
