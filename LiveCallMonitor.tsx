/*
 * ENHANCED LIVE CALL MONITOR
 * - Improved UI with minimalist design
 * - Fixed transcript display with user/AI distinction
 * - Real-time updates with WebSocket integration
 * - Better error handling and loading states
 * - Optimized performance and memory management
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageCircle,
  Clock,
  Users,
  X,
  Zap,
  History
} from 'lucide-react-native';
import { websocketService } from '@/services/websocketService';
import { useRouter } from 'expo-router';

interface LiveCallMonitorProps {
  visible: boolean;
  onClose: () => void;
  callId: string;
  sessionId: string;
  recipients: string[];
  callMode: 'intro+ai' | 'ai-only';
  notes: string;
}

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  confidence?: number;
}

interface CallMetrics {
  duration: number;
  messagesExchanged: number;
  lastActivity: string;
  connectionStatus: 'connecting' | 'connected' | 'active' | 'ended' | 'error';
}

export default function LiveCallMonitor({
  visible,
  onClose,
  callId,
  sessionId,
  recipients,
  callMode,
  notes
}: LiveCallMonitorProps) {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [callMetrics, setCallMetrics] = useState<CallMetrics>({
    duration: 0,
    messagesExchanged: 0,
    lastActivity: new Date().toISOString(),
    connectionStatus: 'connecting'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Router for navigation
  const router = useRouter();

  // Refs for cleanup and performance
  const durationIntervalRef = useRef<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Memoized handlers to prevent unnecessary re-renders
  const handleTranscriptUpdate = useCallback((message: TranscriptMessage) => {
    setTranscript(prev => [...prev, message]);
    setCallMetrics(prev => ({
      ...prev,
      messagesExchanged: prev.messagesExchanged + 1,
      lastActivity: message.timestamp,
      connectionStatus: 'active'
    }));

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const addTranscriptMessage = useCallback((message: Omit<TranscriptMessage, 'id'>) => {
    const newMessage: TranscriptMessage = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    handleTranscriptUpdate(newMessage);
  }, [handleTranscriptUpdate]);

  // Initialize call monitoring
  const initializeCallMonitoring = useCallback(async () => {
    try {
      setError(null);
      setCallMetrics(prev => ({ ...prev, connectionStatus: 'connecting' }));
      startTimeRef.current = Date.now();

      // Connect to WebSocket and join call room
      if (!websocketService.getIsConnected()) {
        await websocketService.connectToWebSocket();
      }
      await websocketService.joinCallRoom(callId, sessionId);

      setIsConnected(true);
      setCallMetrics(prev => ({ ...prev, connectionStatus: 'connected' }));

      // Set up WebSocket event listeners
      setupWebSocketListeners();

      // Add pre-set system messages before connection
      addTranscriptMessage({
        speaker: 'system',
        text: 'Gathering the details...',
        timestamp: new Date().toISOString()
      });

      // Simulate a brief delay for realistic feel
      setTimeout(() => {
        addTranscriptMessage({
          speaker: 'system',
          text: 'Dialing...',
          timestamp: new Date().toISOString()
        });
      }, 800);

      setTimeout(() => {
        addTranscriptMessage({
          speaker: 'system',
          text: `Call initiated to ${recipients.length} recipient(s) using ${callMode} mode`,
          timestamp: new Date().toISOString()
        });

        if (notes) {
          addTranscriptMessage({
            speaker: 'system',
            text: `AI Instructions: ${notes}`,
            timestamp: new Date().toISOString()
          });
        }
      }, 1500);

      // Start duration timer
      durationIntervalRef.current = window.setInterval(() => {
        setCallMetrics(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }));
      }, 1000);

    } catch (error) {
      console.error('Failed to initialize call monitoring:', error);
      setError('Failed to connect to call monitoring');
      setCallMetrics(prev => ({ ...prev, connectionStatus: 'error' }));
    }
  }, [callId, sessionId, recipients, callMode, notes, addTranscriptMessage]);

  const setupWebSocketListeners = useCallback(() => {
    // Listen for live transcription updates
    const handleLiveTranscript = (data: any) => {
      console.log('📝 Live transcript received:', data);

      if (data.text && data.speaker) {
        addTranscriptMessage({
          speaker: data.speaker,
          text: data.text,
          timestamp: data.timestamp || new Date().toISOString(),
          confidence: data.confidence
        });
      }
    };

    const handleCallStatusUpdate = (data: any) => {
      console.log('📞 Call status update:', data);

      if (data.status === 'completed' || data.status === 'ended') {
        setCallMetrics(prev => ({ ...prev, connectionStatus: 'ended' }));
        addTranscriptMessage({
          speaker: 'system',
          text: 'Call ended',
          timestamp: new Date().toISOString()
        });

        // Stop duration timer
        if (durationIntervalRef.current) {
          window.clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      }
    };

    const handleBridgeStatus = (data: any) => {
      console.log('🌉 Bridge status update:', data);

      if (data.status) {
        addTranscriptMessage({
          speaker: 'system',
          text: `Bridge status: ${data.status}`,
          timestamp: data.timestamp || new Date().toISOString()
        });
      }
    };

    const handleConversationEnded = (data: any) => {
      console.log('🔚 Conversation ended:', data);

      setCallMetrics(prev => ({ ...prev, connectionStatus: 'ended' }));
      addTranscriptMessage({
        speaker: 'system',
        text: `Conversation completed. Duration: ${data.duration || 'unknown'}`,
        timestamp: new Date().toISOString()
      });

      // Stop duration timer
      if (durationIntervalRef.current) {
        window.clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
      setError('Connection lost. Attempting to reconnect...');
      setCallMetrics(prev => ({ ...prev, connectionStatus: 'error' }));
    };

    // Register event listeners (cover multiple server event names)
    websocketService.on('transcription-update', handleLiveTranscript);
    websocketService.on('transcription', handleLiveTranscript);
    websocketService.on('live_transcript', handleLiveTranscript);
    websocketService.on('call-status', handleCallStatusUpdate);
    websocketService.on('call-status-update', handleCallStatusUpdate);
    websocketService.on('bridge_status', handleBridgeStatus);
    websocketService.on('conversation-ended', handleConversationEnded);
    websocketService.on('error', handleError);

    // Return cleanup function
    return () => {
      websocketService.off('transcription-update', handleLiveTranscript);
      websocketService.off('transcription', handleLiveTranscript);
      websocketService.off('live_transcript', handleLiveTranscript);
      websocketService.off('call-status', handleCallStatusUpdate);
      websocketService.off('call-status-update', handleCallStatusUpdate);
      websocketService.off('bridge_status', handleBridgeStatus);
      websocketService.off('conversation-ended', handleConversationEnded);
      websocketService.off('error', handleError);
    };
  }, [addTranscriptMessage]);

  const cleanup = useCallback(async () => {
    if (isConnected && callId && sessionId) {
      try {
        await websocketService.leaveCallRoom(callId, sessionId);
      } catch (error) {
        console.error('Error leaving call room:', error);
      }
    }

    // Clear duration timer
    if (durationIntervalRef.current) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setIsConnected(false);
  }, [isConnected, callId, sessionId]);

  // Handle navigation to activity/history page
  const navigateToActivity = useCallback(async () => {
    // Close the monitor first
    onClose();
    
    // Small delay to ensure modal closes, then navigate
    setTimeout(() => {
      router.push('/(tabs)/history');
    }, 100);
  }, [onClose, router]);

  // Main effect for initializing and cleaning up
  useEffect(() => {
    if (visible && callId && sessionId) {
      initializeCallMonitoring();
    }

    return () => {
      cleanup();
    };
  }, [visible, callId, sessionId, initializeCallMonitoring, cleanup]);

  // Utility functions
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getStatusColor = useCallback(() => {
    switch (callMetrics.connectionStatus) {
      case 'connected':
      case 'active':
        return '#000000';
      case 'connecting':
        return '#666666';
      case 'ended':
        return '#999999';
      case 'error':
        return '#000000';
      default:
        return '#999999';
    }
  }, [callMetrics.connectionStatus]);

  const getStatusText = useCallback(() => {
    switch (callMetrics.connectionStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'active':
        return 'Active Conversation';
      case 'ended':
        return 'Call Ended';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  }, [callMetrics.connectionStatus]);

  const getSpeakerIcon = useCallback((speaker: string) => {
    switch (speaker) {
      case 'agent':
        return <Zap size={16} color="#000000" />;
      case 'user':
        return <Users size={16} color="#000000" />;
      case 'system':
        return <MessageCircle size={16} color="#666666" />;
      default:
        return <MessageCircle size={16} color="#666666" />;
    }
  }, []);

  const getSpeakerName = useCallback((speaker: string) => {
    switch (speaker) {
      case 'agent':
        return 'HeyWay';
      case 'user':
        return 'Recipient';
      case 'system':
        return 'System';
      default:
        return 'Unknown';
    }
  }, []);

  const renderTranscriptMessage = useCallback((message: TranscriptMessage) => (
    <View
      key={message.id}
      style={[
        styles.transcriptMessage,
        message.speaker === 'user' && styles.userMessage
      ]}
    >
      <View style={styles.messageHeader}>
        <View style={styles.speakerInfo}>
          {getSpeakerIcon(message.speaker)}
          <Text style={[
            styles.speakerName,
            message.speaker === 'user' && styles.userSpeakerName
          ]}>
            {getSpeakerName(message.speaker)}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          message.speaker === 'user' && styles.userMessageTime
        ]}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={[
        styles.messageText,
        message.speaker === 'user' && styles.userMessageText
      ]}>
        {message.text}
      </Text>
      {message.confidence && (
        <Text style={[
          styles.confidenceText,
          message.speaker === 'user' && styles.userConfidenceText
        ]}>
          Confidence: {Math.round(message.confidence * 100)}%
        </Text>
      )}
    </View>
  ), [getSpeakerIcon, getSpeakerName]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Call Monitor</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Call Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            <View style={styles.metricsContainer}>
              <View style={styles.metric}>
                <Clock size={16} color="#666666" />
                <Text style={styles.metricText}>{formatDuration(callMetrics.duration)}</Text>
              </View>
              <View style={styles.metric}>
                <MessageCircle size={16} color="#666666" />
                <Text style={styles.metricText}>{callMetrics.messagesExchanged}</Text>
              </View>
            </View>
          </View>

          <View style={styles.callInfo}>
            <Text style={styles.callInfoText}>
              Recipients: {recipients.join(', ')}
            </Text>
            <Text style={styles.callInfoText}>
              Mode: {callMode === 'intro+ai' ? 'Personal Intro + AI' : 'AI Only'}
            </Text>
          </View>
        </View>

        {/* Live Transcript */}
        <View style={styles.transcriptSection}>
          <Text style={styles.sectionTitle}>Live Conversation</Text>

          {transcript.length === 0 ? (
            <View style={styles.emptyTranscript}>
              {callMetrics.connectionStatus === 'connecting' ? (
                <>
                  <ActivityIndicator size="large" color="#000000" />
                  <Text style={styles.emptyText}>Connecting to call...</Text>
                  <Text style={styles.emptySubtext}>Setting up AI assistant and establishing connection</Text>
                </>
              ) : callMetrics.connectionStatus === 'connected' ? (
                <>
                  <ActivityIndicator size="large" color="#000000" />
                  <Text style={styles.emptyText}>Connected - Waiting for conversation...</Text>
                  <Text style={styles.emptySubtext}>AI assistant is ready and listening</Text>
                </>
              ) : (
                <>
                  <MessageCircle size={48} color="#999999" />
                  <Text style={styles.emptyText}>Waiting for conversation to begin...</Text>
                </>
              )}
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.transcriptScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.transcriptContent}
            >
              {transcript.map(renderTranscriptMessage)}
            </ScrollView>
          )}
        </View>

        {/* Call Controls */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={styles.activityButton}
            onPress={navigateToActivity}
          >
            <History size={24} color="#FFFFFF" />
            <Text style={styles.activityButtonText}>View Activity</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffe0e0',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#cc0000',
    textAlign: 'center',
  },
  statusSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 14,
    color: '#666666',
  },
  callInfo: {
    gap: 4,
  },
  callInfoText: {
    fontSize: 14,
    color: '#666666',
  },
  transcriptSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    padding: 20,
    paddingBottom: 0,
  },
  emptyTranscript: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
  transcriptScroll: {
    flex: 1,
  },
  transcriptContent: {
    padding: 20,
    paddingTop: 10,
  },
  transcriptMessage: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userMessage: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  speakerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  userSpeakerName: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    color: '#666666',
  },
  userMessageTime: {
    color: '#666666',
  },
  messageText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#000000',
  },
  confidenceText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  userConfidenceText: {
    color: '#666666',
  },
  controlsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  endCallButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  activityButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});