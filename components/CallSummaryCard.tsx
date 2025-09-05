// CallSummaryCard.tsx — Compact Right Pane (email-style) rewrite
// Goals vs CallsListView/ContactListView:
// • Denser layout (12/8 spacing), sticky tools header, pill info row
// • Transcript in minimal "mail body" style (no heavy bubbles)
// • Collapsible "Analysis" drawer to save vertical space
// • Quick Reply footer with single primary action
// • Subtle glass on header only, keep body crisp white for contrast

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { Archive, Download, MoreHorizontal, Send, Star, UserPlus, X, CheckCircle, ChevronDown, PhoneOutgoing, PhoneIncoming } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { useContacts } from '@/hooks/useContacts';
import { useCallAnalysis } from '@/hooks/useCallAnalysis';
import { apiService } from '../services/apiService';
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
} from '../styles/HEYWAY_STYLE_GUIDE';

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

// Helper functions for analysis styling
function getAnalysisHeaderStyle(analysis: any) {
  switch (analysis.category) {
    case 'good':
      return { backgroundColor: 'rgba(76, 175, 80, 0.1)' };
    case 'bad':
      return { backgroundColor: 'rgba(244, 67, 54, 0.1)' };
    case 'opportunity':
      return { backgroundColor: 'rgba(255, 152, 0, 0.1)' };
    default:
      return { backgroundColor: '#F8F9FA' };
  }
}

function getAnalysisTitleStyle(analysis: any) {
  switch (analysis.category) {
    case 'good':
      return { color: '#2D5A2D' };
    case 'bad':
      return { color: '#B71C1C' };
    case 'opportunity':
      return { color: '#E65100' };
    default:
      return { color: HEYWAY_COLORS.text.macosPrimary };
  }
}

function getAnalysisIconColor(analysis: any) {
  switch (analysis.category) {
    case 'good':
      return '#2D5A2D';
    case 'bad':
      return '#B71C1C';
    case 'opportunity':
      return '#E65100';
    default:
      return HEYWAY_COLORS.text.macosSecondary;
  }
}

