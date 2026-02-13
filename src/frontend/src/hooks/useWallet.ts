import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { WalletBalance, Transaction, InternalTransferRequest, InternalTransferRequestByPhone, FundingRequest, CashOutRequest } from '../backend';
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

// Mutation: Process internal transfer by phone number
export function useProcessInternalTransferByPhone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transfer: InternalTransferRequestByPhone) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processInternalTransferByPhone(transfer);
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
      } else if (errorMessage.includes('does not exist') || errorMessage.includes('not found')) {
        toast.error('Recipient phone number not found. Please check the number and try again.');
      } else if (errorMessage.includes('Phone number cannot be empty') || errorMessage.includes('invalid')) {
        toast.error('Invalid phone number. Please enter a valid phone number.');
      } else if (errorMessage.includes('already in use') || errorMessage.includes('duplicate')) {
        toast.error('Phone number is associated with multiple accounts. Please contact support.');
      } else if (errorMessage.includes('Cannot transfer to yourself')) {
        toast.error('You cannot send money to yourself');
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

// Mutation: Start add money (initiate OTP flow)
export function useStartAddMoney() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (request: FundingRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.startAddMoney(request);
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to start add money';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated')) {
        toast.error('You need to be signed in to add money');
      } else if (errorMessage.includes('Card number is required') || errorMessage.includes('Card holder') || errorMessage.includes('CVV')) {
        toast.error('Please provide complete card details to fund your wallet');
      } else if (errorMessage.includes('Bank account number') || errorMessage.includes('Account holder') || errorMessage.includes('Bank name') || errorMessage.includes('Routing number')) {
        toast.error('Please provide complete bank account details to fund your wallet');
      } else if (errorMessage.includes('required')) {
        toast.error('All funding details are required. Please fill in all fields.');
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

// Mutation: Verify add money with OTP
export function useVerifyAddMoney() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ referenceId, otp }: { referenceId: bigint; otp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyAddMoney(referenceId, otp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
      toast.success('Money added successfully! Your wallet has been credited.');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to verify OTP';
      if (errorMessage.includes('Invalid OTP')) {
        toast.error('Invalid OTP code. Please check and try again.');
      } else if (errorMessage.includes('expired')) {
        toast.error('OTP has expired. Please request a new one.');
      } else if (errorMessage.includes('already completed') || errorMessage.includes('duplicate')) {
        toast.error('This transaction has already been completed.');
      } else if (errorMessage.includes('Invalid transaction reference')) {
        toast.error('Invalid transaction reference. Please start a new add money request.');
      } else if (errorMessage.includes('Unauthorized')) {
        toast.error('You are not authorized to verify this transaction.');
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

// Mutation: Resend add money OTP
export function useResendAddMoneyOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (referenceId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resendAddMoneyOtp(referenceId);
    },
    onSuccess: () => {
      toast.success('OTP resent successfully. Please check your bank notification.');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to resend OTP';
      if (errorMessage.includes('Invalid transaction reference') || errorMessage.includes('expired')) {
        toast.error('Transaction reference is invalid or expired. Please start a new add money request.');
      } else if (errorMessage.includes('Unauthorized')) {
        toast.error('You are not authorized to resend OTP for this transaction.');
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
