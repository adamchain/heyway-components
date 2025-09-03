import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

export const useScheduledCalls = () => {
  const [scheduledCalls, setScheduledCalls] = useState<any[]>([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);

  const loadScheduledCalls = useCallback(async () => {
    setIsLoadingScheduled(true);
    try {
      const response = await apiService.getScheduledCalls();
      setScheduledCalls(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading scheduled calls:', error);
    } finally {
      setIsLoadingScheduled(false);
    }
  }, []);

  return {
    scheduledCalls,
    isLoadingScheduled,
    loadScheduledCalls,
    setScheduledCalls,
  };
};