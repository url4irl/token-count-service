import request from "supertest";
import { createApp } from "../lib/app";
import { testDb } from "./test-db";

describe("Token Count Service E2E Tests", () => {
  let app: any;

  beforeAll(async () => {
    // Setup test database
    await testDb.setup();
    app = createApp();
  });

  beforeEach(async () => {
    // Clean database before each test
    await testDb.cleanup();
  });

  afterAll(async () => {
    // Teardown test database
    await testDb.teardown();
  });

  describe("GET /", () => {
    it("should return service information and test database connection", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.body).toEqual({
        message: "Token Count Service is running",
        documentation: "http://localhost:4001/docs",
      });
    });
  });

  describe("POST /api/documents/analyze", () => {
    it("should analyze a txt document and return token count", async () => {
      const response = await request(app)
        .post("/api/documents/analyze")
        .field("userId", "testuser")
        .attach("file", Buffer.from("This is a test document."), "test.txt")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.analysis.tokenCount).toBe(6);
      expect(response.body.analysis.analysis.byteSize).toBe(24);
      expect(response.body.analysis.analysis.charCount).toBe(24);
      expect(response.body.analysis.analysis.wordCount).toBe(5);
    });

    it("should return 400 when file is missing", async () => {
      const response = await request(app)
        .post("/api/documents/analyze")
        .field("userId", "testuser")
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: '"file" is required',
      });
    });
  });

  describe("GET /api/documents/status", () => {
    it("should return document status", async () => {
      const analyzeResponse = await request(app)
        .post("/api/documents/analyze")
        .field("userId", "testuser")
        .attach("file", Buffer.from("This is a test document."), "test.txt")
        .expect(200);

      const documentId = analyzeResponse.body.analysis.id;

      const response = await request(app)
        .get("/api/documents/status")
        .query({ documentId, userId: "testuser" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status.tokenCount).toBe(6);
    });

    it("should return 400 when documentId is missing", async () => {
      const response = await request(app)
        .get("/api/documents/status")
        .query({ userId: "testuser" })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: '"documentId" and "userId" query parameters are required',
      });
    });

    it("should return 404 when document is not found", async () => {
      const response = await request(app)
        .get("/api/documents/status")
        .query({ documentId: 999, userId: "testuser" })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Document not found");
    });
  });
});