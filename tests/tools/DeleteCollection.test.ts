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
import { DeleteCollection } from "../../tools/DeleteCollection.js";
import { mockDb } from "../mocks/db.mock.js";

describe("DeleteCollection Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    mockDb.dropCollection.mockClear();
  });

  it("should delete a collection", async () => {
    const collectionName = "test_collection";

    // Call the function
    const result = await DeleteCollection({
      collectionName,
    });

    // Verify the mock was called with correct parameters
    expect(mockDb.dropCollection).toHaveBeenCalledTimes(1);
    expect(mockDb.dropCollection).toHaveBeenCalledWith(collectionName);

    // Verify the result
    expect(result.success).toBe(true);
    expect(result.message).toContain(collectionName);
  });
});
