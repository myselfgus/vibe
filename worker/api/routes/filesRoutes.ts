import { Hono } from 'hono';
import type { AppEnv } from '../../types/appenv';
import { FilesController } from '../controllers/files/controller';

export function setupFilesRoutes(app: Hono<AppEnv>): void {
    // Upload a file
    app.post('/api/files/upload', async (c) => {
        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
        }
        return FilesController.uploadFile(c.req.raw, c.env, user);
    });

    // List user's files
    app.get('/api/files', async (c) => {
        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
        }
        return FilesController.listFiles(c.req.raw, c.env, user);
    });

    // Get/download a file
    app.get('/api/files/:fileId', async (c) => {
        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
        }
        const fileId = c.req.param('fileId');
        return FilesController.getFile(c.req.raw, c.env, user, fileId);
    });

    // Delete a file
    app.delete('/api/files/:fileId', async (c) => {
        const user = c.get('user');
        if (!user) {
            return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
        }
        const fileId = c.req.param('fileId');
        return FilesController.deleteFile(c.req.raw, c.env, user, fileId);
    });
}
