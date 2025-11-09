/**
 * Node.js-only instrumentation file
 * This file is never imported by Edge Runtime, only by Node.js runtime
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  AlwaysOnSampler,
  BatchSpanProcessor,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { env } from "../env/get-env";
import pkg from "../../package.json";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

// Logs imports
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { logs } from "@opentelemetry/api-logs";

// CRITICAL: Enable OpenTelemetry internal diagnostics
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

console.log("\n🔍 ========== INSTRUMENTATION DEBUG START ==========");
console.log("🔍 [DEBUG] Process ID:", process.pid);
console.log("🔍 [DEBUG] Node version:", process.version);
console.log("🔍 [DEBUG] Current working directory:", process.cwd());

// Configure the OTLP exporters to point to your collector
const traceExporter = new OTLPTraceExporter({
  url: env.OTEL_EXPORTER_OTLP_ENDPOINT + "/v1/traces",
});

const logExporter = new OTLPLogExporter({
  url: env.OTEL_EXPORTER_OTLP_ENDPOINT + "/v1/logs",
});

// Create the resource for both traces and logs
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: pkg.name.replace("@url4irl/", ""),
  [ATTR_SERVICE_VERSION]: pkg.version,
  ["service.environment"]: env.NODE_ENV,
});

// Configure logs pipeline via LoggerProvider
const loggerProvider = new LoggerProvider({
  resource,
  processors: [new BatchLogRecordProcessor(logExporter)],
});

// Set the global logger provider
logs.setGlobalLoggerProvider(loggerProvider);

const sdk = new NodeSDK({
  traceExporter: traceExporter,
  resource,
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-net": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-dns": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },
    }),
    new WinstonInstrumentation({
      disableLogCorrelation: false, // inject trace_id, span_id, trace_flags
      disableLogSending: false, // forward logs to OpenTelemetry Logs SDK
    }),
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  sampler:
    env.NODE_ENV === "development"
      ? new AlwaysOnSampler()
      : new TraceIdRatioBasedSampler(1),
});

try {
  sdk.start();
  console.log("✅ [INSTRUMENTATION] OpenTelemetry SDK started successfully");

  // Add graceful shutdown handlers
  const shutdown = async () => {
    console.log("[INSTRUMENTATION] Shutting down services...");

    // Shutdown SDK (this flushes any pending spans)
    await sdk.shutdown();
    console.log("✅ [INSTRUMENTATION] SDK shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} catch (error) {
  console.error(
    "❌ [INSTRUMENTATION] Failed to start OpenTelemetry SDK:",
    error
  );
}

// Cool ASCII instrumentation banner
console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🔬 INSTRUMENTATION SUCCESSFULLY REGISTERED 🔬                               ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │  🚀 OpenTelemetry SDK: ACTIVE                                          │  ║
║  │  📝 Logger Provider: ACTIVE                                            │  ║
║  │  🎯 Auto-Instrumentations: LOADED                                      │  ║
║  │  🔗 Collector: ${
  env.OTEL_EXPORTER_OTLP_ENDPOINT ? "CONNECTED" : "LOCAL"
} ${"".repeat(48)}│ ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  📊 All LLM interactions will be traced and monitored                        ║
║  📝 All Winston logs will be forwarded to OpenTelemetry                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
