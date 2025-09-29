#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
docker-compose build

# Start the container
echo "Starting container..."
docker-compose up -d

# Show logs
echo "Container is starting. Showing logs (Ctrl+C to exit logs, container will continue running)..."
docker-compose logs -f

echo "\nContainer is running on port 2025"
echo "To stop the container, run: docker-compose down"
echo "To view logs: docker-compose logs -f"

# Make the script executable
chmod +x docker-run.sh
