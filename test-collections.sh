#!/bin/bash

# ============================================
# MindEase Mock API - Collections Test Script
# ============================================
# Testa se todos os endpoints est√£o respondendo
# com arrays vazios (state inicial esperado)

BASE_URL="http://localhost:3333/api/v1"
COLLECTIONS=("users" "preferences" "tasks" "checklistItems" "taskNotes" "focusSessions" "cognitiveAlerts" "telemetryEvents")

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "============================================"
echo "Ì∑™ MindEase Mock API - Collections Test"
echo "============================================"
echo ""

# Vari√°veis de controle
PASSED=0
FAILED=0

# Testar cada collection
for collection in "${COLLECTIONS[@]}"; do
  echo -n "Testing /${collection}... "
  
  # Fazer requisi√ß√£o
  response=$(curl -s "$BASE_URL/$collection")
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$collection")
  
  # Verificar resposta
  if [ "$http_code" == "200" ] && [ "$response" == "[]" ]; then
    echo -e "${GREEN}‚úÖ OK${NC} (Status: 200, Response: [])"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}‚ùå FAIL${NC} (Status: $http_code, Response: $response)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "============================================"
echo "Ì≥ä Results"
echo "============================================"
echo -e "Total tests: ${YELLOW}${#COLLECTIONS[@]}${NC}"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}‚úÖ All collections OK! Database structure is ready.${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}‚ùå Some tests failed. Check server logs.${NC}"
  echo ""
  exit 1
fi
