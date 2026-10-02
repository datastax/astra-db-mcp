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

import { describe, it, expect, vi } from "vitest";
import { FindWithVector } from "../../tools/FindWithVector.js";
import { FindWithVectorize } from "../../tools/FindWithVectorize.js";
import { FindAndRerank } from "../../tools/FindAndRerank.js";
import { VectorSearch } from "../../tools/VectorSearch.js";
import "../mocks/db.mock.js";

describe("Vector & Hybrid Search Tools", () => {
  it("FindWithVector executes vector search with similarity score", async () => {
    const results = await FindWithVector({
      collectionName: "test_collection1",
      vector: [0.1, 0.2, 0.3],
      limit: 5,
      includeSimilarity: true,
    });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe("Record 1");
  });

  it("FindWithVectorize executes natural language search", async () => {
    const results = await FindWithVectorize({
      collectionName: "test_collection1",
      vectorize: "find records about content",
      limit: 2,
    });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  it("FindAndRerank executes hybrid search and reranking", async () => {
    const results = await FindAndRerank({
      collectionName: "test_collection1",
      hybrid: {
        vector: [0.1, 0.2, 0.3],
        lexical: "Content",
      },
      rerankQuery: "Content query",
      limit: 5,
      includeScores: true,
    });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  it("VectorSearch executes legacy vector similarity search", async () => {
    const queryVector = [0.1, 0.2, 0.3];
    const result = await VectorSearch({
      collectionName: "test_collection1",
      queryVector,
    });
    expect(Array.isArray(result)).toBe(true);
  });
});
