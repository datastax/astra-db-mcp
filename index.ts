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

import { Server, ProtocolError, METHOD_NOT_FOUND } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { ToolName, tools } from "./tools.js";

// Collections & Records
import { GetCollections } from "./tools/GetCollections.js";
import { GetCollectionInfo } from "./tools/GetCollectionInfo.js";
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
import { FindWithFilter } from "./tools/FindWithFilter.js";
import { FindWithVector } from "./tools/FindWithVector.js";
import { FindWithVectorize } from "./tools/FindWithVectorize.js";
import { FindAndRerank } from "./tools/FindAndRerank.js";
import { VectorSearch } from "./tools/VectorSearch.js";
import { HybridSearch } from "./tools/HybridSearch.js";
import { BulkCreateRecords } from "./tools/BulkCreateRecords.js";
import { BulkUpdateRecords } from "./tools/BulkUpdateRecords.js";
import { BulkDeleteRecords } from "./tools/BulkDeleteRecords.js";
import { EstimateDocumentCount } from "./tools/EstimateDocumentCount.js";

// Tables
import { ListTables } from "./tools/ListTables.js";
import { CreateTable } from "./tools/CreateTable.js";
import { AlterTable } from "./tools/AlterTable.js";
import { DropTable } from "./tools/DropTable.js";
import { QueryTable } from "./tools/QueryTable.js";
import { InsertTableRow } from "./tools/InsertTableRow.js";
import { UpdateTableRow } from "./tools/UpdateTableRow.js";
import { DeleteTableRow } from "./tools/DeleteTableRow.js";
import { CreateTableIndex } from "./tools/CreateTableIndex.js";
import { CreateTableVectorIndex } from "./tools/CreateTableVectorIndex.js";

// Keyspaces & Admin
import { ListKeyspaces } from "./tools/ListKeyspaces.js";
import { CreateKeyspace } from "./tools/CreateKeyspace.js";
import { DropKeyspace } from "./tools/DropKeyspace.js";
import { UseKeyspace } from "./tools/UseKeyspace.js";
import { GetCurrentKeyspace } from "./tools/GetCurrentKeyspace.js";
import { ListEmbeddingProviders } from "./tools/ListEmbeddingProviders.js";
import { ListRerankingProviders } from "./tools/ListRerankingProviders.js";
import { GetDatabaseInfo } from "./tools/GetDatabaseInfo.js";

// Utilities
import { OpenBrowser } from "./tools/OpenBrowser.js";
import { HelpAddToClient } from "./tools/HelpAddToClient.js";
import { sanitizeRecordData } from "./util/sanitize.js";
import { AstraError, AstraErrorCode, createErrorFromException } from "./util/errors.js";

