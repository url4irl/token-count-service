import express from "express";
import swaggerUi from "swagger-ui-express";
import multer from "multer";
import { TokenCountService } from "./service";
import { jsDocSpecs } from "./docs";
import type { Application } from "express";

const upload = multer({ storage: multer.memoryStorage() });

export function createApp(enableSwagger: boolean = true): Application {
  const app = express();

  const tokenCountService = new TokenCountService();

  app.use(express.json());

  if (enableSwagger) {
    try {
      app.use(
        "/docs",
        swaggerUi.serve as any,
        swaggerUi.setup(jsDocSpecs) as any
      );
    } catch (error) {
      console.warn("Failed to setup Swagger UI:", error);
    }
  }

  app.get("/", async (_, res) => {
    try {
      await tokenCountService.testDbConnection();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Failed to connect to the database",
      });
    }

    res.json({
      message: "Token Count Service is running",
      documentation: "http://localhost:4001/docs",
    });
  });

  app.post("/api/documents/analyze", upload.single("file"), async (req, res) => {
    const { userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: `"file" is required`,
      });
    }

    try {
      const analysis = await tokenCountService.analyze(file, userId);

      res.json({
        success: true,
        message: "Document analyzed successfully",
        analysis,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as any)?.message,
      });
    }
  });

  app.get("/api/documents/status", async (req, res) => {
    const { documentId, userId } = req.query;

    if (!documentId || !userId) {
      return res.status(400).json({
        success: false,
        error: `"documentId" and "userId" query parameters are required`,
      });
    }

    try {
      const status = await tokenCountService.getDocumentStatus(
        Number(documentId as string),
        userId as string
      );

      return res.json({
        success: true,
        status,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: (error as any)?.message,
      });
    }
  });

  return app;
}