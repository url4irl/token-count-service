# token-count-service <!-- omit in toc -->

A free service that offers API endpoints for users to send documents and have them broken down into a token count analysis.

- [How to use this service](#how-to-use-this-service)
  - [Client SDK](#client-sdk)
    - [Features](#features)
    - [Installation](#installation)
    - [Quick Start](#quick-start)
    - [Environment Support](#environment-support)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
  - [Dockerized Testing](#dockerized-testing)
  - [Test Database Management](#test-database-management)
  - [Test Scenarios](#test-scenarios)
- [Database Management](#database-management)
  - [Database Migration Lifecycle](#database-migration-lifecycle)
    - [Production Environment](#production-environment)
    - [Development Environment](#development-environment)
- [Deployment](#deployment)

## How to use this service

This service is designed for a "User" (e.g., a service or backend) that manages documents on behalf of its "Customers" (the end-users who own the documents).

1.  **User:** Analyze a customer's document by sending a `POST` request to `/api/documents/analyze` with the document content.
2.  **User:** Periodically check the analysis status by sending a `GET` request to `/api/documents/status` with the document ID and customer ID.

### Client SDK

A TypeScript client library for the Token Count Service API, providing type-safe document analysis with built-in input validation using Zod.

#### Features

- 🔒 **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Input Validation**: Built-in validation using Zod schemas
- 🚀 **Promise-based**: Modern async/await API
- 📦 **Zero Configuration**: Works out of the box with sensible defaults
- 🌐 **Node.js Compatible**: Uses node-fetch for HTTP requests

#### Installation

```bash
pnpm add @url4irl/token-count-service
# or
npm install @url4irl/token-count-service
# or
yarn add @url4irl/token-count-service
```

#### Quick Start

```typescript
import { TokenCountClient } from '@url4irl/token-count-service';

const client = new TokenCountClient(); // or specify a custom base URL in case you are self-hosting the service

// Analyze a document
await client.analyzeDocument({
  content: 'This is a test document.',
  userId: 'customer123'
});

// Check document analysis status
const statusResult = await client.getDocumentStatus({
  documentId: 1,
  userId: 'customer123'
});
```

#### Environment Support

- **Node.js**: 14+ (uses node-fetch for HTTP requests)
- **TypeScript**: 4.0+
- **ES Modules**: Supported
- **CommonJS**: Supported

## API Documentation

The API documentation is available on `/docs`. You can access it by navigating to `https://token-count.url4irl.com/docs` in your web browser (or `http://localhost:4001/docs` if running locally).

OpenAPI specs are also available at [openapi.json](./openapi.json).

## Development

To run the service in development mode, follow these steps:
1. Clone the repository.
2. Make sure you have Node.js, pnpm and Docker (with Docker Compose) installed on your machine.
3. Install the dependencies:
    ```bash
    pnpm install
    ```
4. Start the service:
    ```bash
    pnpm dev
    ```
5. The service will be available at `http://localhost:4001`
6. See the [Database Management](#database-management) to learn how to manage the database.

## Testing

This project includes comprehensive end-to-end (e2e) tests using Jest and Supertest.

Tests run against a separate test database (`postgres_test`) to avoid affecting your development data.

```bash
# Setup test environment (run once)
pnpm run test:setup

# Run tests with coverage report
pnpm run test:coverage

# Cleanup test environment
pnpm run test:teardown

# Setups the test environment, runs all tests, and cleans up afterwards
pnpm test
```

### Dockerized Testing

Before deploying the service, it's best practice to run the tests against a production-like Docker container. The project includes a script to facilitate this.

```bash
pnpm docker:test
```

This script will:
1.  Build the Docker image.
2.  Start the containerized service and a test database.
3.  Run the e2e tests against the service running in Docker.
4.  Stop and remove the containers.

### Test Database Management

Each test automatically:
1. Sets up the test database schema before running
2. Cleans all data before each test
3. Resets auto-increment sequences
4. Closes database connections after completion

### Test Scenarios

- ✅ Successful operations
- ✅ Validation errors (missing fields)
- ✅ Database interactions
- ✅ Integration flows
- ✅ Edge cases and error conditions
- ✅ Concurrent operations
- ✅ Data cleanup and isolation

## Database Management

### Database Migration Lifecycle

#### Production Environment

Database migrations are managed using Drizzle ORM. In a production environment, migrations must be applied **manually** by accessing the running container and executing the following command within it:

```bash
pnpm drizzle-kit migrate --config ./dist/drizzle.config.js
```

This command will apply any pending schema changes to the database. Ensure you run this command after any deployment that includes database schema modifications.

#### Development Environment

In development, create and apply migrations using:

```bash
pnpm run db:generate # Generates a new migration file
pnpm run db:migrate # Applies the migration to the database
```

## Deployment

This project is deployed to a Coolify instance. When code changes are pushed to the repository, Coolify automatically rebuilds the project using the `Dockerfile` and deploys the updated service.


Contributions are always welcome ❤️
