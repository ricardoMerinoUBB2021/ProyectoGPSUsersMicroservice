#!/bin/bash

# This script updates the ECS task definition with the latest image tag and registers a new task definition

# Required environment variables
# ECR_REPOSITORY - The ECR repository URL
# IMAGE_TAG - The image tag to use
# AWS_REGION - The AWS region
# ECS_TASK_FAMILY - The ECS task definition family name
# AWS_ACCOUNT_ID - The AWS account ID

# Exit on error
set -e

# Get the current task definition
TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition $ECS_TASK_FAMILY --region $AWS_REGION)

# Create a new task definition file with the updated image
echo $TASK_DEFINITION \
  | jq --arg IMAGE "$ECR_REPOSITORY:$IMAGE_TAG" \
     '.taskDefinition | .containerDefinitions[0].image = $IMAGE | {containerDefinitions: .containerDefinitions, family: .family, executionRoleArn: .executionRoleArn, networkMode: .networkMode, volumes: .volumes, placementConstraints: .placementConstraints, requiresCompatibilities: .requiresCompatibilities, cpu: .cpu, memory: .memory}' \
  > new-task-definition.json

# Register the new task definition
NEW_TASK_DEFINITION=$(aws ecs register-task-definition \
  --region $AWS_REGION \
  --cli-input-json file://new-task-definition.json)

# Get the new task definition revision
NEW_REVISION=$(echo $NEW_TASK_DEFINITION | jq -r '.taskDefinition.revision')

# Create the task definition ARN
TASK_DEFINITION_ARN="arn:aws:ecs:$AWS_REGION:$AWS_ACCOUNT_ID:task-definition/$ECS_TASK_FAMILY:$NEW_REVISION"

# Output the new task definition ARN for reference
echo "New task definition: $TASK_DEFINITION_ARN"

# Save the ARN to a file for the Jenkins pipeline to read
echo $TASK_DEFINITION_ARN > task-definition-arn.txt 