import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Square, Play, Pause, CircleCheck as CheckCircle } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';

interface VoiceRecorderProps {
  onRecordingComplete: (recordingUri: string, duration: number) => void;
  maxDuration?: number; // in seconds
}

export default function VoiceRecorder({ onRecordingComplete, maxDuration = 60 }: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Web-specific recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (timer) {
        clearInterval(timer);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [sound, mediaRecorder, timer, recording]);

  const requestPermissions = async () => {
    if (permissionRequested) return hasPermission;

    setPermissionRequested(true);

    if (Platform.OS === 'web') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
        return true;
      } catch (error) {
        console.error('Web audio permission denied:', error);
        setHasPermission(false);
        Alert.alert('Permission Required', 'Microphone access is required for recording');
        return false;
      }
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (!granted) {
        Alert.alert('Permission Required', 'Microphone access is required for recording');
      }

      return granted;
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      setHasPermission(false);
      return false;
    }
  };

  const startRecording = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    try {
      if (Platform.OS === 'web') {
        await startWebRecording();
      } else {
        await startNativeRecording();
      }

      // Start duration timer
      setDuration(0);
      const intervalId = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            clearInterval(intervalId);
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      setTimer(intervalId);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use webm with opus codec as it's widely supported across browsers
      const mimeType = 'audio/webm;codecs=opus';

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordingUri(audioUrl);
        setAudioChunks(chunks);
        onRecordingComplete(audioUrl, duration);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Auto-stop after maxDuration
      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopRecording();
        }
      }, maxDuration * 1000);

    } catch (error) {
      console.error('Web recording error:', error);
      throw error;
    }
  };

  const startNativeRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 128000,
        },
      });

      setRecording(newRecording);
      setIsRecording(true);

      // Auto-stop after maxDuration
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, maxDuration * 1000);

    } catch (error) {
      console.error('Native recording error:', error);
      throw error;
    }
  };

  const stopRecording = async () => {
    try {
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }

      setIsProcessing(true);

      if (Platform.OS === 'web') {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setMediaRecorder(null);
        }
      } else {
        if (!recording) return;

        setIsRecording(false);
        await recording.stopAndUnloadAsync();

        const uri = recording.getURI();
        if (uri) {
          setRecordingUri(uri);
          onRecordingComplete(uri, duration);
        }

        setRecording(null);
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      if (Platform.OS === 'web') {
        // For web, create audio element
        const audio = new window.Audio(recordingUri);
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      } else {
        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordingUri });
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });

        await newSound.playAsync();
      }
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const stopPlayback = async () => {
    if (Platform.OS === 'web') {
      // For web, we'd need to track the audio element
      setIsPlaying(false);
    } else {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {!isRecording && !recordingUri && (
        <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
          <Mic size={24} color="#FFFFFF" />
          <Text style={styles.recordButtonText}>Start Recording</Text>
        </TouchableOpacity>
      )}

      {isRecording && (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording... {formatDuration(duration)}</Text>
          </View>

          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <Square size={24} color="#FFFFFF" />
            <Text style={styles.stopButtonText}>Stop Recording</Text>
          </TouchableOpacity>
        </View>
      )}

      {recordingUri && !isRecording && (
        <View style={styles.playbackSection}>
          <View style={styles.recordingStatus}>
            <CheckCircle size={20} color="#000000" />
            <Text style={styles.recordingStatusText}>Recording saved</Text>
          </View>

          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={isPlaying ? stopPlayback : playRecording}
            >
              {isPlaying ? (
                <Pause size={20} color="#000000" />
              ) : (
                <Play size={20} color="#000000" />
              )}
              <Text style={styles.playButtonText}>
                {isPlaying ? 'Stop' : 'Play'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reRecordButton}
              onPress={() => {
                setRecordingUri(null);
                setDuration(0);
              }}
            >
              <Mic size={20} color="#000000" />
              <Text style={styles.reRecordButtonText}>Re-record</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.processingText}>Processing recording...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    marginVertical: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.xs,
  },
  recordButtonText: {
    marginLeft: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  recordingContainer: {
    alignItems: 'center',
    gap: HEYWAY_SPACING.lg,
    marginVertical: HEYWAY_SPACING.sm,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    width: '100%',
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },
  stopButtonText: {
    marginLeft: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: HEYWAY_RADIUS.xs,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    marginRight: HEYWAY_SPACING.sm,
  },
  recordingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  playbackSection: {
    alignItems: 'center',
    gap: HEYWAY_SPACING.lg,
    width: '100%',
    marginVertical: HEYWAY_SPACING.sm,
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
  },
  recordingStatusText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    width: '100%',
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  playButtonText: {
    marginLeft: HEYWAY_SPACING.xs,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  reRecordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  reRecordButtonText: {
    marginLeft: HEYWAY_SPACING.xs,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: HEYWAY_COLORS.background.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HEYWAY_RADIUS.component.card.sm,
  },
  processingText: {
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});