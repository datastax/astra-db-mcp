import { describe, it, expect, beforeEach } from "vitest";
import { FindRecord } from "../../tools/FindRecord.js";
import { mockDb } from "../mocks/db.mock";

// Import the mock to ensure it's applied
import "../mocks/db.mock";

describe("FindRecord Tool", () => {
  beforeEach(() => {
    // Clear mock call history before each test
    mockDb.collection.mockClear();
  });

  it("should find a record by field value", async () => {
    const collectionName = "test_collection1";
    const field = "title";
    const value = "Record 1";

    const mockCollection = mockDb.collection(collectionName);

    // Call the function
    const result = await FindRecord({
      collectionName,
      field,
      value,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledTimes(1);
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
    expect(mockCollection.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockCollection.findOneBy).toHaveBeenCalledWith(field, value);

    // Our mock is set up to return the first record that matches the field/value
    expect(result).toEqual({
      _id: "1",
      title: "Record 1",
      content: "Content 1",
      vector: [0.1, 0.2, 0.3],
    });
  });

  it("should return null when no record matches", async () => {
    const collectionName = "test_collection1";
    const field = "title";
    const value = "Non-existent Record";

    const mockCollection = mockDb.collection(collectionName);

    // Mock the findOneBy method to return null for this specific test
    mockCollection.findOneBy.mockResolvedValueOnce(null);

    // Call the function
    const result = await FindRecord({
      collectionName,
      field,
      value,
    });

    // Verify the mocks were called correctly
    expect(mockDb.collection).toHaveBeenCalledTimes(1);
    expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
    expect(mockCollection.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockCollection.findOneBy).toHaveBeenCalledWith(field, value);

    // Verify the result is null
    expect(result).toBeNull();
  });
});
