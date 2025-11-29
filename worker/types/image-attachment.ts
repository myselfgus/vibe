/**
 * Supported image MIME types for upload
 * Limited to most common web formats for reliability
 */
export const SUPPORTED_IMAGE_MIME_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
] as const;

/**
 * Supported code file MIME types
 */
export const SUPPORTED_CODE_FILE_MIME_TYPES = [
	// Text/Plain
	'text/plain',
	'text/markdown',
	'text/x-markdown',
	// JavaScript/TypeScript
	'text/javascript',
	'application/javascript',
	'application/x-javascript',
	'text/typescript',
	'application/typescript',
	// Web files
	'text/html',
	'text/css',
	'application/json',
	'application/xml',
	'text/xml',
	// Python
	'text/x-python',
	'application/x-python-code',
	// Java
	'text/x-java-source',
	'text/x-java',
	// C/C++
	'text/x-c',
	'text/x-c++src',
	'text/x-csrc',
	// Other languages
	'text/x-go',
	'text/x-rust',
	'text/x-ruby',
	'text/x-php',
	'text/x-swift',
	'text/x-kotlin',
	'text/x-csharp',
	'text/x-sh',
	'application/x-sh',
	'text/x-yaml',
	'application/x-yaml',
	// Config files
	'application/toml',
	'text/x-properties',
] as const;

/**
 * Supported archive MIME types
 */
export const SUPPORTED_ARCHIVE_MIME_TYPES = [
	'application/zip',
	'application/x-zip-compressed',
	'application/x-zip',
	'application/gzip',
	'application/x-gzip',
	'application/x-tar',
	'application/x-compressed-tar',
] as const;

/**
 * Supported file MIME types for upload (includes images, code files, and archives)
 */
export const SUPPORTED_FILE_MIME_TYPES = [
	...SUPPORTED_IMAGE_MIME_TYPES,
	...SUPPORTED_CODE_FILE_MIME_TYPES,
	...SUPPORTED_ARCHIVE_MIME_TYPES,
] as const;

export type SupportedImageMimeType = typeof SUPPORTED_IMAGE_MIME_TYPES[number];
export type SupportedCodeFileMimeType = typeof SUPPORTED_CODE_FILE_MIME_TYPES[number];
export type SupportedArchiveMimeType = typeof SUPPORTED_ARCHIVE_MIME_TYPES[number];
export type SupportedFileMimeType = typeof SUPPORTED_FILE_MIME_TYPES[number];

/**
 * Image attachment for user messages
 * Represents an image that can be sent with text prompts
 */
export interface ImageAttachment {
	/** Unique identifier for this attachment */
	id: string;
	/** Original filename */
	filename: string;
	/** MIME type of the image */
	mimeType: SupportedImageMimeType;
	/** Base64-encoded image data (without data URL prefix) */
	base64Data: string;
	/** Size of the original file in bytes */
	size?: number;
	/** Optional dimensions if available */
	dimensions?: {
		width: number;
		height: number;
	};
}

/**
 * Code file attachment for user messages
 * Represents a code file that can be sent with prompts
 */
export interface CodeFileAttachment {
	/** Unique identifier for this attachment */
	id: string;
	/** Original filename */
	filename: string;
	/** MIME type of the file */
	mimeType: SupportedCodeFileMimeType | SupportedArchiveMimeType;
	/** File content (text or base64 for archives) */
	content: string;
	/** Size of the original file in bytes */
	size?: number;
	/** Whether this is an archive file */
	isArchive?: boolean;
}

/**
 * Union type for all attachment types
 */
export type FileAttachment = ImageAttachment | CodeFileAttachment;

export interface ProcessedImageAttachment {
	/** MIME type of the image */
	mimeType: SupportedImageMimeType;
	/** Base64-encoded image data (without data URL prefix) */
	base64Data?: string;
    /** R2 key of the image */
    r2Key: string;
    /** URL of the image */
    publicUrl: string;
    /** image data hash */
    hash: string;
}

/**
 * Processed code file attachment stored in R2
 */
export interface ProcessedCodeFileAttachment {
	/** MIME type of the file */
	mimeType: SupportedCodeFileMimeType | SupportedArchiveMimeType;
	/** Original filename */
	filename: string;
	/** File content (text or base64 for archives) */
	content?: string;
	/** R2 key of the file */
	r2Key: string;
	/** URL of the file */
	publicUrl: string;
	/** file data hash */
	hash: string;
	/** Whether this is an archive file */
	isArchive?: boolean;
}

