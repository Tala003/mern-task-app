pipeline {
    agent any
    environment {
        // AWS Infrastructure details
        AWS_ACCOUNT_ID = '616745995691'
        AWS_REGION     = 'ap-south-1'
        CLUSTER_NAME   = 'mern-eks-cluster'
        
        // ECR Repository names
        AUTH_REPO      = 'mern-task-app-auth-service'
        TASK_REPO      = 'mern-task-app-task-service'
        NOTIF_REPO     = 'mern-task-app-notification-service'
        FRONTEND_REPO  = 'mern-task-app-frontend'
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
                        // ECR Login
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                        
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
                        // Setup Kubeconfig
                        sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"
                        
                        // Apply Kubernetes manifests
                        sh "kubectl apply -f k8s-manifests/"
                        
                        // Restart deployments
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
            echo 'Deployment Failed.'
        }
        always {
            sh 'docker system prune -f'
            cleanWs()
        }
    }
}
