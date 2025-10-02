#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Server information - replace with your actual server details
SERVER_USER="root"
SERVER_HOST="srv557866"
SERVER_PATH="/root/Switch"

echo -e "${YELLOW}🚀 Uploading updated files to server...${NC}"

# Create a temporary directory for files
mkdir -p temp_upload

# Copy files to upload
cp Dockerfile temp_upload/
cp package.json temp_upload/
cp vite.config.ts temp_upload/
cp -r src/lib/janus-wrapper.js temp_upload/
cp -r src/services/webrtc.js temp_upload/

# Create directories on server if they don't exist
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}/src/lib ${SERVER_PATH}/src/services"

# Upload files
scp temp_upload/Dockerfile ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
scp temp_upload/package.json ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
scp temp_upload/vite.config.ts ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# Upload source files
scp temp_upload/janus-wrapper.js ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/lib/
scp temp_upload/webrtc.js ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/services/

# Clean up
rm -rf temp_upload

echo -e "${GREEN}✅ Files uploaded successfully${NC}"
echo -e "${YELLOW}ℹ️  To rebuild and restart the application, run:${NC}"
echo -e "   ssh ${SERVER_USER}@${SERVER_HOST} \"cd ${SERVER_PATH} && ./deploy.sh\""
