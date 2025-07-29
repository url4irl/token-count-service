import path from "path";
import dotenv from "dotenv";
import fetchMock from "jest-fetch-mock";

// Load test environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env.test") });

// Ensure we're using the test database
if (!process.env.DATABASE_URL?.includes("test")) {
  throw new Error(
    "Test environment must use a test database. Check .env.test file."
  );
}

// Mock fetch globally
fetchMock.enableMocks();