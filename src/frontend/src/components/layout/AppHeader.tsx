import { Link } from '@tanstack/react-router';
import ShanjuLogo from '../brand/ShanjuLogo';
import AuthStatus from '../auth/AuthStatus';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ShanjuLogo size={36} />
          <span className="text-xl font-semibold tracking-tight">Shanju</span>
        </Link>
        <AuthStatus />
      </div>
    </header>
  );
}

