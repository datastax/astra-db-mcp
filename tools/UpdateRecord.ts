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

export async function UpdateRecord(params: {
  collectionName: string;
  recordId: string;
  record: Record<string, any>;
}) {
  const { collectionName, recordId, record } = params;

  const collection = db.collection(collectionName);

  // Remove _id from the record if it exists, as it cannot be updated
  const updateData = { ...record };
  delete updateData._id;

  const result = await collection.updateOne(
    { _id: recordId },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    throw new Error(
      `Record with ID '${recordId}' not found in collection '${collectionName}'`
    );
  }

  return {
    success: true,
    message: `Record '${recordId}' updated successfully in collection '${collectionName}'`,
  };
}
