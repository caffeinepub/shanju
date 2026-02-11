import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PersonalAccount } from '../backend';

// Helper to create a complete PersonalAccount with all required fields
export function createEmptyPersonalAccount(): PersonalAccount {
  return {
    fullName: '',
    address: '',
    email: '',
    phone: '',
    taxId: '',
    password: '',
    nid: '',
  };
}

// Helper to normalize PersonalAccount data ensuring all fields exist
export function normalizePersonalAccount(account: PersonalAccount | null): PersonalAccount {
  if (!account) {
    return createEmptyPersonalAccount();
  }
  return {
    fullName: account.fullName || '',
    address: account.address || '',
    email: account.email || '',
    phone: account.phone || '',
    taxId: account.taxId || '',
    password: account.password || '',
    nid: account.nid || '',
  };
}

export function useGetCallerPersonalAccount() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<PersonalAccount | null>({
    queryKey: ['currentPersonalAccount'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerPersonalAccount();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerPersonalAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: PersonalAccount) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerPersonalAccount(account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPersonalAccount'] });
    },
  });
}
