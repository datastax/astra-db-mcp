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

export async function EstimateDocumentCount(params: {
  collectionName: string;
}) {
  const { collectionName } = params;

  const collection = db.collection(collectionName);
  
  try {
    // Try to use estimatedDocumentCount if available
    if (typeof collection.estimatedDocumentCount === 'function') {
      return await collection.estimatedDocumentCount();
    } else {
      // Last resort: get all documents and count them
      const cursor = collection.find({});
      
      // Handle the case when toArray is not available
      if (!cursor || typeof cursor.toArray !== 'function') {
        console.warn(`cursor.toArray is not available for collection '${collectionName}'`);
        return 0;
      }
      
      const documents = await cursor.toArray();
      return documents.length;
    }
  } catch (error) {
    console.error(`Error estimating document count for collection '${collectionName}':`, error);
    return 0;
  }
}