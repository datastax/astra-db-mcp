import { describe, it, expect, beforeEach } from "vitest";
import { ListRecords } from "../../tools/ListRecords.js";
import { mockDb } from "../mocks/db.mock";

// Import the mock to ensure it's applied
import "../mocks/db.mock";

describe("ListRecords Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    mockDb.collection.mockClear();
  });

  it("should list records from a collection", async () => {
    const collectionName = "test_collection1";
    const mockCollection = mockDb.collection(collectionName);

    // Call the function
    const result = await ListRecords({
      collectionName,
      limit: 10,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledTimes(1);
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
    expect(mockCollection.find).toHaveBeenCalledTimes(1);

    // Verify the result
    expect(result).toEqual([
      {
        _id: "1",
        title: "Record 1",
        content: "Content 1",
        vector: [0.1, 0.2, 0.3],
      },
      {
        _id: "2",
        title: "Record 2",
        content: "Content 2",
        vector: [0.4, 0.5, 0.6],
      },
    ]);
  });

  it("should return an empty array for a non-existent collection", async () => {
    const collectionName = "non_existent_collection";
    const mockCollection = mockDb.collection(collectionName);

    // Call the function
    const result = await ListRecords({
      collectionName,
      limit: 10,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledTimes(1);
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
    expect(mockCollection.find).toHaveBeenCalledTimes(1);

    // Verify the result is an empty array
    expect(result).toEqual([]);
  });
});
