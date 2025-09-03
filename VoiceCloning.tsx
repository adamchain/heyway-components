import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, X, Square, Play, Pause, Volume2, CircleCheck as CheckCircle, ArrowRight, Brain } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { aiService } from '@/services/aiService';
import { apiService } from '@/services/apiService'; // Add this import
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';


interface VoiceCloningProps {
  visible: boolean;
  onClose: () => void;
  onVoiceCloned: () => void;
  initialStatus: 'none' | 'pending' | 'completed';
}

export default function VoiceCloning({
  visible,
  onClose,
  onVoiceCloned,
  initialStatus = 'none'
}: VoiceCloningProps) {
  const [step, setStep] = useState<'intro' | 'record' | 'review' | 'processing' | 'complete'>('intro');
  const [recordings, setRecordings] = useState<string[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackSound, setPlaybackSound] = useState<Audio.Sound | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cloneStatus, setCloneStatus] = useState<'none' | 'pending' | 'completed'>(initialStatus);
  const [config, setConfig] = useState<{
    elevenlabs?: {
      configured: boolean;
      apiKey?: string;
      agentId?: string;
    };
    twilio?: {
      configured: boolean;
      accountSid?: string;
    };
    openai?: {
      configured: boolean;
      apiKey?: string;
    };
    app?: {
      name: string;
      version: string;
      environment: string;
    };
  } | null>(null); // Update the config state type and initial value

  const timerRef = useRef<NodeJS.Timeout | number | null>(null);
  const statusPollingRef = useRef<NodeJS.Timeout | number | null>(null);
  const recordingPrompts = [
    "The quick brown fox jumps over the lazy dog.",
    "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
    "She sells seashells by the seashore."
  ];

  useEffect(() => {
    if (visible) {
      // Check ElevenLabs configuration when modal opens
      checkElevenLabsConfig();

      if (initialStatus === 'completed') {
        setStep('complete');
        setCloneStatus('completed');
        checkForExistingVoice();
      } else if (initialStatus === 'pending') {
        setStep('processing');
        setCloneStatus('pending');
        startStatusPolling();
      } else {
        setStep('intro');
        setCloneStatus('none');
      }
    } else {
      // Stop polling when modal is closed
      stopStatusPolling();
    }

    return () => {
      // Clean up when modal closes
      stopPlayback();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopStatusPolling();
    };
  }, [visible, initialStatus]);

  // Add this function
  const checkElevenLabsConfig = async () => {
    try {
      const response: any = await apiService.get('/config');
      const configData = response && typeof response === 'object' && 'data' in response ? response.data : response;
      setConfig(configData);

      if (!configData?.elevenlabs?.configured) {
        setError('ElevenLabs is not configured on the server. Please contact support.');
        console.warn('⚠️ ElevenLabs not configured on server');
      }
    } catch (error) {
      console.error('Failed to check ElevenLabs config:', error);
      setError('Unable to check voice cloning configuration. Please try again.');
    }
  };

  const checkForExistingVoice = async () => {
    try {
      const aiConfig = await apiService.getAIConfig();
      if (aiConfig && aiConfig.clonedVoiceId) {
        setClonedVoiceId(aiConfig.clonedVoiceId);
      }
    } catch (error) {
      console.error('Failed to check for existing voice:', error);
    }
  };

  const startStatusPolling = () => {
    // Clear any existing polling
    stopStatusPolling();

    // Start polling every 5 seconds
    statusPollingRef.current = setInterval(async () => {
      try {
        const aiConfig = await apiService.getAIConfig();

        if (aiConfig && aiConfig.clonedVoiceId) {
          // Voice cloning completed
          setClonedVoiceId(aiConfig.clonedVoiceId);
          setCloneStatus('completed');
          setStep('complete');
          stopStatusPolling();
          onVoiceCloned();
        }
      } catch (error) {
        console.error('Error polling clone status:', error);
      }
    }, 5000);
  };

  const stopStatusPolling = () => {
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
      statusPollingRef.current = null;
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
      } catch (error) {
        Alert.alert('Permission Required', 'Microphone access is required for voice cloning');
        return false;
      }
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is required for voice cloning');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (uri) {
        setRecordings([...recordings, uri]);
      }

      setRecording(null);
      setRecordingDuration(0);

    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const playRecording = async (index: number) => {
    try {
      // Stop any current playback
      await stopPlayback();

      const uri = recordings[index];
      if (!uri) return;

      const { sound } = await Audio.Sound.createAsync({ uri });
      setPlaybackSound(sound);
      setPlayingIndex(index);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingIndex(null);
        }
      });

      await sound.playAsync();

    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Error', 'Failed to play recording. Please try again.');
    }
  };

  const stopPlayback = async () => {
    if (playbackSound) {
      try {
        await playbackSound.stopAsync();
        await playbackSound.unloadAsync();
        setPlaybackSound(null);
        setPlayingIndex(null);
      } catch (error) {
        console.error('Failed to stop playback:', error);
      }
    }
  };

  const deleteRecording = (index: number) => {
    const newRecordings = [...recordings];
    newRecordings.splice(index, 1);
    setRecordings(newRecordings);
  };

  // Helper function to convert webm to mp3 on web platform
  const convertWebmToMp3 = async (webmBlob: Blob): Promise<Blob> => {
    try {
      // Create FormData for the conversion request
      const formData = new FormData();
      formData.append('audio', webmBlob, 'recording.webm');

      // Send to backend conversion endpoint
      const response = await fetch('/api/audio/convert-format', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to convert audio format');
      }

      // Get the converted MP3 blob
      const mp3Blob = await response.blob();
      return mp3Blob;
    } catch (error) {
      console.error('Audio conversion error:', error);
      throw error;
    }
  };

  const submitVoiceCloning = async () => {
    if (recordings.length < 3) {
      Alert.alert('More Recordings Needed', 'Please record at least 3 voice samples for optimal voice cloning.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setStep('processing');
      setCloneStatus('pending');

      // Prepare form data for upload
      const formData = new FormData();

      // Add recordings to form data
      for (let i = 0; i < recordings.length; i++) {
        const uri = recordings[i];
        const name = uri.split('/').pop() || `recording-${i}.m4a`;

        // Create blob for web or use uri directly for native
        if (Platform.OS === 'web') {
          const response = await fetch(uri);
          let blob = await response.blob();

          // Convert webm to mp3 if needed
          if (blob.type.includes('webm')) {
            try {
              blob = await convertWebmToMp3(blob);
            } catch (conversionError) {
              console.error('Failed to convert audio format:', conversionError);
              setError('Failed to convert audio format. Please try again.');
              setIsProcessing(false);
              setStep('review');
              return;
            }
          }

          formData.append('samples', blob, name.replace('.webm', '.mp3'));
        } else {
          formData.append('samples', {
            uri,
            name,
            type: 'audio/m4a',
          } as any);
        }
      }

      // Add metadata
      formData.append('name', 'My Voice Clone');
      formData.append('description', 'Voice cloned for AI calling');

      // Upload recordings and clone voice
      const response = await aiService.cloneVoice({
        name: 'My Voice Clone',
        description: 'Voice cloned for AI calling',
        samples: recordings
      });

      setClonedVoiceId(response);
      setCloneStatus('completed');
      setStep('complete');
      onVoiceCloned();

      // Start polling for status updates
      startStatusPolling();

    } catch (error) {
      console.error('Voice cloning error:', error);
      setError(error instanceof Error ? error.message : 'Failed to clone voice');
      setStep('review');
      setCloneStatus('none');
      Alert.alert('Error', 'Failed to clone voice. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const testClonedVoice = async () => {
    try {
      setIsProcessing(true);

      const audioUrl = await aiService.testVoice(clonedVoiceId || undefined);

      // Play the test audio
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      await sound.playAsync();

    } catch (error) {
      console.error('Failed to test voice:', error);
      Alert.alert('Error', 'Failed to test voice. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderIntroStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Mic size={48} color="#3b82f6" />
      </View>

      <Text style={styles.stepTitle}>Voice Cloning</Text>

      <Text style={styles.stepDescription}>
        Clone your voice for personalized AI calls. Your cloned voice will be used when making calls with the HeyWay.
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!error && config?.elevenlabs?.configured && (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>How it works:</Text>
            <Text style={styles.infoText}>1. Record 3 voice samples reading the provided phrases</Text>
            <Text style={styles.infoText}>2. Review your recordings before submitting</Text>
            <Text style={styles.infoText}>3. Our AI will create a digital clone of your voice</Text>
            <Text style={styles.infoText}>4. Your cloned voice will be used for all AI calls</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep('record')}
          >
            <Text style={styles.primaryButtonText}>Start Voice Cloning</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}

      {!config?.elevenlabs?.configured && !error && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>⚠️ Voice Cloning Unavailable</Text>
          <Text style={styles.infoText}>
            Voice cloning is not currently configured on this server. Please contact support to enable this feature.
          </Text>
        </View>
      )}
    </View>
  );

  const renderRecordStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Record Voice Samples</Text>

      <Text style={styles.stepDescription}>
        Please record yourself reading each of the following phrases clearly.
        {recordings.length}/3 samples recorded.
      </Text>

      <View style={styles.promptContainer}>
        <Text style={styles.promptTitle}>Please read aloud:</Text>
        <Text style={styles.promptText}>
          {recordingPrompts[recordings.length % recordingPrompts.length]}
        </Text>
      </View>

      <View style={styles.recordingStatus}>
        {isRecording ? (
          <>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Recording... {recordingDuration}s
              </Text>
            </View>

            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopRecording}
            >
              <Square size={24} color="#FFFFFF" />
              <Text style={styles.stopButtonText}>Stop Recording</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startRecording}
          >
            <Mic size={24} color="#FFFFFF" />
            <Text style={styles.recordButtonText}>
              Record Sample {recordings.length + 1}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {recordings.length > 0 && (
        <View style={styles.samplesContainer}>
          <Text style={styles.samplesTitle}>Recorded Samples:</Text>

          {recordings.map((uri, index) => (
            <View key={index} style={styles.sampleItem}>
              <Text style={styles.sampleName}>Sample {index + 1}</Text>

              <View style={styles.sampleControls}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => playingIndex === index ? stopPlayback() : playRecording(index)}
                >
                  {playingIndex === index ? (
                    <Pause size={16} color="#3b82f6" />
                  ) : (
                    <Play size={16} color="#3b82f6" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteRecording(index)}
                >
                  <X size={16} color="#ff3b3b" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep('intro')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            recordings.length < 3 && styles.disabledButton
          ]}
          onPress={() => setStep('review')}
          disabled={recordings.length < 3}
        >
          <Text style={styles.primaryButtonText}>
            {recordings.length < 3 ? `Need ${3 - recordings.length} More` : 'Continue'}
          </Text>
          {recordings.length >= 3 && <ArrowRight size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review Voice Samples</Text>

      <Text style={styles.stepDescription}>
        Listen to your recordings to make sure they're clear before submitting.
      </Text>

      <ScrollView style={styles.samplesScrollView}>
        {recordings.map((uri, index) => (
          <View key={index} style={styles.reviewSampleItem}>
            <View style={styles.reviewSampleHeader}>
              <Text style={styles.reviewSampleName}>Sample {index + 1}</Text>
              <Text style={styles.reviewSamplePrompt}>
                "{recordingPrompts[index % recordingPrompts.length]}"
              </Text>
            </View>

            <TouchableOpacity
              style={styles.reviewPlayButton}
              onPress={() => playingIndex === index ? stopPlayback() : playRecording(index)}
            >
              {playingIndex === index ? (
                <>
                  <Pause size={20} color="#FFFFFF" />
                  <Text style={styles.reviewPlayButtonText}>Stop</Text>
                </>
              ) : (
                <>
                  <Play size={20} color="#FFFFFF" />
                  <Text style={styles.reviewPlayButtonText}>Play</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep('record')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={submitVoiceCloning}
        >
          <Brain size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Clone Voice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.processingTitle}>Cloning Your Voice</Text>
        <Text style={styles.processingText}>
          This may take a few moments. We're creating a digital clone of your voice for AI calls.
        </Text>
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completeContainer}>
        <View style={styles.completeIconContainer}>
          <CheckCircle size={48} color="#34C759" />
        </View>

        <Text style={styles.completeTitle}>Voice Cloning Complete!</Text>

        <Text style={styles.completeText}>
          Your voice has been successfully cloned and is ready to use for AI calls.
        </Text>

        <TouchableOpacity
          style={styles.testButton}
          onPress={testClonedVoice}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Volume2 size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Test Your Voice</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={onClose}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Voice Cloning</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {step === 'intro' && renderIntroStep()}
          {step === 'record' && renderRecordStep()}
          {step === 'review' && renderReviewStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'complete' && renderCompleteStep()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  content: {
    flex: 1,
    padding: HEYWAY_SPACING.xl,
  },
  stepContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: HEYWAY_RADIUS.component.avatar.xl,
    backgroundColor: HEYWAY_COLORS.interactive.selected,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: HEYWAY_SPACING.xxl,
    ...HEYWAY_SHADOWS.light.sm,
  },
  stepTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.md,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  stepDescription: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.xxl,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  infoContainer: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.xxl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  infoTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.md,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  infoText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.sm,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    gap: HEYWAY_SPACING.sm,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },
  primaryButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  disabledButton: {
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    opacity: 0.6,
  },
  promptContainer: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.xxl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  promptTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  promptText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.title.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  recordingStatus: {
    marginBottom: HEYWAY_SPACING.xxl,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: HEYWAY_RADIUS.xs,
    backgroundColor: HEYWAY_COLORS.status.error,
    marginRight: HEYWAY_SPACING.sm,
  },
  recordingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    gap: HEYWAY_SPACING.sm,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },
  recordButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.status.error,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    gap: HEYWAY_SPACING.sm,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },
  stopButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  samplesContainer: {
    marginBottom: HEYWAY_SPACING.xxl,
  },
  samplesTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.md,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  sampleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    padding: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  sampleName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  sampleControls: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error,
    ...HEYWAY_SHADOWS.light.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
    marginTop: 'auto',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.xs,
  },
  secondaryButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  samplesScrollView: {
    flex: 1,
    marginBottom: HEYWAY_SPACING.xxl,
  },
  reviewSampleItem: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  reviewSampleHeader: {
    marginBottom: HEYWAY_SPACING.md,
  },
  reviewSampleName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  reviewSamplePrompt: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    fontStyle: 'italic',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  reviewPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.lg,
    alignSelf: 'flex-start',
    gap: HEYWAY_SPACING.sm,
    ...HEYWAY_SHADOWS.light.sm,
  },
  reviewPlayButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  errorContainer: {
    backgroundColor: HEYWAY_COLORS.status.error + '20',
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    padding: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error,
  },
  errorText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.status.error,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: HEYWAY_SPACING.xxl,
  },
  processingTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.xxl,
    marginBottom: HEYWAY_SPACING.md,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  processingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: HEYWAY_SPACING.xxl,
  },
  completeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: HEYWAY_RADIUS.component.avatar.xl,
    backgroundColor: HEYWAY_COLORS.status.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HEYWAY_SPACING.xxl,
    ...HEYWAY_SHADOWS.light.sm,
  },
  completeTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.md,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  completeText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.xxxl,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    marginBottom: HEYWAY_SPACING.lg,
    width: '100%',
    gap: HEYWAY_SPACING.sm,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },
  testButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    width: '100%',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.xs,
  },
  doneButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});