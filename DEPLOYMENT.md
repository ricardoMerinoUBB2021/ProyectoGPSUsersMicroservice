# Users Microservice Deployment Guide

This guide provides instructions for containerizing the Users Microservice with Docker and deploying it to AWS using Jenkins.

## Prerequisites

- Docker installed locally
- AWS CLI configured with appropriate permissions
- Jenkins server with the following plugins:
  - Docker Pipeline
  - AWS Steps
  - Pipeline Utility Steps
  - Blue Ocean (optional, for better visualization)
- Terraform (for infrastructure provisioning)

## Local Docker Deployment

### Build and Run Locally

1. Navigate to the microservice directory:
   ```bash
   cd /path/to/backend/services/users-microservice
   ```

2. Build the Docker image:
   ```bash
   docker build -t users-microservice:latest .
   ```

3. Run the container with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Test the service:
   ```bash
   curl http://localhost:3001/api/v1/health
   ```

## AWS Deployment with Jenkins

### Setting Up Jenkins Credentials

1. Add the following credentials to Jenkins:
   - `AWS_CREDENTIALS`: AWS access key and secret key
   - `ECR_REPOSITORY_URL`: URL of your ECR repository
   - `AWS_REGION`: AWS region (e.g., us-east-1)
   - `ECS_CLUSTER_NAME`: Name of your ECS cluster
   - `ECS_SERVICE_NAME`: Name of your ECS service
   - `AWS_ACCOUNT_ID`: Your AWS account ID
   - `docker-hub-credentials`: Docker Hub credentials (if needed)

### Infrastructure Setup with Terraform

1. Navigate to the terraform directory:
   ```bash
   cd /path/to/backend/services/users-microservice/terraform
   ```

2. Initialize Terraform:
   ```bash
   terraform init
   ```

3. Create a `terraform.tfvars` file with your specific variables:
   ```
   aws_region       = "us-east-1"
   db_username      = "your_db_username"
   db_password      = "your_db_password"
   db_name          = "users_microservice"
   ```

4. Plan and apply the Terraform configuration:
   ```bash
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

5. Note the outputs:
   ```bash
   terraform output
   ```

### Setting Up the Jenkins Pipeline

1. In your Jenkins instance, create a new Pipeline job.

2. Configure the pipeline to use the Jenkinsfile from your repository:
   - Select "Pipeline script from SCM"
   - Choose Git as the SCM
   - Enter your repository URL and credentials
   - Specify the path to Jenkinsfile: `backend/services/users-microservice/Jenkinsfile`

3. Save the configuration and run the pipeline.

### Continuous Deployment Workflow

The Jenkins pipeline performs the following steps:

1. **Checkout**: Pulls the latest code from the repository
2. **Build and Test**: Installs dependencies and runs tests
3. **Build Docker Image**: Creates a Docker image of the microservice
4. **Push to ECR**: Pushes the image to Amazon ECR
5. **Update Task Definition**: Updates the ECS task definition with the new image
6. **Deploy to ECS**: Updates the ECS service to use the new task definition

## Monitoring and Troubleshooting

### Monitoring

- Use AWS CloudWatch to monitor:
  - Container logs
  - CPU and memory usage
  - Application metrics

### Troubleshooting Common Issues

1. **Jenkins Connectivity Issues**:
   - Ensure Jenkins has network access to AWS services
   - Verify AWS credentials have appropriate permissions

2. **Docker Build Failures**:
   - Check Node.js compatibility
   - Ensure all required files are included (not excluded by .dockerignore)

3. **ECS Deployment Failures**:
   - Check ECS task execution role permissions
   - Verify container health check is passing
   - Examine CloudWatch logs for application errors

## Scaling Considerations

- The ECS service is configured to run on AWS Fargate, which allows for easy scaling:
  - Update the `desired_count` in the ECS service to scale horizontally
  - Adjust CPU and memory in the task definition for vertical scaling

## Security Notes

- Secrets management:
  - Production credentials should be stored in AWS Systems Manager Parameter Store
  - Update the task definition to reference these parameters
  - Never hardcode credentials in Docker images or task definitions

## Rollback Procedure

In case of deployment failures:

1. Identify the last stable version from ECR
2. Update the ECS task definition to use that image
3. Update the ECS service to use the rollback task definition:
   ```bash
   aws ecs update-service --cluster <cluster-name> --service <service-name> --task-definition <rollback-task-definition>
   ``` 