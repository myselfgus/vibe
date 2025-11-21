# AI Providers Configuration Guide

This document explains where AI providers are configured in the platform and how to access them.

## Platform Providers (Not BYOK)

Platform providers are AI services configured at the infrastructure level with API keys managed by platform administrators. Users can access these providers without needing their own API keys.

### Configuration Files

All platform AI provider configurations are centralized in the following locations:

#### 1. Environment Variables (`worker-configuration.d.ts`)

Location: `/home/user/vibe/worker-configuration.d.ts`

```typescript
interface Env {
    // AI Provider API Keys
    ANTHROPIC_API_KEY: string;
    OPENAI_API_KEY: string;
    GOOGLE_AI_STUDIO_API_KEY: string;
    XAI_API_KEY: string;
    CEREBRAS_API_KEY: string;
    GROQ_API_KEY: string;
    OPENROUTER_API_KEY: string;

    // AI Gateway Configuration
    CLOUDFLARE_AI_GATEWAY: "voither";
    CLOUDFLARE_AI_GATEWAY_URL: string;
    CLOUDFLARE_AI_GATEWAY_TOKEN: string;
}
```

**What to set:**
- `ANTHROPIC_API_KEY`: Your Anthropic API key (format: `sk-ant-...`)
- `GOOGLE_AI_STUDIO_API_KEY`: Your Google AI Studio API key (format: `AI...`)
- `XAI_API_KEY`: Your xAI API key (format: `xai-...`)
- `CLOUDFLARE_AI_GATEWAY_TOKEN`: Token for AI Gateway wholesaling (optional)

#### 2. Deployment Configuration (`wrangler.jsonc`)

Location: `/home/user/vibe/wrangler.jsonc`

```jsonc
{
    "vars": {
        "CLOUDFLARE_AI_GATEWAY": "voither",
        "DISPATCH_NAMESPACE": "meta-mcp"
    }
}
```

**Important:** The `CLOUDFLARE_AI_GATEWAY` is set to `"voither"` - this is the AI Gateway name that routes all AI requests.

#### 3. Model Definitions (`worker/agents/inferutils/config.types.ts`)

Location: `/home/user/vibe/worker/agents/inferutils/config.types.ts`

```typescript
export enum AIModels {
    // Google AI Studio (Gemini)
    GEMINI_2_5_PRO = 'google-ai-studio/gemini-2.5-pro',
    GEMINI_2_5_FLASH = 'google-ai-studio/gemini-2.5-flash',

    // Anthropic (Claude)
    CLAUDE_3_5_SONNET_LATEST = 'anthropic/claude-3-5-sonnet-latest',
    CLAUDE_3_7_SONNET_20250219 = 'anthropic/claude-3-7-sonnet-20250219',
    CLAUDE_OPUS_4_1 = 'anthropic/claude-opus-4.1',
    CLAUDE_SONNET_4_5 = 'anthropic/claude-sonnet-4-5-20250929',
    CLAUDE_HAIKU_4_5 = 'anthropic/claude-haiku-4-5-20251001',

    // xAI (Grok)
    XAI_GROK_2_LATEST = 'xai/grok-2-latest',
    XAI_GROK_2_1212 = 'xai/grok-2-1212',
    XAI_GROK_BETA = 'xai/grok-beta',
    XAI_GROK_VISION_BETA = 'xai/grok-vision-beta',

    // OpenAI
    OPENAI_O3 = 'openai/o3',
    OPENAI_5 = 'openai/gpt-5',

    // Cerebras
    CEREBRAS_GPT_OSS = 'cerebras/gpt-oss-120b',
}
```

#### 4. Provider Discovery (`worker/api/controllers/modelConfig/byokHelper.ts`)

Location: `/home/user/vibe/worker/api/controllers/modelConfig/byokHelper.ts`

```typescript
export function getPlatformEnabledProviders(env: Env): string[] {
    const providerList = [
        'anthropic',
        'openai',
        'google-ai-studio',
        'cerebras',
        'groq',
        'xai',
    ];

    // Returns only providers that have valid API keys configured
}
```

This function automatically detects which providers are available based on environment variables.

#### 5. API Key Templates (`worker/types/secretsTemplates.ts`)

