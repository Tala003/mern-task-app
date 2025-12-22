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
            steps { checkout scm }
        }
        stage('Build & Push Frontend') {
            steps {
                script {
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                    sh "docker build -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${FRONTEND_REPO}:latest ."
                    sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${FRONTEND_REPO}:latest"
                }
            }
        }
        stage('Deploy to EKS') {
            steps {
                script {
                    sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"
                    // Manifest apply karein
                    sh "kubectl apply -f k8s-manifests/frontend-ingress.yaml"
                    // Force restart taake naya code nazar aaye
                    sh "kubectl rollout restart deployment frontend"
                }
            }
        }
    }
}