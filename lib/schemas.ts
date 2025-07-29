import { z } from "zod";

export const AnalyzeDocumentBodySchema = z.object({
  userId: z.string().optional(),
});

export const GetDocumentStatusQuerySchema = z.object({
  documentId: z.string(),
  userId: z.string(),
});