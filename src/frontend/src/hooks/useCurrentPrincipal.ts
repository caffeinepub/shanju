import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@dfinity/principal';

export function useCurrentPrincipal(): Principal | null {
  const { identity } = useInternetIdentity();
  
  if (!identity) {
    return null;
  }
  
  const principal = identity.getPrincipal();
  return principal.isAnonymous() ? null : principal;
}

