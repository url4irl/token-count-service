module.exports = {
  preset: "ts-jest",
  moduleNameMapper: {
    "node-fetch": "jest-fetch-mock",
  },
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\.ts$": "ts-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!node-fetch)/",
  ],
  moduleNameMapper: {
    "^drizzle-orm$": "<rootDir>/node_modules/drizzle-orm",
    "^drizzle-kit$": "<rootDir>/node_modules/drizzle-kit",
  },
  modulePaths: ["<rootDir>/node_modules"],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "!lib/**/*.d.ts",
    "!lib/db/migrations/**",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
};