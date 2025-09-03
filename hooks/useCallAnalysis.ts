import { useState, useCallback, useEffect, useMemo } from 'react';
import { callAnalysisService, type CallAnalysis } from '@/services/callAnalysisService';
import { apiService } from '../services/apiService';

export const useCallAnalysis = (calls: any[] = []) => {
  const [analyses, setAnalyses] = useState<Map<string, CallAnalysis>>(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze calls when they change - now with persistence
  const analyzeCalls = useCallback(async (callsToAnalyze: any[]) => {
    if (!callsToAnalyze || callsToAnalyze.length === 0) {
      setAnalyses(new Map());
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysesToSave: any[] = [];
      const newAnalyses = new Map<string, CallAnalysis>();

      // Process each call
      for (const call of callsToAnalyze) {
        const callId = call.id || call.callId || call._id;
        if (!callId) continue;

        // Check if we already have analysis from the database
        if (call.analysis && call.analysis.category && call.analysis.analyzedAt) {
          // Use existing analysis from database
          newAnalyses.set(callId, call.analysis);
        } else {
          // Generate new analysis if not found
          const analysis = callAnalysisService.analyzeCall(call);
          if (analysis) {
            newAnalyses.set(callId, analysis);
            analysesToSave.push({
              callId,
              ...analysis
            });
          }
        }
      }

      // Save new analyses to database in batch
      if (analysesToSave.length > 0) {
        try {
          await apiService.bulkSaveCallAnalyses(analysesToSave);
          console.log(`✅ Saved ${analysesToSave.length} new call analyses to database`);
        } catch (saveError) {
          console.error('Failed to save analyses to database:', saveError);
          // Continue with local analysis even if save fails
        }
      }

      setAnalyses(newAnalyses);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Failed to analyze calls:', error);
      setIsAnalyzing(false);
    }
  }, []);

  // Analyze a single call
  const analyzeCall = useCallback((call: any): CallAnalysis | null => {
    const callId = call.id || call.callId || call._id;
    if (!callId) return null;

    try {
      const analysis = callAnalysisService.analyzeCall(call);
      if (analysis) {
        setAnalyses(prev => {
          const newMap = new Map(prev);
          newMap.set(callId, analysis);
          return newMap;
        });
        return analysis;
      }
      return null;
    } catch (error) {
      console.error('Failed to analyze call:', error);
      return null;
    }
  }, []);

  // Get analysis for a specific call
  const getCallAnalysis = useCallback((call: any): CallAnalysis | null => {
    const callId = call.id || call.callId || call._id;
    if (!callId) return null;

    return analyses.get(callId) || null;
  }, [analyses]);

  // Auto-analyze when calls change
  useEffect(() => {
    if (calls.length > 0) {
      analyzeCalls(calls);
    }
  }, [calls]);

  // Summary statistics
  const stats = useMemo(() => {
    const analysisArray = Array.from(analyses.values());
    const total = analysisArray.length;

    if (total === 0) {
      return {
        total: 0,
        good: 0,
        bad: 0,
        opportunity: 0,
        needFollowUp: 0,
        averageScore: 0
      };
    }

    const good = analysisArray.filter(a => a.category === 'good').length;
    const bad = analysisArray.filter(a => a.category === 'bad').length;
    const opportunity = analysisArray.filter(a => a.category === 'opportunity').length;
    const needFollowUp = analysisArray.filter(a => a.followUpNeeded).length;
    const averageScore = Math.round(
      analysisArray.reduce((sum, a) => sum + a.score, 0) / total
    );

    return {
      total,
      good,
      bad,
      opportunity,
      needFollowUp,
      averageScore
    };
  }, [analyses]);

  // Filter calls by category
  const filterCallsByCategory = useCallback((
    callsToFilter: any[],
    category: 'good' | 'bad' | 'opportunity' | 'follow-up'
  ) => {
    return callsToFilter.filter(call => {
      const callId = call.id || call.callId || call._id;
      if (!callId) return false;

      const analysis = analyses.get(callId);
      if (!analysis) return false;

      if (category === 'follow-up') {
        return analysis.followUpNeeded;
      }

      return analysis.category === category;
    });
  }, [analyses]);

  return {
    analyses,
    isAnalyzing,
    stats,
    analyzeCalls,
    analyzeCall,
    getCallAnalysis,
    filterCallsByCategory
  };
};