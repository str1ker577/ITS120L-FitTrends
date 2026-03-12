#!/bin/bash
# =============================================================================
# build-and-copy.sh
# Builds the React frontend and copies the output into the Spring Boot
# static resources folder so Spring Boot serves the SPA from one JAR.
#
# Run from the repo root:
#   bash build-and-copy.sh
# =============================================================================

set -e

echo "==> Building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Copying dist/ to backend static resources..."
DEST="backend/src/main/resources/static"
rm -rf "$DEST"
mkdir -p "$DEST"
cp -r frontend/dist/. "$DEST/"

echo "==> Done! Now run: cd backend && mvnw spring-boot:run"
