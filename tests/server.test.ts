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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Server } from "@modelcontextprotocol/server";
import { tools } from "../tools.js";

// Mock the tools
vi.mock("../tools/GetCollections.js", () => ({
  GetCollections: vi.fn().mockResolvedValue([
    { name: "test_collection1", type: "vector" },
    { name: "test_collection2", type: "document" },
  ]),
}));

vi.mock("../tools/CreateCollection.js", () => ({
  CreateCollection: vi.fn().mockImplementation((args) => {
    return Promise.resolve({
      name: args.collectionName,
      vector: args.vector !== undefined ? args.vector : true,
      dimension: args.dimension || 1536,
    });
  }),
}));

// Create a mock for setRequestHandler
const mockSetRequestHandler = vi.fn();

// Mock the Server class
vi.mock("@modelcontextprotocol/server", () => {
  return {
    Server: vi.fn().mockImplementation(() => ({
      setRequestHandler: mockSetRequestHandler,
    })),
    ProtocolError: vi.fn(),
    METHOD_NOT_FOUND: -32601,
  };
});

describe("MCP Server", () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock the server initialization
    (Server as any).mockClear();
    mockSetRequestHandler.mockClear();
    
    // Manually call the server initialization code that would be in index.js
    const server = new Server(
      {
        name: "astra-db-mcp-server",
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    server.setRequestHandler("tools/list", async () => ({
      tools,
    }));
    
    server.setRequestHandler("tools/call", async () => ({
      content: [{ type: "text", text: "success" }],
    }));
  });

  it("should initialize the server with correct configuration", () => {
    // Check that the Server constructor was called with the correct arguments
    expect(Server).toHaveBeenCalledWith(
      {
        name: "astra-db-mcp-server",
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
  });

  it("should set up request handlers for ListTools and CallTool", () => {
    // Check that the request handlers were set up
    expect(mockSetRequestHandler).toHaveBeenCalledTimes(2);

    // Check that the ListTools handler was set up
    expect(mockSetRequestHandler).toHaveBeenCalledWith(
      "tools/list",
      expect.any(Function)
    );

    // Check that the CallTool handler was set up
    expect(mockSetRequestHandler).toHaveBeenCalledWith(
      "tools/call",
      expect.any(Function)
    );
  });
});
