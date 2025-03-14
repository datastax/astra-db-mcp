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

export async function UpdateCollection(params: {
  collectionName: string;
  newName: string;
}) {
  const { collectionName, newName } = params;

  // Check if source collection exists
  const collections = await db.listCollections();
  const sourceCollectionExists = collections.some(
    (collection) => collection.name === collectionName
  );

  if (!sourceCollectionExists) {
    throw new Error(`Collection '${collectionName}' does not exist`);
  }

  // Check if target collection already exists
  const targetCollectionExists = collections.some(
    (collection) => collection.name === newName
  );

  if (targetCollectionExists) {
    throw new Error(`Collection '${newName}' already exists`);
  }

  // Create new collection
  const sourceCollection = db.collection(collectionName);
  // Get the source collection info to preserve settings
  const collectionInfo = await sourceCollection.find({}).limit(1).toArray();
  const hasVectors =
    collectionInfo.length > 0 && collectionInfo[0].$vector !== undefined;

  // Create the new collection with the same settings
  if (hasVectors) {
    const vectorDimension = collectionInfo[0].$vector.length;
    await db.createCollection(newName, {
      vector: {
        dimension: vectorDimension,
      },
    });
  } else {
    await db.createCollection(newName);
  }

  // Copy data
  const targetCollection = db.collection(newName);
  const documents = await sourceCollection.find({}).toArray();

  if (documents.length > 0) {
    await targetCollection.insertMany(documents);
  }

  // Delete the old collection
  await db.dropCollection(collectionName);

  return {
    success: true,
    message: `Collection '${collectionName}' renamed to '${newName}' successfully`,
  };
}
