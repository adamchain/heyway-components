// features/automations/hooks/useAutomationRuns.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AutomationsAPI } from '../api/automations.api';
import type { Automation } from '../types';

export function useAutomationStats(id?: string) {
  return useQuery<Automation>({
    queryKey: ['automation-stats', { id }],
    queryFn: () => {
      if (!id) throw new Error('id required');
      return AutomationsAPI.getById(id);
    },
    enabled: !!id,
    refetchInterval: 2000, // Poll every 2 seconds for live stats
    select: (data) => ({
      ...data,
      // Ensure stats exist
      stats: data.stats || {
        queued: 0,
        active: 0,
        completed: 0,
        failed: 0,
      }
    })
  });
}

export function useAutomationCalls(id?: string) {
  return useQuery({
    queryKey: ['automation-calls', { id }],
    queryFn: () => {
      if (!id) throw new Error('id required');
      return AutomationsAPI.getCalls(id);
    },
    enabled: !!id,
    refetchInterval: 3000, // Poll every 3 seconds for live call updates
  });
}

// Hook for managing real-time updates across all automations
export function useAutomationsRealTime() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['automations'] });
    queryClient.invalidateQueries({ queryKey: ['automation'] });
    queryClient.invalidateQueries({ queryKey: ['automation-stats'] });
    queryClient.invalidateQueries({ queryKey: ['automation-calls'] });
    queryClient.invalidateQueries({ queryKey: ['automation-contacts'] });
  };

  const invalidateAutomation = (id: string) => {
    queryClient.invalidateQueries({ queryKey: ['automation', { id }] });
    queryClient.invalidateQueries({ queryKey: ['automation-stats', { id }] });
    queryClient.invalidateQueries({ queryKey: ['automation-calls', { id }] });
    queryClient.invalidateQueries({ queryKey: ['automation-contacts', { id }] });
  };

  const updateAutomationStats = (id: string, stats: any) => {
    queryClient.setQueryData(['automation-stats', { id }], (oldData: any) => 
      oldData ? { ...oldData, stats } : null
    );
  };

  return {
    invalidateAll,
    invalidateAutomation,
    updateAutomationStats,
  };
}