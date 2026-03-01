#!/bin/bash
echo "🔄 Resetando database para seed data..."

cd "$(dirname "$0")"

if [ ! -f "db.seed.json" ]; then
  echo "❌ Erro: db.seed.json não encontrado!"
  exit 1
fi

# Backup atual
if [ -f "db.json" ]; then
  BACKUP_FILE="db.json.backup.$(date +%Y%m%d_%H%M%S)"
  cp db.json "$BACKUP_FILE"
  echo "📦 Backup criado: $BACKUP_FILE"
fi

# Copiar seed
cp db.seed.json db.json
echo "✅ Database resetado com seed data!"
echo ""
echo "📊 Dados carregados:"
echo "  - 3 usuários (ana.silva, bruno.costa, carlos.santos)"
echo "  - 3 preferências (simple/medium/full)"
echo "  - 10 tasks (TODO/DOING/DONE)"
echo "  - 5 checklist items"
echo "  - 3 task notes"
echo "  - 3 focus sessions"
echo "  - 2 alertas cognitivos"
echo "  - 4 eventos de telemetria"
echo ""
echo "🔐 Credenciais de login:"
echo "  - ana.silva@example.com / Senha@123"
echo "  - bruno.costa@example.com / Senha@456"
echo "  - carlos.santos@example.com / Senha@789"
echo ""
echo "🔄 Reinicie o servidor: npm start"
