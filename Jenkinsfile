pipeline {
    agent any
    environment {
        // AWS Infrastructure details from terraform.tfstate
        AWS_ACCOUNT_ID = '616745995691' [cite: 31]
        AWS_REGION     = 'ap-south-1' [cite: 23]
        CLUSTER_NAME   = 'mern-eks-cluster' [cite: 7]
        
        // Repository names from ecr.tf
        AUTH_REPO      = 'mern-task-app-auth-service' [cite: 6]
        TASK_REPO      = 'mern-task-app-task-service' [cite: 6]
        NOTIF_REPO     = 'mern-task-app-notification-service' [cite: 6]
        FRONTEND_REPO  = 'mern-task-app-frontend' [cite: 6]
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Images') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                 credentialsId: 'aws-credentials', 
                                 accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                 secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    script {
                        // Login to ECR
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                        
                        // Array of services to build and push based on your ecr.tf
                        def services = [
                            [dir: 'auth-service', repo: AUTH_REPO],
                            [dir: 'task-service', repo: TASK_REPO],
                            [dir: 'notification-service', repo: NOTIF_REPO],
                            [dir: 'frontend', repo: FRONTEND_REPO]
                        ]

                        services.each { service ->
                            echo "Building and Pushing: ${service.repo}"
                            dir("${service.dir}") {
                                sh "docker build -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${service.repo}:latest ."
                                sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${service.repo}:latest"
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                 credentialsId: 'aws-credentials', 
                                 accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                 secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    script {
                        // Setup Kubeconfig for your EKS cluster
                        sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}" [cite: 7]
                        
                        // Apply Kubernetes manifests (Ensure these files exist in your repo)
                        sh "kubectl apply -f k8s-manifests/"
                        
                        // Restart deployments to pull latest images from ECR
                        sh "kubectl rollout restart deployment auth-service task-service notification-service frontend"
                    }
                }
            }
        }
    }
    post {
        success {
            echo 'MERN Stack Deployment to EKS Successful!'
        }
        failure {
            echo 'Deployment Failed. Verify AWS credentials and ECR permissions.'
        }
        always {
            // Clean up workspace to prevent storage issues on EC2
            sh 'docker system prune -f'
            cleanWs()
        }
    }
}
