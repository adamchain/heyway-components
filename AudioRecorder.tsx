import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { SPACING, TYPOGRAPHY, RADIUS } from '@/components/designSystem';

// iOS Native Colors to match AutomationsManager
const IOS_COLORS = {
  background: '#000000',
  cardBackground: '#1C1C1E',
  buttonBackground: '#3A3A3C',
  text: {
    primary: '#FFFFFF',
    secondary: '#AEAEB2',
    tertiary: '#636366',
  },
  accent: '#007AFF',
  success: '#34C759',
  error: '#FF3B30',
  separator: '#3A3A3C',
};

interface AudioRecorderProps {
  onAudioRecorded?: (audioUri: string, duration: number) => void;
  onAudioDeleted?: () => void;
  initialAudioUri?: string | null;
  disabled?: boolean;
}

export default function AudioRecorder({
  onAudioRecorded,
  onAudioDeleted,
  initialAudioUri,
  disabled = false
}: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(initialAudioUri || null);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Web-specific recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
      if (Platform.OS === 'web') {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      } else {
        // Don't call stopAndUnloadAsync here as it's handled in stopRecording
        // The recording will be properly cleaned up when stopping
      }
    };
  }, [sound, mediaRecorder]);

  useEffect(() => {
    if (initialAudioUri) {
      setAudioUri(initialAudioUri);
    }
  }, [initialAudioUri]);

  // Cleanup effect for recording object changes
  useEffect(() => {
    return () => {
      // Clean up recording if component unmounts while recording is active
      if (Platform.OS !== 'web' && recording && isRecording) {
        recording.stopAndUnloadAsync().catch(console.warn);
      }
    };
  }, [recording, isRecording]);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
      } else {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Alert.alert('Permission Required', 'Microphone access is required for recording');
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      Alert.alert('Permission Required', 'Microphone access is required for recording');
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      console.log('🎤 Starting audio recording...');
      setIsLoading(true);
      setRecordingDuration(0);

      if (Platform.OS === 'web') {
        await startWebRecording();
      } else {
        await startNativeRecording();
      }

      // Start duration timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      setIsRecording(true);
      setIsLoading(false);
      console.log('🎤 Recording started successfully');
    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsLoading(false);
    }
  };

  const startWebRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = 'audio/webm;codecs=opus';

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUri(audioUrl);
      onAudioRecorded?.(audioUrl, recordingDuration);

      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
    };

    recorder.start();
    setMediaRecorder(recorder);
    setAudioChunks(chunks);
  };

  const startNativeRecording = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    
    setRecording(newRecording);
  };


  const stopRecording = async () => {
    try {
      console.log('🛑 Stopping audio recording...');
      setIsLoading(true);
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      setIsRecording(false);

      if (Platform.OS === 'web') {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setMediaRecorder(null);
          console.log('🛑 Web recording stopped successfully');
        }
      } else {
        if (!recording) {
          console.log('❌ No recording to stop');
          setIsLoading(false);
          return;
        }

        // Stop the recording first, then get URI
        let uri = null;
        try {
          await recording.stopAndUnloadAsync();
          uri = recording.getURI();
          console.log('🛑 Recording URI after stopping:', uri);
          console.log('🛑 Recording stopped and unloaded successfully');
        } catch (stopError) {
          console.error('❌ Error stopping/unloading recording:', stopError);
          // Try to get URI even if stop failed
          try {
            uri = recording.getURI();
          } catch (uriError) {
            console.warn('⚠️ Could not get recording URI:', uriError);
          }
        }
        
        if (uri) {
          setAudioUri(uri);
          onAudioRecorded?.(uri, recordingDuration);
          console.log('✅ Recording saved successfully:', uri);
        } else {
          console.error('❌ No recording URI available');
          Alert.alert('Error', 'Recording failed - no audio file was created. Please try again.');
        }

        setRecording(null);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
      setIsLoading(false);
    }
  };

  const playAudio = async () => {
    try {
      if (!audioUri) return;
      
      if (Platform.OS === 'web') {
        // For web, create audio element
        const audio = new window.Audio(audioUri);
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      } else {
        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio.');
    }
  };

  const pauseAudio = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we'd need to track the audio element
        setIsPlaying(false);
      } else {
        if (sound) {
          await sound.pauseAsync();
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const deleteAudio = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this voice message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (audioUri) {
                // Try to delete the file (only for native platforms)
                if (Platform.OS !== 'web') {
                  try {
                    await FileSystem.deleteAsync(audioUri);
                  } catch (deleteError) {
                    console.warn('Could not delete audio file:', deleteError);
                  }
                } else {
                  // For web, revoke the object URL
                  URL.revokeObjectURL(audioUri);
                }
              }
              setAudioUri(null);
              setRecordingDuration(0);
              onAudioDeleted?.();
            } catch (error) {
              console.error('Error deleting audio:', error);
            }
          }
        }
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If we have an existing audio recording
  if (audioUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Voice Message</Text>
        <View style={styles.audioControls}>
          <View style={styles.audioInfo}>
            <View style={styles.waveformPlaceholder}>
              <View style={styles.waveformBars}>
                {[...Array(8)].map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.waveformBar, 
                      { height: Math.random() * 20 + 10 }
                    ]} 
                  />
                ))}
              </View>
            </View>
            <Text style={styles.durationText}>
              {formatDuration(recordingDuration)}
            </Text>
          </View>
          
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={isPlaying ? pauseAudio : playAudio}
              disabled={disabled}
            >
              {isPlaying ? (
                <Pause size={20} color={IOS_COLORS.text.primary} />
              ) : (
                <Play size={20} color={IOS_COLORS.text.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.deleteButton]}
              onPress={deleteAudio}
              disabled={disabled}
            >
              <Trash2 size={18} color={IOS_COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.hint}>
          Voice message will play first, then AI instructions if needed
        </Text>
      </View>
    );
  }

  // Recording interface
  return (
    <View style={styles.container}>
      {/* <Text style={styles.label}>Voice Message</Text> */}
      
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              Recording... {formatDuration(recordingDuration)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRecording}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={IOS_COLORS.text.primary} />
            ) : (
              <Square size={24} color={IOS_COLORS.text.primary} />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.recordButton}
          onPress={startRecording}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={IOS_COLORS.text.primary} />
          ) : (
            <>
              <Mic size={24} color={IOS_COLORS.accent} />
              <Text style={styles.recordButtonText}>Tap to record voice message</Text>
            </>
          )}
        </TouchableOpacity>
      )}
      
      {/* <Text style={styles.hint}>
        Record a personal voice message (optional). This will play before AI instructions.
      </Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  recordButton: {
    backgroundColor: IOS_COLORS.cardBackground,
    borderWidth: 1,
    borderColor: IOS_COLORS.separator,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recordButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: IOS_COLORS.text.secondary,
    fontWeight: '500',
  },
  recordingContainer: {
    backgroundColor: IOS_COLORS.cardBackground,
    borderWidth: 1,
    borderColor: IOS_COLORS.separator,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: IOS_COLORS.error,
  },
  recordingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: IOS_COLORS.text.primary,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: IOS_COLORS.error,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioControls: {
    backgroundColor: IOS_COLORS.cardBackground,
    borderWidth: 1,
    borderColor: IOS_COLORS.separator,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  waveformPlaceholder: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    paddingRight: SPACING.md,
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveformBar: {
    width: 3,
    backgroundColor: IOS_COLORS.accent,
    borderRadius: 1.5,
  },
  durationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: IOS_COLORS.text.secondary,
    fontWeight: '500',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  controlButton: {
    backgroundColor: IOS_COLORS.buttonBackground,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: IOS_COLORS.error,
  },
  hint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: IOS_COLORS.text.tertiary,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
});