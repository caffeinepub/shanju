import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useCurrentPrincipal } from './useCurrentPrincipal';
import type { Payment, PaymentStatus } from '../backend';
import { Principal } from '@dfinity/principal';

export function useListPayments() {
  const { actor, isFetching: actorFetching } = useActor();
  const principal = useCurrentPrincipal();

  return useQuery<Payment[]>({
    queryKey: ['payments', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.listPaymentsForUser(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useGetPayment(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Payment | null>({
    queryKey: ['payment', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      try {
        return await actor.getPayment(id);
      } catch (error) {
        console.error('Error fetching payment:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payee,
      amount,
      currency,
      description,
    }: {
      payee: string;
      amount: bigint;
      currency: string;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const payeePrincipal = Principal.fromText(payee);
      return actor.createPayment(payeePrincipal, amount, currency, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: PaymentStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment'] });
    },
  });
}
