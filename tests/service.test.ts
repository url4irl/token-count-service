import { TokenCountService } from "../lib/service";
import { testDb } from "./test-db";

describe("TokenCountService Unit Tests", () => {
  let service: TokenCountService;

  beforeAll(async () => {
    await testDb.setup();
    service = new TokenCountService();
  });

  beforeEach(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.teardown();
  });

  describe("analyze", () => {
    it("should analyze a txt document and return token count", async () => {
      const file = {
        buffer: Buffer.from("This is a test document."),
        mimetype: "text/plain",
        size: 24,
      } as Express.Multer.File;

      const result = await service.analyze(file, "testuser");

      expect(result.tokenCount).toBe(6);
      expect(result.analysis.byteSize).toBe(24);
      expect(result.analysis.charCount).toBe(24);
      expect(result.analysis.wordCount).toBe(5);
    });
  });

  describe("getDocumentStatus", () => {
    it("should return document status", async () => {
      const file = {
        buffer: Buffer.from("This is a test document."),
        mimetype: "text/plain",
        size: 24,
      } as Express.Multer.File;

      const analysis = await service.analyze(file, "testuser");

      const status = await service.getDocumentStatus(analysis.id, "testuser");

      expect(status.tokenCount).toBe(6);
    });

    it("should throw error for non-existent document", async () => {
      await expect(service.getDocumentStatus(999, "testuser")).rejects.toThrow(
        "Document not found"
      );
    });
  });
});