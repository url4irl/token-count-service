import express from "express";
import swaggerUi from "swagger-ui-express";
import { jsDocSpecs } from "./docs";
import { errorHandler } from "./middleware/errorHandler";
import { createRoutes } from "./routes";
import type { Application } from "express";

export function createApp(enableSwagger: boolean = true): Application {
  const app = express();

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

  app.use("/", createRoutes());

  app.use(errorHandler);

  return app;
}