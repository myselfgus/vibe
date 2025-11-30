
import { SmartCodeGeneratorAgent } from './core/smartGeneratorAgent';
import { getAgentByName } from 'agents';
import { CodeGenState } from './core/state';
import { generateId } from '../utils/idGenerator';
import { StructuredLogger } from '../logger';
import { InferenceContext } from './inferutils/config.types';
import { SandboxSdkClient } from '../services/sandbox/sandboxSdkClient';
import { selectTemplate } from './planning/templateSelector';
import { TemplateDetails } from '../services/sandbox/sandboxTypes';
import { TemplateSelection } from './schemas';
import type { ImageAttachment } from '../types/image-attachment';
import { BaseSandboxService } from 'worker/services/sandbox/BaseSandboxService';

export async function getAgentStub(env: Env, agentId: string) : Promise<DurableObjectStub<SmartCodeGeneratorAgent>> {
    return getAgentByName<Env, SmartCodeGeneratorAgent>(env.CodeGenObject, agentId);
}

export async function getAgentStubLightweight(env: Env, agentId: string) : Promise<DurableObjectStub<SmartCodeGeneratorAgent>> {
    return getAgentByName<Env, SmartCodeGeneratorAgent>(env.CodeGenObject, agentId, {
        // props: { readOnlyMode: true }
    });
}

export async function getAgentState(env: Env, agentId: string) : Promise<CodeGenState> {
    const agentInstance = await getAgentStub(env, agentId);
    return await agentInstance.getFullState() as CodeGenState;
}

export async function cloneAgent(env: Env, agentId: string) : Promise<{newAgentId: string, newAgent: DurableObjectStub<SmartCodeGeneratorAgent>}> {
    const agentInstance = await getAgentStub(env, agentId);
    if (!agentInstance || !await agentInstance.isInitialized()) {
        throw new Error(`Agent ${agentId} not found`);
    }
    const newAgentId = generateId();

    const newAgent = await getAgentStub(env, newAgentId);
    const originalState = await agentInstance.getFullState() as CodeGenState;
    const newState = {
        ...originalState,
        sessionId: newAgentId,
        sandboxInstanceId: undefined,
        pendingUserInputs: [],
        currentDevState: 0,
        generationPromise: undefined,
        shouldBeGenerating: false,
        // latestScreenshot: undefined,
        clientReportedErrors: [],
    };

    await newAgent.setState(newState);
    return {newAgentId, newAgent};
}

export async function getTemplateForQuery(
    env: Env,
    inferenceContext: InferenceContext,
    query: string,
    images: ImageAttachment[] | undefined,
    logger: StructuredLogger,
) : Promise<{templateDetails: TemplateDetails, selection: TemplateSelection}> {
    // Fetch available templates
    let templatesResponse;
    try {
        templatesResponse = await SandboxSdkClient.listTemplates();
    } catch (error) {
        logger.error('Failed to call listTemplates', {
            error: error instanceof Error ? error.message : String(error)
        });
        throw new Error(`Template service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (!templatesResponse || !templatesResponse.success) {
        logger.error('Template list request failed', {
            error: templatesResponse?.error,
            hasResponse: !!templatesResponse
        });
        throw new Error(`Failed to fetch templates from template service: ${templatesResponse?.error || 'Unknown error'}`);
    }

    if (templatesResponse.templates.length === 0) {
        throw new Error('No templates available in the template catalog');
    }
        
    let analyzeQueryResponse;
    try {
        analyzeQueryResponse = await selectTemplate({
            env,
            inferenceContext,
            query,
            availableTemplates: templatesResponse.templates,
            images,
        });
    } catch (error) {
        logger.error('Template selection failed', {
            error: error instanceof Error ? error.message : String(error),
            query: query.substring(0, 100)
        });
        throw error; // Re-throw to preserve rate limit and security errors
    }

    logger.info('Selected template', { selectedTemplate: analyzeQueryResponse });

    if (!analyzeQueryResponse.selectedTemplateName) {
        logger.error('No suitable template found for code generation', {
            reasoning: analyzeQueryResponse.reasoning,
            availableTemplates: templatesResponse.templates.map(t => t.name)
        });
        throw new Error('No suitable template found for your request. Please try rephrasing your query.');
    }

    const selectedTemplate = templatesResponse.templates.find(template => template.name === analyzeQueryResponse.selectedTemplateName);
    if (!selectedTemplate) {
        logger.error('Selected template not found in available templates', {
            selectedName: analyzeQueryResponse.selectedTemplateName,
            availableTemplates: templatesResponse.templates.map(t => t.name)
        });
        throw new Error(`Selected template '${analyzeQueryResponse.selectedTemplateName}' not found in available templates`);
    }

    let templateDetailsResponse;
    try {
        templateDetailsResponse = await BaseSandboxService.getTemplateDetails(selectedTemplate.name);
    } catch (error) {
        logger.error('Failed to fetch template details', {
            templateName: selectedTemplate.name,
            error: error instanceof Error ? error.message : String(error)
        });
        throw new Error(`Template service error: Failed to fetch template details for '${selectedTemplate.name}'`);
    }

    if (!templateDetailsResponse.success || !templateDetailsResponse.templateDetails) {
        logger.error('Template details request failed', {
            templateName: selectedTemplate.name,
            error: templateDetailsResponse.error
        });
        throw new Error(`Failed to fetch template files: ${templateDetailsResponse.error || 'Unknown error'}`);
    }

    const templateDetails = templateDetailsResponse.templateDetails;
    return { templateDetails, selection: analyzeQueryResponse };
}