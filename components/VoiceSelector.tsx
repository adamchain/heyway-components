import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Volume2, Check, CircleCheck as CheckCircle, VolumeX, Settings, Filter, Users, User, Play, Pause } from 'lucide-react-native';
import { apiService } from '../services/apiService';
import { aiService, PREDEFINED_VOICES } from '@/services/aiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

interface VoiceSelectorProps {
  visible: boolean;
  onClose: () => void;
  onVoiceSelected: (voiceId: string, voiceName: string) => void;
  initialVoiceId?: string;
}

interface Voice {
  id: string;
  name: string;
  gender?: string;
  category?: string;
  description?: string;
  previewUrl?: string;
  preview_url?: string;
  is_cloned?: boolean;
  is_default?: boolean;
}

// Predefined test scenarios
const TEST_SCENARIOS = {
  greeting: "Hello! Welcome to our service. How can I assist you today?",
  professional: "Good day. I'm here to provide professional assistance with your business needs.",
  casual: "Hey there! What's up? I'm here to chat and help out with whatever you need.",
  helpful: "Hi! I'm your HeyWay, ready to help you solve problems and answer questions.",
  phone_call: "Thank you for calling. I'm here to help you with your inquiry. What can I do for you?",
  appointment: "I'd be happy to help you schedule an appointment. What date and time works best for you?",
  support: "I understand you're having an issue. Let me help you resolve this as quickly as possible.",
  friendly: "It's great to connect with you! I'm excited to help make your experience wonderful."
};

