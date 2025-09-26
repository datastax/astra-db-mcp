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
import { VectorSearch } from "../../tools/VectorSearch.js";
import { mockDb } from "../mocks/db.mock.js";

describe("VectorSearch", () => {
  beforeEach(() => {
    mockDb.collection.mockClear();
  });

  it("should search for records using vector similarity", async () => {
    const queryVector = [0.1, 0.2, 0.3];
    const result = await VectorSearch({
      collectionName: "test_collection1",
      queryVector,
    });

    // Verify the result has the expected properties
    expect(Array.isArray(result)).toBe(true);
  });

  it("should search with custom limit and minScore", async () => {
    const queryVector = [0.1, 0.2, 0.3];
    const limit = 5;
    const minScore = 0.7;
    const result = await VectorSearch({
      collectionName: "test_collection1",
      queryVector,
      limit,
      minScore,
    });

    // Verify the result has the expected properties
    expect(Array.isArray(result)).toBe(true);
  });

  it("should search with additional filter criteria", async () => {
    const queryVector = [0.1, 0.2, 0.3];
    const filter = { category: "test" };
    const result = await VectorSearch({
      collectionName: "test_collection1",
      queryVector,
      filter,
    });

    // Verify the result has the expected properties
    expect(Array.isArray(result)).toBe(true);
  });
});

// Made with Bob
