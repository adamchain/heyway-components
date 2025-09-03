import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService';
import type { Automation } from '@/components/CreateAutomationModal';

interface UseRealTimeAutomationsOptions {
  enabled?: boolean;
  pollingInterval?: number;
  onUpdate?: (automations: Automation[]) => void;
}

interface UseRealTimeAutomationsReturn {
  automations: Automation[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
}

export const useRealTimeAutomations = ({
  enabled = true,
  pollingInterval = 5000, // 5 seconds
  onUpdate
}: UseRealTimeAutomationsOptions = {}): UseRealTimeAutomationsReturn => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const pollingRef = useRef<any>(null);
  const isActiveRef = useRef(true);
  const lastDataHash = useRef<string>('');

  // Hash function to detect changes in automation data
  const hashAutomations = useCallback((automations: Automation[]): string => {
    const relevantData = automations.map(auto => ({
      id: auto.id || (auto as any)._id,
      name: auto.name,
      isActive: auto.isActive,
      contactsCount: auto.contactsCount,
      completedCount: auto.completedCount,
      pendingCount: auto.pendingCount,
      lastRun: auto.lastRun,
      nextRun: auto.nextRun
    }));
    return JSON.stringify(relevantData);
  }, []);

  // Fetch automations data
  const fetchAutomations = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      }
      setError(null);

      console.log('🔄 Fetching automations (real-time)...');
      const fetchedAutomations = await apiService.getAutomations();

      // Map _id to id for consistency
      const normalizedAutomations = fetchedAutomations.map(automation => ({
        ...automation,
        id: (automation as any)._id || automation.id
      }));

      const dataHash = hashAutomations(normalizedAutomations);

      // Only update if data has changed
      if (dataHash !== lastDataHash.current) {
        console.log('✅ Automations data changed, updating UI');
        setAutomations(normalizedAutomations);
        setLastUpdated(new Date());
        lastDataHash.current = dataHash;

        // Call onUpdate callback if provided
        if (onUpdate) {
          onUpdate(normalizedAutomations);
        }
      } else {
        console.log('📋 Automations data unchanged');
      }
    } catch (error) {
      console.error('❌ Failed to fetch automations (real-time):', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch automations');
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  }, [hashAutomations, onUpdate]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    if (!enabled) {
      console.log('⏸️ Real-time polling disabled');
      return;
    }

    console.log(`🔄 Starting real-time polling (interval: ${pollingInterval}ms)`);

    pollingRef.current = setInterval(() => {
      if (isActiveRef.current && document.visibilityState === 'visible') {
        fetchAutomations(false);
      }
    }, pollingInterval);
  }, [enabled, pollingInterval, fetchAutomations]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      console.log('⏹️ Stopping real-time polling');
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchAutomations(false);
  }, [fetchAutomations]);

  // Initial load and setup
  useEffect(() => {
    isActiveRef.current = true;
    fetchAutomations(true);
    startPolling();

    return () => {
      isActiveRef.current = false;
      stopPolling();
    };
  }, [fetchAutomations, startPolling, stopPolling]);

  // Handle visibility changes - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible, resuming real-time polling');
        // Fetch immediately when tab becomes visible
        fetchAutomations(false);
        startPolling();
      } else {
        console.log('👁️ Tab hidden, pausing real-time polling');
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAutomations, startPolling, stopPolling]);

  // Handle page focus/blur for additional efficiency
  useEffect(() => {
    const handleFocus = () => {
      isActiveRef.current = true;
      fetchAutomations(false);
    };

    const handleBlur = () => {
      isActiveRef.current = false;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [fetchAutomations]);

  return {
    automations,
    isLoading,
    error,
    lastUpdated,
    refresh,
    setAutomations
  };
};