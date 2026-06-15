#!/bin/bash
REGISTRY=$1
TAG=$2

BACKEND_IMAGE="${REGISTRY}/coupon-backend"
FRONTEND_IMAGE="${REGISTRY}/coupon-frontend"

echo "============================================="
echo "🚀 배포 자동화 시작: Tag [ ${TAG} ]"
echo "============================================="

# 1. 새 이미지 Pull
echo "📥 도커 허브로부터 신규 이미지 다운로드 중..."
docker pull ${BACKEND_IMAGE}:${TAG}
docker pull ${FRONTEND_IMAGE}:${TAG}

# 2. 기존 가동 중인 컨테이너 중지 및 삭제
echo "🧹 기존 구버전 컨테이너 정리..."
docker stop coupon-backend coupon-frontend 2>/dev/null || true
docker rm coupon-backend coupon-frontend 2>/dev/null || true

# 3. 도커 브릿지 네트워크망 확인 및 연결
docker network create coupon-net 2>/dev/null || true

# 4. 백엔드(Spring Boot WAS) 구동
echo "🟢 신규 백엔드 컨테이너 구동..."
docker run -d \
  --name coupon-backend \
  --network coupon-net \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL="jdbc:mariadb://coupon-mariadb:3306/coupon_db" \
  -e SPRING_DATASOURCE_USERNAME="root" \
  -e SPRING_DATASOURCE_PASSWORD="rootpassword" \
  --restart always \
  ${BACKEND_IMAGE}:${TAG}

# 5. 프론트엔드(React + Nginx) 구동
echo "🟢 신규 프론트엔드 컨테이너 구동..."
docker run -d \
  --name coupon-frontend \
  --network coupon-net \
  -p 80:80 \
  --restart always \
  ${FRONTEND_IMAGE}:${TAG}

# 6. 사용하지 않는 구버전 잔여 이미지 청소
echo "♻️ 사용하지 않는 미사용 이미지 정리 (Prune)..."
docker image prune -f

echo "============================================="
echo "✅ 배포가 성공적으로 완료되었습니다!"
echo "============================================="
