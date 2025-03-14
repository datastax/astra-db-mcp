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
  | "CreateCollection"
  | "UpdateCollection"
  | "DeleteCollection"
  | "ListRecords"
  | "GetRecord"
  | "CreateRecord"
  | "UpdateRecord"
  | "DeleteRecord"
  | "FindRecord";

type Tool = {
  name: ToolName;
  description: string;
  inputSchema: Schema;
};

export const tools: Tool[] = [
  {
    name: "GetCollections",
    description: "Get all collections in the Astra DB database",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "CreateCollection",
    description: "Create a new collection in the database",
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
          description:
            "The dimensions of the vector collection, if vector is true",
          default: 1536,
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
    name: "ListRecords",
    description: "List records from a collection in the database",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to list records from",
        },
        limit: {
          type: "number",
          description: "Maximum number of records to return",
          default: 10,
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
    description: "Find records in a collection by field value",
    inputSchema: {
      type: "object",
      properties: {
        collectionName: {
          type: "string",
          description: "Name of the collection to search in",
        },
        field: {
          type: "string",
          description:
            "Field name to search by (e.g., 'title', '_id', or any property)",
        },
        value: {
          type: ["string", "number", "boolean"],
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
] as const satisfies {
  name: ToolName;
  description: string;
  inputSchema: Schema;
}[];
