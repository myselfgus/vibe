import { BaseController } from '../baseController';
import { createLogger } from '../../../logger';
import type { AuthUser } from '../../../types/auth-types';
import { MAX_FILE_SIZE_BYTES, isSupportedFileType } from '../../../types/image-attachment';
import type { UserFile, FileListData, FileUploadData } from './types';

const logger = createLogger('FilesController');

export class FilesController extends BaseController {
    /**
     * Upload a file to R2
     */
    static async uploadFile(
        request: Request,
        env: Env,
        user: AuthUser
    ): Promise<Response> {
        try {
            const formData = await request.formData();
            const file = formData.get('file') as File | null;

            if (!file) {
                return this.createErrorResponse('No file provided', 400);
            }

            // Validate file type
            if (!isSupportedFileType(file.type)) {
                return this.createErrorResponse(`Unsupported file type: ${file.type}`, 400);
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE_BYTES) {
                return this.createErrorResponse(`File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`, 400);
            }

            const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const r2Key = `user-files/${user.id}/${fileId}/${encodeURIComponent(file.name)}`;

            // Upload to R2
            const arrayBuffer = await file.arrayBuffer();
            await env.USER_FILES_BUCKET.put(r2Key, arrayBuffer, {
                httpMetadata: { contentType: file.type },
                customMetadata: {
                    userId: user.id,
                    originalName: file.name,
                    uploadedAt: new Date().toISOString(),
                },
            });

            const userFile: UserFile = {
                id: fileId,
                name: file.name,
                mimeType: file.type,
                size: file.size,
                uploadedAt: new Date().toISOString(),
                r2Key,
            };

            logger.info('File uploaded successfully', { userId: user.id, fileId, fileName: file.name });
            return this.createSuccessResponse<FileUploadData>({ file: userFile });
        } catch (error) {
            logger.error('Error uploading file', { error, userId: user.id });
            return this.handleError(error, 'upload file');
        }
    }

    /**
     * List user's files from R2
     */
    static async listFiles(
        _request: Request,
        env: Env,
        user: AuthUser
    ): Promise<Response> {
        try {
            const prefix = `user-files/${user.id}/`;
            const listed = await env.USER_FILES_BUCKET.list({ prefix, limit: 100 });

            const files: UserFile[] = [];
            for (const object of listed.objects) {
                const metadata = object.customMetadata || {};
                const pathParts = object.key.split('/');
                const fileId = pathParts[2] || '';
                const fileName = decodeURIComponent(pathParts[3] || 'unknown');

                files.push({
                    id: fileId,
                    name: metadata.originalName || fileName,
                    mimeType: object.httpMetadata?.contentType || 'application/octet-stream',
                    size: object.size,
                    uploadedAt: metadata.uploadedAt || object.uploaded.toISOString(),
                    r2Key: object.key,
                });
            }

            // Sort by upload date descending
            files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

            return this.createSuccessResponse<FileListData>({
                files,
                totalCount: files.length,
            });
        } catch (error) {
            logger.error('Error listing files', { error, userId: user.id });
            return this.handleError(error, 'list files');
        }
    }

    /**
     * Delete a file from R2
     */
    static async deleteFile(
        _request: Request,
        env: Env,
        user: AuthUser,
        fileId: string
    ): Promise<Response> {
        try {
            const prefix = `user-files/${user.id}/${fileId}/`;
            const listed = await env.USER_FILES_BUCKET.list({ prefix, limit: 1 });

            if (listed.objects.length === 0) {
                return this.createErrorResponse('File not found', 404);
            }

            const r2Key = listed.objects[0].key;
            await env.USER_FILES_BUCKET.delete(r2Key);

            logger.info('File deleted successfully', { userId: user.id, fileId });
            return this.createSuccessResponse({ deleted: true });
        } catch (error) {
            logger.error('Error deleting file', { error, userId: user.id, fileId });
            return this.handleError(error, 'delete file');
        }
    }

    /**
     * Download/get a file from R2
     */
    static async getFile(
        _request: Request,
        env: Env,
        user: AuthUser,
        fileId: string
    ): Promise<Response> {
        try {
            const prefix = `user-files/${user.id}/${fileId}/`;
            const listed = await env.USER_FILES_BUCKET.list({ prefix, limit: 1 });

            if (listed.objects.length === 0) {
                return this.createErrorResponse('File not found', 404);
            }

            const r2Key = listed.objects[0].key;
            const object = await env.USER_FILES_BUCKET.get(r2Key);

            if (!object) {
                return this.createErrorResponse('File not found', 404);
            }

            const headers = new Headers();
            headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
            headers.set('Content-Length', object.size.toString());

            const fileName = object.customMetadata?.originalName || 'download';
            headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

            return new Response(object.body, { headers });
        } catch (error) {
            logger.error('Error getting file', { error, userId: user.id, fileId });
            return this.handleError(error, 'get file');
        }
    }
}
