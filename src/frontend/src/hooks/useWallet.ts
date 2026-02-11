import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { WalletBalance, Transaction, InternalTransferRequest, FundingRequest, CashOutRequest } from '../backend';
import { toast } from 'sonner';

// Query: Get caller's wallet balance
export function useGetCallerWalletBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<WalletBalance[]>({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerWalletBalance();
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

// Query: Get caller's transaction history
export function useGetCallerTransactionHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Transaction[]>({
    queryKey: ['transactionHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerTransactionHistory();
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

// Mutation: Process internal transfer (Send Money)
export function useProcessInternalTransfer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transfer: InternalTransferRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processInternalTransfer(transfer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      toast.success('Money sent successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to send money';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated')) {
        toast.error('You need to be signed in to send money');
      } else if (errorMessage.includes('Insufficient funds')) {
        toast.error('Insufficient funds for this transfer');
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

// Mutation: Process add money (Funding)
export function useProcessAddMoney() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: FundingRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processAddMoney(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      toast.success('Money added successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to add money';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated')) {
        toast.error('You need to be signed in to add money');
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

// Mutation: Process cash out
export function useProcessCashOut() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CashOutRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processCashOut(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      toast.success('Cash out request submitted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to process cash out';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated')) {
        toast.error('You need to be signed in to cash out');
      } else if (errorMessage.includes('Insufficient funds')) {
        toast.error('Insufficient funds for this cash out');
      } else {
        toast.error(errorMessage);
      }
    },
  });
}
