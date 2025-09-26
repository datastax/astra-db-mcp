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
import { FindDistinctValues } from "./tools/FindDistinctValues.js";
import { BulkCreateRecords } from "./tools/BulkCreateRecords.js";
import { BulkUpdateRecords } from "./tools/BulkUpdateRecords.js";
import { BulkDeleteRecords } from "./tools/BulkDeleteRecords.js";
import { VectorSearch } from "./tools/VectorSearch.js";
import { HybridSearch } from "./tools/HybridSearch.js";
import { OpenBrowser } from "./tools/OpenBrowser.js";
import { HelpAddToClient } from "./tools/HelpAddToClient.js";
import { EstimateDocumentCount } from "./tools/EstimateDocumentCount.js";
import { sanitizeRecordData } from "./util/sanitize.js";
import { AstraError, AstraErrorCode, createErrorFromException } from "./util/errors.js";

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

  try {
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
          metric: args.metric as "cosine" | "euclidean" | "dot_product" | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: createResult.message,
            },
          ],
        };

      case "EstimateDocumentCount":
        const count = await EstimateDocumentCount({
          collectionName: args.collectionName as string,
        });
        return {
          content: [
            {
              type: "text",
              text: `Estimated document count in "${args.collectionName}": ${count}`,
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
        // Sanitize records to prevent prompt injection
        const sanitizedRecords = sanitizeRecordData(records);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitizedRecords, null, 2),
            },
          ],
        };

      case "GetRecord":
        const record = await GetRecord({
          collectionName: args.collectionName as string,
          recordId: args.recordId as string,
        });
        // Sanitize record to prevent prompt injection
        const sanitizedRecord = sanitizeRecordData(record);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitizedRecord, null, 2),
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
          value: args.value as string,
          limit: args.limit as number | undefined,
        });
        // Sanitize found records to prevent prompt injection
        const sanitizedFoundRecords = sanitizeRecordData(foundRecords);
        return {
          content: [
            {
              type: "text",
              text:
                sanitizedFoundRecords.length === 0
                  ? "No matching records found."
                  : JSON.stringify(sanitizedFoundRecords, null, 2),
            },
          ],
        };

      case "FindDistinctValues":
        const distinctValues = await FindDistinctValues({
          collectionName: args.collectionName as string,
          field: args.field as string,
          filter: args.filter as Record<string, any> | undefined,
        });
        // Sanitize distinct values to prevent prompt injection
        const sanitizedDistinctValues = sanitizeRecordData(distinctValues);
        return {
          content: [
            {
              type: "text",
              text:
                sanitizedDistinctValues.length === 0
                  ? "No distinct values found."
                  : JSON.stringify(sanitizedDistinctValues, null, 2),
            },
          ],
        };

      case "VectorSearch":
        const vectorSearchResults = await VectorSearch({
          collectionName: args.collectionName as string,
          queryVector: args.queryVector as number[],
          limit: args.limit as number | undefined,
          minScore: args.minScore as number | undefined,
          filter: args.filter as Record<string, any> | undefined,
        });
        // Sanitize vector search results to prevent prompt injection
        const sanitizedVectorResults = sanitizeRecordData(vectorSearchResults);
        return {
          content: [
            {
              type: "text",
              text:
                sanitizedVectorResults.length === 0
                  ? "No matching records found."
                  : JSON.stringify(sanitizedVectorResults, null, 2),
            },
          ],
        };

      case "HybridSearch":
        const hybridSearchResults = await HybridSearch({
          collectionName: args.collectionName as string,
          queryVector: args.queryVector as number[],
          textQuery: args.textQuery as string,
          weights: args.weights as { vector: number; text: number } | undefined,
          limit: args.limit as number | undefined,
          fields: args.fields as string[] | undefined,
        });
        // Sanitize hybrid search results to prevent prompt injection
        const sanitizedHybridResults = sanitizeRecordData(hybridSearchResults);
        return {
          content: [
            {
              type: "text",
              text:
                sanitizedHybridResults.length === 0
                  ? "No matching records found."
                  : JSON.stringify(sanitizedHybridResults, null, 2),
            },
          ],
        };

      case "BulkCreateRecords":
        const bulkCreateResult = await BulkCreateRecords({
          collectionName: args.collectionName as string,
          records: args.records as Record<string, any>[],
        });
        return {
          content: [
            {
              type: "text",
              text: `${
                bulkCreateResult.message
              }\nIDs: ${bulkCreateResult.ids.join(", ")}`,
            },
          ],
        };

      case "BulkUpdateRecords":
        const bulkUpdateResult = await BulkUpdateRecords({
          collectionName: args.collectionName as string,
          records: args.records as Array<{
            id: string;
            record: Record<string, any>;
          }>,
        });
        return {
          content: [
            {
              type: "text",
              text: bulkUpdateResult.message,
            },
          ],
        };

      case "BulkDeleteRecords":
        const bulkDeleteResult = await BulkDeleteRecords({
          collectionName: args.collectionName as string,
          recordIds: args.recordIds as string[],
        });
        return {
          content: [
            {
              type: "text",
              text: bulkDeleteResult.message,
            },
          ],
        };

      case "OpenBrowser":
        const openBrowserResult = await OpenBrowser({
          url: args.url as string,
        });
        return {
          content: [
            {
              type: "text",
              text: openBrowserResult.message,
            },
          ],
        };

      case "HelpAddToClient":
        const helpAddToClientResult = await HelpAddToClient();
        return {
          content: [
            {
              type: "text",
              text: helpAddToClientResult.instructions,
            },
          ],
        };

      default:
        throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
    }
  } catch (error) {
    console.error("Error executing tool:", error);

    // Convert the error to a structured AstraError
    const astraError = createErrorFromException(error);
    
    // Special handling for authentication errors
    if (astraError.code === AstraErrorCode.AUTH_MISSING_CREDENTIALS) {
      return {
        content: [
          {
            type: "text",
            text: "It seems like you haven't configured your Astra DB credentials. Would you like me to open the Astra DB dashboard for you so you can sign up and get your credentials?",
          },
        ],
      };
    }
    
    // Return a structured error response
    return {
      content: [
        {
          type: "text",
          text: `Error [${astraError.code}]: ${astraError.message}${
            astraError.details ? `\n\nDetails: ${JSON.stringify(astraError.details, null, 2)}` : ""
          }`,
        },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

// Made with Bob