Location: `/home/user/vibe/worker/types/secretsTemplates.ts`

Defines metadata for each provider's API keys:

```typescript
{
    id: 'ANTHROPIC_API_KEY',
    displayName: 'Anthropic API Key',
    provider: 'anthropic',
    description: 'Anthropic Claude API key',
    placeholder: 'sk-ant-...',
    validation: '^sk-ant-[a-zA-Z0-9_-]{48,}$',
    category: 'ai',
}
```

## How to Configure Platform Providers

### Step 1: Obtain API Keys

1. **Anthropic (Claude)**
   - Go to: https://console.anthropic.com/
   - Navigate to: API Keys → Create Key
   - Copy your key (format: `sk-ant-...`)

2. **Google AI Studio (Gemini)**
   - Go to: https://aistudio.google.com/
   - Navigate to: Get API key
   - Copy your key (format: `AI...`)

3. **xAI (Grok)**
   - Go to: https://console.x.ai/
   - Navigate to: API Keys → Create new key
   - Copy your key (format: `xai-...`)

### Step 2: Set Environment Variables

Create or update `.dev.vars` (local) or `.prod.vars` (production):

```bash
# AI Providers
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
GOOGLE_AI_STUDIO_API_KEY=AIyour-actual-key-here
XAI_API_KEY=xai-your-actual-key-here

# AI Gateway (optional - for wholesaling)
CLOUDFLARE_AI_GATEWAY_TOKEN=your-gateway-token
CLOUDFLARE_AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/your-account/voither
```

### Step 3: Deploy Configuration

For production deployment, set secrets in Cloudflare:

```bash
# Using Wrangler CLI
echo "sk-ant-your-key" | wrangler secret put ANTHROPIC_API_KEY
echo "AIyour-key" | wrangler secret put GOOGLE_AI_STUDIO_API_KEY
echo "xai-your-key" | wrangler secret put XAI_API_KEY
```

## How Platform Providers are Accessed

### Request Flow

1. **User makes a request** via the frontend (e.g., starts a chat)
2. **Agent determines which model to use** based on configuration in `worker/agents/inferutils/config.ts`
3. **Core inference engine** (`worker/agents/inferutils/core.ts`) builds request:
   - Extracts provider from model name (e.g., `anthropic/claude-3-5-sonnet-latest` → `anthropic`)
   - Calls `getApiKey(provider, env, userId)` to retrieve the platform API key
   - Calls `buildGatewayUrl(env)` to construct the AI Gateway URL
4. **Request is routed through Cloudflare AI Gateway** (`voither`)
5. **AI Gateway forwards to provider** (Anthropic, Google, xAI, etc.)
6. **Response streams back** through Gateway → Worker → Frontend

### Code Flow Example

```typescript
// worker/agents/inferutils/core.ts

async function getApiKey(provider: string, env: Env, userId: string): Promise<string> {
    // Convert provider name to env var format
    // 'anthropic' → 'ANTHROPIC_API_KEY'
    const providerKeyString = provider.toUpperCase().replaceAll('-', '_');
    const envKey = `${providerKeyString}_API_KEY` as keyof Env;
    let apiKey = env[envKey] as string;

    // Fallback to AI Gateway token if no direct key
    if (!isValidApiKey(apiKey)) {
        apiKey = env.CLOUDFLARE_AI_GATEWAY_TOKEN;
    }

    return apiKey;
}

async function getConfigurationForModel(model: AIModels, env: Env, userId: string) {
    // Build Gateway URL: https://gateway.ai.cloudflare.com/v1/account/voither/compat
    const baseURL = await buildGatewayUrl(env);

    // Extract provider: 'anthropic/claude-3-5-sonnet-latest' → 'anthropic'
    const provider = model.split('/')[0];

    // Get platform API key
    const apiKey = await getApiKey(provider, env, userId);

    return { baseURL, apiKey };
}
```

## Available Models by Provider

### Anthropic (Claude)
- `claude-3-5-sonnet-latest` - Latest Claude 3.5 Sonnet
- `claude-3-7-sonnet-20250219` - Claude 3.7 Sonnet (specific version)
- `claude-opus-4.1` - Claude Opus 4.1
- `claude-sonnet-4-5-20250929` - Claude Sonnet 4.5 (September 2025)
- `claude-haiku-4-5-20251001` - Claude Haiku 4.5 (October 2025)

