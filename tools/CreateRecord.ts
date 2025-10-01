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

import { db } from "../util/db.js";

// Define the return type to include all properties needed by both tests and index.ts
type CreateRecordResult = Record<string, any> & {
  _id: string;
  id: string;
  message: string;
  success: boolean;
};

export async function CreateRecord(params: {
  collectionName: string;
  record: Record<string, any>;
}): Promise<CreateRecordResult> {
  const { collectionName, record } = params;

  const collection = db.collection(collectionName);
  const result = await collection.insertOne(record);

  // Create a response that satisfies both the tests and the index.ts usage
  const id = record._id || result.insertedId;
  
  // Create the response object with all required properties
  const response: CreateRecordResult = {
    ...record,
    _id: id,
    id: id,
    message: `Record created successfully in collection '${collectionName}'`,
    success: true
  };

  return response;
}
