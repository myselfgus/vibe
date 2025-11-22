import { useState } from 'react';
import { Cloud, Loader2, File, FileText, FileCode, FileArchive, FileImage, Check } from 'lucide-react';
import { useFiles } from '@/hooks/use-files';
import { apiClient } from '@/lib/api-client';
import type { UserFile, ImageAttachment } from '@/api-types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function getFileIcon(mimeType: string) {
	if (mimeType.startsWith('image/')) {
		return <FileImage className="h-4 w-4" />;
	}
	if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('gzip')) {
		return <FileArchive className="h-4 w-4" />;
	}
	if (mimeType.includes('javascript') || mimeType.includes('typescript') ||
		mimeType.includes('python') || mimeType.includes('json') ||
		mimeType.includes('html') || mimeType.includes('css')) {
		return <FileCode className="h-4 w-4" />;
	}
	if (mimeType.startsWith('text/')) {
		return <FileText className="h-4 w-4" />;
	}
	return <File className="h-4 w-4" />;
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface R2FilePickerProps {
	onFilesSelected: (attachments: ImageAttachment[]) => void;
	disabled?: boolean;
	className?: string;
	iconClassName?: string;
}

export function R2FilePicker({
	onFilesSelected,
	disabled = false,
	className = '',
	iconClassName = 'size-4',
}: R2FilePickerProps) {
	const { files, loading, error, refetch } = useFiles();
	const [open, setOpen] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(false);

	const toggleFileSelection = (fileId: string) => {
		setSelectedFiles(prev => {
			const newSet = new Set(prev);
			if (newSet.has(fileId)) {
				newSet.delete(fileId);
			} else {
				newSet.add(fileId);
			}
			return newSet;
		});
	};

	const handleConfirm = async () => {
		if (selectedFiles.size === 0) return;

		setIsLoading(true);
		try {
			const attachments: ImageAttachment[] = [];

			for (const fileId of selectedFiles) {
				const file = files.find(f => f.id === fileId);
				if (!file) continue;

				const response = await apiClient.getFile(fileId);
				if (!response.ok) {
					toast.error(`Failed to load ${file.name}`);
					continue;
				}

				const blob = await response.blob();
				const base64 = await blobToBase64(blob);

				attachments.push({
					id: `r2-${fileId}-${Date.now()}`,
					filename: file.name,
					mimeType: file.mimeType as ImageAttachment['mimeType'],
					base64Data: base64,
					size: file.size,
				});
			}

			if (attachments.length > 0) {
				onFilesSelected(attachments);
				toast.success(`${attachments.length} file(s) added`);
			}

			setSelectedFiles(new Set());
			setOpen(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to load files');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => {
			setOpen(isOpen);
			if (isOpen) {
				refetch();
				setSelectedFiles(new Set());
			}
		}}>
			<DialogTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={`p-1 rounded-md bg-transparent hover:bg-bg-3 text-text-secondary hover:text-text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
					aria-label="Pick files from cloud storage"
					title="Pick files from My Files (R2)"
				>
					<Cloud className={iconClassName} strokeWidth={1.5} />
				</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Select from My Files</DialogTitle>
					<DialogDescription>
						Choose files from your cloud storage to use as context
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[300px] overflow-y-auto">
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : error ? (
						<div className="text-center py-8 text-destructive">
							<p>{error}</p>
						</div>
					) : files.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Cloud className="h-10 w-10 mx-auto mb-3 opacity-50" />
							<p>No files uploaded yet</p>
							<p className="text-sm mt-1">Upload files in Explorer first</p>
						</div>
					) : (
						<div className="space-y-1">
							{files.map((file) => (
								<FileItem
									key={file.id}
									file={file}
									selected={selectedFiles.has(file.id)}
									onToggle={() => toggleFileSelection(file.id)}
								/>
							))}
						</div>
					)}
				</div>

				{files.length > 0 && (
					<div className="flex justify-between items-center pt-4 border-t">
						<span className="text-sm text-muted-foreground">
							{selectedFiles.size} selected
						</span>
						<Button
							onClick={handleConfirm}
							disabled={selectedFiles.size === 0 || isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Loading...
								</>
							) : (
								'Add Selected'
							)}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

interface FileItemProps {
	file: UserFile;
	selected: boolean;
	onToggle: () => void;
}

function FileItem({ file, selected, onToggle }: FileItemProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={cn(
				'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
				'hover:bg-muted/50',
				selected && 'bg-accent/10 ring-1 ring-accent'
			)}
		>
			<div className={cn(
				'flex items-center justify-center w-5 h-5 rounded border transition-all',
				selected ? 'bg-accent border-accent text-white' : 'border-border'
			)}>
				{selected && <Check className="h-3 w-3" />}
			</div>
			<div className="flex-shrink-0 text-muted-foreground">
				{getFileIcon(file.mimeType)}
			</div>
			<div className="flex-1 min-w-0 text-left">
				<p className="text-sm font-medium truncate">{file.name}</p>
				<p className="text-xs text-muted-foreground">
					{formatFileSize(file.size)} - {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
				</p>
			</div>
		</button>
	);
}

async function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			// Remove data URL prefix to get just the base64
			const base64 = result.split(',')[1];
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}
