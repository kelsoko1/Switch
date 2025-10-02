#!/bin/bash

# Appwrite CLI Setup Script for Live Streaming Collections
# This script automates the creation of required collections

echo "🚀 Appwrite Live Streaming Setup"
echo "=================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
PROJECT_ID="${VITE_APPWRITE_PROJECT_ID}"
DATABASE_ID="${VITE_APPWRITE_DATABASE_ID}"
ENDPOINT="${VITE_APPWRITE_ENDPOINT}"

echo "📊 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Database ID: $DATABASE_ID"
echo "  Endpoint: $ENDPOINT"
echo ""

# Check if Appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo "❌ Appwrite CLI not found!"
    echo ""
    echo "📥 Installing Appwrite CLI..."
    npm install -g appwrite-cli
    echo ""
fi

echo "✅ Appwrite CLI found"
echo ""

# Login check
echo "🔐 Checking authentication..."
echo "If not logged in, please run: appwrite login"
echo ""

# Create live_streams collection
echo "📹 Creating live_streams collection..."
appwrite databases createCollection \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --name "Live Streams" \
    --permissions "read(\"any\")" "create(\"users\")" "update(\"users\")" "delete(\"users\")"

# Create attributes for live_streams
echo "📝 Creating attributes for live_streams..."

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "streamId" \
    --size 255 \
    --required true

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "title" \
    --size 255 \
    --required true

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "streamerId" \
    --size 255 \
    --required true

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "streamerName" \
    --size 255 \
    --required true

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "streamerAvatar" \
    --size 2000 \
    --required false

appwrite databases createBooleanAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "isLive" \
    --required true \
    --default true

appwrite databases createIntegerAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "viewerCount" \
    --required true \
    --default 0

appwrite databases createIntegerAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "likeCount" \
    --required true \
    --default 0

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "startedAt" \
    --size 50 \
    --required true

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "endedAt" \
    --size 50 \
    --required false

echo "⏳ Waiting for attributes to be available..."
sleep 5

# Create indexes for live_streams
echo "🔍 Creating indexes for live_streams..."

appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "streamId_idx" \
    --type "unique" \
    --attributes "streamId"

appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "streamerId_idx" \
    --type "key" \
    --attributes "streamerId"

appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "isLive_idx" \
    --type "key" \
    --attributes "isLive"

appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "live_streams" \
    --key "createdAt_idx" \
    --type "key" \
    --attributes "\$createdAt" \
    --orders "DESC"

echo "✅ live_streams collection created!"
echo ""

# Create stream_comments collection
echo "💬 Creating stream_comments collection..."
appwrite databases createCollection \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --name "Stream Comments" \
    --permissions "read(\"any\")" "create(\"users\")" "update(\"users\")" "delete(\"users\")"

# Create attributes for stream_comments
echo "📝 Creating attributes for stream_comments..."

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --key "streamId" \
    --size 255 \
    --required true

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --key "userId" \
    --size 255 \
    --required true

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --key "userName" \
    --size 255 \
    --required true

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --key "userAvatar" \
    --size 2000 \
    --required false

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --key "message" \
    --size 500 \
    --required true

appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --key "timestamp" \
    --size 50 \
    --required true

echo "⏳ Waiting for attributes to be available..."
sleep 5

# Create indexes for stream_comments
echo "🔍 Creating indexes for stream_comments..."

appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --key "streamId_idx" \
    --type "key" \
    --attributes "streamId"

appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --key "userId_idx" \
    --type "key" \
    --attributes "userId"

appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "stream_comments" \
    --key "timestamp_idx" \
    --type "key" \
    --attributes "timestamp" \
    --orders "ASC"

echo "✅ stream_comments collection created!"
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "✅ Collections created:"
echo "  - live_streams (with 10 attributes and 4 indexes)"
echo "  - stream_comments (with 6 attributes and 3 indexes)"
echo ""
echo "🚀 Next steps:"
echo "  1. Restart your dev server: npm run dev"
echo "  2. Test live streaming at /streams"
echo ""
echo "🎬 Your live streaming feature is ready!"
