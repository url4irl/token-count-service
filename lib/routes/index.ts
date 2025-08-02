import { Router } from "express";
import { TokenCountService } from "../service";
import { validate } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import {
  AnalyzeDocumentBodySchema,
  GetDocumentStatusQuerySchema,
} from "../schemas";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const createRoutes = (): Router => {
  const router = Router();
  const tokenCountService = new TokenCountService();

  /**
   * @swagger
   * /:
   *   get:
   *     summary: Health check
   *     responses:
   *       200:
   *         description: Service is running
   */
  router.get("/", async (_, res, next) => {
    try {
      await tokenCountService.testDbConnection();
      res.json({
        message: "Token Count Service is running",
        documentation: "http://localhost:4001/docs",
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/documents/analyze:
   *   post:
   *     summary: Analyze a document
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *               userId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Document analyzed successfully
   */
  router.post(
    "/api/documents/analyze",
    upload.single("file"),
    authenticate,
    validate(AnalyzeDocumentBodySchema, "body"),
    async (req, res, next) => {
      try {
        const { userId } = req.body;
        const file = req.file;

        if (!file) {
          return res.status(400).json({
            success: false,
            error: `"file" is required`,
          });
        }

        const analysis = await tokenCountService.analyze(file, userId);

        res.json({
          success: true,
          message: "Document analyzed successfully",
          analysis,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * @swagger
   * /api/documents/status:
   *   get:
   *     summary: Get document status
   *     parameters:
   *       - in: query
   *         name: documentId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Document status
   */
  router.get(
    "/api/documents/status",
    authenticate,
    validate(GetDocumentStatusQuerySchema, "query"),
    async (req, res, next) => {
      try {
        const { documentId, userId } = req.query;

        const status = await tokenCountService.getDocumentStatus(
          Number(documentId as string),
          userId as string
        );

        return res.json({
          success: true,
          status,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};