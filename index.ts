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

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { ToolName, tools } from "./tools.js";
import { GetCollections } from "./tools/GetCollections.js";
import { CreateCollection } from "./tools/CreateCollection.js";
import { UpdateCollection } from "./tools/UpdateCollection.js";
import { DeleteCollection } from "./tools/DeleteCollection.js";
import { ListRecords } from "./tools/ListRecords.js";
import { GetRecord } from "./tools/GetRecord.js";
import { CreateRecord } from "./tools/CreateRecord.js";
import { UpdateRecord } from "./tools/UpdateRecord.js";
import { DeleteRecord } from "./tools/DeleteRecord.js";
import { FindRecord } from "./tools/FindRecord.js";

const server = new Server(
  {
    name: "astra-db-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        list: true,
        call: true,
      },
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name as ToolName;
  const args = request.params.arguments || {};

  switch (toolName) {
    case "GetCollections":
      const collections = await GetCollections();
      return {
        content: [
          {
            type: "text",
            text: collections.map((c) => c.name).join("\n"),
          },
        ],
      };

    case "CreateCollection":
      const createResult = await CreateCollection({
        collectionName: args.collectionName as string,
        vector: args.vector as boolean | undefined,
        dimension: args.dimension as number | undefined,
      });
      return {
        content: [
          {
            type: "text",
            text: createResult.message,
          },
        ],
      };

    case "UpdateCollection":
      const updateResult = await UpdateCollection({
        collectionName: args.collectionName as string,
        newName: args.newName as string,
      });
      return {
        content: [
          {
            type: "text",
            text: updateResult.message,
          },
        ],
      };

    case "DeleteCollection":
      const deleteResult = await DeleteCollection({
        collectionName: args.collectionName as string,
      });
      return {
        content: [
          {
            type: "text",
            text: deleteResult.message,
          },
        ],
      };

    case "ListRecords":
      const records = await ListRecords({
        collectionName: args.collectionName as string,
        limit: args.limit as number | undefined,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(records, null, 2),
          },
        ],
      };

    case "GetRecord":
      const record = await GetRecord({
        collectionName: args.collectionName as string,
        recordId: args.recordId as string,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(record, null, 2),
          },
        ],
      };

    case "CreateRecord":
      const createRecordResult = await CreateRecord({
        collectionName: args.collectionName as string,
        record: args.record as Record<string, any>,
      });
      return {
        content: [
          {
            type: "text",
            text: `${createRecordResult.message}\nID: ${createRecordResult.id}`,
          },
        ],
      };

    case "UpdateRecord":
      const updateRecordResult = await UpdateRecord({
        collectionName: args.collectionName as string,
        recordId: args.recordId as string,
        record: args.record as Record<string, any>,
      });
      return {
        content: [
          {
            type: "text",
            text: updateRecordResult.message,
          },
        ],
      };

    case "DeleteRecord":
      const deleteRecordResult = await DeleteRecord({
        collectionName: args.collectionName as string,
        recordId: args.recordId as string,
      });
      return {
        content: [
          {
            type: "text",
            text: deleteRecordResult.message,
          },
        ],
      };

    case "FindRecord":
      const foundRecords = await FindRecord({
        collectionName: args.collectionName as string,
        field: args.field as string,
        value: args.value as string | number | boolean,
        limit: args.limit as number | undefined,
      });
      return {
        content: [
          {
            type: "text",
            text:
              foundRecords.length === 0
                ? "No matching records found."
                : JSON.stringify(foundRecords, null, 2),
          },
        ],
      };

    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
