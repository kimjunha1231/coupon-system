pipeline {
    agent any
    
    environment {
        REGISTRY = "junhajuns" 
        BACKEND_IMAGE = "coupon-backend"
        FRONTEND_IMAGE = "coupon-frontend"
        TAG = "${env.BUILD_NUMBER}"
        TARGET_SERVER_IP = "15.165.141.72" // EC2 탄력적 IP 고정 적용
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Backend Build & Test') {
            steps {
                sh 'chmod +x gradlew'
                sh './gradlew clean build -x test'
            }
        }
        
        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                }
                
                sh "docker build -t ${REGISTRY}/${BACKEND_IMAGE}:${TAG} ."
                sh "docker build -t ${REGISTRY}/${BACKEND_IMAGE}:latest ."
                sh "docker push ${REGISTRY}/${BACKEND_IMAGE}:${TAG}"
                sh "docker push ${REGISTRY}/${BACKEND_IMAGE}:latest"
                
                dir('frontend') {
                    sh "docker build -t ${REGISTRY}/${FRONTEND_IMAGE}:${TAG} ."
                    sh "docker build -t ${REGISTRY}/${FRONTEND_IMAGE}:latest ."
                    sh "docker push ${REGISTRY}/${FRONTEND_IMAGE}:${TAG}"
                    sh "docker push ${REGISTRY}/${FRONTEND_IMAGE}:latest"
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                sshagent(['backend-ssh-key']) {
                    sh "scp -o StrictHostKeyChecking=no deploy.sh ubuntu@${TARGET_SERVER_IP}:/home/ubuntu/deploy.sh"
                    sh "ssh -o StrictHostKeyChecking=no ubuntu@${TARGET_SERVER_IP} 'chmod +x /home/ubuntu/deploy.sh && /home/ubuntu/deploy.sh ${REGISTRY} ${TAG}'"
                }
            }
        }
    }
    
    post {
        success {
            echo '배포가 성공적으로 완료되었습니다! 🎉'
        }
        failure {
            echo '배포 중 오류가 발생했습니다. Jenkins 빌드 로그를 확인해 주세요. ❌'
        }
    }
}
