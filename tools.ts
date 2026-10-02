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

import type { Schema } from "jsonschema";

export type ToolName =
  | "GetCollections"
  | "GetCollectionInfo"
  | "CreateCollection"
  | "UpdateCollection"
  | "DeleteCollection"
  | "EstimateDocumentCount"
  | "ListRecords"
  | "GetRecord"
  | "CreateRecord"
  | "UpdateRecord"
  | "DeleteRecord"
  | "FindRecord"
  | "FindDistinctValues"
  | "FindWithFilter"
  | "FindWithVector"
  | "FindWithVectorize"
  | "FindAndRerank"
  | "VectorSearch"
  | "HybridSearch"
  | "BulkCreateRecords"
  | "BulkUpdateRecords"
  | "BulkDeleteRecords"
  | "ListTables"
  | "CreateTable"
  | "AlterTable"
  | "DropTable"
  | "QueryTable"
  | "InsertTableRow"
  | "UpdateTableRow"
  | "DeleteTableRow"
  | "CreateTableIndex"
  | "CreateTableVectorIndex"
  | "ListKeyspaces"
  | "CreateKeyspace"
  | "DropKeyspace"
  | "UseKeyspace"
  | "GetCurrentKeyspace"
  | "ListEmbeddingProviders"
  | "ListRerankingProviders"
  | "GetDatabaseInfo"
  | "OpenBrowser"
  | "HelpAddToClient";

export type Tool = {
  name: ToolName;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, any>;
    required?: string[];
    [key: string]: any;
  };
};

