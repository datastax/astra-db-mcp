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
import { OpenBrowser } from "../../tools/OpenBrowser.js";
import { execFile } from "child_process";

// Mock execFile to avoid actually opening a browser
vi.mock("child_process", () => ({
  execFile: vi.fn((cmd, args, callback) => {
    callback(null);
    return { 
      cmd,
      args
    };
  }),
}));

describe("OpenBrowser Tool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate and accept a valid https URL", async () => {
    const validUrl = "https://example.com";
    const result = await OpenBrowser({ url: validUrl });
    
    expect(result.success).toBe(true);
    expect(result.message).toContain(validUrl);
    expect(execFile).toHaveBeenCalled();
  });

  it("should validate and accept a valid http URL", async () => {
    const validUrl = "http://example.com";
    const result = await OpenBrowser({ url: validUrl });
    
    expect(result.success).toBe(true);
    expect(result.message).toContain(validUrl);
    expect(execFile).toHaveBeenCalled();
  });

  it("should reject URLs with invalid protocols", async () => {
    const invalidUrl = "file:///etc/passwd";
    const result = await OpenBrowser({ url: invalidUrl });
    
    expect(result.success).toBe(false);
    expect(result.message).toContain("Invalid URL protocol");
    expect(execFile).not.toHaveBeenCalled();
  });

  it("should reject malformed URLs", async () => {
    const malformedUrl = "not a valid url";
    const result = await OpenBrowser({ url: malformedUrl });
    
    expect(result.success).toBe(false);
    expect(result.message).toContain("Invalid URL format");
    expect(execFile).not.toHaveBeenCalled();
  });

  it("should reject command injection attempts", async () => {
    const maliciousUrl = "https://example.com; rm -rf /";
    const result = await OpenBrowser({ url: maliciousUrl });
    
    // This should fail because the URL is malformed
    expect(result.success).toBe(false);
    expect(execFile).not.toHaveBeenCalled();
  });
});