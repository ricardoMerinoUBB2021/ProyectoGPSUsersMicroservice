#!/bin/bash

# Build with custom DNS to avoid network issues and use the multi-stage Dockerfile
echo "Building Docker image using multi-stage build with custom network settings..."
docker build \
  --network=host \
  --dns 8.8.8.8 \
  --dns 8.8.4.4 \
  -f Dockerfile.multistage \
  -t users-microservice:latest .

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build successful! You can now run the container with:"
  echo "docker-compose up -d"
else
  echo "Build failed. Please check the error messages above."
fi 