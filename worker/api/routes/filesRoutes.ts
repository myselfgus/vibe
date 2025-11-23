/**
 * Files Routes
 * API routes for user file storage management
 */

import { Hono } from 'hono';
import type { AppEnv } from '../../types/appenv';
import { FilesController } from '../controllers/files/controller';
import { AuthConfig, setAuthLevel, enforceAuthRequirement } from '../../middleware/auth/routeAuth';

export function setupFilesRoutes(app: Hono<AppEnv>): void {
    // Create a sub-router for files routes
    const filesRouter = new Hono<AppEnv>();

    // Upload a file
    filesRouter.post('/upload', setAuthLevel(AuthConfig.authenticated), async (c) => {
        const authResult = await enforceAuthRequirement(c);
        if (authResult) return authResult;

        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
        }
        return FilesController.uploadFile(c.req.raw, c.env, user);
    });

    // List user's files
    filesRouter.get('/', setAuthLevel(AuthConfig.authenticated), async (c) => {
        const authResult = await enforceAuthRequirement(c);
        if (authResult) return authResult;

        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
        }
        return FilesController.listFiles(c.req.raw, c.env, user);
    });

    // Get/download a file
    filesRouter.get('/:fileId', setAuthLevel(AuthConfig.authenticated), async (c) => {
        const authResult = await enforceAuthRequirement(c);
        if (authResult) return authResult;

        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
        }
        const fileId = c.req.param('fileId');
        return FilesController.getFile(c.req.raw, c.env, user, fileId);
    });

    // Delete a file
    filesRouter.delete('/:fileId', setAuthLevel(AuthConfig.authenticated), async (c) => {
        const authResult = await enforceAuthRequirement(c);
        if (authResult) return authResult;

        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
        }
        const fileId = c.req.param('fileId');
        return FilesController.deleteFile(c.req.raw, c.env, user, fileId);
    });

    // Mount the router under /api/files
    app.route('/api/files', filesRouter);
}
