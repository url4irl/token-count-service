import { z } from "zod";
import fetch, { RequestInit } from "node-fetch";
import FormData from "form-data";
import fs from "fs";

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4001"
    : "https://token-count.url4irl.com";

// Zod Schemas
export const AnalyzeDocumentSchema = z.object({
  file: z.any(),
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
    data: any = null,
    queryParams: Record<string, string> | null = null
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (queryParams) {
      Object.keys(queryParams).forEach((key) =>
        url.searchParams.append(key, queryParams[key])
      );
    }

    const options: RequestInit = {
      method,
    };

    if (data instanceof FormData) {
      options.body = data;
    } else if (data) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url.toString(), options);
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || "Something went wrong");
    }
    return json as T;
  }

  async analyzeDocument(
    input: AnalyzeDocumentInput
  ): Promise<AnalysisResponse> {
    const { file, userId } = AnalyzeDocumentSchema.parse(input);
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));
    if (userId) {
      formData.append("userId", userId);
    }

    return this._request<AnalysisResponse>(
      "POST",
      "/api/documents/analyze",
      formData
    );
  }

  async getDocumentStatus(
    statusData: GetDocumentStatusInput
  ): Promise<StatusResponse> {
    const parsedData = GetDocumentStatusSchema.parse(statusData);
    return this._request<StatusResponse>(
      "GET",
      "/api/documents/status",
      null,
      { documentId: String(parsedData.documentId), userId: parsedData.userId }
    );
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    return this._request<HealthCheckResponse>("GET", "/");
  }
}

export default TokenCountClient;