const server = new Server(
  {
    name: "astra-db-mcp-server",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler("tools/list", async () => {
  return {
    tools,
  };
});

server.setRequestHandler("tools/call", async (request: any) => {
  const toolName = request.params?.name as ToolName;
  const args = (request.params?.arguments || {}) as Record<string, any>;

  try {
    switch (toolName) {
      // Collections
      case "GetCollections": {
        const collections = await GetCollections();
        return {
          content: [
            {
              type: "text",
              text: collections.map((c) => c.name).join("\n"),
            },
          ],
        };
      }

      case "GetCollectionInfo": {
        const info = await GetCollectionInfo({
          collectionName: args.collectionName as string,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      case "CreateCollection": {
        const createResult = await CreateCollection({
          collectionName: args.collectionName as string,
          vector: args.vector as boolean | undefined,
          dimension: args.dimension as number | undefined,
          metric: args.metric,
          service: args.service,
          defaultId: args.defaultId,
          indexing: args.indexing,
        });
        return {
          content: [
            {
              type: "text",
              text: createResult.message,
            },
          ],
        };
      }

      case "EstimateDocumentCount": {
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
      }

      case "UpdateCollection": {
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
      }

      case "DeleteCollection": {
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
      }

      // Record Operations
      case "ListRecords": {
        const records = await ListRecords({
          collectionName: args.collectionName as string,
          limit: args.limit as number | undefined,
          skip: args.skip as number | undefined,
          sort: args.sort as Record<string, 1 | -1> | undefined,
          projection: args.projection as Record<string, any> | undefined,
        });
        const sanitizedRecords = sanitizeRecordData(records);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitizedRecords, null, 2),
            },
          ],
        };
      }

      case "GetRecord": {
        const record = await GetRecord({
          collectionName: args.collectionName as string,
          recordId: args.recordId as string,
        });
        const sanitizedRecord = sanitizeRecordData(record);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitizedRecord, null, 2),
            },
          ],
        };
      }

      case "CreateRecord": {
        const createRecordResult = await CreateRecord({
          collectionName: args.collectionName as string,
          record: args.record as Record<string, any>,
        });
        const recordId = (createRecordResult as any).insertedId || (createRecordResult as any)._id || (createRecordResult as any).id;
        return {
          content: [
            {
              type: "text",
              text: `Record created successfully in "${args.collectionName}"\nID: ${recordId}`,
            },
          ],
        };
      }

      case "UpdateRecord": {
        const updateRecordResult = await UpdateRecord({
          collectionName: args.collectionName as string,
          recordId: args.recordId as string,
          record: args.record as Record<string, any>,
        });
        return {
          content: [
            {
              type: "text",
              text: `Record updated successfully in "${args.collectionName}"\nID: ${updateRecordResult._id}`,
            },
          ],
        };
      }

      case "DeleteRecord": {
        const deleteRecordResult = await DeleteRecord({
          collectionName: args.collectionName as string,
          recordId: args.recordId as string,
        });
        return {
          content: [
            {
              type: "text",
              text: `Record deleted successfully from "${args.collectionName}"\nID: ${deleteRecordResult._id}`,
            },
          ],
        };
      }

      case "FindRecord": {
        const foundRecords = await FindRecord({
          collectionName: args.collectionName as string,
          field: args.field as string,
          value: args.value as string,
          limit: args.limit as number | undefined,
        });
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
      }

      case "FindDistinctValues": {
        const distinctValues = await FindDistinctValues({
          collectionName: args.collectionName as string,
          field: args.field as string,
          filter: args.filter as Record<string, any> | undefined,
        });
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
      }

      case "FindWithFilter": {
        const records = await FindWithFilter({
          collectionName: args.collectionName as string,
          filter: args.filter as Record<string, any>,
          sort: args.sort as Record<string, 1 | -1> | undefined,
          projection: args.projection as Record<string, any> | undefined,
          limit: args.limit as number | undefined,
          skip: args.skip as number | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text:
                records.length === 0
                  ? "No matching records found."
                  : JSON.stringify(records, null, 2),
            },
          ],
        };
      }

      case "FindWithVector": {
        const records = await FindWithVector({
          collectionName: args.collectionName as string,
          vector: args.vector as number[],
          filter: args.filter as Record<string, any> | undefined,
          limit: args.limit as number | undefined,
          skip: args.skip as number | undefined,
          includeSimilarity: args.includeSimilarity as boolean | undefined,
          projection: args.projection as Record<string, any> | undefined,
        });
        const sanitizedRecords = sanitizeRecordData(records);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitizedRecords, null, 2),
            },
          ],
        };
      }

      case "VectorSearch": {
        const vectorSearchResults = await VectorSearch({
          collectionName: args.collectionName as string,
          queryVector: args.queryVector as number[],
          limit: args.limit as number | undefined,
          minScore: args.minScore as number | undefined,
          filter: args.filter as Record<string, any> | undefined,
        });
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
      }

      case "HybridSearch": {
        const hybridSearchResults = await HybridSearch({
          collectionName: args.collectionName as string,
          queryVector: args.queryVector as number[],
          textQuery: args.textQuery as string,
          weights: args.weights as { vector: number; text: number } | undefined,
          limit: args.limit as number | undefined,
          fields: args.fields as string[] | undefined,
        });
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
      }

      case "FindWithVectorize": {
        const records = await FindWithVectorize({
          collectionName: args.collectionName as string,
          vectorize: args.vectorize as string,
          filter: args.filter as Record<string, any> | undefined,
          limit: args.limit as number | undefined,
          skip: args.skip as number | undefined,
          includeSimilarity: args.includeSimilarity as boolean | undefined,
          projection: args.projection as Record<string, any> | undefined,
        });
        const sanitizedRecords = sanitizeRecordData(records);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitizedRecords, null, 2),
            },
          ],
        };
      }

      case "FindAndRerank": {
        const records = await FindAndRerank({
          collectionName: args.collectionName as string,
          filter: args.filter as Record<string, any> | undefined,
          hybrid: args.hybrid,
          rerankQuery: args.rerankQuery as string | undefined,
          rerankOn: args.rerankOn as string | undefined,
          limit: args.limit as number | undefined,
          includeScores: args.includeScores as boolean | undefined,
          projection: args.projection as Record<string, any> | undefined,
        });
        const sanitizedRecords = sanitizeRecordData(records);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sanitizedRecords, null, 2),
            },
          ],
        };
      }

      case "BulkCreateRecords": {
        const bulkCreateResult = await BulkCreateRecords({
          collectionName: args.collectionName as string,
          records: args.records as Record<string, any>[],
        });
        return {
          content: [
            {
              type: "text",
              text: `${bulkCreateResult.message}\nIDs: ${bulkCreateResult.ids.join(", ")}`,
            },
          ],
        };
      }

      case "BulkUpdateRecords": {
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
      }

      case "BulkDeleteRecords": {
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
      }

      // Table Operations
      case "ListTables": {
        const tables = await ListTables();
        return {
          content: [
            {
              type: "text",
              text: tables.length === 0 ? "No tables found." : tables.join("\n"),
            },
          ],
        };
      }

      case "CreateTable": {
        const result = await CreateTable({
          tableName: args.tableName as string,
          definition: args.definition,
          ifNotExists: args.ifNotExists as boolean | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "AlterTable": {
        const result = await AlterTable({
          tableName: args.tableName as string,
          operation: args.operation,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "DropTable": {
        const result = await DropTable({
          tableName: args.tableName as string,
          ifExists: args.ifExists as boolean | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "QueryTable": {
        const rows = await QueryTable({
          tableName: args.tableName as string,
          filter: args.filter as Record<string, any> | undefined,
          sort: args.sort as Record<string, 1 | -1> | undefined,
          projection: args.projection as Record<string, any> | undefined,
          limit: args.limit as number | undefined,
          skip: args.skip as number | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text:
                rows.length === 0
                  ? "No matching rows found."
                  : JSON.stringify(rows, null, 2),
            },
          ],
        };
      }

      case "InsertTableRow": {
        const result = await InsertTableRow({
          tableName: args.tableName as string,
          row: args.row as Record<string, any> | undefined,
          rows: args.rows as Record<string, any>[] | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "UpdateTableRow": {
        const result = await UpdateTableRow({
          tableName: args.tableName as string,
          filter: args.filter as Record<string, any>,
          update: args.update as Record<string, any>,
          many: args.many as boolean | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "DeleteTableRow": {
        const result = await DeleteTableRow({
          tableName: args.tableName as string,
          filter: args.filter as Record<string, any>,
          many: args.many as boolean | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "CreateTableIndex": {
        const result = await CreateTableIndex({
          tableName: args.tableName as string,
          indexName: args.indexName as string,
          column: args.column as string,
          options: args.options,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "CreateTableVectorIndex": {
        const result = await CreateTableVectorIndex({
          tableName: args.tableName as string,
          indexName: args.indexName as string,
          column: args.column as string,
          metric: args.metric,
          service: args.service,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      // Keyspace Administration
      case "ListKeyspaces": {
        const keyspaces = await ListKeyspaces();
        return {
          content: [
            {
              type: "text",
              text: keyspaces.join("\n"),
            },
          ],
        };
      }

      case "CreateKeyspace": {
        const result = await CreateKeyspace({
          keyspaceName: args.keyspaceName as string,
          updateDbKeyspace: args.updateDbKeyspace as boolean | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "DropKeyspace": {
        const result = await DropKeyspace({
          keyspaceName: args.keyspaceName as string,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "UseKeyspace": {
        const result = await UseKeyspace({
          keyspaceName: args.keyspaceName as string,
        });
        return {
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      case "GetCurrentKeyspace": {
        const result = await GetCurrentKeyspace();
        return {
          content: [
            {
              type: "text",
              text: `Active keyspace: ${result.keyspace}`,
            },
          ],
        };
      }

      // Admin & Provider Discovery
      case "ListEmbeddingProviders": {
        const providers = await ListEmbeddingProviders();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(providers, null, 2),
            },
          ],
        };
      }

      case "ListRerankingProviders": {
        const providers = await ListRerankingProviders();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(providers, null, 2),
            },
          ],
        };
      }

      case "GetDatabaseInfo": {
        const info = await GetDatabaseInfo();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      // Utilities
      case "OpenBrowser": {
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
      }

      case "HelpAddToClient": {
        const helpAddToClientResult = await HelpAddToClient();
        return {
          content: [
            {
              type: "text",
              text: helpAddToClientResult.instructions,
            },
          ],
        };
      }

      default:
        throw new ProtocolError(METHOD_NOT_FOUND, `Tool not found: ${toolName}`);
    }
  } catch (error) {
    console.error("Error executing tool:", error);

    // Convert the error to a structured AstraError
    const astraError = createErrorFromException(error);
    
    // Special handling for authentication errors
    if (
      astraError.code === AstraErrorCode.AUTH_MISSING_CREDENTIALS ||
      (error instanceof Error &&
        (error.message.includes("ASTRA_DB_API_ENDPOINT") ||
          error.message.includes("ASTRA_DB_APPLICATION_TOKEN") ||
          error.message.includes("Invalid URL") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("Network error") ||
          !process.env.ASTRA_DB_API_ENDPOINT ||
          !process.env.ASTRA_DB_APPLICATION_TOKEN))
    ) {
      return {
        content: [
          {
            type: "text",
            text: "It seems like you haven't configured your Astra DB credentials. Would you like me to open the Astra DB dashboard for you so you can sign up and get your credentials?",
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Error [${astraError.code}]: ${astraError.message}${
            astraError.details ? `\n\nDetails: ${JSON.stringify(astraError.details, null, 2)}` : ""
          }`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

// Made with Bob
