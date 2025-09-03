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
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#9ca3af',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#9ca3af',
    marginBottom: 8,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  promptContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  promptTitle: {
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 18,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 24,
  },
  recordingStatus: {
    marginBottom: 24,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff3b3b',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff3b3b',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#ffffff',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  recordButtonText: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b3b',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  stopButtonText: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
  },
  samplesContainer: {
    marginBottom: 24,
  },
  samplesTitle: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  sampleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  sampleName: {
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#ffffff',
  },
  sampleControls: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ff3b3b',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
  },
  samplesScrollView: {
    flex: 1,
    marginBottom: 24,
  },
  reviewSampleItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  reviewSampleHeader: {
    marginBottom: 12,
  },
  reviewSampleName: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  reviewSamplePrompt: {
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  reviewPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    gap: 8,
  },
  reviewPlayButtonText: {
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 59, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 59, 0.2)',
  },
  errorText: {
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#ff3b3b',
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  processingTitle: {
    fontSize: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 12,
  },
  processingText: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  completeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  completeText: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    width: '100%',
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    color: '#ffffff',
  },
});