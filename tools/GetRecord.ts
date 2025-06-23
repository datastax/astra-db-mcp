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
import { sanitizeRecordData } from "../util/sanitize.js";

export async function GetRecord(params: {
  collectionName: string;
  recordId: string;
}) {
  const { collectionName, recordId } = params;

  const collection = db.collection(collectionName);
  const record = await collection.findOne({ _id: recordId });

  if (!record) {
    throw new Error(
      `Record with ID '${recordId}' not found in collection '${collectionName}'`
    );
  }

  // Return sanitized record to prevent prompt injection attacks
  return sanitizeRecordData(record);
}