### Google AI Studio (Gemini)
- `gemini-2.5-pro` - Pro model with advanced reasoning
- `gemini-2.5-flash` - Fast model for quick responses
- `gemini-2.5-flash-lite` - Lightweight version
- Plus 8+ other Gemini variants

### xAI (Grok)
- `grok-2-latest` - Latest Grok 2 model
- `grok-2-1212` - Specific Grok 2 version
- `grok-beta` - Beta version
- `grok-vision-beta` - Vision-enabled beta

### OpenAI
- `o3`, `o4-mini`, `gpt-5`, `gpt-5-mini`, etc.

### Cerebras
- `gpt-oss-120b` - 120B parameter open model
- `qwen-3-coder-480b` - 480B coding model

## Cloudflare AI Gateway Configuration

### Gateway Name: `voither`

All AI requests are routed through the Cloudflare AI Gateway named `"voither"`.

**Configuration:**
```typescript
// wrangler.jsonc
"vars": {
    "CLOUDFLARE_AI_GATEWAY": "voither"
}
```

**Gateway URL Construction:**
```typescript
export async function buildGatewayUrl(env: Env): Promise<string> {
    // Option 1: Direct URL (if CLOUDFLARE_AI_GATEWAY_URL is set)
    if (env.CLOUDFLARE_AI_GATEWAY_URL) {
        return env.CLOUDFLARE_AI_GATEWAY_URL;
    }

    // Option 2: Use AI binding (default)
    const gateway = env.AI.gateway('voither');
    return `${await gateway.getUrl()}compat`; // OpenAI-compatible endpoint
}
```

**Benefits:**
- Centralized request logging and analytics
- Rate limiting and caching
- Unified API interface (OpenAI-compatible)
- Automatic failover and retry logic
- Cost tracking per provider

## Wholesaling (Advanced)

If you set `CLOUDFLARE_AI_GATEWAY_TOKEN`, the system enables "wholesaling" mode:

```typescript
// Add token as separate header for AI Gateway auth
const defaultHeaders = {
    'cf-aig-authorization': `Bearer ${env.CLOUDFLARE_AI_GATEWAY_TOKEN}`
};
```

This allows using user-provided API keys while still routing through your AI Gateway for analytics.

## Troubleshooting

### Provider Not Available

**Symptom:** Provider doesn't appear in model selection dropdown

**Check:**
1. API key is set in environment variables
2. API key passes validation (length >= 10, not "none" or "default")
3. Provider is listed in `byokHelper.ts` → `providerList`
4. Model definitions exist in `config.types.ts` for that provider

### "Namespace does not exist" Error

**Symptom:** Deploy fails with "dispatch namespace does not exist"

**Solution:** Verify `DISPATCH_NAMESPACE` in `wrangler.jsonc` matches your Cloudflare account:
```jsonc
"vars": {
    "DISPATCH_NAMESPACE": "meta-mcp"  // Must match your namespace
}
```

### Gateway Routing Issues

**Symptom:** Requests fail with 404 or gateway errors

**Check:**
1. `CLOUDFLARE_AI_GATEWAY` is set to correct gateway name
2. Gateway exists in your Cloudflare account
3. Gateway has proper provider configurations
4. Account has AI Gateway enabled

## Summary

**To enable a platform provider:**
1. Add API key to environment variables (`PROVIDER_NAME_API_KEY`)
2. Add provider to `providerList` in `byokHelper.ts`
3. Add model definitions to `AIModels` enum in `config.types.ts`
4. Add API key template to `secretsTemplates.ts`
5. Deploy and verify provider appears in platform

**To use a provider:**
- Platform automatically uses configured API keys
- No user configuration needed (not BYOK)
- Requests route through Cloudflare AI Gateway (`voither`)
- All providers use OpenAI-compatible interface

**Current Platform Providers:**
- ✅ Anthropic (Claude)
- ✅ Google AI Studio (Gemini)
- ✅ xAI (Grok)
- ✅ OpenAI
- ✅ Cerebras
- ✅ Groq
