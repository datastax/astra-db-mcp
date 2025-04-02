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

// Write a test for tools/EstimateDocumentCount.ts class
import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "../../util/db.js";
import { EstimateDocumentCount } from "../../tools/EstimateDocumentCount.js";

// Make TypeScript happy with the mocked module
const mockDb = db as unknown as {
  estimatedDocumentCount: ReturnType<typeof vi.fn>;
};
  
describe("EstimateDocumentCount Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  it("should return an estimated document count of the passed collection", async () => {
    const collectionName = "new_empty_collection1";

    // Call the function
    const result = await EstimateDocumentCount({ collectionName });

    // Verify the mock was called
    expect(mockDb.estimatedDocumentCount).toHaveBeenCalledTimes(1);
    expect(mockDb.estimatedDocumentCount).toHaveBeenCalledWith(collectionName);

    // Verify the result
    expect(result).toEqual([0]);
  });
});