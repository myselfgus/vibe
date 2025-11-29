import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
	type ImageAttachment,
	type CodeFileAttachment,
	isSupportedImageType,
	isSupportedExtension,
	getMimeTypeFromExtension,
	isZipArchive,
	MAX_IMAGE_SIZE_BYTES,
	MAX_CODE_FILE_SIZE_BYTES,
	MAX_IMAGES_PER_MESSAGE,
	MAX_CODE_FILES_PER_MESSAGE,
	MAX_TOTAL_ATTACHMENT_SIZE_BYTES,
	SUPPORTED_CODE_EXTENSIONS,
} from '@/api-types';

export interface FileUploadOptions {
	maxImages?: number;
	maxCodeFiles?: number;
	maxImageSizeBytes?: number;
	maxCodeFileSizeBytes?: number;
	maxTotalSizeBytes?: number;
	onError?: (error: string) => void;
}

export interface FileUploadReturn {
	images: ImageAttachment[];
	codeFiles: CodeFileAttachment[];
	addFiles: (files: File[]) => Promise<void>;
	removeImage: (id: string) => void;
	removeCodeFile: (id: string) => void;
	clearAll: () => void;
	isProcessing: boolean;
	totalSize: number;
}

/**
 * Hook for handling file uploads - supports images, code files, and ZIPs
 */
export function useFileUpload(options: FileUploadOptions = {}): FileUploadReturn {
	const {
		maxImages = MAX_IMAGES_PER_MESSAGE,
		maxCodeFiles = MAX_CODE_FILES_PER_MESSAGE,
		maxImageSizeBytes = MAX_IMAGE_SIZE_BYTES,
		maxCodeFileSizeBytes = MAX_CODE_FILE_SIZE_BYTES,
		maxTotalSizeBytes = MAX_TOTAL_ATTACHMENT_SIZE_BYTES,
		onError,
	} = options;

	const [images, setImages] = useState<ImageAttachment[]>([]);
	const [codeFiles, setCodeFiles] = useState<CodeFileAttachment[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);

	const totalSize = [...images, ...codeFiles].reduce(
		(sum, file) => sum + (file.size || 0),
		0
	);

	const processImageFile = useCallback(
		async (file: File): Promise<ImageAttachment | null> => {
			if (file.size > maxImageSizeBytes) {
				const errorMsg = `Image "${file.name}" exceeds ${maxImageSizeBytes / 1024 / 1024}MB limit`;
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

						const base64Data = result.split(',')[1];

						const img = new Image();
						img.onload = () => {
							resolve({
								id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
								filename: file.name,
								mimeType: file.type as ImageAttachment['mimeType'],
								base64Data,
								size: file.size,
								dimensions: {
									width: img.width,
									height: img.height,
								},
							});
						};

						img.onerror = () => {
							resolve({
								id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
								filename: file.name,
								mimeType: file.type as ImageAttachment['mimeType'],
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
		},
		[maxImageSizeBytes, onError]
	);

	const processCodeFile = useCallback(
		async (file: File): Promise<CodeFileAttachment | null> => {
			if (file.size > maxCodeFileSizeBytes) {
				const errorMsg = `File "${file.name}" exceeds ${maxCodeFileSizeBytes / 1024 / 1024}MB limit`;
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

						const base64Data = result.split(',')[1];
						const extension = file.name.substring(file.name.lastIndexOf('.'));
						const mimeType = getMimeTypeFromExtension(file.name);

						resolve({
							id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
							filename: file.name,
							mimeType,
							base64Data,
							size: file.size,
							isArchive: isZipArchive(file.type) || ['.zip', '.tar', '.gz', '.tgz'].includes(extension.toLowerCase()),
							extension,
						});
					} catch (error) {
						reject(error);
					}
				};

				reader.onerror = () => {
					reject(new Error(`Failed to read file: ${file.name}`));
				};

				reader.readAsDataURL(file);
			});
		},
		[maxCodeFileSizeBytes, onError]
	);

	const addFiles = useCallback(
		async (files: File[]) => {
			setIsProcessing(true);

			try {
				const imageFiles: File[] = [];
				const codeFilesToProcess: File[] = [];

				// Categorize files
				for (const file of files) {
					if (isSupportedImageType(file.type)) {
						imageFiles.push(file);
					} else if (isSupportedExtension(file.name) || file.type === 'application/octet-stream') {
						codeFilesToProcess.push(file);
					} else {
						// Try to accept based on extension
						const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
						if (SUPPORTED_CODE_EXTENSIONS.includes(ext as typeof SUPPORTED_CODE_EXTENSIONS[number])) {
							codeFilesToProcess.push(file);
						} else {
							const errorMsg = `Unsupported file type: ${file.name}`;
							toast.error(errorMsg);
							onError?.(errorMsg);
						}
					}
				}

				// Check limits
				if (images.length + imageFiles.length > maxImages) {
					const errorMsg = `Maximum ${maxImages} images allowed per message.`;
					toast.error(errorMsg);
					onError?.(errorMsg);
					return;
				}

				if (codeFiles.length + codeFilesToProcess.length > maxCodeFiles) {
					const errorMsg = `Maximum ${maxCodeFiles} code files allowed per message.`;
					toast.error(errorMsg);
					onError?.(errorMsg);
					return;
				}

				// Check total size
				const newTotalSize =
					totalSize +
					[...imageFiles, ...codeFilesToProcess].reduce((sum, f) => sum + f.size, 0);
				if (newTotalSize > maxTotalSizeBytes) {
					const errorMsg = `Total attachment size exceeds ${maxTotalSizeBytes / 1024 / 1024}MB limit.`;
					toast.error(errorMsg);
					onError?.(errorMsg);
					return;
				}

				// Process images
				if (imageFiles.length > 0) {
					const processedImages = await Promise.all(
						imageFiles.map((file) => processImageFile(file))
					);
					const validImages = processedImages.filter(
						(img): img is ImageAttachment => img !== null
					);
					if (validImages.length > 0) {
						setImages((prev) => [...prev, ...validImages]);
					}
				}

				// Process code files
				if (codeFilesToProcess.length > 0) {
					const processedCodeFiles = await Promise.all(
						codeFilesToProcess.map((file) => processCodeFile(file))
					);
					const validCodeFiles = processedCodeFiles.filter(
						(file): file is CodeFileAttachment => file !== null
					);
					if (validCodeFiles.length > 0) {
						setCodeFiles((prev) => [...prev, ...validCodeFiles]);
					}
				}
			} catch (error) {
				onError?.(
					error instanceof Error ? error.message : 'Failed to process files'
				);
			} finally {
				setIsProcessing(false);
			}
		},
		[
			images.length,
			codeFiles.length,
			totalSize,
			maxImages,
			maxCodeFiles,
			maxTotalSizeBytes,
			processImageFile,
			processCodeFile,
			onError,
		]
	);

	const removeImage = useCallback((id: string) => {
		setImages((prev) => prev.filter((img) => img.id !== id));
	}, []);

	const removeCodeFile = useCallback((id: string) => {
		setCodeFiles((prev) => prev.filter((file) => file.id !== id));
	}, []);

	const clearAll = useCallback(() => {
		setImages([]);
		setCodeFiles([]);
	}, []);

	return {
		images,
		codeFiles,
		addFiles,
		removeImage,
		removeCodeFile,
		clearAll,
		isProcessing,
		totalSize,
	};
}
