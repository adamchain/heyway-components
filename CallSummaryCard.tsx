import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { X, ArrowLeft, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useContacts } from '@/hooks/useContacts';
import { useCallAnalysis } from '@/hooks/useCallAnalysis';
import { apiService } from '@/services/apiService';
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_LAYOUT, HEYWAY_COMPONENTS, HEYWAY_CHAT_PATTERNS } from '@/styles/HEYWAY_STYLE_GUIDE';
import { aiGradient, aiInset } from '@/ts/utils/theme';
import CallAnalysisTag from '@/components/CallAnalysisTag';

interface CallSummaryCardProps {
  call?: any;
  callId?: string;
  sessionId?: string;
  transcript: Array<{
    speaker: string;
    text: string;
    timestamp?: string;
    isAgent?: boolean;
  }>;
  isInbound?: boolean;
  isEmbedded?: boolean;
  onClose?: () => void;
}

export default function CallSummaryCard({ call, callId, sessionId, transcript, isInbound = false, isEmbedded = false, onClose }: CallSummaryCardProps) {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Initialize call analysis
  const { getCallAnalysis } = useCallAnalysis(call ? [call] : []);
  const analysis = call ? getCallAnalysis(call) : null;

  const closeModal = () => {
    onClose?.();
  };

  // Send message functionality
  const sendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('Message Required', 'Please enter a message to send.');
      return;
    }

    const phoneNumber = isInbound ? call?.fromNumber : (call?.recipients?.[0]?.number || call?.recipients?.[0]?.phoneNumber);
    if (!phoneNumber) {
      Alert.alert('Error', 'Unable to determine recipient phone number.');
      return;
    }

    try {
      setIsSending(true);

      // Prepare transcript context for AI
      const transcriptContext = transcript.map(entry => {
        const speaker = entry.isAgent || entry.speaker === 'agent' || entry.speaker === 'Heyway' ? 'HeyWay' : 'Customer';
        return `${speaker}: ${entry.text}`;
      }).join('\n');

      // Create context message for AI
      const contextMessage = `Previous conversation transcript:\n${transcriptContext}\n\nUser wants to send this message: "${messageText.trim()}"`;

      // Log the context being sent to AI for verification
      console.log('🤖 AI Context being sent:');
      console.log('📞 Phone number:', phoneNumber);
      console.log('📝 Transcript lines:', transcript.length);
      console.log('📋 Full context message:');
      console.log(contextMessage);
      console.log('💬 User message:', messageText.trim());

      // Send message with AI context
      const callPayload = {
        recipients: [phoneNumber],
        callMode: 'ai-only' as const,
        notes: `You are continuing a previous conversation. Here's the context: ${contextMessage}. Use this context to have a natural follow-up conversation.`
      };

      console.log('🚀 Sending call payload:', callPayload);
      await apiService.initiateCall(callPayload);

      Alert.alert('Success', 'Message sent successfully!');
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Helper functions for call info
  const formatCallDuration = (duration?: number | string) => {
    if (!duration) return 'Unknown';
    const durationNum = typeof duration === 'string' ? parseInt(duration) : duration;
    if (isNaN(durationNum)) return 'Unknown';

    const minutes = Math.floor(durationNum / 60);
    const seconds = durationNum % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatCallDateTime = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const callDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      if (callDate.getTime() === today.getTime()) {
        return `Today at ${timeStr}`;
      } else if (callDate.getTime() === today.getTime() - 86400000) {
        return `Yesterday at ${timeStr}`;
      } else {
        return `${date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })} at ${timeStr}`;
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  const getCallStatus = () => {
    if (call?.status) return call.status;
    if (call?.duration && parseInt(call.duration) > 0) return 'completed';
    return 'unknown';
  };

  const contacts = useContacts();
  // Helper to get display name for the other party
  const getDisplayNameForCall = (call: any) => {
    const isInbound = call.isInbound === true || call.isInbound === 'true';
    const recipientObj = call.recipients && call.recipients.length > 0 ? call.recipients[0] : null;
    if (isInbound) {
      const inboundNumber = call.fromNumber || call.caller;
      if (inboundNumber) {
        const found = contacts.contacts.find(
          (c: any) => c.number === inboundNumber || c.phone === inboundNumber
        );
        if (found && found.name) return found.name;
        return inboundNumber;
      }
      return 'Unknown Caller';
    } else {
      if (recipientObj?.name) return recipientObj.name;
      if (recipientObj?.number) {
        const found = contacts.contacts.find(
          (c: any) => c.number === recipientObj.number || c.phone === recipientObj.number
        );
        if (found && found.name) return found.name;
        return recipientObj.number;
      }
      return 'Unknown Recipient';
    }
  };

  // Get the other party's name for the header and transcript
  const otherPartyName = getDisplayNameForCall(call);

  const renderContent = () => (
    <View style={isEmbedded ? styles.embeddedContainer : styles.container}>
      <SafeAreaView style={isEmbedded ? styles.embeddedSafeArea : styles.safeArea}>
        {/* Header - WhatsApp chat style */}
        <View style={isEmbedded ? styles.embeddedHeader : styles.whatsappHeader}>
          <View style={styles.headerLeftContainer}>
            <TouchableOpacity onPress={closeModal} style={styles.headerButton}>
              {isEmbedded ? (
                <ArrowLeft size={24} color={HEYWAY_COLORS.text.primary} />
              ) : (
                <X size={24} color={HEYWAY_COLORS.text.primary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{otherPartyName}</Text>
          </View>

          <View style={styles.headerRightContainer}>
            {/* Empty for symmetry */}
          </View>
        </View>

        {/* Content matching list page scroll style */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* Call Info Section - Compact Single Row */}
            <View style={styles.compactInfoContainer}>
              <View style={styles.compactInfoItem}>
                <Text style={styles.compactInfoValue}>
                  {formatCallDuration(call?.duration)}
                </Text>
              </View>
              <View style={styles.compactInfoSeparator} />
              <View style={styles.compactInfoItem}>
                <Text style={styles.compactInfoValue}>
                  {formatCallDateTime(call?.date || call?.createdAt)}
                </Text>
              </View>
              <View style={styles.compactInfoSeparator} />
              <View style={styles.compactInfoItem}>
                <Text style={styles.compactInfoValue}>
                  {isInbound ? 'Incoming' : 'Outgoing'}
                </Text>
              </View>
              <View style={styles.compactInfoSeparator} />
              <View style={styles.compactInfoItem}>
                <Text style={[styles.compactInfoValue, styles.statusText]}>
                  {getCallStatus().charAt(0).toUpperCase() + getCallStatus().slice(1)}
                </Text>
              </View>
              {(call?.fromNumber || (call?.recipients && call.recipients.length > 0)) && (
                <>
                  <View style={styles.compactInfoSeparator} />
                  <View style={styles.compactInfoItem}>
                    <Text style={styles.compactInfoValue}>
                      {isInbound ? call?.fromNumber : (call.recipients[0]?.number || call.recipients[0]?.phoneNumber)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Analysis Section */}
            {analysis && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>Call Analysis</Text>
                <View style={styles.analysisContent}>
                  <CallAnalysisTag
                    analysis={analysis}
                    size="large"
                    showIcon={true}
                    showScore={true}
                  />
                  {analysis.followUpNeeded && (
                    <View style={styles.followUpNotice}>
                      <Text style={styles.followUpNoticeText}>⚠️ Follow-up recommended</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.analysisReasoning}>{analysis.reasoning}</Text>
                {analysis.keywords.length > 0 && (
                  <View style={styles.keywordsSection}>
                    <Text style={styles.keywordsTitle}>Key indicators:</Text>
                    <Text style={styles.keywordsList}>
                      {analysis.keywords.slice(0, 5).join(', ')}
                      {analysis.keywords.length > 5 ? '...' : ''}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Transcript Section */}
            <View style={styles.transcriptSection}>

              {/* Check if this is a multi-recipient call with separated transcripts */}
              {call?.participants && call.participants.length > 1 && call.participants.some((p: any) => p.transcription && p.transcription.length > 0) ? (
                // Multi-recipient call with separated transcripts
                call.participants.map((participant: any, participantIndex: number) => {
                  const participantTranscript = participant.transcription || [];
                  if (participantTranscript.length === 0) return null;

                  const participantName = participant.name || participant.phoneNumber || `Participant ${participantIndex + 1}`;

                  return (
                    <View key={participantIndex} style={styles.participantSection}>
                      <Text style={styles.participantHeader}>Conversation with {participantName}</Text>
                      {participantTranscript.map((entry: any, index: number) => {
                        const isAgent = entry.isAgent || entry.speaker === 'agent' || entry.speaker === 'Heyway';
                        return (
                          <View
                            key={`${participantIndex}-${index}`}
                            style={[
                              styles.whatsappMessageContainer,
                              isAgent ? styles.whatsappAgentContainer : styles.whatsappUserContainer
                            ]}
                          >
                            <View
                              style={[
                                styles.whatsappBubble,
                                isAgent ? styles.whatsappAgentBubble : styles.whatsappUserBubble
                              ]}
                            >
                              <Text style={[styles.whatsappMessageText, isAgent ? styles.whatsappAgentText : styles.whatsappUserText]}>
                                {entry.text}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })
              ) : transcript && transcript.length > 0 ? (
                // Single recipient call or legacy format
                transcript.map((entry, index) => {
                  const isAgent = entry.isAgent || entry.speaker === 'agent' || entry.speaker === 'Heyway';
                  return (
                    <View
                      key={index}
                      style={[
                        styles.whatsappMessageContainer,
                        isAgent ? styles.whatsappAgentContainer : styles.whatsappUserContainer
                      ]}
                    >
                      <View
                        style={[
                          styles.whatsappBubble,
                          isAgent ? styles.whatsappAgentBubble : styles.whatsappUserBubble
                        ]}
                      >
                        <Text style={[styles.whatsappMessageText, isAgent ? styles.whatsappAgentText : styles.whatsappUserText]}>
                          {entry.text}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No Transcript Available</Text>
                  <Text style={styles.emptyText}>
                    This call doesn't have a transcript to display
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* WhatsApp Message Input Section */}
        <View style={styles.whatsappInputSection}>
          <View style={styles.whatsappInputContainer}>
            <TextInput
              style={styles.whatsappInput}
              placeholder="Type a message..."
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.whatsappSendButton, !messageText.trim() && styles.whatsappSendButtonDisabled]}
              onPress={sendMessage}
              disabled={isSending || !messageText.trim()}
              activeOpacity={0.7}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={HEYWAY_COLORS.text.inverse} />
              ) : (
                <Send size={18} color={HEYWAY_COLORS.text.inverse} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  // Render conditionally based on isEmbedded prop
  if (isEmbedded) {
    return renderContent();
  }

  return (
    <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
      {renderContent()}
    </Modal>
  );
}

const styles = StyleSheet.create({
  /* ROOT */
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
  },
  safeArea: { flex: 1, backgroundColor: 'transparent' },

  /* EMBEDDED (right pane) */
  embeddedContainer: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
  },
  embeddedSafeArea: { flex: 1, backgroundColor: 'transparent' },
  embeddedHeader: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  /* HEADER - WHATSAPP STYLE */
  whatsappHeader: {
    backgroundColor: HEYWAY_COLORS.interactive.whatsappDark,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    ...HEYWAY_SHADOWS.light.sm,
  },
  headerLeftContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerCenter: { flexDirection: 'column', alignItems: 'center', gap: 4 },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 44,
  },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.inverse,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  /* SCROLLER */
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  /* INFO BAR (pill segmented, Apple-y) */
  compactInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  compactInfoItem: { alignItems: 'center', flex: 1 },
  compactInfoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: 0.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statusText: { color: HEYWAY_COLORS.text.secondary },
  compactInfoSeparator: {
    width: 1,
    height: 16,
    backgroundColor: HEYWAY_COLORS.border.divider,
    marginHorizontal: 8,
  },

  /* ANALYSIS CARD */
  analysisSection: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 14,
    marginBottom: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  analysisContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  followUpNotice: {
    backgroundColor: 'rgba(255,193,7,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,193,7,0.32)',
  },
  followUpNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: HEYWAY_COLORS.accent.warning,
    letterSpacing: 0.1,
  },
  analysisReasoning: {
    fontSize: 14,
    fontWeight: '400',
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  keywordsSection: { marginTop: 4 },
  keywordsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  keywordsList: {
    fontSize: 12,
    fontWeight: '400',
    color: HEYWAY_COLORS.text.tertiary,
    lineHeight: 16,
    fontStyle: 'italic',
  },

  /* TRANSCRIPT */
  transcriptSection: { flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 12,
    letterSpacing: -0.1,
  },

  /* WHATSAPP MESSAGE BUBBLES */
  whatsappMessageContainer: { 
    marginVertical: HEYWAY_SPACING.xs, 
    paddingHorizontal: HEYWAY_SPACING.sm 
  },
  whatsappAgentContainer: { alignItems: 'flex-end' },
  whatsappUserContainer: { alignItems: 'flex-start' },
  whatsappBubble: {
    ...HEYWAY_CHAT_PATTERNS.bubble,
    maxWidth: HEYWAY_CHAT_PATTERNS.bubble.maxWidth,
    marginVertical: HEYWAY_SPACING.xs,
    ...HEYWAY_SHADOWS.balloon,
  },
  whatsappAgentBubble: {
    backgroundColor: HEYWAY_COLORS.background.whatsappChat,
    borderBottomRightRadius: HEYWAY_RADIUS.xs,
  },
  whatsappUserBubble: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomLeftRadius: HEYWAY_RADIUS.xs,
    borderWidth: HEYWAY_CHAT_PATTERNS.avatar.border.width,
    borderColor: HEYWAY_COLORS.border.secondary,
  },
  whatsappMessageText: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large, 
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.body.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
  },
  whatsappAgentText: { color: HEYWAY_COLORS.text.primary },
  whatsappUserText: { color: HEYWAY_COLORS.text.primary },

  /* MULTI-PARTICIPANT */
  participantSection: {
    marginBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    paddingBottom: 10,
  },
  participantHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: HEYWAY_COLORS.background.content,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },

  /* EMPTY */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  emptyText: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* WHATSAPP COMPOSER */
  whatsappInputSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HEYWAY_COLORS.border.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  whatsappInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.secondary,
    gap: 8,
  },
  whatsappInput: {
    flex: 1,
    color: HEYWAY_COLORS.text.primary,
    fontSize: 16,
    lineHeight: 20,
    paddingVertical: 2,
    textAlignVertical: 'top',
    fontWeight: '400',
  },
  whatsappSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: HEYWAY_COLORS.interactive.whatsappGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: HEYWAY_COLORS.interactive.whatsappGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsappSendButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.interactive.primaryDisabled,
    opacity: 0.5,
  },
});