export default function CallSummaryCard({
  call,
  callId,
  sessionId,
  transcript: initialTranscript,
  isInbound = false,
  isEmbedded = false,
  onClose,
}: CallSummaryCardProps) {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [transcript, setTranscript] = useState(initialTranscript || []);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const { getCallAnalysis } = useCallAnalysis(call ? [call] : []);
  const analysis = call ? getCallAnalysis(call) : null;

  const contacts = useContacts();

  const otherPartyName = useMemo(() => getDisplayNameForCall(call, contacts), [call, contacts]);

  const phoneNumber = isInbound
    ? call?.fromNumber
    : call?.recipients?.[0]?.number || call?.recipients?.[0]?.phoneNumber;

  const status = getCallStatus(call);
  const prettyDate = formatCallDateTime(call?.date || call?.createdAt);
  const prettyDuration = formatCallDuration(call?.duration);

  // Fetch transcript when call changes
  const fetchTranscript = useCallback(async () => {
    const currentCallId = callId || call?.callId || call?.id;
    const currentSessionId = sessionId || call?.sessionId || call?.id;

    if (!currentSessionId && !currentCallId) {
      console.warn('No sessionId or callId provided for transcript fetch');
      return;
    }

    // If we already have a transcript from props, don't fetch unless it's empty
    if (initialTranscript && initialTranscript.length > 0) {
      setTranscript(initialTranscript);
      return;
    }

    setIsLoadingTranscript(true);
    setTranscriptError(null);

    try {
      // Try to fetch transcript using sessionId first, then callId
      const transcriptData = await apiService.getCallTranscript(
        currentSessionId || currentCallId
      );

      if (transcriptData && Array.isArray(transcriptData)) {
        setTranscript(transcriptData);
      } else {
        console.warn('No transcript data received or invalid format');
        setTranscript([]);
      }
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
      setTranscriptError('Failed to load transcript');
      setTranscript([]);
    } finally {
      setIsLoadingTranscript(false);
    }
  }, [callId, sessionId, call?.callId, call?.id, call?.sessionId, initialTranscript]);

  // Effect to fetch transcript when call changes
  useEffect(() => {
    if (call) {
      fetchTranscript();
    } else {
      setTranscript([]);
      setTranscriptError(null);
      setIsLoadingTranscript(false);
    }
  }, [call, fetchTranscript]);

  const sendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('Message Required', 'Please enter a message to send.');
      return;
    }
    if (!phoneNumber) {
      Alert.alert('Error', 'Unable to determine recipient phone number.');
      return;
    }
    try {
      setIsSending(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });

      const transcriptContext = (transcript || [])
        .map((entry) => {
          const speaker = entry.isAgent || entry.speaker === 'agent' || entry.speaker === 'Heyway' ? 'HeyWay' : 'Customer';
          return `${speaker}: ${entry.text}`;
        })
        .join('\n');

      const notes = `Continue previous conversation. Context:\n${transcriptContext}\n\nUser wants to send: "${messageText.trim()}"`;

      await apiService.initiateCall({ recipients: [phoneNumber], callMode: 'ai-only' as const, notes });
      Alert.alert('Success', 'Message sent successfully!');
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ...existing code...
  const addToContacts = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Unable to determine phone number.');
      return;
    }
    try {
      const payload = {
        name: otherPartyName?.startsWith('+') ? '' : otherPartyName,
        phoneNumber,
        source: 'call_summary',
      };

      // Prefer contacts hook; fall back if needed
      if ((contacts as any)?.addContact) {
        await (contacts as any).addContact(payload);
      } else if ((apiService as any)?.createContact) {
        await (apiService as any).createContact(payload);
      } else if ((apiService as any)?.upsertContact) {
        await (apiService as any).upsertContact(payload);
      } else {
        throw new Error('No contact creation method available');
      }

      Alert.alert('Success', 'Contact added successfully!');
    } catch (error) {
      console.error('Failed to add contact:', error);
      Alert.alert('Error', 'Failed to add contact. Please try again.');
    }
  };
  // ...existing code...

  const exportConversation = () => {
    const t = (transcript || [])
      .map((entry) => {
        const speaker = entry.isAgent || entry.speaker === 'agent' || entry.speaker === 'Heyway' ? 'HeyWay' : otherPartyName;
        return `${speaker}: ${entry.text}`;
      })
      .join('\n');

    const exportData = `Call Summary\n===========\nDate: ${prettyDate}\nDuration: ${prettyDuration}\nDirection: ${isInbound ? 'Incoming' : 'Outgoing'}\nContact: ${otherPartyName}\nPhone: ${phoneNumber}\n\nTranscript:\n${t}\n`;
    console.log('Export Data:', exportData);
    Alert.alert('Export', 'Conversation exported to console (replace with file save in prod).');
  };

  const Header = (
    <View style={styles.headerWrap}>
      {Platform.OS !== 'web' ? (
        <BlurView tint="light" intensity={28} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={styles.headerGlassFallback} />
      )}
      <SafeAreaView>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.subject} numberOfLines={1}>
              {otherPartyName || phoneNumber || 'Unknown'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.metaRow}>
              {isInbound ? (
                <PhoneIncoming size={16} color={HEYWAY_COLORS.text.secondary} />
              ) : (
                <PhoneOutgoing size={16} color={HEYWAY_COLORS.text.secondary} />
              )}
              <Text style={styles.dot}>•</Text>
              {status === 'completed' ? (
                <CheckCircle size={14} color="#4CAF50" />
              ) : (
                <Text style={styles.metaText}>{status}</Text>
              )}
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{prettyDuration}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{prettyDate}</Text>
            </View>
            <HeaderIcon onPress={onClose}><X size={16} color={HEYWAY_COLORS.text.macosPrimary} /></HeaderIcon>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  const AnalysisDrawer = analysis ? (
    <View style={styles.drawer}>
      <TouchableOpacity
        onPress={() => setShowAnalysis((s) => !s)}
        style={[styles.drawerHeader, getAnalysisHeaderStyle(analysis)]}
        accessibilityRole="button"
      >
        <Text style={[styles.drawerTitle, getAnalysisTitleStyle(analysis)]}>Analysis</Text>
        <ChevronDown size={16} color={getAnalysisIconColor(analysis)} />
      </TouchableOpacity>
      {showAnalysis && (
        <View style={styles.drawerBody}>
          <Text style={styles.drawerLine}>
            Sentiment: <Text style={styles.drawerStrong}>{analysis.sentiment || 'n/a'}</Text>
          </Text>
          {Array.isArray(analysis.keywords) && analysis.keywords.length > 0 && (
            <Text style={styles.drawerLine}>
              Keywords: <Text style={styles.drawerMuted}>{analysis.keywords.slice(0, 6).join(', ')}</Text>
            </Text>
          )}
          {analysis.reasoning && (
            <Text style={styles.drawerReason}>{analysis.reasoning}</Text>
          )}
        </View>
      )}
    </View>
  ) : null;

  const Body = (
    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
      {AnalysisDrawer}

      {/* Chat-style transcript: messages on left and right */}
      <View style={styles.thread}>
        {(transcript || []).map((entry, idx) => {
          const isAgent = entry.isAgent || entry.speaker === 'agent' || entry.speaker === 'Heyway';
          // For better UX: Heyway (user's AI) messages on right in blue, recipient on left in off-white
          const isUserMessage = isAgent; // Heyway represents the user
          return (
            <View key={idx} style={[styles.messageRow, isUserMessage ? styles.userRow : styles.agentRow]}>
              <View style={[styles.messageBubble, isUserMessage ? styles.userBubble : styles.agentBubble]}>
                <Text style={[styles.messageText, isUserMessage ? styles.userText : styles.agentText]}>
                  {entry.text}
                </Text>
              </View>
            </View>
          );
        })}
        {isLoadingTranscript && (
          <View style={styles.empty}>
            <ActivityIndicator size="small" color={HEYWAY_COLORS.interactive.primary} />
            <Text style={styles.emptyTitle}>Loading Transcript...</Text>
            <Text style={styles.emptyText}>Please wait while we load the call transcript.</Text>
          </View>
        )}
        {!isLoadingTranscript && transcriptError && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Error Loading Transcript</Text>
            <Text style={styles.emptyText}>{transcriptError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTranscript}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {!isLoadingTranscript && !transcriptError && (!transcript || transcript.length === 0) && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No Transcript</Text>
            <Text style={styles.emptyText}>There's nothing to show for this call yet.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const Footer = (
    <View style={styles.footer}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Call with a reply..."
          placeholderTextColor={HEYWAY_COLORS.text.tertiary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={sendMessage} disabled={isSending}>
        {isSending ? (
          <ActivityIndicator size="small" color={HEYWAY_COLORS.text.inverse} />
        ) : (
          <>
            <Send size={14} color={HEYWAY_COLORS.text.inverse} />
            <Text style={styles.primaryBtnLabel}>Send</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  if (isEmbedded) {
    return (
      <View style={styles.rootEmbedded}>
        {Header}
        {Body}
        {Footer}
      </View>
    );
  }

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View style={styles.rootModal}>{Header}{Body}{Footer}</View>
    </Modal>
  );
}

/* ————— helpers ————— */
function getDisplayNameForCall(call: any, contacts: any) {
  try {
    const inbound = call?.isInbound === true || call?.isInbound === 'true';
    const recipientObj = call?.recipients && call.recipients.length > 0 ? call.recipients[0] : null;
    if (inbound) {
      const inboundNumber = call?.fromNumber || call?.caller;
      if (!inboundNumber) return 'Unknown Caller';
      const found = contacts?.contacts?.find((c: any) => c.number === inboundNumber || c.phone === inboundNumber);
      return (found && found.name) || inboundNumber;
    } else {
      if (recipientObj?.name) return recipientObj.name;
      const num = recipientObj?.number || recipientObj?.phoneNumber;
      if (!num) return 'Unknown Recipient';
      const found = contacts?.contacts?.find((c: any) => c.number === num || c.phone === num);
      return (found && found.name) || num;
    }
  } catch {
    return 'Unknown';
  }
}

function formatCallDuration(duration?: number | string) {
  if (!duration) return '—';
  const n = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  if (!Number.isFinite(n)) return '—';
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatCallDateTime(dateString?: string) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const callDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (callDate.getTime() === today.getTime()) return `Today ${timeStr}`;
    if (callDate.getTime() === today.getTime() - 86400000) return `Yesterday ${timeStr}`;
    return `${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })} ${timeStr}`;
  } catch {
    return '—';
  }
}

function getCallStatus(call?: any) {
  if (call?.status) return String(call.status).toLowerCase();
  if (call?.duration && parseInt(String(call.duration), 10) > 0) return 'completed';
  return 'unknown';
}

/* ————— styles ————— */
const S = HEYWAY_SPACING;
const R = HEYWAY_RADIUS;
const T = HEYWAY_TYPOGRAPHY;

const styles = StyleSheet.create({
  rootEmbedded: { flex: 1, backgroundColor: '#fff' },
  rootModal: { flex: 1, backgroundColor: '#fff' },

  headerWrap: {
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
    backgroundColor: '#F8F9FA',
    ...HEYWAY_SHADOWS.light.xs,
  },
  headerGlassFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: HEYWAY_COLORS.fill.quaternary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.tertiary,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.macosSecondary,
  },
  titleCol: { flex: 1 },
  subject: {
    fontSize: 15,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.macosPrimary,
    letterSpacing: -0.1,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  metaPill: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: HEYWAY_COLORS.text.macosPrimary,
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  dot: { color: HEYWAY_COLORS.text.tertiary, marginHorizontal: 2 },
  metaText: { fontSize: 11, color: HEYWAY_COLORS.text.macosSecondary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerInfo: { flex: 1, alignItems: 'flex-end', marginRight: 8 },

  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    maxWidth: 800, // Max width for larger screens
    alignSelf: 'center', // Center the content
    width: '100%', // Take full width on smaller screens
  },

  drawer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    ...HEYWAY_SHADOWS.light.sm,
    marginBottom: 10,
    maxWidth: 950, // Much wider than transcript bubbles (400px)
    alignSelf: 'center', // Center the drawer
    width: '100%', // Take full width on smaller screens
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  drawerTitle: { fontSize: 12, fontWeight: '700', color: HEYWAY_COLORS.text.macosPrimary, textTransform: 'uppercase' },
  drawerBody: { paddingHorizontal: 10, paddingVertical: 8, gap: 4 },
  drawerLine: { fontSize: 12, color: HEYWAY_COLORS.text.macosSecondary },
  drawerStrong: { fontWeight: '700', color: HEYWAY_COLORS.text.macosPrimary },
  drawerMuted: { color: HEYWAY_COLORS.text.tertiary, fontStyle: 'italic' },
  drawerReason: { fontSize: 12, color: HEYWAY_COLORS.text.macosSecondary, lineHeight: 18 },

  thread: { gap: 8 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2 },
  agentRow: { justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  messageBubble: {
    maxWidth: 400,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  agentBubble: {
    backgroundColor: '#F8F9FA',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderBottomRightRadius: 4,
  },
  messageText: { fontSize: 13, lineHeight: 18 },
  agentText: { color: HEYWAY_COLORS.text.macosPrimary },
  userText: { color: HEYWAY_COLORS.text.inverse },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: HEYWAY_COLORS.text.macosPrimary, marginBottom: 6 },
  emptyText: { fontSize: 13, color: HEYWAY_COLORS.text.macosSecondary },

  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    backgroundColor: '#FFFFFF',
  },
  inputWrap: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  input: {
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: HEYWAY_COLORS.text.macosPrimary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    ...HEYWAY_SHADOWS.light.sm,
  },
  primaryBtnLabel: { fontSize: 13, fontWeight: '700', color: HEYWAY_COLORS.text.inverse },

  retryButton: {
    marginTop: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.md,
  },
  retryButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

function HeaderIcon({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={headerIconStyles.btn} accessibilityRole="button">
      {children}
    </TouchableOpacity>
  );
}

const headerIconStyles = StyleSheet.create({
  btn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },

  retryButton: {
    marginTop: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.md,
  },

  retryButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
