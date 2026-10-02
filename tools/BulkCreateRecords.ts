import { db } from "../util/db.js";
import { Collection } from "@datastax/astra-db-ts";

type BulkCreateRecordsArgs = {
  collectionName: string;
  records: Record<string, any>[];
};

type BulkCreateRecordsResult = {
  message: string;
  ids: string[];
};

export async function BulkCreateRecords({
  collectionName,
  records,
}: BulkCreateRecordsArgs): Promise<BulkCreateRecordsResult> {
  const collection: Collection = db.collection(collectionName);
  
  let ids: string[] = [];
  
  try {
    // Try to use insertMany for better performance
    if (typeof collection.insertMany === 'function') {
      const result = await collection.insertMany(records);
      
      // Extract the inserted IDs from the result
      ids = Object.values(result.insertedIds || {})
        .map((id) => id?.toString() || "")
        .filter((id) => id !== "");
    } else {
      // Fallback to individual insertOne operations
      for (const record of records) {
        const result = await collection.insertOne(record);
        if (result.insertedId) {
          ids.push(result.insertedId.toString());
        }
      }
    }
  } catch (error) {
    console.error("Error in bulk create:", error);
    throw error;
  }
  
  return {
    message: `Successfully created ${ids.length} records`,
    ids,
  };
}

// Made with Bob
