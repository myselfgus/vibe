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
 * Supported code file MIME types for upload
 * Covers common programming languages and configuration files
 */
export const SUPPORTED_CODE_MIME_TYPES = [
	// Text and markdown
	'text/plain',
	'text/markdown',
	'text/html',
	'text/css',
	'text/csv',
	'text/xml',
	// JavaScript/TypeScript
	'text/javascript',
	'application/javascript',
	'text/typescript',
	'application/typescript',
	// JSON and config
	'application/json',
	'application/xml',
	'application/x-yaml',
	'text/yaml',
	// Archives
	'application/zip',
	'application/x-zip-compressed',
	'application/gzip',
	'application/x-tar',
	// Other common code types
	'text/x-python',
	'text/x-java-source',
	'text/x-c',
	'text/x-c++',
	'text/x-rust',
	'text/x-go',
	'text/x-ruby',
	'text/x-php',
	'text/x-swift',
	'text/x-kotlin',
	'text/x-scala',
	'application/x-sh',
	'application/sql',
	// Binary data (for generic files)
	'application/octet-stream',
] as const;

/**
 * Supported file MIME types for upload (includes images and code files)
 */
export const SUPPORTED_FILE_MIME_TYPES = [
	...SUPPORTED_IMAGE_MIME_TYPES,
	...SUPPORTED_CODE_MIME_TYPES,
] as const;

export type SupportedImageMimeType = typeof SUPPORTED_IMAGE_MIME_TYPES[number];
export type SupportedCodeMimeType = typeof SUPPORTED_CODE_MIME_TYPES[number];
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
 * Code file attachment for user messages
 * Represents a code file or archive that can be sent with prompts
 */
export interface CodeFileAttachment {
	/** Unique identifier for this attachment */
	id: string;
	/** Original filename */
	filename: string;
	/** MIME type of the file */
	mimeType: SupportedFileMimeType;
	/** Base64-encoded file data (without data URL prefix) */
	base64Data: string;
	/** Size of the original file in bytes */
	size: number;
	/** Whether this is a ZIP archive */
	isArchive: boolean;
	/** File extension */
	extension: string;
}

export interface ProcessedCodeFileAttachment {
	/** MIME type of the file */
	mimeType: SupportedFileMimeType;
	/** R2 key of the file */
	r2Key: string;
	/** URL of the file */
	publicUrl: string;
	/** File data hash */
	hash: string;
	/** Original filename */
	filename: string;
	/** Whether this is a ZIP archive */
	isArchive: boolean;
	/** Extracted files if this is a ZIP */
	extractedFiles?: Array<{
		filePath: string;
		fileContents: string;
	}>;
}

/**
 * Utility to check if a MIME type is supported (image)
 */
export function isSupportedImageType(mimeType: string): mimeType is SupportedImageMimeType {
	return SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType as SupportedImageMimeType);
}

/**
 * Utility to check if a MIME type is supported (code file)
 */
export function isSupportedCodeType(mimeType: string): mimeType is SupportedCodeMimeType {
	return SUPPORTED_CODE_MIME_TYPES.includes(mimeType as SupportedCodeMimeType);
}

/**
 * Utility to check if a MIME type is supported (any file)
 */
export function isSupportedFileType(mimeType: string): mimeType is SupportedFileMimeType {
	return SUPPORTED_FILE_MIME_TYPES.includes(mimeType as SupportedFileMimeType);
}

/**
 * Utility to check if a file is a ZIP archive
 */
export function isZipArchive(mimeType: string): boolean {
	return mimeType === 'application/zip' ||
		   mimeType === 'application/x-zip-compressed' ||
		   mimeType === 'application/gzip' ||
		   mimeType === 'application/x-tar';
}

/**
 * Supported code file extensions (for validation by extension)
 */
