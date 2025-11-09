import { z } from "zod";
import fetch from "cross-fetch";
import FormData from "form-data";
import fs from "fs";
import { env } from "../env/get-env";

const BASE_URL =
  env.NODE_ENV === "development"
    ? "http://localhost:4001"
    : "https://token-count.url4irl.com";

// Zod Schemas
export const AnalyzeDocumentSchema = z.object({
  file: z.object({
    path: z.string(),
  }),
  userId: z.string().optional(),
});

export const GetDocumentStatusSchema = z.object({
  documentId: z.number(),
  userId: z.string(),
});

// Type definitions
export type AnalyzeDocumentInput = z.infer<typeof AnalyzeDocumentSchema>;
export type GetDocumentStatusInput = z.infer<typeof GetDocumentStatusSchema>;

export interface AnalysisResponse {
  success: boolean;
  message?: string;
  analysis?: any;
}

export interface StatusResponse {
  success: boolean;
  status?: any;
  message?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
}

// API Client
export class TokenCountClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async _request<T>(
    method: string,
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    const response = await fetch(url.toString(), { method, ...options });
    const json = (await response.json()) as { error?: string };

    if (!response.ok) {
      throw new Error(json.error || "Something went wrong");
    }
    return json as T;
  }

  async analyzeDocument(
    input: AnalyzeDocumentInput
  ): Promise<AnalysisResponse> {
    const { file, userId } = AnalyzeDocumentSchema.parse(input);
    const form = new FormData();
    form.append("file", fs.createReadStream(file.path));

    const headers: Record<string, string> = {
      ...form.getHeaders(),
    };

    if (userId) {
      headers["X-User-Id"] = userId;
    }

    return this._request<AnalysisResponse>("POST", "/api/documents/analyze", {
      body: form as any,
      headers,
    });
  }

  async getDocumentStatus(
    statusData: GetDocumentStatusInput
  ): Promise<StatusResponse> {
    const parsedData = GetDocumentStatusSchema.parse(statusData);
    const url = new URL(`${this.baseUrl}/api/documents/status`);
    url.searchParams.append("documentId", String(parsedData.documentId));
    url.searchParams.append("userId", parsedData.userId);

    return this._request<StatusResponse>("GET", url.pathname + url.search);
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    return this._request<HealthCheckResponse>("GET", "/");
  }
}

export default TokenCountClient;
