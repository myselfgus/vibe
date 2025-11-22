/**
 * Config Types - Pure type definitions only
 * Extracted from config.ts to avoid importing logic code into frontend
 */

import { ReasoningEffort } from "openai/resources.mjs";
// import { LLMCallsRateLimitConfig } from "../../services/rate-limit/config";

export enum AIModels {
	DISABLED = 'disabled',

	// Gemini models (google-ai-studio provider)
	GEMINI_3_PRO = 'google-ai-studio/gemini-3-pro',
	GEMINI_2_5_PRO = 'google-ai-studio/gemini-2.5-pro',

	// Claude models (anthropic provider)
	CLAUDE_SONNET_4_5 = 'anthropic/claude-sonnet-4-5-20250929',
	CLAUDE_HAIKU_4_5 = 'anthropic/claude-haiku-4-5-20251001',

	// Grok models (grok provider - uses XAI_API_KEY)
	GROK_4_1_FAST_REASONING = 'grok/grok-4-1-fast-reasoning',
	GROK_CODE_FAST_1 = 'grok/grok-code-fast-1',
}

export interface ModelConfig {
    name: AIModels | string;
    reasoning_effort?: ReasoningEffort;
    max_tokens?: number;
    temperature?: number;
    fallbackModel?: AIModels | string;
}

export interface AgentConfig {
    templateSelection: ModelConfig;
    blueprint: ModelConfig;
    projectSetup: ModelConfig;
    phaseGeneration: ModelConfig;
    phaseImplementation: ModelConfig;
    firstPhaseImplementation: ModelConfig;
    codeReview: ModelConfig;
    fileRegeneration: ModelConfig;
    screenshotAnalysis: ModelConfig;
    realtimeCodeFixer: ModelConfig;
    fastCodeFixer: ModelConfig;
    conversationalResponse: ModelConfig;
    deepDebugger: ModelConfig;
}

// Provider and reasoning effort types for validation
export type ProviderOverrideType = 'cloudflare' | 'direct';
export type ReasoningEffortType = 'low' | 'medium' | 'high';

export type AgentActionKey = keyof AgentConfig;

export type InferenceMetadata = {
    agentId: string;
    userId: string;
    // llmRateLimits: LLMCallsRateLimitConfig;
}

export interface InferenceContext extends InferenceMetadata {
    userModelConfigs?: Record<AgentActionKey, ModelConfig>;
    enableRealtimeCodeFix: boolean;
    enableFastSmartCodeFix: boolean;
    abortSignal?: AbortSignal;
}
