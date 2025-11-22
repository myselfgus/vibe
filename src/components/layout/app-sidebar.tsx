import {
	Settings,
	Plus,
	Search,
	Compass,
	Clock,
	FolderOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useNavigate, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

export function AppSidebar() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { pathname } = useLocation();

	if (!user) return null;

	const isActive = (path: string) => pathname === path;

	return (
		<div className={cn(
			"fixed z-50",
			// Mobile: bottom center
			"bottom-4 left-1/2 -translate-x-1/2",
			// Desktop: left side, vertically centered
			"lg:bottom-auto lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0"
		)}>
			<nav className={cn(
				"flex items-center gap-1 px-2 py-2 neomorph-card backdrop-blur-md rounded-full",
				// Desktop: vertical layout
				"lg:flex-col lg:px-2 lg:py-3 lg:gap-2"
			)}>
				<TooltipProvider delayDuration={0}>
					{/* Section 1: Actions */}
					<div className="flex items-center gap-1 lg:flex-col lg:gap-2">
						{/* New Build */}
						{pathname !== '/' && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={() => navigate('/')}
										className={cn(
											'flex items-center justify-center rounded-full transition-all duration-200',
											'w-10 h-10 lg:w-12 lg:h-12',
											'bg-accent text-white hover:bg-accent/90 shadow-metallic'
										)}
									>
										<Plus className="h-5 w-5 lg:h-6 lg:w-6" />
									</button>
								</TooltipTrigger>
								<TooltipContent side="top" className="lg:hidden">
									New build
								</TooltipContent>
								<TooltipContent side="right" className="hidden lg:block">
									New build
								</TooltipContent>
							</Tooltip>
						)}

						{/* Recents */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => navigate('/recents')}
									className={cn(
										'flex items-center justify-center rounded-full transition-all duration-200',
										'w-10 h-10 lg:w-12 lg:h-12',
										isActive('/recents')
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
									)}
								>
									<Clock className="h-5 w-5 lg:h-6 lg:w-6" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="lg:hidden">
								Recents
							</TooltipContent>
							<TooltipContent side="right" className="hidden lg:block">
								Recents
							</TooltipContent>
						</Tooltip>

						{/* Search/Apps */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => navigate('/apps')}
									className={cn(
										'flex items-center justify-center rounded-full transition-all duration-200',
										'w-10 h-10 lg:w-12 lg:h-12',
										isActive('/apps')
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
									)}
								>
									<Search className="h-5 w-5 lg:h-6 lg:w-6" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="lg:hidden">
								Search apps
							</TooltipContent>
							<TooltipContent side="right" className="hidden lg:block">
								Search apps
							</TooltipContent>
						</Tooltip>
					</div>

					{/* Separator */}
					<div className="w-px h-6 bg-border mx-1 lg:w-8 lg:h-px lg:mx-0 lg:my-1" />

					{/* Section 2: Navigation */}
					<div className="flex items-center gap-1 lg:flex-col lg:gap-2">
						{/* Discover */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => navigate('/discover')}
									className={cn(
										'flex items-center justify-center rounded-full transition-all duration-200',
										'w-10 h-10 lg:w-12 lg:h-12',
										isActive('/discover')
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
									)}
								>
									<Compass className="h-5 w-5 lg:h-6 lg:w-6" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="lg:hidden">
								Discover
							</TooltipContent>
							<TooltipContent side="right" className="hidden lg:block">
								Discover
							</TooltipContent>
						</Tooltip>

						{/* Explorer */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => navigate('/explorer')}
									className={cn(
										'flex items-center justify-center rounded-full transition-all duration-200',
										'w-10 h-10 lg:w-12 lg:h-12',
										isActive('/explorer')
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
									)}
								>
									<FolderOpen className="h-5 w-5 lg:h-6 lg:w-6" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="lg:hidden">
								My Files
							</TooltipContent>
							<TooltipContent side="right" className="hidden lg:block">
								My Files
							</TooltipContent>
						</Tooltip>

						{/* Settings */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => navigate('/settings')}
									className={cn(
										'flex items-center justify-center rounded-full transition-all duration-200',
										'w-10 h-10 lg:w-12 lg:h-12',
										isActive('/settings')
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
									)}
								>
									<Settings className="h-5 w-5 lg:h-6 lg:w-6" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="lg:hidden">
								Settings
							</TooltipContent>
							<TooltipContent side="right" className="hidden lg:block">
								Settings
							</TooltipContent>
						</Tooltip>
					</div>
				</TooltipProvider>
			</nav>
		</div>
	);
}
