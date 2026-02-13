import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useUserProfile';
import { useIsAdmin } from '../../hooks/useAdmin';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, UserCircle, Shield } from 'lucide-react';

export default function AuthStatus() {
  const { identity, clear, isLoggingIn } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handlePersonalAccount = () => {
    navigate({ to: '/personal-account' });
  };

  const handleAdminPanel = () => {
    navigate({ to: '/admin' });
  };

  const displayName = userProfile?.name || identity.getPrincipal().toString().slice(0, 8) + '...';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" disabled={isLoggingIn}>
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePersonalAccount}>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Personal Account</span>
        </DropdownMenuItem>
        {!isAdminLoading && isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAdminPanel}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
