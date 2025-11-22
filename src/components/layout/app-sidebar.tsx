import {
	Settings,
	Plus,
	Search,
	Compass,
	Clock,
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
		<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
			<nav className="flex items-center gap-1 px-2 py-2 bg-card/95 backdrop-blur-md border border-border rounded-full shadow-lg">
				<TooltipProvider delayDuration={0}>
					{/* Section 1: Actions */}
					<div className="flex items-center gap-1">
						{/* New Build */}
						{pathname !== '/' && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={() => navigate('/')}
										className={cn(
											'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
											'bg-accent text-white hover:bg-accent/90 shadow-metallic'
										)}
									>
										<Plus className="h-5 w-5" />
									</button>
								</TooltipTrigger>
								<TooltipContent side="top">
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
										'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
										isActive('/recents')
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
									)}
								>
									<Clock className="h-5 w-5" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top">
								Recents
							</TooltipContent>
						</Tooltip>

						{/* Search/Apps */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => navigate('/apps')}
									className={cn(
										'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
										isActive('/apps')
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
									)}
								>
									<Search className="h-5 w-5" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top">
								Search apps
							</TooltipContent>
						</Tooltip>
					</div>

					{/* Separator */}
					<div className="w-px h-6 bg-border mx-1" />

					{/* Section 2: Navigation */}
					<div className="flex items-center gap-1">
						{/* Discover */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => navigate('/discover')}
									className={cn(
										'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
										isActive('/discover')
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
									)}
								>
									<Compass className="h-5 w-5" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top">
								Discover
							</TooltipContent>
						</Tooltip>

						{/* Settings */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => navigate('/settings')}
									className={cn(
										'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
										isActive('/settings')
											? 'bg-muted text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
									)}
								>
									<Settings className="h-5 w-5" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top">
								Settings
							</TooltipContent>
						</Tooltip>
					</div>
				</TooltipProvider>
			</nav>
		</div>
	);
}
