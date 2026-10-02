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

import { vi } from "vitest";
import { mockDb, mockDbAdmin, getDbKeyspace, setDbKeyspace, getDbAdmin } from "./mocks/db.mock.js";

// Mock environment variables
process.env.ASTRA_DB_APPLICATION_TOKEN = "test-token";
process.env.ASTRA_DB_API_ENDPOINT = "test-endpoint";

// Mock the database module using the centralized mockDb
vi.mock("../util/db.js", () => {
  return {
    db: mockDb,
    getDbAdmin,
    setDbKeyspace,
    getDbKeyspace,
  };
});
