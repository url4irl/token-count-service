import { eq, and, sql } from "drizzle-orm";
import { db } from "./db/db";
import { documentsTable, analysisLogsTable } from "./db/schema";
import { get_encoding } from "tiktoken";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import xlsx from "xlsx";

export class TokenCountService {
  private encoding = get_encoding("cl100k_base");

  constructor() {}

  async testDbConnection() {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      throw new Error(`Database connection failed: ${(error as any)?.message}`);
    }
  }

  private async _getTextFromFile(file: Express.Multer.File): Promise<string> {
    switch (file.mimetype) {
      case "application/pdf":
        const data = await pdf(file.buffer);
        return data.text;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docxResult = await mammoth.extractRawText({
          buffer: file.buffer,
        });
        return docxResult.value;
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        const workbook = xlsx.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_txt(worksheet);
      case "text/plain":
        return file.buffer.toString("utf-8");
      default:
        throw new Error("Unsupported file type");
    }
  }

  async analyze(file: Express.Multer.File, userId?: string) {
    try {
      const content = await this._getTextFromFile(file);
      const tokenCount = this.encoding.encode(content).length;
      const byteSize = file.size;
      const charCount = content.length;
      const wordCount = content.split(/\s+/).filter(Boolean).length;

      const analysis = {
        tokenCount,
        byteSize,
        charCount,
        wordCount,
      };

      const [created] = await db
        .insert(documentsTable)
        .values({
          content,
          userId,
          tokenCount,
          analysis,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      await db.insert(analysisLogsTable).values({
        documentId: created.id,
        userId: userId || "anonymous",
        status: "success",
        details: "Analysis completed successfully",
        createdAt: new Date(),
      });

      return created;
    } catch (error) {
      throw new Error(`Failed to analyze document: ${(error as any)?.message}`);
    }
  }

  async getDocumentStatus(documentId: number, userId: string) {
    const [document] = await db
      .select()
      .from(documentsTable)
      .where(
        and(
          eq(documentsTable.id, documentId),
          eq(documentsTable.userId, userId)
        )
      )
      .limit(1);

    if (!document) {
      throw new Error("Document not found");
    }

    return {
      documentId: document.id,
      tokenCount: document.tokenCount,
      analysis: document.analysis,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
