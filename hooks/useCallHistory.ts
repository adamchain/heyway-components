import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const useCallHistory = () => {
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>('all');
  const [hasMore, setHasMore] = useState(true);

  const loadCallHistory = useCallback(async (loadMore: boolean = false) => {
    if (loadMore && !hasMore) return;

    setIsLoading(!loadMore);
    try {
      const offset = loadMore ? callHistory.length : 0;
      const limit = 100; // Increase batch size
      const response = await apiService.getCallHistory(limit, offset);

      // Map each call to include a 'direction' field for filtering
      const mapped = Array.isArray(response)
        ? response.map(call => ({
          ...call,
          direction: call.isInbound === true || call.isInbound === 'true' ? 'received' : 'sent',
        }))
        : [];

      if (loadMore) {
        setCallHistory(prev => [...prev, ...mapped]);
      } else {
        setCallHistory(mapped);
      }

      // Check if we have more data
      setHasMore(mapped.length === limit);
    } catch (error) {
      console.error('Error loading call history:', error);
      if (!loadMore) setCallHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [callHistory.length, hasMore]);

  const refreshCallHistory = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCallHistory();
    } finally {
      setRefreshing(false);
    }
  }, [loadCallHistory]);

  // Auto-load call history on mount
  useEffect(() => {
    loadCallHistory();
  }, []);

  const filteredCallHistory = callHistory.filter(call => {
    if (filterType === 'all') return true;
    return call.direction === filterType;
  });

  return {
    callHistory: filteredCallHistory,
    selectedCall,
    isLoading,
    refreshing,
    filterType,
    hasMore,
    setSelectedCall,
    setFilterType,
    loadCallHistory,
    loadMoreCallHistory: () => loadCallHistory(true),
    refreshCallHistory,
  };
};