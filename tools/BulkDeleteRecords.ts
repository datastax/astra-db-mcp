import { db } from "../util/db.js";
import { Collection } from "@datastax/astra-db-ts";

type BulkDeleteRecordsArgs = {
  collectionName: string;
  recordIds: string[];
};

type BulkDeleteRecordsResult = {
  message: string;
  deletedCount: number;
};

export async function BulkDeleteRecords({
  collectionName,
  recordIds,
}: BulkDeleteRecordsArgs): Promise<BulkDeleteRecordsResult> {
  const collection: Collection = db.collection(collectionName);
  
  // Create an array of delete operations for bulkWrite
  const deleteOperations = recordIds.map((id) => ({
    deleteOne: {
      filter: { _id: id }
    }
  }));
  
  let deletedCount = 0;
  
  try {
    // Try to use bulkWrite for better performance
    if (typeof collection.bulkWrite === 'function') {
      // Use bulkWrite for batch processing
      const result = await collection.bulkWrite(deleteOperations);
      
      // Get the count of deleted documents
      deletedCount = result.deletedCount || 0;
    } else {
      // Fallback to individual deleteOne operations
      for (const id of recordIds) {
        const result = await collection.deleteOne({ _id: id });
        if (result.deletedCount) {
          deletedCount += result.deletedCount;
        }
      }
    }
  } catch (error) {
    console.error("Error in bulk delete:", error);
    throw error;
  }
  
  return {
    message: `Successfully deleted ${deletedCount} records`,
    deletedCount,
  };
}

// Made with Bob
