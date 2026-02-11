import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AppHeader from './AppHeader';
import { Home, Plus, History, Plug, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function AppLayout() {
  const { identity } = useInternetIdentity();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const protectedPaths = ['/dashboard', '/create-payment', '/history', '/payment', '/integrations', '/personal-account'];
  const isProtectedRoute = protectedPaths.some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    if (isProtectedRoute && !isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isProtectedRoute, isAuthenticated, navigate]);

  const showNavigation = isAuthenticated && location.pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      {showNavigation && (
        <nav className="border-b bg-card">
          <div className="container">
            <div className="flex gap-1 py-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                to="/create-payment"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Payment</span>
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
              <Link
                to="/integrations"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
              >
                <Plug className="h-4 w-4" />
                <span className="hidden sm:inline">Integrations</span>
              </Link>
              <Link
                to="/personal-account"
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
                activeProps={{ className: 'bg-accent text-accent-foreground' }}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Personal Account</span>
              </Link>
            </div>
          </div>
        </nav>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 bg-card">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'shanju-app'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
