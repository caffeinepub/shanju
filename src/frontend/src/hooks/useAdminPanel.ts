import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Payment, WalletBalance, Transaction, UserProfile, PersonalAccount } from '../backend';
import { Principal } from '@dfinity/principal';

export function useAllPayments() {
  const { actor, isFetching } = useActor();

  return useQuery<Payment[]>({
    queryKey: ['admin', 'allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserAccount(principalString: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<{
    profile?: UserProfile;
    personalAccount?: PersonalAccount;
    walletBalances?: WalletBalance[];
    transactions?: Transaction[];
  } | null>({
    queryKey: ['admin', 'userAccount', principalString],
    queryFn: async () => {
      if (!actor || !principalString) return null;
      try {
        const principal = Principal.fromText(principalString);
        return actor.getUserAccount(principal);
      } catch (error) {
        throw new Error('Invalid principal format');
      }
    },
    enabled: !!actor && !isFetching && !!principalString,
    retry: false,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{
    principal: Principal;
    profile?: UserProfile;
    personalAccount?: PersonalAccount;
  }>>({
    queryKey: ['admin', 'allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}
