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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { AstraError, AstraErrorCode, createErrorFromException } from "../../util/errors.js";

describe("Error Handling", () => {
  describe("AstraError", () => {
    it("should create an error with code and message", () => {
      const error = new AstraError(
        AstraErrorCode.COLLECTION_NOT_FOUND,
        "Collection not found"
      );
      
      expect(error.code).toBe(AstraErrorCode.COLLECTION_NOT_FOUND);
      expect(error.message).toBe("Collection not found");
      expect(error.name).toBe("AstraError");
    });
    
    it("should create an error with details", () => {
      const details = { collectionName: "test_collection" };
      const error = new AstraError(
        AstraErrorCode.COLLECTION_NOT_FOUND,
        "Collection not found",
        details
      );
      
      expect(error.details).toEqual(details);
    });
    
    it("should convert to response object", () => {
      const error = new AstraError(
        AstraErrorCode.COLLECTION_NOT_FOUND,
        "Collection not found"
      );
      
      const response = error.toResponse();
      expect(response.error.code).toBe(AstraErrorCode.COLLECTION_NOT_FOUND);
      expect(response.error.message).toBe("Collection not found");
    });
    
    it("should convert to user message", () => {
      const error = new AstraError(
        AstraErrorCode.COLLECTION_NOT_FOUND,
        "Collection not found"
      );
      
      const message = error.toUserMessage();
      expect(message).toContain(AstraErrorCode.COLLECTION_NOT_FOUND);
      expect(message).toContain("Collection not found");
    });
  });
  
  describe("createErrorFromException", () => {
    beforeEach(() => {
      vi.resetModules();
      process.env.ASTRA_DB_API_ENDPOINT = "https://test.com";
      process.env.ASTRA_DB_APPLICATION_TOKEN = "test-token";
    });
    
    it("should return the original error if it's an AstraError", () => {
      const originalError = new AstraError(
        AstraErrorCode.COLLECTION_NOT_FOUND,
        "Collection not found"
      );
      
      const error = createErrorFromException(originalError);
      expect(error).toBe(originalError);
    });
    
    it("should create AUTH_MISSING_CREDENTIALS error for missing credentials", () => {
      delete process.env.ASTRA_DB_API_ENDPOINT;
      
      const error = createErrorFromException(new Error("Missing API endpoint"));
      expect(error.code).toBe(AstraErrorCode.AUTH_MISSING_CREDENTIALS);
    });
    
    it("should create NETWORK_ERROR for network-related errors", () => {
      const error = createErrorFromException(new Error("Failed to fetch"));
      expect(error.code).toBe(AstraErrorCode.NETWORK_ERROR);
    });
    
    it("should create COLLECTION_NOT_FOUND for collection not found errors", () => {
      const error = createErrorFromException(new Error("collection not found"));
      expect(error.code).toBe(AstraErrorCode.COLLECTION_NOT_FOUND);
    });
    
    it("should create RECORD_NOT_FOUND for record not found errors", () => {
      const error = createErrorFromException(new Error("document not found"));
      expect(error.code).toBe(AstraErrorCode.RECORD_NOT_FOUND);
    });
    
    it("should create UNKNOWN_ERROR for other errors", () => {
      const error = createErrorFromException(new Error("Some random error"));
      expect(error.code).toBe(AstraErrorCode.UNKNOWN_ERROR);
    });
    
    it("should handle non-Error objects", () => {
      const error = createErrorFromException("String error");
      expect(error.code).toBe(AstraErrorCode.UNKNOWN_ERROR);
      expect(error.message).toContain("String error");
    });
  });
});

// Made with Bob