export default function VoiceSelector({
  visible,
  onClose,
  onVoiceSelected,
  initialVoiceId
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>(PREDEFINED_VOICES);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | undefined>(initialVoiceId);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Custom test message state
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customTestMessage, setCustomTestMessage] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof TEST_SCENARIOS>('greeting');

  // Filter state
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Use ref to keep track of current audio instance
  const audioRef = useRef<HTMLAudioElement | Audio.Sound | null>(null);
  const [audioPermissions, setAudioPermissions] = useState<boolean>(false);

  // Get unique categories and genders
  const categories = ['All', ...new Set(voices.map(v => v.category).filter((cat): cat is string => Boolean(cat)))];
  const genders = ['All', 'Male', 'Female'];

  // Filter voices based on selection
  const filteredVoices = voices.filter(voice => {
    const genderMatch = selectedGender === 'All' || voice.gender === selectedGender;
    const categoryMatch = selectedCategory === 'All' || voice.category === selectedCategory;
    return genderMatch && categoryMatch;
  });

  useEffect(() => {
    if (visible) {
      setSelectedVoiceId(initialVoiceId);
      // Request audio permissions on mount
      requestAudioPermissions();
      // Load saved custom message
      loadSavedTestMessage();
    }
  }, [visible, initialVoiceId]);

  const loadSavedTestMessage = async () => {
    try {
      const saved = await AsyncStorage.getItem('customVoiceTestMessage');
      if (saved !== null) {
        setCustomTestMessage(saved);
      }
    } catch (error) {
      console.log('No saved test message found');
    }
  };

  const saveTestMessage = async (message: string) => {
    try {
      await AsyncStorage.setItem('customVoiceTestMessage', message);
    } catch (error) {
      console.error('Failed to save test message:', error);
    }
  };

  const requestAudioPermissions = async () => {
    if (Platform.OS !== 'web') {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setAudioPermissions(status === 'granted');

        // Configure audio mode for playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Failed to request audio permissions:', error);
        setAudioPermissions(false);
      }
    } else {
      setAudioPermissions(true);
    }
  };

  // Cleanup audio when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        if (Platform.OS === 'web') {
          (audioRef.current as HTMLAudioElement).pause();
        } else {
          (audioRef.current as Audio.Sound).unloadAsync();
        }
        audioRef.current = null;
      }
    };
  }, []);

  // Stop any playing audio when modal closes
  useEffect(() => {
    if (!visible && audioRef.current) {
      if (Platform.OS === 'web') {
        (audioRef.current as HTMLAudioElement).pause();
      } else {
        (audioRef.current as Audio.Sound).unloadAsync();
      }
      setIsPlaying(null);
      setIsTestingVoice(false);
    }
  }, [visible]);

  const stopAudio = async () => {
    if (audioRef.current) {
      try {
        if (Platform.OS === 'web') {
          const audio = audioRef.current as HTMLAudioElement;
          audio.pause();
          audio.currentTime = 0;
        } else {
          const sound = audioRef.current as Audio.Sound;
          await sound.unloadAsync();
        }
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
      audioRef.current = null;
    }
    setIsPlaying(null);
    setIsTestingVoice(false);
  };

  const getTestMessage = (): string => {
    if (showCustomMessage && customTestMessage.trim()) {
      return customTestMessage.trim();
    }
    return TEST_SCENARIOS[selectedScenario];
  };

  const handleSelectVoice = async (voiceId: string, voiceName: string) => {
    try {
      // Stop any playing audio first
      await stopAudio();

      // Check if token exists
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found when selecting voice');
        setError('Authentication required. Please log in again.');
        return;
      }

      setSelectedVoiceId(voiceId);

      // Save selection to backend
      await apiService.saveAIConfig({
        voiceId: voiceId,
        voiceName: voiceName
      });

      onVoiceSelected(voiceId, voiceName);
    } catch (error) {
      console.error('Failed to select voice:', error);
      setError('Failed to save voice selection. Please try again.');
    }
  };

  const handleTestVoice = async (voiceId: string) => {
    try {
      // Clear any previous errors
      setError(null);

      // Check if token exists
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found when testing voice');
        setError('Authentication required. Please log in again.');
        return;
      }

      // Check audio permissions for native platforms
      if (Platform.OS !== 'web' && !audioPermissions) {
        setError('Audio permissions required. Please enable audio permissions and try again.');
        await requestAudioPermissions();
        return;
      }

      // If this voice is already playing, stop it
      if (isPlaying === voiceId) {
        await stopAudio();
        return;
      }

      // Stop any other playing audio
      await stopAudio();

      setIsPlaying(voiceId);
      setIsTestingVoice(true);

      console.log('🎵 Testing voice with message:', getTestMessage());

      // Get the test message and call the API with it
      const testMessage = getTestMessage();

      // Use aiService.testVoice with custom text instead of direct API call
      const audioUrl = await aiService.testVoice(voiceId, testMessage);

      if (!audioUrl) {
        throw new Error('No audio URL received from server');
      }

      // Play audio based on platform
      if (Platform.OS === 'web') {
        await playAudioWeb(audioUrl);
      } else {
        await playAudioNative(audioUrl);
      }
    } catch (error) {
      console.error('Failed to test voice:', error);
      setError(`Failed to test voice: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsPlaying(null);
      setIsTestingVoice(false);
    }
  };

  const playAudioWeb = async (audioUrl: string) => {
    try {
      // Create new audio instance
      const audio = new window.Audio();
      audioRef.current = audio;

      // Set up event listeners
      const handleEnded = () => {
        console.log('🎵 Audio playback ended');
        setIsPlaying(null);
        setIsTestingVoice(false);
        audioRef.current = null;
      };

      const handleError = (e: any) => {
        console.error('🎵 Audio error:', e);
        console.error('🎵 Audio error details:', audio.error);
        setError('Failed to play audio sample');
        setIsPlaying(null);
        setIsTestingVoice(false);
        audioRef.current = null;
      };

      const handleCanPlay = () => {
        console.log('🎵 Audio can play, starting playback...');
        audio.play().catch(handleError);
      };

      // Add event listeners
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);

      // Configure audio
      audio.volume = 0.7;
      audio.preload = 'auto';

      // Handle base64 data URLs properly
      if (audioUrl.startsWith('data:audio')) {
        // Direct base64 data URL
        console.log('🎵 Using direct base64 data URL');
        audio.src = audioUrl;
      } else {
        // Assume it's base64 without the data URL prefix
        console.log('🎵 Adding data URL prefix to base64');
        audio.src = `data:audio/mpeg;base64,${audioUrl}`;
      }

      // Start loading
      audio.load();
    } catch (error) {
      console.error('🎵 Web audio setup error:', error);
      setError('Failed to create audio player');
      setIsPlaying(null);
      setIsTestingVoice(false);
    }
  };

  const playAudioNative = async (audioUrl: string) => {
    try {
      console.log('🎵 Setting up native audio playback...');

      // Convert base64 to blob URL for expo-av
      let uri = audioUrl;

      // If it's a base64 string, convert it to a temporary file
      if (audioUrl.startsWith('data:audio') || !audioUrl.startsWith('http')) {
        // For base64 data, we need to create a temporary file
        const base64Data = audioUrl.includes('base64,')
          ? audioUrl.split('base64,')[1]
          : audioUrl;

        // Create a blob URL that expo-av can handle
        uri = `data:audio/mpeg;base64,${base64Data}`;
      }

      console.log('🎵 Creating sound object...');

      // Create and load the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true,
          volume: 0.7,
          isLooping: false
        }
      );

      audioRef.current = sound;

      // Set up status update listener
      sound.setOnPlaybackStatusUpdate((status: Audio.PlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setIsTestingVoice(false);
          sound.unloadAsync();
          audioRef.current = null;
        }
      });

      console.log('🎵 Native audio setup complete, should be playing...');

    } catch (error) {
      console.error('🎵 Native audio error:', error);
      setError(`Audio playback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsPlaying(null);
      setIsTestingVoice(false);
    }
  };

  const renderTestMessageCustomizer = () => (
    <View style={styles.testCustomizer}>
      <View style={styles.customizerHeader}>
        <Settings size={16} color="#34C759" />
        <Text style={styles.customizerTitle}>Customize Test Message</Text>
        <TouchableOpacity
          onPress={() => setShowCustomMessage(!showCustomMessage)}
          style={styles.expandButton}
        >
          <Text style={styles.expandButtonText}>
            {showCustomMessage ? 'Use Presets' : 'Custom Text'}
          </Text>
        </TouchableOpacity>
      </View>

      {!showCustomMessage ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scenarioScroll}>
          {Object.entries(TEST_SCENARIOS).map(([key, message]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.scenarioButton,
                selectedScenario === key && styles.scenarioButtonActive
              ]}
              onPress={() => setSelectedScenario(key as keyof typeof TEST_SCENARIOS)}
            >
              <Text style={[
                styles.scenarioButtonText,
                selectedScenario === key && styles.scenarioButtonTextActive
              ]}>
                {key.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.customTextContainer}>
          <TextInput
            style={styles.customTextInput}
            value={customTestMessage}
            onChangeText={(text) => {
              setCustomTestMessage(text);
              saveTestMessage(text);
            }}
            placeholder="Enter your custom test message..."
            multiline
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {customTestMessage.length}/200 characters
          </Text>
        </View>
      )}

      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Preview:</Text>
        <Text style={styles.previewText}>{getTestMessage()}</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterHeader}>
        <Filter size={16} color="#34C759" />
        <Text style={styles.filterTitle}>Filter Voices</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterToggle}
        >
          <Text style={styles.filterToggleText}>
            {showFilters ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterOptions}>
          {/* Gender Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Gender</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {genders.map(gender => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.filterButton,
                    selectedGender === gender && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedGender(gender)}
                >
                  {gender === 'Male' && <User size={14} color={selectedGender === gender ? '#ffffff' : '#34C759'} />}
                  {gender === 'Female' && <Users size={14} color={selectedGender === gender ? '#ffffff' : '#34C759'} />}
                  <Text style={[
                    styles.filterButtonText,
                    selectedGender === gender && styles.filterButtonTextActive
                  ]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterButton,
                    selectedCategory === category && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedCategory === category && styles.filterButtonTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Results count */}
      <Text style={styles.resultsCount}>
        Showing {filteredVoices.length} of {voices.length} voices
      </Text>
    </View>
  );

  const renderVoiceItem = (voice: Voice) => {
    const isCurrentlyPlaying = isPlaying === voice.id;
    const isThisVoiceTesting = isTestingVoice && isCurrentlyPlaying;

    return (
      <View key={voice.id} style={styles.voiceItem}>
        <TouchableOpacity
          style={[
            styles.voiceSelector,
            selectedVoiceId === voice.id && styles.voiceSelectorSelected
          ]}
          onPress={() => handleSelectVoice(voice.id, voice.name)}
        >
          <View style={styles.voiceInfo}>
            <View style={styles.voiceHeader}>
              <Text style={styles.voiceName}>{voice.name}</Text>
              {voice.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{voice.category}</Text>
                </View>
              )}
            </View>
            <View style={styles.voiceDetails}>
              {voice.gender && (
                <Text style={styles.voiceGender}>{voice.gender}</Text>
              )}
              {voice.description && (
                <Text style={styles.voiceDescription}>{voice.description}</Text>
              )}
            </View>
          </View>

          <View style={styles.voiceActions}>
            <TouchableOpacity
              style={[
                styles.testButton,
                isCurrentlyPlaying && styles.testButtonActive
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleTestVoice(voice.id);
              }}
              disabled={isTestingVoice && !isCurrentlyPlaying}
            >
              {isThisVoiceTesting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : isCurrentlyPlaying ? (
                <VolumeX size={20} color="#ffffff" />
              ) : (
                <Volume2 size={20} color="#34C759" />
              )}
            </TouchableOpacity>

            <View style={[
              styles.radioButton,
              selectedVoiceId === voice.id && styles.radioButtonSelected
            ]}>
              {selectedVoiceId === voice.id && (
                <Check size={16} color="#FFFFFF" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Voice ({filteredVoices.length})</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => setError(null)}
              style={styles.errorDismiss}
            >
              <X size={16} color="#dc3545" />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.description}>
            Choose a voice for your HeyWay calls. Customize the test message and use filters to find the perfect voice style.
          </Text>

          {renderTestMessageCustomizer()}
          {renderFilters()}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#34C759" />
              <Text style={styles.loadingText}>Loading voices...</Text>
            </View>
          ) : (
            <View style={styles.voiceListContainer}>
              {filteredVoices.map(renderVoiceItem)}
            </View>
          )}
        </ScrollView>

        {selectedVoiceId && (
          <View style={styles.footer}>
            <View style={styles.selectedVoiceContainer}>
              <CheckCircle size={20} color="#34C759" />
              <Text style={styles.selectedVoiceText}>
                Voice selected: {voices.find(v => v.id === selectedVoiceId)?.name || 'Custom Voice'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  title: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: HEYWAY_SPACING.xl,
    paddingBottom: 100, // Extra padding at bottom for footer
  },
  voiceListContainer: {
    gap: HEYWAY_SPACING.md,
  },
  description: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.xxl,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  errorContainer: {
    backgroundColor: HEYWAY_COLORS.status.error + '20',
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    padding: HEYWAY_SPACING.md,
    margin: HEYWAY_SPACING.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.error,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.status.error,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  errorDismiss: {
    padding: HEYWAY_SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    marginTop: HEYWAY_SPACING.lg,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  voiceItem: {
    // No marginBottom needed since we use gap in container
  },
  voiceSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  voiceSelectorSelected: {
    borderColor: HEYWAY_COLORS.interactive.primary,
    borderWidth: 2,
    backgroundColor: HEYWAY_COLORS.interactive.selected,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: HEYWAY_SPACING.xs,
  },
  voiceName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  categoryBadge: {
    backgroundColor: HEYWAY_COLORS.interactive.primary + '20',
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    borderRadius: HEYWAY_RADIUS.component.badge.md,
  },
  categoryBadgeText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.interactive.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  voiceDetails: {
    gap: HEYWAY_SPACING.xs,
  },
  voiceGender: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  voiceDescription: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  voiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.lg,
  },
  testButton: {
    width: 40,
    height: 40,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    backgroundColor: HEYWAY_COLORS.interactive.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.interactive.primary + '40',
    ...HEYWAY_SHADOWS.light.xs,
  },
  testButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    borderWidth: 2,
    borderColor: HEYWAY_COLORS.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
  },
  footer: {
    padding: HEYWAY_SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  selectedVoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.sm,
  },
  selectedVoiceText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  doneButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.lg,
    alignItems: 'center',
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.sm,
  },
  doneButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  // Test message customizer styles
  testCustomizer: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  customizerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
  },
  customizerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  expandButton: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.xs,
    backgroundColor: HEYWAY_COLORS.interactive.primary + '20',
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    ...HEYWAY_SHADOWS.light.xs,
  },
  expandButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.interactive.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  scenarioScroll: {
    marginBottom: HEYWAY_SPACING.md,
  },
  scenarioButton: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    borderRadius: HEYWAY_RADIUS.component.button.xl,
    marginRight: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  scenarioButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  scenarioButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    textTransform: 'capitalize',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  scenarioButtonTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  customTextContainer: {
    marginBottom: HEYWAY_SPACING.md,
  },
  customTextInput: {
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    padding: HEYWAY_SPACING.md,
    minHeight: 80,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    ...HEYWAY_SHADOWS.light.xs,
  },
  characterCount: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'right',
    marginTop: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  previewContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    padding: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    borderLeftWidth: HEYWAY_SPACING.xs,
    borderLeftColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  previewLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  previewText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  // Filter styles
  filtersContainer: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
  },
  filterTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  filterToggle: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.xs,
    backgroundColor: HEYWAY_COLORS.interactive.primary + '20',
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    ...HEYWAY_SHADOWS.light.xs,
  },
  filterToggleText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.interactive.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  filterOptions: {
    gap: HEYWAY_SPACING.lg,
  },
  filterGroup: {
    gap: HEYWAY_SPACING.sm,
  },
  filterGroupTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.tertiary,
    borderRadius: HEYWAY_RADIUS.component.button.xl,
    marginRight: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    gap: HEYWAY_SPACING.xs,
    ...HEYWAY_SHADOWS.light.xs,
  },
  filterButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  filterButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  filterButtonTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  resultsCount: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginTop: HEYWAY_SPACING.sm,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});