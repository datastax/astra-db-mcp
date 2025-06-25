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

import "dotenv/config";
import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);

const endpoint = process.env.ASTRA_DB_API_ENDPOINT || "https://api.astra.datastax.com";
const keyspace = process.env.ASTRA_DB_KEYSPACE;

const dbOptions = keyspace ? { keyspace: keyspace } : undefined;

export const db = client.db(endpoint, dbOptions);
