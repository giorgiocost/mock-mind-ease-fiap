# Deploy no Vercel - Instruções

## ⚠️ Problema Resolvido

O erro que você estava enfrentando:
```
Error: The Edge Function "middleware" is referencing unsupported modules:
	- __vc__ns__/0/middleware.js: fs, path
	- jsonwebtoken: crypto
```

Foi causado porque o Vercel tentava rodar o middleware como Edge Function, mas o código usa módulos Node.js (`fs`, `path`, `crypto`) que não são suportados no Edge Runtime.

## ✅ Solução Implementada

1. **Criado `vercel.json`**: Configurado para usar Node.js runtime ao invés de Edge runtime
2. **Modificado `server.js`**: Exporta o servidor como módulo para funcionar no Vercel serverless

## 📋 Configurar Variáveis de Ambiente no Vercel

Antes de fazer o deploy, você **DEVE** configurar as seguintes variáveis de ambiente no painel do Vercel:

### Passo a Passo:

1. Acesse o projeto no Vercel Dashboard: https://vercel.com/dashboard
2. Vá em **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `JWT_SECRET` | `sua-chave-secreta-forte-aqui` | **OBRIGATÓRIO** - Gere com: `openssl rand -base64 32` |
| `NODE_ENV` | `production` | Ambiente de execução |
| `JWT_ACCESS_EXPIRY` | `1h` | Expiração do access token |
| `JWT_REFRESH_EXPIRY` | `7d` | Expiração do refresh token |
| `PORT` | `3333` | Porta (opcional, Vercel define automaticamente) |

### Gerar JWT_SECRET seguro:

No terminal, execute:
```bash
openssl rand -base64 32
```

Copie o resultado e cole como valor da variável `JWT_SECRET` no Vercel.

## 🚀 Deploy

Após configurar as variáveis de ambiente:

```bash
# Se ainda não tiver o Vercel CLI instalado:
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

Ou use o Git integration do Vercel (recomendado):
- Conecte seu repositório GitHub/GitLab/Bitbucket ao Vercel
- O deploy acontece automaticamente a cada push na branch principal

## 🧪 Testar após Deploy

Após o deploy, teste os endpoints:

```bash
# Health check
curl https://seu-projeto.vercel.app/health

# API info
curl https://seu-projeto.vercel.app/api/v1

# Swagger docs
# Abra no navegador: https://seu-projeto.vercel.app/api-docs
```

## ⚠️ Limitações do Vercel (Serverless)

1. **Sem persistência de dados**: O `db.json` será resetado a cada deploy. Use um banco de dados real (MongoDB, PostgreSQL, etc.) em produção.
2. **Cold starts**: A primeira requisição pode ser mais lenta.
3. **Timeout**: Máximo de 10 segundos por requisição no plano free.
4. **Limit de 50MB**: O código + dependências não pode ultrapassar 50MB.

## 🔄 Alternativa: Usar Banco de Dados Real

Para produção, considere substituir json-server por:
- **MongoDB Atlas** (free tier)
- **Supabase** (PostgreSQL gratuito)
- **PlanetScale** (MySQL serverless)
- **Railway** / **Render** (para hospedar o json-server tradicional)

## 📚 Documentação

- [Vercel Node.js](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [JSON Server](https://github.com/typicode/json-server)