export const tools: Tool[] = [
  // Collections
  {
    name: "GetCollections",
    description: "Get all collections in the active Astra DB keyspace",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "GetCollectionInfo",
    description: "Get metadata, options, vector settings, and defaultId type of a collection",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to inspect",
        },
      },
      required: ["collectionName"],
    },
  },
  {
    name: "CreateCollection",
    description: "Create a new collection with optional vector, metric, auto-vectorize service, or indexing options",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to create",
        },
        vector: {
          type: "boolean",
          description: "Whether to create a vector collection",
          default: true,
        },
        dimension: {
          type: "number",
          description: "Vector dimensions (e.g., 1536 for OpenAI, 384 for MiniLM)",
          default: 1536,
        },
        metric: {
          type: "string",
          enum: ["cosine", "euclidean", "dot_product"],
          description: "Similarity metric for vector comparisons",
          default: "cosine",
        },
        service: {
          type: "object",
          description: "Vectorize auto-embedding provider configuration",
          properties: {
            provider: { type: "string", description: "Embedding provider name (e.g., 'openai', 'cohere', 'nvidia')" },
            modelName: { type: "string", description: "Model name for embedding generation" },
            parameters: { type: "object", description: "Optional provider-specific model parameters" },
            authentication: { type: "object", description: "Optional provider authentication tokens/keys" },
          },
          required: ["provider", "modelName"],
        },
        defaultId: {
          type: "object",
          description: "Default ID generation type",
          properties: {
            type: { type: "string", enum: ["objectId", "uuid", "uuidv6", "uuidv7", "default"] },
          },
        },
        indexing: {
          type: "object",
          description: "Collection indexing rules",
          properties: {
            allow: { type: "array", items: { type: "string" } },
            deny: { type: "array", items: { type: "string" } },
          },
        },
      },
      required: ["collectionName"],
    },
  },
  {
    name: "UpdateCollection",
    description: "Update an existing collection in the database",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to update",
        },
        newName: {
          type: "string",
          description: "New name for the collection",
        },
      },
      required: ["collectionName", "newName"],
    },
  },
  {
    name: "DeleteCollection",
    description: "Delete a collection from the database",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to delete",
        },
      },
      required: ["collectionName"],
    },
  },
  {
    name: "EstimateDocumentCount",
    description: "Estimate the number of documents in a collection using a fast, approximate count method",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to estimate document count for",
        },
      },
      required: ["collectionName"],
    },
  },

  // Document Operations & Queries
  {
    name: "ListRecords",
    description: "List records from a collection with optional sorting, pagination, and projection",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to list records from",
        },
        limit: {
          type: "number",
          description: "Maximum number of records to return (default: 10)",
          default: 10,
        },
        skip: {
          type: "number",
          description: "Number of documents to skip for pagination",
          default: 0,
        },
        sort: {
          type: "object",
          description: "Sort criteria object, e.g. { createdAt: -1 }",
        },
        projection: {
          type: "object",
          description: "Projection object to include/exclude specific fields",
        },
      },
      required: ["collectionName"],
    },
  },
  {
    name: "GetRecord",
    description: "Get a specific record from a collection by ID",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to get the record from",
        },
        recordId: {
          type: "string",
          description: "ID of the record to retrieve",
        },
      },
      required: ["collectionName", "recordId"],
    },
  },
  {
    name: "CreateRecord",
    description: "Create a new record in a collection",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to create the record in",
        },
        record: {
          type: "object",
          description: "The record data to insert",
        },
      },
      required: ["collectionName", "record"],
    },
  },
  {
    name: "UpdateRecord",
    description: "Update an existing record in a collection",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection containing the record",
        },
        recordId: {
          type: "string",
          description: "ID of the record to update",
        },
        record: {
          type: "object",
          description: "The updated record data",
        },
      },
      required: ["collectionName", "recordId", "record"],
    },
  },
  {
    name: "DeleteRecord",
    description: "Delete a record from a collection",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection containing the record",
        },
        recordId: {
          type: "string",
          description: "ID of the record to delete",
        },
      },
      required: ["collectionName", "recordId"],
    },
  },
  {
    name: "FindRecord",
    description: "Find records in a collection by a single field value",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to search in",
        },
        field: {
          type: "string",
          description: "Field name to search by (e.g., 'title', '_id', or any property)",
        },
        value: {
          type: "string",
          description: "Value to search for in the specified field",
        },
        limit: {
          type: "number",
          description: "Maximum number of records to return",
          default: 10,
        },
      },
      required: ["collectionName", "field", "value"],
    },
  },
  {
    name: "FindDistinctValues",
    description: "Find distinct values for a field in a collection",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to search in",
        },
        field: {
          type: "string",
          description: "Field name to get distinct values for",
        },
        filter: {
          type: "object",
          description: "Optional filter criteria to apply before finding distinct values",
        },
      },
      required: ["collectionName", "field"],
    },
  },
  {
    name: "FindWithFilter",
    description: "Find records in a collection using rich MongoDB-style filter expressions ($and, $or, $gt, $in, $exists, etc.) with sorting and pagination",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to search in",
        },
        filter: {
          type: "object",
          description: "Filter criteria (e.g. { age: { $gt: 25 }, status: { $in: ['active', 'pending'] } })",
        },
        sort: {
          type: "object",
          description: "Sort criteria, e.g. { createdAt: -1 }",
        },
        projection: {
          type: "object",
          description: "Projection object to select specific fields",
        },
        limit: {
          type: "number",
          description: "Maximum number of records to return",
          default: 10,
        },
        skip: {
          type: "number",
          description: "Number of records to skip",
          default: 0,
        },
      },
      required: ["collectionName", "filter"],
    },
  },
  {
    name: "FindWithVector",
    description: "Find records via vector similarity search using raw vector embeddings",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the vector collection",
        },
        vector: {
          type: "array",
          items: { type: "number" },
          description: "Dense vector array (e.g. [0.12, 0.45, -0.31, ...])",
        },
        filter: {
          type: "object",
          description: "Optional metadata filter criteria applied alongside vector search",
        },
        limit: {
          type: "number",
          description: "Maximum number of nearest records to return",
          default: 10,
        },
        skip: {
          type: "number",
          description: "Number of records to skip",
          default: 0,
        },
        includeSimilarity: {
          type: "boolean",
          description: "Whether to return the $similarity score with each document",
          default: true,
        },
        projection: {
          type: "object",
          description: "Projection object to include/exclude fields",
        },
      },
      required: ["collectionName", "vector"],
    },
  },
  {
    name: "FindWithVectorize",
    description: "Find records in a vectorized collection using plain text (auto-vectorization using collection's embedding service)",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the vectorize-enabled collection",
        },
        vectorize: {
          type: "string",
          description: "Natural language search query to auto-embed and search",
        },
        filter: {
          type: "object",
          description: "Optional metadata filter criteria",
        },
        limit: {
          type: "number",
          description: "Maximum number of nearest records to return",
          default: 10,
        },
        skip: {
          type: "number",
          description: "Number of records to skip",
          default: 0,
        },
        includeSimilarity: {
          type: "boolean",
          description: "Whether to return $similarity score",
          default: true,
        },
        projection: {
          type: "object",
          description: "Projection object to include/exclude fields",
        },
      },
      required: ["collectionName", "vectorize"],
    },
  },
  {
    name: "FindAndRerank",
    description: "Perform hybrid (lexical + vector) search with optional reranking on a collection",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection",
        },
        filter: {
          type: "object",
          description: "Optional filter criteria",
        },
        hybrid: {
          type: "object",
          description: "Hybrid search specifications",
          properties: {
            vector: { type: "array", items: { type: "number" }, description: "Explicit query vector" },
            vectorize: { type: "string", description: "Query string to vectorize" },
            lexical: { type: "string", description: "Lexical search query string" },
          },
        },
        rerankQuery: {
          type: "string",
          description: "Query string used by the reranker model",
        },
        rerankOn: {
          type: "string",
          description: "Document field name to perform reranking on",
        },
        limit: {
          type: "number",
          description: "Maximum number of top reranked records to return",
          default: 10,
        },
        includeScores: {
          type: "boolean",
          description: "Whether to return $similarity and $rerankerScore",
          default: true,
        },
        projection: {
          type: "object",
          description: "Projection object to select specific fields",
        },
      },
      required: ["collectionName", "hybrid"],
    },
  },
  {
    name: "BulkCreateRecords",
    description: "Create multiple records in a collection at once",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to create the records in",
        },
        records: {
          type: "array",
          description: "Array of records to insert",
          items: {
            type: "object",
          },
        },
      },
      required: ["collectionName", "records"],
    },
  },
  {
    name: "BulkUpdateRecords",
    description: "Update multiple records in a collection at once",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection containing the records",
        },
        records: {
          type: "array",
          description: "Array of records to update with their IDs",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "ID of the record to update",
              },
              record: {
                type: "object",
                description: "The updated record data",
              },
            },
            required: ["id", "record"],
          },
        },
      },
      required: ["collectionName", "records"],
    },
  },
  {
    name: "BulkDeleteRecords",
    description: "Delete multiple records from a collection at once",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection containing the records",
        },
        recordIds: {
          type: "array",
          description: "Array of record IDs to delete",
          items: {
            type: "string",
          },
        },
      },
      required: ["collectionName", "recordIds"],
    },
  },

  // Tables (Astra DB Data API v2)
  {
    name: "ListTables",
    description: "List all tables in the current keyspace",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "CreateTable",
    description: "Create a structured table with typed columns and primary key in Astra DB",
    inputSchema: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "Name of the table to create",
        },
        definition: {
          type: "object",
          description: "Table schema definition with column types and primary key",
          properties: {
            columns: {
              type: "object",
              description: "Mapping of column names to types (e.g. text, int, bigint, boolean, timestamp, uuid, vector)",
            },
            primaryKey: {
              description: "Primary key definition (single column name, array of partition/clustering keys, or composite primary key object)",
            },
          },
          required: ["columns", "primaryKey"],
        },
        ifNotExists: {
          type: "boolean",
          description: "Do not error if table already exists",
          default: false,
        },
      },
      required: ["tableName", "definition"],
    },
  },
  {
    name: "AlterTable",
    description: "Alter a table schema (add columns, drop columns, add vector columns)",
    inputSchema: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "Name of the table to alter",
        },
        operation: {
          type: "object",
          description: "Alter operations object (e.g., { addColumns: { age: 'int' } })",
          properties: {
            addColumns: { type: "object", description: "Columns to add with their types" },
            dropColumns: { type: "array", items: { type: "string" }, description: "Column names to drop" },
            addVectorColumns: { type: "object", description: "Vector columns to add" },
          },
        },
      },
      required: ["tableName", "operation"],
    },
  },
  {
    name: "DropTable",
    description: "Drop a table from the current keyspace",
    inputSchema: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "Name of the table to drop",
        },
        ifExists: {
          type: "boolean",
          description: "Do not error if table does not exist",
          default: false,
        },
      },
      required: ["tableName"],
    },
  },
  {
    name: "QueryTable",
    description: "Query rows in a table with filter, sorting, pagination, and projection",
    inputSchema: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "Name of the table to query",
        },
        filter: {
          type: "object",
          description: "Filter criteria for rows",
        },
        sort: {
          type: "object",
          description: "Sort criteria object",
        },
        projection: {
          type: "object",
          description: "Columns to include in result",
        },
        limit: {
          type: "number",
          description: "Maximum number of rows to return",
          default: 10,
        },
        skip: {
          type: "number",
          description: "Number of rows to skip",
          default: 0,
        },
      },
      required: ["tableName"],
    },
  },
  {
    name: "InsertTableRow",
    description: "Insert a single row or multiple rows into a table",
    inputSchema: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "Name of the table",
        },
        row: {
          type: "object",
          description: "Single row object to insert",
        },
        rows: {
          type: "array",
          items: { type: "object" },
          description: "Multiple row objects to insert in batch",
        },
      },
      required: ["tableName"],
    },
  },
  {
    name: "UpdateTableRow",
    description: "Update one or multiple rows matching a filter in a table",
    inputSchema: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "Name of the table",
        },
        filter: {
          type: "object",
          description: "Filter to match rows to update",
        },
        update: {
          type: "object",
          description: "Update operation payload (e.g. { $set: { status: 'active' } })",
        },
        many: {
          type: "boolean",
          description: "Whether to update all matching rows or just one",
          default: false,
        },
      },
      required: ["tableName", "filter", "update"],
    },
  },
  {
    name: "DeleteTableRow",
    description: "Delete one or multiple rows matching a filter from a table",
    inputSchema: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "Name of the table",
        },
        filter: {
          type: "object",
          description: "Filter to match rows to delete",
        },
        many: {
          type: "boolean",
          description: "Whether to delete all matching rows or just one",
          default: false,
        },
      },
      required: ["tableName", "filter"],
    },
  },
  {
    name: "CreateTableIndex",
    description: "Create a regular secondary index on a table column",
    inputSchema: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "Name of the table",
        },
        indexName: {
          type: "string",
          description: "Name of the index to create",
        },
        column: {
          type: "string",
          description: "Column name to index",
        },
        options: {
          type: "object",
          description: "Index options (ascii, caseSensitive, normalize)",
          properties: {
            ascii: { type: "boolean" },
            caseSensitive: { type: "boolean" },
            normalize: { type: "boolean" },
          },
        },
      },
      required: ["tableName", "indexName", "column"],
    },
  },
  {
    name: "CreateTableVectorIndex",
    description: "Create a vector index on a vector column in a table",
    inputSchema: {
      type: "object",
      properties: {
        tableName: {
          type: "string",
          description: "Name of the table",
        },
        indexName: {
          type: "string",
          description: "Name of the vector index",
        },
        column: {
          type: "string",
          description: "Vector column name",
        },
        metric: {
          type: "string",
          enum: ["cosine", "euclidean", "dot_product"],
          description: "Distance metric for vector search",
          default: "cosine",
        },
        service: {
          type: "object",
          description: "Vectorize auto-embedding provider settings if applicable",
          properties: {
            provider: { type: "string" },
            modelName: { type: "string" },
            parameters: { type: "object" },
            authentication: { type: "object" },
          },
        },
      },
      required: ["tableName", "indexName", "column"],
    },
  },

  // Keyspace Administration
  {
    name: "ListKeyspaces",
    description: "List all keyspaces in the Astra DB database",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "CreateKeyspace",
    description: "Create a new keyspace in the Astra DB database",
    inputSchema: {
      type: "object",
      properties: {
        keyspaceName: {
          type: "string",
          description: "Name of the keyspace to create",
        },
        updateDbKeyspace: {
          type: "boolean",
          description: "Whether to immediately switch the active connection keyspace to this newly created keyspace",
          default: false,
        },
      },
      required: ["keyspaceName"],
    },
  },
  {
    name: "DropKeyspace",
    description: "Drop a keyspace from the Astra DB database",
    inputSchema: {
      type: "object",
      properties: {
        keyspaceName: {
          type: "string",
          description: "Name of the keyspace to drop",
        },
      },
      required: ["keyspaceName"],
    },
  },
  {
    name: "UseKeyspace",
    description: "Switch the active working keyspace for subsequent queries",
    inputSchema: {
      type: "object",
      properties: {
        keyspaceName: {
          type: "string",
          description: "Name of the keyspace to switch to",
        },
      },
      required: ["keyspaceName"],
    },
  },
  {
    name: "GetCurrentKeyspace",
    description: "Get the currently active keyspace",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },

  // Admin & Provider Discovery
  {
    name: "ListEmbeddingProviders",
    description: "List all available vector embedding providers and models supported by Astra DB Vectorize",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ListRerankingProviders",
    description: "List all available reranking providers and models supported by Astra DB for hybrid search",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "GetDatabaseInfo",
    description: "Get database environment metadata (id, name, region, environment, status, keyspaces)",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },

  // Utilities
  {
    name: "VectorSearch",
    description: "Search for records in a collection using vector similarity",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to search in",
        },
        queryVector: {
          type: "array",
          description: "The vector to search for similar vectors",
          items: {
            type: "number",
          },
        },
        limit: {
          type: "number",
          description: "Maximum number of records to return",
          default: 10,
        },
        minScore: {
          type: "number",
          description: "Minimum similarity score (0.0 to 1.0)",
          default: 0.0,
        },
        filter: {
          type: "object",
          description: "Additional filter criteria for the search",
        },
      },
      required: ["collectionName", "queryVector"],
    },
  },
  {
    name: "HybridSearch",
    description: "Search for records using both vector similarity and text matching",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to search in",
        },
        queryVector: {
          type: "array",
          description: "The vector to search for similar vectors",
          items: {
            type: "number",
          },
        },
        textQuery: {
          type: "string",
          description: "The text query to search for",
        },
        weights: {
          type: "object",
          description: "Weights for vector and text components",
          properties: {
            vector: {
              type: "number",
              description: "Weight for vector similarity (0.0 to 1.0)",
              default: 0.7,
            },
            text: {
              type: "number",
              description: "Weight for text matching (0.0 to 1.0)",
              default: 0.3,
            },
          },
        },
        limit: {
          type: "number",
          description: "Maximum number of records to return",
          default: 10,
        },
        fields: {
          type: "array",
          description: "Fields to search in for text matching",
          items: {
            type: "string",
          },
          default: ["*"],
        },
      },
      required: ["collectionName", "queryVector", "textQuery"],
    },
  },
  {
    name: "OpenBrowser",
    description: "Open a web browser to a specific URL",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to open in the browser",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "HelpAddToClient",
    description: "Help the user add the Astra DB client to their MCP client",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
] as const satisfies Tool[];
