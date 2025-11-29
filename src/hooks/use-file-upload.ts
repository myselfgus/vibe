import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { 
	type ImageAttachment,
	type CodeFileAttachment,
	type FileAttachment,
	isSupportedImageType,
	isSupportedCodeFileType,
	isSupportedArchiveType,
	isSupportedFileType,
	getMimeTypeFromExtension,
	MAX_IMAGE_SIZE_BYTES,
	MAX_CODE_FILE_SIZE_BYTES,
	MAX_ARCHIVE_SIZE_BYTES,
	MAX_IMAGES_PER_MESSAGE,
	MAX_CODE_FILES_PER_MESSAGE,
	MAX_ARCHIVES_PER_MESSAGE,
} from '@/api-types';

export interface UseFileUploadOptions {
	onError?: (error: string) => void;
}

export interface UseFileUploadReturn {
	files: FileAttachment[];
	images: ImageAttachment[];
	codeFiles: CodeFileAttachment[];
	archives: CodeFileAttachment[];
	addFiles: (files: File[]) => Promise<void>;
	removeFile: (id: string) => void;
	clearFiles: () => void;
	isProcessing: boolean;
}

/**
 * Enhanced hook for handling all file uploads (images, code files, and archives)
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
	const { onError } = options;

	const [files, setFiles] = useState<FileAttachment[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);

	const processImageFile = useCallback(async (file: File): Promise<ImageAttachment | null> => {
		// Check file size
		if (file.size > MAX_IMAGE_SIZE_BYTES) {
			const errorMsg = `Image too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB.`;
			toast.error(errorMsg);
			onError?.(errorMsg);
			return null;
		}

		// Validate MIME type
		let mimeType = file.type;
		if (!mimeType || mimeType === 'application/octet-stream') {
			const detectedType = getMimeTypeFromExtension(file.name);
			if (detectedType && isSupportedImageType(detectedType)) {
				mimeType = detectedType;
			}
		}

		if (!isSupportedImageType(mimeType)) {
			const errorMsg = `Unsupported image type: ${file.type || 'unknown'}. Only PNG, JPEG, and WEBP are supported.`;
			toast.error(errorMsg);
			onError?.(errorMsg);
			return null;
		}

		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const result = e.target?.result as string;
					if (!result) {
						reject(new Error('Failed to read file'));
						return;
					}

					// Extract base64 data (remove data URL prefix)
					const base64Data = result.split(',')[1];

					// Try to get image dimensions
					const img = new Image();
					img.onload = () => {
						resolve({
							id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
							filename: file.name,
							mimeType: mimeType as ImageAttachment['mimeType'],
							base64Data,
							size: file.size,
							dimensions: {
								width: img.width,
								height: img.height,
							},
						});
					};

					img.onerror = () => {
						// Fallback without dimensions if image loading fails
						resolve({
							id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
							filename: file.name,
							mimeType: mimeType as ImageAttachment['mimeType'],
							base64Data,
							size: file.size,
						});
					};

					img.src = result;
				} catch (error) {
					reject(error);
				}
			};

			reader.onerror = () => {
				reject(new Error(`Failed to read file: ${file.name}`));
			};

			reader.readAsDataURL(file);
		});
	}, [onError]);

	const processCodeFile = useCallback(async (file: File, isArchive: boolean): Promise<CodeFileAttachment | null> => {
		const maxSize = isArchive ? MAX_ARCHIVE_SIZE_BYTES : MAX_CODE_FILE_SIZE_BYTES;
		
		// Check file size
		if (file.size > maxSize) {
			const errorMsg = `File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${maxSize / 1024 / 1024}MB.`;
			toast.error(errorMsg);
			onError?.(errorMsg);
			return null;
		}

		// Validate MIME type
		let mimeType = file.type;
		if (!mimeType || mimeType === 'application/octet-stream') {
			const detectedType = getMimeTypeFromExtension(file.name);
			if (detectedType && (isSupportedCodeFileType(detectedType) || isSupportedArchiveType(detectedType))) {
				mimeType = detectedType;
			}
		}

		if (!isSupportedCodeFileType(mimeType) && !isSupportedArchiveType(mimeType)) {
			const errorMsg = `Unsupported file type: ${file.type || 'unknown'} for ${file.name}`;
			toast.error(errorMsg);
			onError?.(errorMsg);
			return null;
		}

		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const result = e.target?.result;
					if (!result) {
						reject(new Error('Failed to read file'));
						return;
					}

					let content: string;
					if (isArchive) {
						// For archives, convert to base64
						if (typeof result === 'string') {
							content = result.split(',')[1];
						} else {
							// Convert ArrayBuffer to base64
							const bytes = new Uint8Array(result as ArrayBuffer);
							content = btoa(String.fromCharCode(...bytes));
						}
					} else {
						// For text files, use the content directly
						content = result as string;
					}

					resolve({
						id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
						filename: file.name,
						mimeType: mimeType as CodeFileAttachment['mimeType'],
						content,
						size: file.size,
						isArchive,
					});
				} catch (error) {
					reject(error);
				}
			};

			reader.onerror = () => {
				reject(new Error(`Failed to read file: ${file.name}`));
			};

			// Read as appropriate type
			if (isArchive) {
				reader.readAsDataURL(file);
			} else {
				reader.readAsText(file);
			}
		});
	}, [onError]);

	const processFile = useCallback(async (file: File): Promise<FileAttachment | null> => {
		// Detect file type
		let mimeType = file.type;
		if (!mimeType || mimeType === 'application/octet-stream') {
			const detectedType = getMimeTypeFromExtension(file.name);
			if (detectedType) {
				mimeType = detectedType;
			}
		}

		if (!isSupportedFileType(mimeType)) {
			const errorMsg = `Unsupported file type: ${file.type || 'unknown'} for ${file.name}. Please upload code files, images, or ZIP archives.`;
			toast.error(errorMsg);
			onError?.(errorMsg);
			return null;
		}

		// Process based on type
		if (isSupportedImageType(mimeType)) {
			return processImageFile(file);
		} else if (isSupportedArchiveType(mimeType)) {
			return processCodeFile(file, true);
		} else {
			return processCodeFile(file, false);
		}
	}, [processImageFile, processCodeFile, onError]);

	const addFiles = useCallback(async (newFiles: File[]) => {
		setIsProcessing(true);

		try {
			// Count files by type
			const currentImages = files.filter(f => 'base64Data' in f && 'dimensions' in f).length;
			const currentCodeFiles = files.filter(f => 'content' in f && !f.isArchive).length;
			const currentArchives = files.filter(f => 'content' in f && f.isArchive).length;

			let newImages = 0;
			let newCodeFiles = 0;
			let newArchives = 0;

			for (const file of newFiles) {
				let mimeType = file.type;
				if (!mimeType || mimeType === 'application/octet-stream') {
					const detectedType = getMimeTypeFromExtension(file.name);
					if (detectedType) {
						mimeType = detectedType;
					}
				}

				if (isSupportedImageType(mimeType)) {
					newImages++;
				} else if (isSupportedArchiveType(mimeType)) {
					newArchives++;
				} else if (isSupportedCodeFileType(mimeType)) {
					newCodeFiles++;
				}
			}

			// Check limits
			if (currentImages + newImages > MAX_IMAGES_PER_MESSAGE) {
				const errorMsg = `Maximum ${MAX_IMAGES_PER_MESSAGE} images allowed per message.`;
				toast.error(errorMsg);
				onError?.(errorMsg);
				return;
			}

			if (currentCodeFiles + newCodeFiles > MAX_CODE_FILES_PER_MESSAGE) {
				const errorMsg = `Maximum ${MAX_CODE_FILES_PER_MESSAGE} code files allowed per message.`;
				toast.error(errorMsg);
				onError?.(errorMsg);
				return;
			}

			if (currentArchives + newArchives > MAX_ARCHIVES_PER_MESSAGE) {
				const errorMsg = `Maximum ${MAX_ARCHIVES_PER_MESSAGE} archive file allowed per message.`;
				toast.error(errorMsg);
				onError?.(errorMsg);
				return;
			}

			// Process all files
			const processedFiles = await Promise.all(
				newFiles.map(file => processFile(file))
			);

			// Filter out null results (failed validations)
			const validFiles = processedFiles.filter((f): f is FileAttachment => f !== null);

			if (validFiles.length > 0) {
				setFiles(prev => [...prev, ...validFiles]);
				toast.success(`Successfully added ${validFiles.length} file(s)`);
			}
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : 'Failed to process files';
			toast.error(errorMsg);
			onError?.(errorMsg);
		} finally {
			setIsProcessing(false);
		}
	}, [files, processFile, onError]);

	const removeFile = useCallback((id: string) => {
		setFiles(prev => prev.filter(f => f.id !== id));
	}, []);

	const clearFiles = useCallback(() => {
		setFiles([]);
	}, []);

	// Separate files by type for convenience
	const images = files.filter((f): f is ImageAttachment => 'base64Data' in f && 'dimensions' in f);
	const codeFiles = files.filter((f): f is CodeFileAttachment => 'content' in f && !f.isArchive);
	const archives = files.filter((f): f is CodeFileAttachment => 'content' in f && f.isArchive);

	return {
		files,
		images,
		codeFiles,
		archives,
		addFiles,
		removeFile,
		clearFiles,
		isProcessing,
	};
}
