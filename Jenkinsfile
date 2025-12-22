pipeline {
    agent any
    environment {
        AWS_ACCOUNT_ID = '616745995691'
        AWS_REGION     = 'ap-south-1'
        FRONTEND_REPO  = 'mern-task-app-frontend'
        CLUSTER_NAME   = 'mern-eks-cluster'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Frontend') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', 
                                 credentialsId: 'aws-credentials', 
                                 accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                 secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    script {
                        // ECR Login
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                        
                        // Frontend folder mein ja kar build karna
                        dir('frontend') {
                            sh "docker build -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${FRONTEND_REPO}:latest ."
                        }
                        
                        // Image Push karna
                        sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${FRONTEND_REPO}:latest"
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
                        // EKS Connection Setup
                        sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"
                        
                        // K8s Manifests apply karna
                        sh "kubectl apply -f k8s-manifests/"
                        
                        // Deployment restart taake naya image uthaye
                        sh "kubectl rollout restart deployment frontend"
                    }
                }
            }
        }
    }
    post {
        success {
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Deployment Failed. Check logs.'
        }
    }
}