export const SUPPORTED_CODE_EXTENSIONS = [
	// JavaScript/TypeScript
	'.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
	// Web
	'.html', '.htm', '.css', '.scss', '.sass', '.less',
	// Data formats
	'.json', '.yaml', '.yml', '.xml', '.csv', '.toml',
	// Python
	'.py', '.pyw', '.pyx',
	// Java/JVM
	'.java', '.kt', '.kts', '.scala', '.groovy',
	// C/C++
	'.c', '.h', '.cpp', '.cc', '.cxx', '.hpp', '.hh',
	// Rust
	'.rs',
	// Go
	'.go',
	// Ruby
	'.rb', '.erb',
	// PHP
	'.php',
	// Swift
	'.swift',
	// Shell
	'.sh', '.bash', '.zsh', '.fish',
	// SQL
	'.sql',
	// Markdown/Text
	'.md', '.mdx', '.txt', '.text',
	// Config files
	'.env', '.env.local', '.env.example', '.gitignore', '.dockerignore',
	'.eslintrc', '.prettierrc', '.babelrc', '.editorconfig',
	// Docker
	'.dockerfile',
	// Archives
	'.zip', '.tar', '.gz', '.tgz',
	// Other
	'.vue', '.svelte', '.astro',
] as const;

/**
 * Check if a file extension is supported
 */
export function isSupportedExtension(filename: string): boolean {
	const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
	return SUPPORTED_CODE_EXTENSIONS.includes(ext as typeof SUPPORTED_CODE_EXTENSIONS[number]);
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): SupportedFileMimeType {
	const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
	const mimeMap: Record<string, SupportedFileMimeType> = {
		// JavaScript/TypeScript
		'.js': 'text/javascript',
		'.jsx': 'text/javascript',
		'.mjs': 'text/javascript',
		'.cjs': 'text/javascript',
		'.ts': 'text/typescript',
		'.tsx': 'text/typescript',
		// Web
		'.html': 'text/html',
		'.htm': 'text/html',
		'.css': 'text/css',
		'.scss': 'text/css',
		'.sass': 'text/css',
		'.less': 'text/css',
		// Data formats
		'.json': 'application/json',
		'.yaml': 'text/yaml',
		'.yml': 'text/yaml',
		'.xml': 'application/xml',
		'.csv': 'text/csv',
		// Python
		'.py': 'text/x-python',
		'.pyw': 'text/x-python',
		'.pyx': 'text/x-python',
		// Java/JVM
		'.java': 'text/x-java-source',
		'.kt': 'text/x-kotlin',
		'.kts': 'text/x-kotlin',
		'.scala': 'text/x-scala',
		// C/C++
		'.c': 'text/x-c',
		'.h': 'text/x-c',
		'.cpp': 'text/x-c++',
		'.cc': 'text/x-c++',
		'.cxx': 'text/x-c++',
		'.hpp': 'text/x-c++',
		'.hh': 'text/x-c++',
		// Rust
		'.rs': 'text/x-rust',
		// Go
		'.go': 'text/x-go',
		// Ruby
		'.rb': 'text/x-ruby',
		'.erb': 'text/x-ruby',
		// PHP
		'.php': 'text/x-php',
		// Swift
		'.swift': 'text/x-swift',
		// Shell
		'.sh': 'application/x-sh',
		'.bash': 'application/x-sh',
		'.zsh': 'application/x-sh',
		'.fish': 'application/x-sh',
		// SQL
		'.sql': 'application/sql',
		// Markdown/Text
		'.md': 'text/markdown',
		'.mdx': 'text/markdown',
		'.txt': 'text/plain',
		'.text': 'text/plain',
		// Archives
		'.zip': 'application/zip',
		'.tar': 'application/x-tar',
		'.gz': 'application/gzip',
		'.tgz': 'application/gzip',
	};
	return mimeMap[ext] || 'application/octet-stream';
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
 * Maximum file size for code files (50MB - to support larger ZIPs)
 */
export const MAX_CODE_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/**
 * Maximum number of images per message
 */
export const MAX_IMAGES_PER_MESSAGE = 2;

/**
 * Maximum number of code files per message
 */
export const MAX_CODE_FILES_PER_MESSAGE = 10;

/**
 * Maximum total size for all attachments per message (100MB)
 */
export const MAX_TOTAL_ATTACHMENT_SIZE_BYTES = 100 * 1024 * 1024;
