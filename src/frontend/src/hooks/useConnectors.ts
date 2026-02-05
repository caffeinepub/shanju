import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PlatformConnection, PlatformType } from '../backend';

export function useListConnectors() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PlatformConnection[]>({
    queryKey: ['connectors'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerConnections();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetConnector(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PlatformConnection | null>({
    queryKey: ['connector', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      try {
        return await actor.getConnection(id);
      } catch (error) {
        console.error('Error fetching connector:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useCreateConnector() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      platformType,
      apiKey,
      apiSecret,
    }: {
      name: string;
      platformType: PlatformType;
      apiKey: string;
      apiSecret: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createConnection(name, platformType, apiKey, apiSecret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
}

export function useUpdateConnector() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      platformType,
      apiKey,
      apiSecret,
    }: {
      id: bigint;
      name: string;
      platformType: PlatformType;
      apiKey: string;
      apiSecret: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateConnection(id, name, platformType, apiKey, apiSecret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connector'] });
    },
  });
}

export function useDeleteConnector() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteConnection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
}
