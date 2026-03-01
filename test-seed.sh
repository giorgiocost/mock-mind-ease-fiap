#!/bin/bash
BASE_URL="http://localhost:3333/api/v1"

echo "🧪 Validando seed data..."
echo ""

# 1. Contar usuários
USERS_COUNT=$(curl -s "$BASE_URL/users" | grep -o '"id"' | wc -l)
echo "1. Usuários: $USERS_COUNT (esperado: 3)"
if [ "$USERS_COUNT" -eq 3 ]; then
  echo "   ✅ PASS"
else
  echo "   ❌ FAIL"
fi
echo ""

# 2. Contar tasks
TASKS_COUNT=$(curl -s "$BASE_URL/tasks" | grep -o '"id"' | wc -l)
echo "2. Tasks: $TASKS_COUNT (esperado: 10)"
if [ "$TASKS_COUNT" -eq 10 ]; then
  echo "   ✅ PASS"
else
  echo "   ❌ FAIL"
fi
echo ""

# 3. Contar preferências
PREFS_COUNT=$(curl -s "$BASE_URL/preferences" | grep -o '"id"' | wc -l)
echo "3. Preferências: $PREFS_COUNT (esperado: 3)"
if [ "$PREFS_COUNT" -eq 3 ]; then
  echo "   ✅ PASS"
else
  echo "   ❌ FAIL"
fi
echo ""

# 4. Contar checklist items
CHECKLIST_COUNT=$(curl -s "$BASE_URL/checklistItems" | grep -o '"id"' | wc -l)
echo "4. Checklist Items: $CHECKLIST_COUNT (esperado: 5)"
if [ "$CHECKLIST_COUNT" -eq 5 ]; then
  echo "   ✅ PASS"
else
  echo "   ❌ FAIL"
fi
echo ""

# 5. Contar task notes
NOTES_COUNT=$(curl -s "$BASE_URL/taskNotes" | grep -o '"id"' | wc -l)
echo "5. Task Notes: $NOTES_COUNT (esperado: 3)"
if [ "$NOTES_COUNT" -eq 3 ]; then
  echo "   ✅ PASS"
else
  echo "   ❌ FAIL"
fi
echo ""

# 6. Contar focus sessions
SESSIONS_COUNT=$(curl -s "$BASE_URL/focusSessions" | grep -o '"id"' | wc -l)
echo "6. Focus Sessions: $SESSIONS_COUNT (esperado: 3)"
if [ "$SESSIONS_COUNT" -eq 3 ]; then
  echo "   ✅ PASS"
else
  echo "   ❌ FAIL"
fi
echo ""

# 7. Contar alertas cognitivos
ALERTS_COUNT=$(curl -s "$BASE_URL/cognitiveAlerts" | grep -o '"id"' | wc -l)
echo "7. Alertas Cognitivos: $ALERTS_COUNT (esperado: 2)"
if [ "$ALERTS_COUNT" -eq 2 ]; then
  echo "   ✅ PASS"
else
  echo "   ❌ FAIL"
fi
echo ""

# 8. Contar eventos de telemetria
EVENTS_COUNT=$(curl -s "$BASE_URL/telemetryEvents" | grep -o '"id"' | wc -l)
echo "8. Eventos Telemetria: $EVENTS_COUNT (esperado: 4)"
if [ "$EVENTS_COUNT" -eq 4 ]; then
  echo "   ✅ PASS"
else
  echo "   ❌ FAIL"
fi
echo ""

# 9. Testar login Ana
echo "9. Login Ana Silva..."
LOGIN_ANA=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.silva@example.com","password":"Senha@123"}')
if [ "$LOGIN_ANA" == "200" ]; then
  echo "   ✅ PASS (status: $LOGIN_ANA)"
else
  echo "   ❌ FAIL (status: $LOGIN_ANA, esperado: 200)"
fi
echo ""

# 10. Testar login Bruno
echo "10. Login Bruno Costa..."
LOGIN_BRUNO=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bruno.costa@example.com","password":"Senha@456"}')
if [ "$LOGIN_BRUNO" == "200" ]; then
  echo "   ✅ PASS (status: $LOGIN_BRUNO)"
else
  echo "   ❌ FAIL (status: $LOGIN_BRUNO, esperado: 200)"
fi
echo ""

# 11. Testar login Carlos
echo "11. Login Carlos Santos..."
LOGIN_CARLOS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos.santos@example.com","password":"Senha@789"}')
if [ "$LOGIN_CARLOS" == "200" ]; then
  echo "   ✅ PASS (status: $LOGIN_CARLOS)"
else
  echo "   ❌ FAIL (status: $LOGIN_CARLOS, esperado: 200)"
fi
echo ""

# 12. Verificar relacionamentos (tasks com userId válido)
echo "12. Relacionamentos tasks → users..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.silva@example.com","password":"Senha@123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

ANA_TASKS=$(curl -s -X GET "$BASE_URL/tasks" -H "Authorization: Bearer $TOKEN" | grep -o '"userId":"user-001"' | wc -l)
if [ "$ANA_TASKS" -ge 1 ]; then
  echo "   ✅ PASS (Ana tem $ANA_TASKS task(s))"
else
  echo "   ❌ FAIL (Ana sem tasks)"
fi
echo ""

echo "================================================"
echo "✅ Validação do seed data concluída!"
echo "================================================"
