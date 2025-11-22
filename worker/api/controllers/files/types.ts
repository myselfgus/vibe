/**
 * Types for user files API
 */

export interface UserFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
    r2Key: string;
}

export interface FileListData {
    files: UserFile[];
    totalCount: number;
}

export interface FileUploadData {
    file: UserFile;
}

export interface FileDeleteData {
    deleted: boolean;
}
