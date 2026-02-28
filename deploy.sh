#!/usr/bin/env bash
# ============================================================
# THE PATRON — Vercel 배포 스크립트
# 실행 전: npm i -g vercel && vercel login
# ============================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVESTOR_DIR="$REPO_ROOT/apps/investor"
COMPANY_DIR="$REPO_ROOT/apps/company"
ADMIN_DIR="$REPO_ROOT/apps/admin"

# 색상
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   THE PATRON — Vercel 배포${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 배포 대상 선택
echo -e "\n배포할 앱을 선택하세요:"
echo "  1) investor (투자자 앱)"
echo "  2) company  (기업 앱)"
echo "  3) admin    (관리자 앱)"
echo "  4) all      (전체)"
read -p "선택 (1-4): " CHOICE

# 프로덕션 여부
read -p "프로덕션 배포? (y/N): " IS_PROD
PROD_FLAG=""
if [[ "$IS_PROD" =~ ^[Yy]$ ]]; then
  PROD_FLAG="--prod"
fi

deploy_app() {
  local APP_DIR=$1
  local APP_NAME=$2
  echo -e "\n${GREEN}▶ $APP_NAME 배포 중...${NC}"
  cd "$APP_DIR"
  vercel deploy $PROD_FLAG --yes
  echo -e "${GREEN}✓ $APP_NAME 배포 완료${NC}"
  cd "$REPO_ROOT"
}

case $CHOICE in
  1) deploy_app "$INVESTOR_DIR" "investor" ;;
  2) deploy_app "$COMPANY_DIR"  "company"  ;;
  3) deploy_app "$ADMIN_DIR"    "admin"    ;;
  4)
    deploy_app "$INVESTOR_DIR" "investor"
    deploy_app "$COMPANY_DIR"  "company"
    deploy_app "$ADMIN_DIR"    "admin"
    ;;
  *)
    echo "잘못된 선택입니다"
    exit 1
    ;;
esac

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}배포 완료!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
