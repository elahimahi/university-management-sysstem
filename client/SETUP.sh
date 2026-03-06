#!/bin/bash
# AUST University Management System - Frontend Setup Script

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  AUST University Management System - Frontend                  ║"
echo "║  Enterprise-Level React + Vite Application                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📁 Project Location:${NC}"
echo "   e:\3.1\sd lab\cse-3100\university-management-system-frontend"
echo ""

echo -e "${BLUE}📋 STEP 1: Navigate to Frontend Directory${NC}"
echo "   cd e:/3.1/sd\ lab/cse-3100/university-management-system-frontend"
echo ""

echo -e "${BLUE}📦 STEP 2: Install Dependencies${NC}"
echo "   npm install"
echo ""

echo -e "${BLUE}⚙️  STEP 3: Create Environment File${NC}"
echo "   cp .env.example .env"
echo ""

echo -e "${BLUE}🔧 Configure .env${NC}"
echo "   VITE_API_URL=http://localhost:8000/api"
echo "   VITE_APP_NAME=AUST University Management System"
echo ""

echo -e "${GREEN}✨ STEP 4: Start Development Server${NC}"
echo "   npm run dev"
echo "   App will run on: http://localhost:5173"
echo ""

echo -e "${YELLOW}🔑 Demo Credentials:${NC}"
echo ""
echo "   Admin:"
echo "   ├─ Email: admin@test.com"
echo "   └─ Password: password123"
echo ""
echo "   Teacher:"
echo "   ├─ Email: teacher@test.com"
echo "   └─ Password: password123"
echo ""
echo "   Student:"
echo "   ├─ Email: student@test.com"
echo "   └─ Password: password123"
echo ""

echo -e "${BLUE}🏗️  Build for Production${NC}"
echo "   npm run build"
echo "   npm run preview"
echo ""

echo -e "${BLUE}📚 Additional Commands${NC}"
echo "   npm run lint          # Run ESLint"
echo ""

echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Visit http://localhost:5173 in your browser"
echo ""
