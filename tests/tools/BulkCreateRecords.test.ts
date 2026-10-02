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
import { BulkCreateRecords } from "../../tools/BulkCreateRecords.js";
import { mockDb } from "../mocks/db.mock.js";

describe("BulkCreateRecords", () => {
  beforeEach(() => {
    mockDb.collection.mockClear();
  });

  it("should create multiple records at once", async () => {
    const records = [
      { title: "Record 1", content: "Content 1" },
      { title: "Record 2", content: "Content 2" },
    ];

    const result = await BulkCreateRecords({
      collectionName: "test_collection1",
      records,
    });

    // Verify the result has the expected properties
    expect(result).toHaveProperty('message');
    expect(result.message).toContain("Successfully created");
    expect(result).toHaveProperty('ids');
    expect(Array.isArray(result.ids)).toBe(true);
  });

  it("should handle empty records array", async () => {
    const records: Record<string, any>[] = [];

    const result = await BulkCreateRecords({
      collectionName: "test_collection1",
      records,
    });

    // Verify the result has the expected properties
    expect(result).toHaveProperty('message');
    expect(result.message).toContain("Successfully created");
    expect(result).toHaveProperty('ids');
    expect(Array.isArray(result.ids)).toBe(true);
    expect(result.ids.length).toBe(0);
  });
});

// Made with Bob
