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
import { COLORS, RADIUS, SHADOWS } from '@/components/designSystem';

import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Volume2, Check, CircleCheck as CheckCircle, VolumeX, Settings, Filter, Users, User, Play, Pause } from 'lucide-react-native';
import { apiService } from '@/services/apiService';
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
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.secondary,
    borderBottomColor: COLORS.border.primary,
  },
  title: {
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding at bottom for footer
  },
  voiceListContainer: {
    gap: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'System',
    color: COLORS.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // Using rgba for transparency
    borderRadius: RADIUS.sm,
    padding: 12,
    margin: 20,
    borderWidth: 1,
    borderColor: COLORS.error,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'System',
    color: COLORS.error,
    flex: 1,
  },
  errorDismiss: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'System',
    color: COLORS.text.secondary,
    marginTop: 16,
  },
  voiceItem: {
    // No marginBottom needed since we use gap in container
  },
  voiceSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    ...SHADOWS.sm,
  },
  voiceSelectorSelected: {
    borderColor: COLORS.accent,
    borderWidth: 2,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  voiceName: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(254, 44, 85, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.md,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '500',
  },
  voiceDetails: {
    gap: 2,
  },
  voiceGender: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  voiceDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
  },
  voiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  testButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(254, 44, 85, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(254, 44, 85, 0.2)',
  },
  testButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.primary,
    backgroundColor: COLORS.background.secondary,
  },
  selectedVoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  selectedVoiceText: {
    fontSize: 16,
    fontFamily: 'System',
    color: COLORS.text.primary,
  },
  doneButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  // Test message customizer styles
  testCustomizer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  customizerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  customizerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
  },
  expandButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(254, 44, 85, 0.1)',
    borderRadius: RADIUS.lg,
  },
  expandButtonText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  scenarioScroll: {
    marginBottom: 12,
  },
  scenarioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: RADIUS.xl,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border.secondary,
  },
  scenarioButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  scenarioButtonText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  scenarioButtonTextActive: {
    color: COLORS.text.primary,
  },
  customTextContainer: {
    marginBottom: 12,
  },
  customTextInput: {
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    borderRadius: RADIUS.sm,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    color: COLORS.text.primary,
    fontFamily: 'System',
    backgroundColor: COLORS.background.primary,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  previewContainer: {
    backgroundColor: COLORS.background.primary,
    padding: 12,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    fontFamily: 'System',
  },
  // Filter styles
  filtersContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
    fontFamily: 'System',
  },
  filterToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(254, 44, 85, 0.1)',
    borderRadius: RADIUS.lg,
  },
  filterToggleText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  filterOptions: {
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: RADIUS.xl,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border.secondary,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
    fontFamily: 'System',
  },
  filterButtonTextActive: {
    color: COLORS.text.primary,
  },
  resultsCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
});