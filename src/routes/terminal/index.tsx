import { useState } from 'react';
import { Terminal as TerminalIcon, ExternalLink, Settings, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Navigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Cloudflare Access SSH URL for voither.com
const DEFAULT_SSH_URL = 'https://ssh.voither.com';

export default function TerminalPage() {
	const { user, isLoading: authLoading } = useAuth();
	const [sshUrl, setSshUrl] = useState(() => {
		return localStorage.getItem('terminal_ssh_url') || DEFAULT_SSH_URL;
	});
	const [inputUrl, setInputUrl] = useState(sshUrl);
	const [isConfiguring, setIsConfiguring] = useState(!sshUrl);
	const [isConnecting, setIsConnecting] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);

	if (authLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	const handleSaveUrl = () => {
		if (inputUrl.trim()) {
			localStorage.setItem('terminal_ssh_url', inputUrl.trim());
			setSshUrl(inputUrl.trim());
			setIsConfiguring(false);
			setConnectionError(null);
		}
	};

	const handleConnect = () => {
		setIsConnecting(true);
		setConnectionError(null);
		// Small delay to show loading state
		setTimeout(() => {
			setIsConnecting(false);
		}, 500);
	};

	const handleIframeError = () => {
		setConnectionError('Failed to connect. Check if Cloudflare Access is configured correctly.');
	};

	// Configuration screen
	if (isConfiguring || !sshUrl) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="max-w-md w-full space-y-6">
					<div className="text-center space-y-2">
						<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
							<TerminalIcon className="h-8 w-8 text-muted-foreground" />
						</div>
						<h1 className="text-2xl font-bold">SSH Terminal</h1>
						<p className="text-muted-foreground">
							Connect to your machine via Cloudflare Access SSH
						</p>
					</div>

					<div className="neomorph-card p-6 space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Cloudflare Access SSH URL</label>
							<Input
								type="url"
								placeholder="https://ssh.yourdomain.com"
								value={inputUrl}
								onChange={(e) => setInputUrl(e.target.value)}
								className="font-mono text-sm"
							/>
							<p className="text-xs text-muted-foreground">
								Enter your Cloudflare Access browser-rendered SSH URL
							</p>
						</div>

						<Button
							onClick={handleSaveUrl}
							disabled={!inputUrl.trim()}
							className="w-full"
						>
							Save and Connect
						</Button>
					</div>

					<div className="text-center">
						<details className="text-left">
							<summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
								How to set up Cloudflare Access SSH
							</summary>
							<div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm space-y-3">
								<p><strong>1. Install cloudflared on your Mac:</strong></p>
								<pre className="bg-background p-2 rounded text-xs overflow-x-auto">
									brew install cloudflared
								</pre>

								<p><strong>2. Login to Cloudflare:</strong></p>
								<pre className="bg-background p-2 rounded text-xs overflow-x-auto">
									cloudflared login
								</pre>

								<p><strong>3. Create a tunnel:</strong></p>
								<pre className="bg-background p-2 rounded text-xs overflow-x-auto">
{`cloudflared tunnel create my-mac
cloudflared tunnel route dns my-mac ssh.yourdomain.com`}
								</pre>

								<p><strong>4. Configure the tunnel (~/.cloudflared/config.yml):</strong></p>
								<pre className="bg-background p-2 rounded text-xs overflow-x-auto">
{`tunnel: <TUNNEL_ID>
credentials-file: ~/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: ssh.yourdomain.com
    service: ssh://localhost:22
  - service: http_status:404`}
								</pre>

								<p><strong>5. Run the tunnel:</strong></p>
								<pre className="bg-background p-2 rounded text-xs overflow-x-auto">
									cloudflared tunnel run my-mac
								</pre>

								<p><strong>6. Configure Access Application:</strong></p>
								<ul className="list-disc pl-4 space-y-1">
									<li>Go to Cloudflare Zero Trust Dashboard</li>
									<li>Access {'>'} Applications {'>'} Add Application</li>
									<li>Select "Self-hosted"</li>
									<li>Set domain to ssh.yourdomain.com</li>
									<li>Enable "Browser rendering" for SSH</li>
									<li>Configure authentication policy</li>
								</ul>
							</div>
						</details>
					</div>
				</div>
			</div>
		);
	}

	// Terminal view with iframe
	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-2 border-b bg-card/50 backdrop-blur-sm">
				<div className="flex items-center gap-3">
					<TerminalIcon className="h-5 w-5 text-accent" />
					<span className="font-medium">SSH Terminal</span>
					<span className="text-xs text-muted-foreground font-mono truncate max-w-[200px] lg:max-w-none">
						{sshUrl}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => window.open(sshUrl, '_blank')}
						title="Open in new tab"
					>
						<ExternalLink className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsConfiguring(true)}
						title="Configure SSH URL"
					>
						<Settings className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Terminal iframe */}
			<div className="flex-1 relative">
				{isConnecting && (
					<div className="absolute inset-0 flex items-center justify-center bg-background z-10">
						<div className="text-center space-y-4">
							<Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
							<p className="text-muted-foreground">Connecting to SSH...</p>
						</div>
					</div>
				)}

				{connectionError && (
					<div className="absolute inset-0 flex items-center justify-center bg-background z-10">
						<div className="text-center space-y-4 max-w-md">
							<AlertCircle className="h-12 w-12 mx-auto text-destructive" />
							<p className="text-destructive font-medium">{connectionError}</p>
							<div className="flex gap-2 justify-center">
								<Button onClick={handleConnect} variant="default">
									Retry
								</Button>
								<Button onClick={() => setIsConfiguring(true)} variant="outline">
									Configure
								</Button>
							</div>
						</div>
					</div>
				)}

				<iframe
					src={sshUrl}
					className={cn(
						"w-full h-full border-0",
						(isConnecting || connectionError) && "invisible"
					)}
					title="SSH Terminal"
					onLoad={() => setIsConnecting(false)}
					onError={handleIframeError}
					allow="clipboard-read; clipboard-write"
					sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
				/>
			</div>
		</div>
	);
}
