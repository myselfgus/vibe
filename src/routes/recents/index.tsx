import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useRecentApps, useFavoriteApps } from '@/hooks/use-apps';
import { formatDistanceToNow, isValid } from 'date-fns';
import { Lock, Globe, Users2, Bookmark, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface App {
	id: string;
	title: string;
	framework?: string | null;
	updatedAt: Date | null;
	updatedAtFormatted?: string;
	visibility: 'private' | 'team' | 'board' | 'public';
	isFavorite?: boolean;
}

function AppCard({ app, onClick }: { app: App; onClick: (id: string) => void }) {
	const formatTimestamp = () => {
		if (app.updatedAtFormatted) return app.updatedAtFormatted;
		if (app.updatedAt && isValid(app.updatedAt)) {
			return formatDistanceToNow(app.updatedAt, { addSuffix: true });
		}
		return 'Recently';
	};

	const getVisibilityIcon = (visibility: App['visibility']) => {
		switch (visibility) {
			case 'private':
				return <Lock className="h-3 w-3" />;
			case 'team':
				return <Users2 className="h-3 w-3" />;
			case 'board':
			case 'public':
				return <Globe className="h-3 w-3" />;
		}
	};

	return (
		<motion.button
			onClick={() => onClick(app.id)}
			className={cn(
				'w-full text-left p-4 rounded-xl border border-border',
				'bg-card/50 hover:bg-card/80 transition-all duration-200',
				'hover:shadow-md hover:border-border-primary'
			)}
			whileHover={{ scale: 1.01 }}
			whileTap={{ scale: 0.99 }}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						{app.isFavorite && (
							<Bookmark className="h-4 w-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
						)}
						<h3 className="font-medium text-foreground truncate">
							{app.title}
						</h3>
						<span className="text-muted-foreground flex-shrink-0">
							{getVisibilityIcon(app.visibility)}
						</span>
					</div>
					<p className="text-sm text-muted-foreground mt-1">
						{formatTimestamp()}
					</p>
				</div>
				{app.framework && (
					<span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
						{app.framework}
					</span>
				)}
			</div>
		</motion.button>
	);
}

export default function RecentsPage() {
	const navigate = useNavigate();
	const { apps: recentApps, loading: loadingRecent } = useRecentApps();
	const { apps: favoriteApps, loading: loadingFavorites } = useFavoriteApps();

	const handleAppClick = (appId: string) => {
		navigate(`/app/${appId}`);
	};

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
						<div className="flex items-center gap-3 mb-3">
							<Clock className="h-8 w-8 text-accent" />
							<h1 className="text-4xl font-bold font-[departureMono] text-accent">
								RECENTS
							</h1>
						</div>
						<p className="text-text-tertiary text-lg">
							Your recently accessed apps
						</p>
					</div>

					{/* Favorites Section */}
					{favoriteApps.length > 0 && (
						<div className="mb-8">
							<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
								<Bookmark className="h-5 w-5 fill-yellow-500 text-yellow-500" />
								Bookmarked
							</h2>
							<div className="grid gap-3">
								{loadingFavorites ? (
									<div className="text-muted-foreground">Loading...</div>
								) : (
									favoriteApps.map((app) => (
										<AppCard
											key={app.id}
											app={app}
											onClick={handleAppClick}
										/>
									))
								)}
							</div>
						</div>
					)}

					{/* Recent Apps Section */}
					<div>
						<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
							<Clock className="h-5 w-5 text-muted-foreground" />
							Recent
						</h2>
						<div className="grid gap-3">
							{loadingRecent ? (
								<div className="text-muted-foreground">Loading...</div>
							) : recentApps.length > 0 ? (
								recentApps.map((app) => (
									<AppCard
										key={app.id}
										app={app}
										onClick={handleAppClick}
									/>
								))
							) : (
								<div className="text-center py-12 text-muted-foreground">
									<Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>No recent apps yet</p>
									<p className="text-sm mt-2">Start building to see your apps here</p>
								</div>
							)}
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
