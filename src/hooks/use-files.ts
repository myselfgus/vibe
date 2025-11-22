import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '@/lib/api-client';
import type { UserFile } from '@/api-types';

interface FilesHookState {
    files: UserFile[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useFiles(): FilesHookState {
    const [files, setFiles] = useState<UserFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.listFiles();
            if (response.success && response.data) {
                setFiles(response.data.files);
            } else {
                setError(response.error?.message || 'Failed to load files');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to load files');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    return {
        files,
        loading,
        error,
        refetch: fetchFiles,
    };
}

export async function uploadFile(file: File): Promise<UserFile> {
    const response = await apiClient.uploadFile(file);
    if (response.success && response.data) {
        return response.data.file;
    }
    throw new Error(response.error?.message || 'Failed to upload file');
}

export async function deleteFile(fileId: string): Promise<void> {
    const response = await apiClient.deleteFile(fileId);
    if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete file');
    }
}

export async function downloadFile(file: UserFile): Promise<void> {
    const response = await apiClient.getFile(file.id);
    if (!response.ok) {
        throw new Error('Failed to download file');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