/**
 * Union type for all processed attachments
 */
export type ProcessedAttachment = ProcessedImageAttachment | ProcessedCodeFileAttachment;

/**
 * Utility to check if a MIME type is supported (image)
 */
export function isSupportedImageType(mimeType: string): mimeType is SupportedImageMimeType {
	return SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType as SupportedImageMimeType);
}

/**
 * Utility to check if a MIME type is supported (code file)
 */
export function isSupportedCodeFileType(mimeType: string): mimeType is SupportedCodeFileMimeType {
	return SUPPORTED_CODE_FILE_MIME_TYPES.includes(mimeType as SupportedCodeFileMimeType);
}

/**
 * Utility to check if a MIME type is supported (archive)
 */
export function isSupportedArchiveType(mimeType: string): mimeType is SupportedArchiveMimeType {
	return SUPPORTED_ARCHIVE_MIME_TYPES.includes(mimeType as SupportedArchiveMimeType);
}

/**
 * Utility to check if a MIME type is supported (any file)
 */
export function isSupportedFileType(mimeType: string): mimeType is SupportedFileMimeType {
	return SUPPORTED_FILE_MIME_TYPES.includes(mimeType as SupportedFileMimeType);
}

/**
 * Utility to determine file type from extension when MIME type is generic
 */
export function getMimeTypeFromExtension(filename: string): SupportedFileMimeType | null {
	const ext = filename.toLowerCase().split('.').pop();
	
	const extensionMap: Record<string, SupportedFileMimeType> = {
		// Images
		'png': 'image/png',
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'webp': 'image/webp',
		// Text
		'txt': 'text/plain',
		'md': 'text/markdown',
		// JavaScript/TypeScript
		'js': 'application/javascript',
		'mjs': 'application/javascript',
		'cjs': 'application/javascript',
		'ts': 'application/typescript',
		'tsx': 'application/typescript',
		'jsx': 'application/javascript',
		// Web
		'html': 'text/html',
		'css': 'text/css',
		'json': 'application/json',
		'xml': 'application/xml',
		// Python
		'py': 'text/x-python',
		// Java
		'java': 'text/x-java-source',
		// C/C++
		'c': 'text/x-c',
		'cpp': 'text/x-c++src',
		'cc': 'text/x-c++src',
		'cxx': 'text/x-c++src',
		'h': 'text/x-c',
		'hpp': 'text/x-c++src',
		// Other languages
		'go': 'text/x-go',
		'rs': 'text/x-rust',
		'rb': 'text/x-ruby',
		'php': 'text/x-php',
		'swift': 'text/x-swift',
		'kt': 'text/x-kotlin',
		'cs': 'text/x-csharp',
		'sh': 'text/x-sh',
		'bash': 'text/x-sh',
		'yaml': 'application/x-yaml',
		'yml': 'application/x-yaml',
		'toml': 'application/toml',
		// Archives
		'zip': 'application/zip',
		'gz': 'application/gzip',
		'tar': 'application/x-tar',
	};
	
	return ext ? extensionMap[ext] || null : null;
}

/**
 * Utility to get file extension from MIME type
 */
export function getFileExtensionFromMimeType(mimeType: SupportedImageMimeType): string {
	const map: Record<SupportedImageMimeType, string> = {
		'image/png': 'png',
		'image/jpeg': 'jpg',
		'image/webp': 'webp',
	};
	return map[mimeType] || 'jpg';
}

/**
 * Maximum file size for images (10MB)
 */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Maximum file size for code files (5MB)
 */
export const MAX_CODE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Maximum file size for archives (50MB)
 */
export const MAX_ARCHIVE_SIZE_BYTES = 50 * 1024 * 1024;

/**
 * Maximum number of images per message
 */
export const MAX_IMAGES_PER_MESSAGE = 2;

/**
 * Maximum number of code files per message
 */
export const MAX_CODE_FILES_PER_MESSAGE = 10;

/**
 * Maximum number of archive files per message
 */
export const MAX_ARCHIVES_PER_MESSAGE = 1;
