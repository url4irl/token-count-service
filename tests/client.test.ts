import { TokenCountClient } from "../lib/client";
import fs from "fs";
import fetchMock from "jest-fetch-mock";
import FormData from "form-data";

// Mock fs.createReadStream
jest.spyOn(fs, "createReadStream").mockReturnValue("mock-file-stream" as any);

describe("TokenCountClient", () => {
  let client: TokenCountClient;

  beforeAll(() => {
    fetchMock.enableMocks();
  });

  afterAll(() => {
    fetchMock.disableMocks();
  });

  beforeEach(() => {
    client = new TokenCountClient("http://localhost:4001");
    fetchMock.resetMocks();
  });

  it("should analyze a document", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true,
      message: "Document analyzed successfully",
      analysis: {
        id: 1,
        tokenCount: 10,
        analysis: {
          byteSize: 100,
          charCount: 90,
          wordCount: 20,
        },
      },
    }));

    const result = await client.analyzeDocument({
      file: { path: "/tmp/test.txt" },
      userId: "user123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4001/api/documents/analyze",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      })
    );
    expect(result.success).toBe(true);
    expect(result.analysis.tokenCount).toBe(10);
  });

  it("should get document status", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true,
      status: {
        documentId: 1,
        tokenCount: 10,
        analysis: {
          byteSize: 100,
          charCount: 90,
          wordCount: 20,
        },
      },
    }));

    const result = await client.getDocumentStatus({
      documentId: 1,
      userId: "user123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4001/api/documents/status?documentId=1&userId=user123",
      expect.objectContaining({
        method: "GET",
      })
    );
    expect(result.success).toBe(true);
    expect(result.status.tokenCount).toBe(10);
  });

  it("should perform health check", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true,
      message: "Service is running",
    }));

    const result = await client.healthCheck();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4001/",
      expect.objectContaining({
        method: "GET",
      })
    );
    expect(result.success).toBe(true);
    expect(result.message).toBe("Service is running");
  });
});