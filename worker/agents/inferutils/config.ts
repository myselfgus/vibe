import { AgentConfig, AIModels } from "./config.types";

export const AGENT_CONFIG: AgentConfig = {
    templateSelection: {
        name: AIModels.CLAUDE_HAIKU_4_5,
        max_tokens: 2000,
        fallbackModel: AIModels.GROK_CODE_FAST_1,
        temperature: 0.6,
    },
    blueprint: {
        name: AIModels.CLAUDE_SONNET_4_5,
        reasoning_effort: 'medium',
        max_tokens: 64000,
        fallbackModel: AIModels.GROK_4_1_FAST_REASONING,
        temperature: 0.7,
    },
    projectSetup: {
        name: AIModels.CLAUDE_SONNET_4_5,
        reasoning_effort: 'low',
        max_tokens: 10000,
        temperature: 0.2,
        fallbackModel: AIModels.GROK_4_1_FAST_REASONING,
    },
    phaseGeneration: {
        name: AIModels.CLAUDE_SONNET_4_5,
        reasoning_effort: 'low',
        max_tokens: 32000,
        temperature: 0.2,
        fallbackModel: AIModels.GROK_4_1_FAST_REASONING,
    },
    firstPhaseImplementation: {
        name: AIModels.CLAUDE_SONNET_4_5,
        reasoning_effort: 'low',
        max_tokens: 64000,
        temperature: 0.2,
        fallbackModel: AIModels.GROK_4_1_FAST_REASONING,
    },
    phaseImplementation: {
        name: AIModels.CLAUDE_SONNET_4_5,
        reasoning_effort: 'low',
        max_tokens: 64000,
        temperature: 0.2,
        fallbackModel: AIModels.GROK_4_1_FAST_REASONING,
    },
    realtimeCodeFixer: {
        name: AIModels.DISABLED,
        reasoning_effort: 'low',
        max_tokens: 32000,
        temperature: 1,
        fallbackModel: AIModels.CLAUDE_HAIKU_4_5,
    },
    fastCodeFixer: {
        name: AIModels.DISABLED,
        reasoning_effort: undefined,
        max_tokens: 64000,
        temperature: 0.0,
        fallbackModel: AIModels.CLAUDE_SONNET_4_5,
    },
    conversationalResponse: {
        name: AIModels.CLAUDE_HAIKU_4_5,
        reasoning_effort: 'low',
        max_tokens: 4000,
        temperature: 0,
        fallbackModel: AIModels.GROK_CODE_FAST_1,
    },
    deepDebugger: {
        name: AIModels.CLAUDE_SONNET_4_5,
        reasoning_effort: 'high',
        max_tokens: 8000,
        temperature: 0.5,
        fallbackModel: AIModels.GROK_4_1_FAST_REASONING,
    },
    codeReview: {
        name: AIModels.CLAUDE_SONNET_4_5,
        reasoning_effort: 'medium',
        max_tokens: 32000,
        temperature: 0.1,
        fallbackModel: AIModels.GROK_4_1_FAST_REASONING,
    },
    fileRegeneration: {
        name: AIModels.GROK_CODE_FAST_1,
        reasoning_effort: 'low',
        max_tokens: 32000,
        temperature: 0,
        fallbackModel: AIModels.CLAUDE_SONNET_4_5,
    },
    screenshotAnalysis: {
        name: AIModels.CLAUDE_SONNET_4_5,
        reasoning_effort: 'medium',
        max_tokens: 8000,
        temperature: 0.1,
        fallbackModel: AIModels.GROK_4_1_FAST_REASONING,
    },
};


// Model validation utilities
export const ALL_AI_MODELS: readonly AIModels[] = Object.values(AIModels);
export type AIModelType = AIModels;

// Create tuple type for Zod enum validation
export const AI_MODELS_TUPLE = Object.values(AIModels) as [AIModels, ...AIModels[]];

export function isValidAIModel(model: string): model is AIModels {
    return Object.values(AIModels).includes(model as AIModels);
}

export function getValidAIModelsArray(): readonly AIModels[] {
    return ALL_AI_MODELS;
}
