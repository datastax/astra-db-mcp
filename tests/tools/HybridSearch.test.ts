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
import { HybridSearch } from "../../tools/HybridSearch.js";
import { mockDb } from "../mocks/db.mock.js";

describe("HybridSearch", () => {
  beforeEach(() => {
    mockDb.collection.mockClear();
  });

  it("should search for records using hybrid search", async () => {
    const queryVector = [0.1, 0.2, 0.3];
    const textQuery = "test query";
    const result = await HybridSearch({
      collectionName: "test_collection1",
      queryVector,
      textQuery,
    });

    // Verify the result has the expected properties
    expect(Array.isArray(result)).toBe(true);
  });

  it("should search with custom weights", async () => {
    const queryVector = [0.1, 0.2, 0.3];
    const textQuery = "test query";
    const weights = { vector: 0.5, text: 0.5 };
    const result = await HybridSearch({
      collectionName: "test_collection1",
      queryVector,
      textQuery,
      weights,
    });

    // Verify the result has the expected properties
    expect(Array.isArray(result)).toBe(true);
  });

  it("should search with custom limit and fields", async () => {
    const queryVector = [0.1, 0.2, 0.3];
    const textQuery = "test query";
    const limit = 5;
    const fields = ["title", "content"];
    const result = await HybridSearch({
      collectionName: "test_collection1",
      queryVector,
      textQuery,
      limit,
      fields,
    });

    // Verify the result has the expected properties
    expect(Array.isArray(result)).toBe(true);
  });
});

// Made with Bob
