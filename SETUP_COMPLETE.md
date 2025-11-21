# Cloudflare VibeSDK - Configuração Completa

## Status da Configuração

Todas as etapas de configuração inicial foram concluídas com sucesso:

- [x] Dependências instaladas (frontend e worker)
- [x] Variáveis de ambiente configuradas
- [x] Configuração do Wrangler validada
- [x] Banco de dados D1 local migrado
- [x] TypeScript configurado e validado

## Estrutura do Projeto

```
vibe/
├── src/                    # Frontend React + TypeScript
│   ├── api-types.ts       # Single source of truth para tipos de API
│   ├── lib/               # Bibliotecas e utilitários
│   ├── hooks/             # React hooks customizados
│   ├── components/        # Componentes React (80+)
│   └── routes/            # Rotas da aplicação
├── worker/                # Backend Cloudflare Workers
│   ├── index.ts          # Entry point (7860 linhas)
│   ├── agents/           # Sistema de agentes AI (88 arquivos)
│   ├── database/         # Drizzle ORM + D1
│   ├── services/         # Serviços (sandbox, oauth, rate-limit)
│   └── api/              # Rotas e controllers
├── shared/               # Tipos compartilhados
├── migrations/           # Migrações do banco D1
└── container/            # Sandbox container tooling
```

## Configuração de Ambiente

### Arquivo .dev.vars

O arquivo `.dev.vars` foi criado com valores de desenvolvimento padrão. Você precisa adicionar suas chaves de API:

**OBRIGATÓRIO:**
- `GOOGLE_AI_STUDIO_API_KEY` - Chave da API do Google Gemini
  - Obtenha em: https://ai.google.dev

**Opcional (mas recomendado):**
- `OPENAI_API_KEY` - Para usar modelos GPT
- `ANTHROPIC_API_KEY` - Para usar Claude
- `GITHUB_TOKEN` - Para operações com repositórios
- `STRIPE_SECRET_KEY` - Para processamento de pagamentos

### Editar o arquivo:
```bash
nano .dev.vars
# ou
code .dev.vars
```

## Próximos Passos

### 1. Adicionar Chave de API do Gemini

Edite o arquivo `.dev.vars` e adicione sua chave do Google AI Studio:

```bash
GOOGLE_AI_STUDIO_API_KEY=AIza...sua-chave-aqui
```

### 2. Iniciar o Ambiente de Desenvolvimento

```bash
# Terminal 1: Iniciar o servidor de desenvolvimento
bun run dev
```

O servidor irá iniciar em: http://localhost:5173

### 3. Acessar a Aplicação

- Frontend: http://localhost:5173
- Acesse com o email configurado em `ALLOWED_EMAIL`

### 4. Comandos Úteis

```bash
# Desenvolvimento
bun run dev                    # Inicia servidor de desenvolvimento
bun run build                  # Build de produção
bun run preview                # Preview da build

# TypeScript
bun run typecheck              # Verifica tipos
bun run lint                   # Linter

# Banco de Dados
bun run db:migrate:local       # Migra banco local
bun run db:studio              # Drizzle Studio (interface visual)
bun run db:generate            # Gera novas migrações

# Testes
bun run test                   # Executa testes
bun run test:watch             # Testes em modo watch
bun run test:coverage          # Cobertura de testes

# Deploy
bun run deploy                 # Deploy para Cloudflare
```

### 5. Desenvolvimento Local

O projeto usa:
- **Vite** para desenvolvimento frontend com HMR
- **Cloudflare Workers** para backend
- **D1 Local** para banco de dados SQLite
- **WebSocket** para comunicação em tempo real

### 6. Estrutura de Agentes AI

Os agentes estão em `/worker/agents/`:
- `SimpleCodeGeneratorAgent` - Durable Object principal
- `PhaseGeneration` - Gera fases de desenvolvimento
- `PhaseImplementation` - Implementa código
- `UserConversationProcessor` - Processa conversas
- `codeDebugger.ts` - Debugger com Gemini 2.5 Pro

### 7. Modificar Comportamento de Agentes

Para alterar prompts ou comportamento:
```typescript
// Configuração de modelos LLM
worker/agents/inferutils/config.ts

// Prompt de conversação
worker/agents/operations/UserConversationProcessor.ts (linha 50)

// Adicionar nova ferramenta LLM
worker/agents/tools/toolkit/minha-ferramenta.ts
worker/agents/tools/customTools.ts
```

### 8. API e Endpoints

Adicionar novo endpoint:
1. Definir tipos em `src/api-types.ts`
2. Adicionar em `src/lib/api-client.ts`
3. Criar service em `worker/database/services/`
4. Criar controller em `worker/api/controllers/`
5. Adicionar rota em `worker/api/routes/`

### 9. WebSocket

Mensagens WebSocket:
- Tipos: `worker/api/websocketTypes.ts`
- Handler backend: `worker/agents/core/websocket.ts`
- Handler frontend: `src/routes/chat/utils/handle-websocket-message.ts`

## Resolução de Problemas

### Erro: "GOOGLE_AI_STUDIO_API_KEY is required"
Adicione sua chave no arquivo `.dev.vars`

### Erro: "Database not found"
Execute: `bun run db:migrate:local`

### Erro de TypeScript
Execute: `bun run typecheck`

### Limpar cache
```bash
rm -rf .wrangler node_modules/.vite
bun install
```

## Recursos

- **Documentação:** `/docs` e `CLAUDE.md`
- **README:** `README.md`
- **Changelog:** `CHANGELOG.md`
- **Exemplos de Prompts:** `samplePrompts.md`

## Arquitetura Cloudflare

O projeto utiliza:
- **Workers** - Runtime serverless
- **Durable Objects** - Estado persistente por sessão
- **D1** - Banco de dados SQLite distribuído
- **R2** - Object storage para templates
- **KV** - Key-value store para sessões
- **Containers** - Sandboxes para apps gerados
- **AI Gateway** - Proxy para múltiplos LLMs

## Segurança

- JWT para autenticação
- Encryption key para secrets
- Rate limiting configurado
- ALLOWED_EMAIL restringe acesso

## Suporte

- Issues: https://github.com/cloudflare/vibesdk/issues
- Discord: https://discord.gg/cloudflaredev
- Docs: https://developers.cloudflare.com

---

Configuração completa! Execute `bun run dev` para começar.
