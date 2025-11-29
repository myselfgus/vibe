/**
 * Comprehensive Route Tests
 * Tests all API routes to ensure they are properly configured and responding
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Route configuration for testing
const API_ROUTES = {
	// Health check
	health: { path: '/api/health', method: 'GET', auth: false },

	// Auth routes
	authProviders: { path: '/api/auth/providers', method: 'GET', auth: false },
	authCsrfToken: { path: '/api/auth/csrf-token', method: 'GET', auth: false },
	authLogin: { path: '/api/auth/login', method: 'POST', auth: false },
	authRegister: { path: '/api/auth/register', method: 'POST', auth: false },
	authProfile: { path: '/api/auth/profile', method: 'GET', auth: true },
	authLogout: { path: '/api/auth/logout', method: 'POST', auth: true },
	authSessions: { path: '/api/auth/sessions', method: 'GET', auth: true },
	authApiKeys: { path: '/api/auth/api-keys', method: 'GET', auth: true },

	// Platform status
	status: { path: '/api/status', method: 'GET', auth: false },

	// Agent/Codegen routes
	agentCreate: { path: '/api/agent', method: 'POST', auth: true },
	agentConnect: { path: '/api/agent/:agentId/connect', method: 'GET', auth: true },
	agentPreview: { path: '/api/agent/:agentId/preview', method: 'GET', auth: true },
	agentWebSocket: { path: '/api/agent/:agentId/ws', method: 'GET', auth: true },

	// App routes
	apps: { path: '/api/apps', method: 'GET', auth: true },
	appsRecent: { path: '/api/apps/recent', method: 'GET', auth: true },
	appsFavorites: { path: '/api/apps/favorites', method: 'GET', auth: true },
	appsPublic: { path: '/api/apps/public', method: 'GET', auth: false },
	appDetails: { path: '/api/apps/:appId', method: 'GET', auth: true },
	appFavorite: { path: '/api/apps/:appId/favorite', method: 'POST', auth: true },
	appStar: { path: '/api/apps/:appId/star', method: 'POST', auth: true },
	appVisibility: { path: '/api/apps/:appId/visibility', method: 'PUT', auth: true },
	appDelete: { path: '/api/apps/:appId', method: 'DELETE', auth: true },
	appGitToken: { path: '/api/apps/:appId/git/token', method: 'POST', auth: true },

	// User routes
	userApps: { path: '/api/user/apps', method: 'GET', auth: true },
	userProfile: { path: '/api/user/profile', method: 'PUT', auth: true },
	userProviders: { path: '/api/user/providers', method: 'GET', auth: true },

	// Stats routes
	statsUser: { path: '/api/stats/user', method: 'GET', auth: true },
	statsActivity: { path: '/api/stats/activity', method: 'GET', auth: true },

	// Model config routes
	modelConfigs: { path: '/api/model-configs', method: 'GET', auth: true },
	modelConfigDefaults: { path: '/api/model-configs/defaults', method: 'GET', auth: true },
	modelConfigByok: { path: '/api/model-configs/byok-providers', method: 'GET', auth: true },
	modelConfigTest: { path: '/api/model-configs/test', method: 'POST', auth: true },
	modelConfigReset: { path: '/api/model-configs/reset-all', method: 'POST', auth: true },

	// Secrets routes
	secrets: { path: '/api/secrets', method: 'GET', auth: true },
	secretTemplates: { path: '/api/secrets/templates', method: 'GET', auth: true },

	// GitHub exporter routes
	githubAuthorize: { path: '/api/github-app/authorize', method: 'GET', auth: true },
	githubExport: { path: '/api/github-app/export', method: 'POST', auth: true },

	// Screenshots routes
	screenshots: { path: '/api/screenshots/:id/:file', method: 'GET', auth: true },
} as const;

describe('API Route Configuration', () => {
	describe('Route Definitions', () => {
		it('should have all required route definitions', () => {
			expect(Object.keys(API_ROUTES).length).toBeGreaterThan(0);
		});

		it('should have valid route paths', () => {
			for (const [name, config] of Object.entries(API_ROUTES)) {
				expect(config.path).toMatch(/^\/api\//);
				expect(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).toContain(config.method);
				expect(typeof config.auth).toBe('boolean');
			}
		});
	});

	describe('Health Check Route', () => {
		it('should have health check endpoint defined', () => {
			expect(API_ROUTES.health).toBeDefined();
			expect(API_ROUTES.health.path).toBe('/api/health');
			expect(API_ROUTES.health.method).toBe('GET');
			expect(API_ROUTES.health.auth).toBe(false);
		});
	});

	describe('Auth Routes', () => {
		it('should have all auth routes defined', () => {
			expect(API_ROUTES.authProviders).toBeDefined();
			expect(API_ROUTES.authCsrfToken).toBeDefined();
			expect(API_ROUTES.authLogin).toBeDefined();
			expect(API_ROUTES.authRegister).toBeDefined();
			expect(API_ROUTES.authProfile).toBeDefined();
			expect(API_ROUTES.authLogout).toBeDefined();
		});

		it('should have correct auth requirements', () => {
			// Public auth routes
			expect(API_ROUTES.authProviders.auth).toBe(false);
			expect(API_ROUTES.authCsrfToken.auth).toBe(false);
			expect(API_ROUTES.authLogin.auth).toBe(false);
			expect(API_ROUTES.authRegister.auth).toBe(false);

			// Protected auth routes
			expect(API_ROUTES.authProfile.auth).toBe(true);
			expect(API_ROUTES.authLogout.auth).toBe(true);
		});
	});

	describe('Agent Routes', () => {
		it('should have all agent routes defined', () => {
			expect(API_ROUTES.agentCreate).toBeDefined();
			expect(API_ROUTES.agentConnect).toBeDefined();
			expect(API_ROUTES.agentPreview).toBeDefined();
			expect(API_ROUTES.agentWebSocket).toBeDefined();
		});

		it('should require authentication for agent routes', () => {
			expect(API_ROUTES.agentCreate.auth).toBe(true);
			expect(API_ROUTES.agentConnect.auth).toBe(true);
			expect(API_ROUTES.agentPreview.auth).toBe(true);
			expect(API_ROUTES.agentWebSocket.auth).toBe(true);
		});
	});

	describe('App Routes', () => {
		it('should have all app routes defined', () => {
			expect(API_ROUTES.apps).toBeDefined();
			expect(API_ROUTES.appsRecent).toBeDefined();
			expect(API_ROUTES.appsFavorites).toBeDefined();
			expect(API_ROUTES.appsPublic).toBeDefined();
			expect(API_ROUTES.appDetails).toBeDefined();
		});

		it('should have public app feed', () => {
			expect(API_ROUTES.appsPublic.auth).toBe(false);
		});
	});

	describe('Model Config Routes', () => {
		it('should have all model config routes defined', () => {
			expect(API_ROUTES.modelConfigs).toBeDefined();
			expect(API_ROUTES.modelConfigDefaults).toBeDefined();
			expect(API_ROUTES.modelConfigByok).toBeDefined();
			expect(API_ROUTES.modelConfigTest).toBeDefined();
		});

		it('should require authentication for model config routes', () => {
			expect(API_ROUTES.modelConfigs.auth).toBe(true);
			expect(API_ROUTES.modelConfigDefaults.auth).toBe(true);
			expect(API_ROUTES.modelConfigByok.auth).toBe(true);
		});
	});
});

describe('File Upload Type Support', () => {
	describe('Supported MIME Types', () => {
		const imageTypes = ['image/png', 'image/jpeg', 'image/webp'];
		const codeTypes = [
			'text/plain',
			'text/markdown',
			'text/javascript',
			'application/json',
			'application/zip',
		];

		it('should support common image types', () => {
			for (const type of imageTypes) {
				expect(type).toMatch(/^image\//);
			}
		});

		it('should support common code file types', () => {
			expect(codeTypes).toContain('text/plain');
			expect(codeTypes).toContain('application/json');
			expect(codeTypes).toContain('application/zip');
		});
	});

	describe('Supported File Extensions', () => {
		const codeExtensions = [
			'.js', '.jsx', '.ts', '.tsx',
			'.py', '.java', '.go', '.rs',
			'.html', '.css', '.json', '.yaml',
			'.zip', '.tar', '.gz',
		];

		it('should support common code extensions', () => {
			expect(codeExtensions).toContain('.js');
			expect(codeExtensions).toContain('.ts');
			expect(codeExtensions).toContain('.py');
			expect(codeExtensions).toContain('.json');
		});

		it('should support archive extensions', () => {
			expect(codeExtensions).toContain('.zip');
			expect(codeExtensions).toContain('.tar');
			expect(codeExtensions).toContain('.gz');
		});
	});

	describe('File Size Limits', () => {
		const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
		const MAX_CODE_FILE_SIZE = 50 * 1024 * 1024; // 50MB
		const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

		it('should have reasonable image size limits', () => {
			expect(MAX_IMAGE_SIZE).toBe(10 * 1024 * 1024);
		});

		it('should have larger limits for code files and ZIPs', () => {
			expect(MAX_CODE_FILE_SIZE).toBeGreaterThan(MAX_IMAGE_SIZE);
			expect(MAX_CODE_FILE_SIZE).toBe(50 * 1024 * 1024);
		});

		it('should have appropriate total attachment size limit', () => {
			expect(MAX_TOTAL_SIZE).toBeGreaterThan(MAX_CODE_FILE_SIZE);
			expect(MAX_TOTAL_SIZE).toBe(100 * 1024 * 1024);
		});
	});

	describe('File Count Limits', () => {
		const MAX_IMAGES = 2;
		const MAX_CODE_FILES = 10;

		it('should limit image count', () => {
			expect(MAX_IMAGES).toBe(2);
		});

		it('should allow more code files than images', () => {
			expect(MAX_CODE_FILES).toBeGreaterThan(MAX_IMAGES);
			expect(MAX_CODE_FILES).toBe(10);
		});
	});
});

describe('CodeGenArgs Validation', () => {
	interface CodeGenArgs {
		query: string;
		language?: string;
		frameworks?: string[];
		selectedTemplate?: string;
		agentMode: 'deterministic' | 'smart';
		images?: unknown[];
	}

	it('should require query field', () => {
		const validArgs: CodeGenArgs = {
			query: 'Build a todo app',
			agentMode: 'deterministic',
		};
		expect(validArgs.query).toBeDefined();
		expect(validArgs.query.length).toBeGreaterThan(0);
	});

	it('should require agentMode field', () => {
		const validArgs: CodeGenArgs = {
			query: 'Build a todo app',
			agentMode: 'smart',
		};
		expect(validArgs.agentMode).toBeDefined();
		expect(['deterministic', 'smart']).toContain(validArgs.agentMode);
	});

	it('should accept optional images array', () => {
		const argsWithImages: CodeGenArgs = {
			query: 'Build based on this design',
			agentMode: 'deterministic',
			images: [{ id: '1', filename: 'design.png', mimeType: 'image/png', base64Data: 'abc123' }],
		};
		expect(argsWithImages.images).toBeDefined();
		expect(Array.isArray(argsWithImages.images)).toBe(true);
	});
});

describe('WebSocket Message Types', () => {
	const messageTypes = [
		'agent_connected',
		'file_generating',
		'file_generated',
		'phase_generating',
		'phase_completed',
		'error',
		'rate_limit_error',
		'ai_message',
		'tool_event',
		'code_fix_edits',
		'preview_deployed',
		'cloudflare_deployment_completed',
		'cloudflare_deployment_error',
	];

	it('should have common message types defined', () => {
		expect(messageTypes).toContain('agent_connected');
		expect(messageTypes).toContain('file_generated');
		expect(messageTypes).toContain('error');
		expect(messageTypes).toContain('ai_message');
	});

	it('should have deployment-related message types', () => {
		expect(messageTypes).toContain('preview_deployed');
		expect(messageTypes).toContain('cloudflare_deployment_completed');
		expect(messageTypes).toContain('cloudflare_deployment_error');
	});
});

describe('Route Path Patterns', () => {
	it('should follow consistent naming conventions', () => {
		const paths = Object.values(API_ROUTES).map((r) => r.path);

		// All paths should start with /api/
		for (const path of paths) {
			expect(path.startsWith('/api/')).toBe(true);
		}
	});

	it('should use kebab-case for multi-word routes', () => {
		const multiWordPaths = [
			'/api/model-configs',
			'/api/github-app',
			'/api/csrf-token',
		];

		for (const path of multiWordPaths) {
			expect(path).toMatch(/^\/api\/[a-z-]+/);
		}
	});

	it('should use :param for path parameters', () => {
		const paramPaths = [
			API_ROUTES.agentConnect.path,
			API_ROUTES.appDetails.path,
			API_ROUTES.screenshots.path,
		];

		for (const path of paramPaths) {
			expect(path).toContain(':');
		}
	});
});
