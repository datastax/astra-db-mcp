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

import { describe, it, expect } from "vitest";
import { ListKeyspaces } from "../../tools/ListKeyspaces.js";
import { CreateKeyspace } from "../../tools/CreateKeyspace.js";
import { DropKeyspace } from "../../tools/DropKeyspace.js";
import { UseKeyspace } from "../../tools/UseKeyspace.js";
import { GetCurrentKeyspace } from "../../tools/GetCurrentKeyspace.js";
import { ListEmbeddingProviders } from "../../tools/ListEmbeddingProviders.js";
import { ListRerankingProviders } from "../../tools/ListRerankingProviders.js";
import { GetDatabaseInfo } from "../../tools/GetDatabaseInfo.js";
import "../mocks/db.mock.js";

describe("Keyspace & Admin Tools", () => {
  it("ListKeyspaces returns keyspace names", async () => {
    const keyspaces = await ListKeyspaces();
    expect(keyspaces).toContain("default_keyspace");
  });

  it("CreateKeyspace creates keyspace", async () => {
    const res = await CreateKeyspace({ keyspaceName: "ecommerce" });
    expect(res.success).toBe(true);
  });

  it("DropKeyspace drops keyspace", async () => {
    const res = await DropKeyspace({ keyspaceName: "ecommerce" });
    expect(res.success).toBe(true);
  });

  it("UseKeyspace switches active keyspace", async () => {
    const res = await UseKeyspace({ keyspaceName: "analytics" });
    expect(res.success).toBe(true);
    expect(res.currentKeyspace).toBe("analytics");
  });

  it("GetCurrentKeyspace returns active keyspace", async () => {
    const res = await GetCurrentKeyspace();
    expect(res.keyspace).toBeDefined();
  });

  it("ListEmbeddingProviders returns models", async () => {
    const res = await ListEmbeddingProviders();
    expect(res).toBeDefined();
  });

  it("ListRerankingProviders returns models", async () => {
    const res = await ListRerankingProviders();
    expect(res).toBeDefined();
  });

  it("GetDatabaseInfo returns database metadata", async () => {
    const res = await GetDatabaseInfo();
    expect(res).toBeDefined();
    expect(res.status).toBe("ACTIVE");
  });
});
