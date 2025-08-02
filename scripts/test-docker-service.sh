#!/bin/bash

set -e

SERVICE_NAME="token-count-service"
CONTAINER_NAME="token-count-service-test"
DB_COMPOSE_FILE="./dev/docker-compose.yml"
CLEAN_DB_SCRIPT="./dev/clean-db.sh"
API_PORT=4001
API_URL="http://localhost:${API_PORT}"

echo "--- Setting up test database ---"
# Ensure the database container is up and running before proceeding
docker-compose -f ${DB_COMPOSE_FILE} up -d token_count_service_db
./scripts/setup-test.sh

echo "--- Building Docker image for the service ---"
docker build -t ${SERVICE_NAME} . --network=host

echo "--- Running service Docker container ---"
# Remove any existing container with the same name
docker rm -f ${CONTAINER_NAME} || true
# Run the new container, linking it to the test database network
docker run -d -p ${API_PORT}:${API_PORT} --name ${CONTAINER_NAME} --network dev_default -e DATABASE_URL="postgres://postgres:postgres@token_count_service_db:5432/postgres_test" ${SERVICE_NAME}

echo "--- Waiting for service to be ready ---"
# Wait for the service's health check endpoint to respond
until nc -z localhost ${API_PORT}; do
  echo "Waiting for service to start..."
  sleep 2
done

echo "--- Service is ready. Running API endpoint tests ---"

# --- API Endpoint Tests ---

echo "Testing GET /"
curl -s ${API_URL} | jq .

echo "Testing POST /api/documents/analyze"
curl -s -X POST -H "Content-Type: multipart/form-data" -F "file=@./README.md" -F "userId=testuser123" ${API_URL}/api/documents/analyze | jq .

echo "Testing GET /api/documents/status"
curl -s "${API_URL}/api/documents/status?documentId=1&userId=testuser123" | jq .

echo "--- All API endpoint tests completed ---"

echo "--- Teardown: Stopping and removing service container ---"
docker stop ${CONTAINER_NAME}
docker rm ${CONTAINER_NAME}

echo "--- Teardown: Cleaning up test database data ---"
docker-compose -f ${DB_COMPOSE_FILE} down

echo "--- Test script finished ---"