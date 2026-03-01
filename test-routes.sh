#!/bin/bash

# ============================================
# MindEase Mock API - Routes & Middleware Test
# ============================================

BASE_URL="http://localhost:3333"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "============================================"
echo "Ì∑™ MindEase Mock API - Routes & Middleware"
echo "============================================"
echo ""

PASSED=0
FAILED=0

# ==========================================
# 1. TESTES DE ROTEAMENTO
# ==========================================
echo "Ì≥ç 1. ROTEAMENTO"
echo "----------------"

# Health check
echo -n "Health check... "
response=$(curl -s "$BASE_URL/health")
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$status" == "200" ] && [[ "$response" == *'"status":"ok"'* ]]; then
  echo -e "${GREEN}‚úÖ OK${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}‚ùå FAIL${NC} (Status: $status)"
  FAILED=$((FAILED + 1))
fi

# API v1 routes
echo -n "GET /api/v1/users... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/users")
if [ "$status" == "200" ]; then
  echo -e "${GREEN}‚úÖ OK${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}‚ùå FAIL${NC} (Status: $status)"
  FAILED=$((FAILED + 1))
fi

echo -n "GET /api/v1/tasks... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/tasks")
if [ "$status" == "200" ]; then
  echo -e "${GREEN}‚úÖ OK${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}‚ùå FAIL${NC} (Status: $status)"
  FAILED=$((FAILED + 1))
fi

echo ""

# ==========================================
# 2. TESTES DE MIDDLEWARE - TIMESTAMPS
# ==========================================
echo "Ì≥ç 2. MIDDLEWARE - TIMESTAMPS"
echo "-----------------------------"

echo -n "POST user (auto timestamps)... "
response=$(curl -s -X POST "$BASE_URL/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","passwordHash":"123"}')

if [[ "$response" == *'"createdAt"'* ]] && [[ "$response" == *'"updatedAt"'* ]]; then
  echo -e "${GREEN}‚úÖ OK${NC}"
  PASSED=$((PASSED + 1))
  
  # Salvar ID para testes seguintes
  USER_ID=$(echo "$response" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
else
  echo -e "${RED}‚ùå FAIL${NC}"
  FAILED=$((FAILED + 1))
  USER_ID=""
fi

echo ""

# ==========================================
# 3. TESTES DE VALIDA√á√ÉO
# ==========================================
echo "Ì≥ç 3. MIDDLEWARE - VALIDA√á√ÉO"
echo "----------------------------"

echo -n "POST user sem email (deve falhar)... "
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","passwordHash":"123"}')
if [ "$status" == "400" ]; then
  echo -e "${GREEN}‚úÖ OK${NC} (Status: 400)"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}‚ùå FAIL${NC} (Status: $status, esperado 400)"
  FAILED=$((FAILED + 1))
fi

echo -n "POST task sem title (deve falhar)... "
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test"}')
if [ "$status" == "400" ]; then
  echo -e "${GREEN}‚úÖ OK${NC} (Status: 400)"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}‚ùå FAIL${NC} (Status: $status, esperado 400)"
  FAILED=$((FAILED + 1))
fi

echo ""

# ==========================================
# 4. TESTES DE AUTH MOCK
# ==========================================
echo "Ì≥ç 4. MIDDLEWARE - AUTH MOCK"
echo "----------------------------"

echo -n "GET com Bearer token... "
response=$(curl -s "$BASE_URL/api/v1/users" \
  -H "Authorization: Bearer fake-token-123")
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/users" \
  -H "Authorization: Bearer fake-token-123")

if [ "$status" == "200" ]; then
  echo -e "${GREEN}‚úÖ OK${NC} (Token aceito)"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}‚ùå FAIL${NC} (Status: $status)"
  FAILED=$((FAILED + 1))
fi

echo ""

# ==========================================
# LIMPEZA
# ==========================================
if [ -n "$USER_ID" ]; then
  echo "Ì∑π Limpando dados de teste..."
  curl -s -X DELETE "$BASE_URL/api/v1/users/$USER_ID" > /dev/null
  echo "Usu√°rio teste deletado (ID: $USER_ID)"
  echo ""
fi

# ==========================================
# RESULTADOS
# ==========================================
echo "============================================"
echo "Ì≥ä RESULTADOS"
echo "============================================"
echo -e "Total:  ${YELLOW}$((PASSED + FAILED))${NC}"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}‚úÖ Todos os testes passaram!${NC}"
  echo "Routes & Middleware configurados corretamente."
  echo ""
  exit 0
else
  echo -e "${RED}‚ùå Alguns testes falharam.${NC}"
  echo ""
  exit 1
fi
