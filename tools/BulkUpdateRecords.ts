import { db } from "../util/db.js";
import { Collection } from "@datastax/astra-db-ts";

type BulkUpdateRecordsArgs = {
  collectionName: string;
  records: Array<{
    id: string;
    record: Record<string, any>;
  }>;
};

type BulkUpdateRecordsResult = {
  message: string;
  updatedCount: number;
};

export async function BulkUpdateRecords({
  collectionName,
  records,
}: BulkUpdateRecordsArgs): Promise<BulkUpdateRecordsResult> {
  const collection: Collection = db.collection(collectionName);
  
  // Create an array of update operations for bulkWrite
  const updateOperations = records.map(({ id, record }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: record }
    }
  }));
  
  let updatedCount = 0;
  
  try {
    // Try to use bulkWrite for better performance
    if (typeof collection.bulkWrite === 'function') {
      // Use bulkWrite for batch processing
      const result = await collection.bulkWrite(updateOperations);
      
      // Get the count of modified documents
      updatedCount = result.modifiedCount || 0;
    } else {
      // Fallback to individual updateOne operations
      for (const { id, record } of records) {
        const result = await collection.updateOne({ _id: id }, { $set: record });
        if (result.modifiedCount) {
          updatedCount += result.modifiedCount;
        }
      }
    }
  } catch (error) {
    console.error("Error in bulk update:", error);
    throw error;
  }
  
  return {
    message: `Successfully updated ${updatedCount} records`,
    updatedCount,
  };
}

// Made with Bob
