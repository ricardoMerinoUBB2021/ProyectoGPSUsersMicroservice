pipeline {
    agent any
    
    environment {
        ECR_REPOSITORY = credentials('ECR_REPOSITORY_URL')
        AWS_REGION = credentials('AWS_REGION')
        ECS_CLUSTER = credentials('ECS_CLUSTER_NAME')
        ECS_SERVICE = credentials('ECS_SERVICE_NAME')
        ECS_TASK_FAMILY = 'users-microservice'
        AWS_ACCOUNT_ID = credentials('AWS_ACCOUNT_ID')
        IMAGE_TAG = "users-microservice-${env.BUILD_NUMBER}"
        DOCKER_CREDS = credentials('docker-hub-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build and Test') {
            steps {
                dir('backend/services/users-microservice') {
                    sh 'npm install'
                    sh 'npm run test'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                dir('backend/services/users-microservice') {
                    script {
                        app = docker.build("${ECR_REPOSITORY}:${IMAGE_TAG}")
                    }
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                script {
                    // Login to ECR
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY}"
                    
                    // Push the image
                    sh "docker push ${ECR_REPOSITORY}:${IMAGE_TAG}"
                }
            }
        }
        
        stage('Update Task Definition') {
            steps {
                dir('backend/services/users-microservice') {
                    sh "chmod +x update-task-definition.sh"
                    script {
                        // Run the update task definition script
                        sh """
                        export ECR_REPOSITORY=${ECR_REPOSITORY}
                        export IMAGE_TAG=${IMAGE_TAG}
                        export AWS_REGION=${AWS_REGION}
                        export ECS_TASK_FAMILY=${ECS_TASK_FAMILY}
                        export AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
                        ./update-task-definition.sh
                        """
                        
                        // Get the new task definition ARN from the output
                        def taskDefArn = sh(
                            script: "cat task-definition-arn.txt",
                            returnStdout: true
                        ).trim()
                        
                        env.TASK_DEFINITION_ARN = taskDefArn
                    }
                }
            }
        }
        
        stage('Deploy to ECS') {
            steps {
                script {
                    // Update ECS service with the new task definition
                    sh """
                    aws ecs update-service --cluster ${ECS_CLUSTER} \
                        --service ${ECS_SERVICE} \
                        --task-definition ${env.TASK_DEFINITION_ARN} \
                        --region ${AWS_REGION}
                    """
                    
                    // Wait for deployment to complete
                    sh """
                    aws ecs wait services-stable \
                        --cluster ${ECS_CLUSTER} \
                        --services ${ECS_SERVICE} \
                        --region ${AWS_REGION}
                    """
                }
            }
        }
    }
    
    post {
        always {
            // Clean up Docker images
            sh "docker rmi ${ECR_REPOSITORY}:${IMAGE_TAG} || true"
        }
        
        success {
            echo 'Deployment completed successfully!'
        }
        
        failure {
            echo 'Deployment failed'
        }
    }
} 