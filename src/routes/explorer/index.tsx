import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
	FolderOpen,
	Upload,
	Download,
	Trash2,
	File,
	FileText,
	FileCode,
	FileArchive,
	FileImage,
	Loader2,
	AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFiles, uploadFile, deleteFile, downloadFile } from '@/hooks/use-files';
import type { UserFile } from '@/api-types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function getFileIcon(mimeType: string) {
	if (mimeType.startsWith('image/')) {
		return <FileImage className="h-5 w-5" />;
	}
	if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('gzip')) {
		return <FileArchive className="h-5 w-5" />;
	}
	if (mimeType.includes('javascript') || mimeType.includes('typescript') ||
		mimeType.includes('python') || mimeType.includes('json') ||
		mimeType.includes('html') || mimeType.includes('css')) {
		return <FileCode className="h-5 w-5" />;
	}
	if (mimeType.startsWith('text/')) {
		return <FileText className="h-5 w-5" />;
	}
	return <File className="h-5 w-5" />;
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileCardProps {
	file: UserFile;
	onDownload: (file: UserFile) => void;
	onDelete: (file: UserFile) => void;
	isDeleting?: boolean;
}

function FileCard({ file, onDownload, onDelete, isDeleting }: FileCardProps) {
	return (
		<motion.div
			className={cn(
				'w-full p-4 rounded-xl border border-border',
				'bg-card/50 hover:bg-card/80 transition-all duration-200',
				'hover:shadow-md hover:border-border-primary'
			)}
			whileHover={{ scale: 1.01 }}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<div className="flex items-center gap-4">
				<div className="flex-shrink-0 text-muted-foreground">
					{getFileIcon(file.mimeType)}
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-medium text-foreground truncate">{file.name}</h3>
					<div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
						<span>{formatFileSize(file.size)}</span>
						<span>-</span>
						<span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onDownload(file)}
						className="h-9 w-9"
					>
						<Download className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onDelete(file)}
						disabled={isDeleting}
						className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
					>
						{isDeleting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Trash2 className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
		</motion.div>
	);
}

export default function ExplorerPage() {
	const { files, loading, error, refetch } = useFiles();
	const [fileToDelete, setFileToDelete] = useState<UserFile | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

	const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = event.target.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		setIsUploading(true);
		try {
			for (const file of Array.from(selectedFiles)) {
				await uploadFile(file);
			}
			refetch();
			toast.success(selectedFiles.length === 1 ? 'File uploaded' : `${selectedFiles.length} files uploaded`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to upload file');
		} finally {
			setIsUploading(false);
			event.target.value = '';
		}
	}, [refetch]);

	const handleDownload = useCallback(async (file: UserFile) => {
		try {
			await downloadFile(file);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to download file');
		}
	}, []);

	const handleDelete = useCallback((file: UserFile) => {
		setFileToDelete(file);
	}, []);

	const confirmDelete = useCallback(async () => {
		if (!fileToDelete) return;

		setDeletingFileId(fileToDelete.id);
		try {
			await deleteFile(fileToDelete.id);
			refetch();
			toast.success('File deleted');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to delete file');
		} finally {
			setDeletingFileId(null);
			setFileToDelete(null);
		}
	}, [fileToDelete, refetch]);

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3 mb-3">
								<FolderOpen className="h-8 w-8 text-accent" />
								<h1 className="text-4xl font-bold font-[departureMono] text-accent">
									MY FILES
								</h1>
							</div>
							<label className="cursor-pointer">
								<input
									type="file"
									multiple
									onChange={handleUpload}
									className="hidden"
									disabled={isUploading}
								/>
								<Button disabled={isUploading} asChild>
									<span>
										{isUploading ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											<Upload className="h-4 w-4 mr-2" />
										)}
										Upload Files
									</span>
								</Button>
							</label>
						</div>
						<p className="text-text-tertiary text-lg">
							Your uploaded files stored in the cloud
						</p>
					</div>

					{/* Files List */}
					<div className="grid gap-3">
						{loading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							</div>
						) : error ? (
							<div className="flex flex-col items-center justify-center py-12 text-destructive">
								<AlertCircle className="h-12 w-12 mb-4" />
								<p>{error}</p>
							</div>
						) : files.length > 0 ? (
							files.map((file) => (
								<FileCard
									key={file.id}
									file={file}
									onDownload={handleDownload}
									onDelete={handleDelete}
									isDeleting={deletingFileId === file.id}
								/>
							))
						) : (
							<div className="text-center py-12 text-muted-foreground">
								<FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>No files uploaded yet</p>
								<p className="text-sm mt-2">Upload files to see them here</p>
							</div>
						)}
					</div>
				</motion.div>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete file?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
