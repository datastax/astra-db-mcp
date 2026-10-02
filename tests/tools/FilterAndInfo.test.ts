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
import { FindWithFilter } from "../../tools/FindWithFilter.js";
import { GetCollectionInfo } from "../../tools/GetCollectionInfo.js";
import "../mocks/db.mock.js";

describe("Filtering & Collection Info Tools", () => {
  it("FindWithFilter queries collection with complex filter and sorts", async () => {
    const results = await FindWithFilter({
      collectionName: "test_collection1",
      filter: { title: { $exists: true } },
      sort: { title: 1 },
      limit: 5,
    });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  it("GetCollectionInfo retrieves collection options and schema metadata", async () => {
    const info = await GetCollectionInfo({
      collectionName: "test_collection1",
    });

    expect(info.name).toBe("test_collection1");
    expect(info.options).toBeDefined();
  });
});
