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
import { GetCollections } from "../../tools/GetCollections.js";
import { db } from "../../util/db.js";

// Make TypeScript happy with the mocked module
const mockDb = db as unknown as {
  listCollections: ReturnType<typeof vi.fn>;
};

describe("GetCollections Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  it("should return a list of collections", async () => {
    // Call the function
    const result = await GetCollections();

    // Verify the mock was called
    expect(mockDb.listCollections).toHaveBeenCalledTimes(1);

    // Verify the result
    expect(result).toEqual([
      { name: "test_collection1", type: "vector" },
      { name: "test_collection2", type: "document" },
    ]);
  });
});
