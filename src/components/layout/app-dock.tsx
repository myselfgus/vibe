import { useNavigate, useLocation } from 'react-router';
import { Plus, FolderOpen, Compass, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface DockItemProps {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
	isActive?: boolean;
	variant?: 'default' | 'primary';
}

function DockItem({ icon, label, onClick, isActive, variant = 'default' }: DockItemProps) {
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild>
					<motion.button
						whileHover={{ scale: 1.15, y: -4 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: 'spring', stiffness: 400, damping: 17 }}
						onClick={onClick}
						className={cn(
							// Base styles
							'relative flex items-center justify-center',
							'size-12 rounded-2xl',
							'transition-all duration-200',
							// Neumorphism + Glassmorphism
							'backdrop-blur-md',
							'border border-white/20 dark:border-white/10',
							// Shadow for depth
							'shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]',
							'dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
							// Variants
							variant === 'primary'
								? 'bg-accent/90 text-white hover:bg-accent'
								: 'bg-white/10 dark:bg-black/10 text-foreground/80 hover:bg-white/20 dark:hover:bg-black/20',
							// Active state
							isActive && variant !== 'primary' && 'bg-white/25 dark:bg-black/25 ring-2 ring-accent/50'
						)}
					>
						{icon}
						{/* Active indicator dot */}
						{isActive && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-accent"
							/>
						)}
					</motion.button>
				</TooltipTrigger>
				<TooltipContent
					side="right"
					className="md:block hidden bg-black/80 dark:bg-white/80 text-white dark:text-black border-0 backdrop-blur-md"
				>
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export function AppDock() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const dockItems = [
		{
			icon: <Plus className="size-5" />,
			label: 'New Project',
			path: '/',
			variant: 'primary' as const,
		},
		{
			icon: <FolderOpen className="size-5" />,
			label: 'My Apps',
			path: '/apps',
			variant: 'default' as const,
		},
		{
			icon: <Compass className="size-5" />,
			label: 'Discover',
			path: '/discover',
			variant: 'default' as const,
		},
		{
			icon: <Settings className="size-5" />,
			label: 'Settings',
			path: '/settings',
			variant: 'default' as const,
		},
	];

	if (!user) return null;

	return (
		<>
			{/* Desktop Dock - Left Side */}
			<motion.div
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}
				className={cn(
					// Positioning - fixed left side on desktop
					'fixed left-4 top-1/2 -translate-y-1/2 z-50',
					'hidden md:flex flex-col gap-3',
					// Container styling - Glassmorphism
					'p-3 rounded-3xl',
					'bg-white/10 dark:bg-black/10',
					'backdrop-blur-xl',
					'border border-white/20 dark:border-white/10',
					// Neumorphic shadow
					'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)]',
					'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]'
				)}
			>
				{dockItems.map((item) => (
					<DockItem
						key={item.path}
						icon={item.icon}
						label={item.label}
						onClick={() => navigate(item.path)}
						isActive={location.pathname === item.path}
						variant={item.variant}
					/>
				))}
			</motion.div>

			{/* Mobile Dock - Bottom */}
			<motion.div
				initial={{ y: 100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}
				className={cn(
					// Positioning - fixed bottom on mobile
					'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
					'flex md:hidden gap-3',
					// Container styling - Glassmorphism
					'p-3 rounded-3xl',
					'bg-white/10 dark:bg-black/10',
					'backdrop-blur-xl',
					'border border-white/20 dark:border-white/10',
					// Neumorphic shadow
					'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)]',
					'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]',
					// Safe area for mobile
					'pb-[calc(0.75rem+env(safe-area-inset-bottom))]'
				)}
			>
				{dockItems.map((item) => (
					<DockItem
						key={item.path}
						icon={item.icon}
						label={item.label}
						onClick={() => navigate(item.path)}
						isActive={location.pathname === item.path}
						variant={item.variant}
					/>
				))}
			</motion.div>
		</>
	);
}
