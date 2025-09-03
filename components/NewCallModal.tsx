import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Animated,
  Easing,
  SafeAreaView,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { X, Users, Building, Calendar, Phone, Minimize2, Maximize2, Send, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import CallScheduler from '@/components/CallScheduler';

// Import updated design system
import {
  HEYWAY_COLORS,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_SPACING,
  HEYWAY_LAYOUT,
  HEYWAY_COMPONENTS,
  HEYWAY_CHAT_PATTERNS
} from '../styles/HEYWAY_STYLE_GUIDE';

// Hooks and Services
import { useContacts } from '@/hooks/useContacts';
import { useAICallerPrompts } from '@/hooks/useAICallerPrompts';
import { useCallerId } from '@/hooks/useCallerId';
import { apiService } from '../services/apiService';

interface NewCallModalProps {
  visible: boolean;
  onClose: () => void;
  preSelectedContacts?: any[];
  onNavigateToRecents?: () => void;
  asPanel?: boolean;
}

export default function NewCallModal({ visible, onClose, preSelectedContacts = [], onNavigateToRecents, asPanel = false }: NewCallModalProps) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const contacts = useContacts();
  const aiCallerPrompts = useAICallerPrompts();
  const callerId = useCallerId();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState('Everyone');
  const [isPhoneNumberMode, setIsPhoneNumberMode] = useState(false);
  const [isBusinessMode, setIsBusinessMode] = useState(false);
  const [isContactsMode, setIsContactsMode] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCallList, setSelectedCallList] = useState<any[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [callPrompt, setCallPrompt] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);

  // Animation refs
  const slideUpAnim = useRef(new Animated.Value(200)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const aiGlowAnim = useRef(new Animated.Value(0)).current;
  const modalEntranceAnim = useRef(new Animated.Value(0)).current;
  const fabPulseAnim = useRef(new Animated.Value(1)).current;
  const minimizeAnim = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(screenWidth)).current;

  // Panel width calculation
  const panelWidth = Math.min(400, screenWidth * 0.4);

  // Enhanced entrance animation for right-side panel
  useEffect(() => {
    if (visible) {
      slideInAnim.setValue(screenWidth);
      Animated.spring(slideInAnim, {
        toValue: 0,
        tension: 280,
        friction: 30,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideInAnim, {
        toValue: screenWidth,
        tension: 400,
        friction: 25,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, screenWidth]);

  // Minimize animation
  useEffect(() => {
    Animated.spring(minimizeAnim, {
      toValue: isMinimized ? 1 : 0,
      tension: 300,
      friction: 25,
      useNativeDriver: false,
    }).start();
  }, [isMinimized]);

  // AI Glow Animation with more subtle effect
  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(aiGlowAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(aiGlowAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, []);

  // Pulse animation for call button
  useEffect(() => {
    if (selectedCallList.length > 0) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(fabPulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fabPulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [selectedCallList.length]);

  // Search focus animation
  useEffect(() => {
    Animated.timing(searchFocusAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused]);

  // Load contacts when modal becomes visible
  useEffect(() => {
    if (visible) {
      contacts.loadContacts();
    }
  }, [visible]);

  // Set pre-selected contacts when modal becomes visible
  useEffect(() => {
    if (visible && preSelectedContacts.length > 0) {
      setSelectedCallList(preSelectedContacts);
    }
  }, [visible, preSelectedContacts]);

  // Search effect
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(searchTimeout);
  }, [searchQuery, isBusinessMode, isPhoneNumberMode]);

  // Clear search and reset
  const clearSearchAndReset = () => {
    setSearchQuery('');
    setIsPhoneNumberMode(false);
    setIsBusinessMode(false);
    setIsContactsMode(false);
    setSearchResults([]);
    setCallPrompt('');
  };

  // Add item to selected call list
  const addToCallList = (item: any) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const exists = selectedCallList.find(existing => existing.phoneNumber === item.phoneNumber);
    if (!exists) {
      setSelectedCallList(prev => [...prev, item]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove item from selected call list
  const removeFromCallList = (phoneNumber: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCallList(prev => prev.filter(item => item.phoneNumber !== phoneNumber));
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };

      setCurrentLocation(coords);
      return coords;
    } catch (error) {
      console.warn('Failed to get current location:', error);
      return null;
    }
  };

  // Enhanced search function
  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      if (isBusinessMode) {
        let locationToUse = currentLocation;
        if (!locationToUse) {
          locationToUse = await getCurrentLocation();
        }

        const searchParams = {
          query: searchQuery.trim(),
          coordinates: locationToUse || undefined,
          radius: 10000,
        };

        const response = await apiService.searchBusinesses(searchParams);
        if (response && Array.isArray(response)) {
          const formattedResults = response
            .filter((place: any) => place.formatted_phone_number || place.international_phone_number)
            .map((place: any) => ({
              id: place.place_id || place.id,
              name: place.name || 'Unknown Business',
              phoneNumber: place.formatted_phone_number || place.international_phone_number,
              address: place.formatted_address || place.vicinity || 'Address not available',
              distance: place.distance || undefined,
              rating: place.rating || undefined,
              type: 'business'
            }));
          setSearchResults(formattedResults);
        } else {
          setSearchResults([]);
        }
      } else if (isPhoneNumberMode) {
        setSearchResults([{
          id: 'phone',
          name: searchQuery,
          phoneNumber: searchQuery,
          type: 'phone'
        }]);
      } else if (isContactsMode) {
        const filtered = contacts.contacts.filter((contact: any) =>
          contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phoneNumber?.includes(searchQuery)
        );
        setSearchResults(filtered.map((contact: any) => ({
          ...contact,
          type: 'contact'
        })));
      } else {
        // "Everyone" mode - search both contacts AND businesses
        const contactResults = contacts.contacts.filter((contact: any) =>
          contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phoneNumber?.includes(searchQuery)
        ).map((contact: any) => ({
          ...contact,
          type: 'contact'
        }));

        let locationToUse = currentLocation;
        if (!locationToUse) {
          locationToUse = await getCurrentLocation();
        }

        let businessResults: any[] = [];
        try {
          const searchParams = {
            query: searchQuery.trim(),
            coordinates: locationToUse || undefined,
            radius: 10000,
          };

          const response = await apiService.searchBusinesses(searchParams);
          if (response && Array.isArray(response)) {
            businessResults = response
              .filter((place: any) => place.formatted_phone_number || place.international_phone_number)
              .map((place: any) => ({
                id: place.place_id || place.id,
                name: place.name || 'Unknown Business',
                phoneNumber: place.formatted_phone_number || place.international_phone_number,
                address: place.formatted_address || place.vicinity || 'Address not available',
                distance: place.distance || undefined,
                rating: place.rating || undefined,
                type: 'business'
              }));
          }
        } catch (error) {
          console.error('Business search error in all mode:', error);
        }

        const allResults = [...contactResults, ...businessResults];
        setSearchResults(allResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle make call with enhanced feedback
  const handleMakeCall = useCallback(async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      // Update the form data with call prompt
      aiCallerPrompts.updateFormData('message', callPrompt);

      const callResponse = await aiCallerPrompts.makeAICall(selectedCallList);

      if (callResponse) {
        // Call was successful - clear selected contacts and navigate to recents
        setSelectedCallList([]);
        onClose();
        if (onNavigateToRecents) {
          onNavigateToRecents();
        }
      }
    } catch (error) {
      console.error('Call initiation error:', error);
    }
  }, [aiCallerPrompts, selectedCallList, onClose, onNavigateToRecents, callPrompt]);

  // Handle schedule call
  const handleScheduleCall = async (scheduledTime: Date, notes: string) => {
    try {
      const phoneNumbers = selectedCallList.map(item => item.phoneNumber);

      // Schedule the call via API
      await apiService.scheduleCall({
        recipients: phoneNumbers,
        scheduledTime: scheduledTime.toISOString(),
        notes: notes || '',
        voiceId: aiCallerPrompts.selectedPrompt?.voiceId,
        voiceName: aiCallerPrompts.selectedPrompt?.name,
        callMode: aiCallerPrompts.selectedPrompt?.key === 'standard' ? 'intro+ai' : 'ai-only',
        callerId: callerId || undefined,
      });

      setShowScheduler(false);
      console.log('✅ Call scheduled successfully for:', phoneNumbers, 'at:', scheduledTime);
      Alert.alert('Success', `Call scheduled for ${scheduledTime.toLocaleString()}`);
      setSelectedCallList([]);
      onClose();
    } catch (error) {
      console.error('❌ Failed to schedule call:', error);
      Alert.alert('Error', 'Failed to schedule call. Please try again.');
    }
  };

  // Enhanced close handler
  const handleClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    clearSearchAndReset();
    setSelectedCallList([]);
    setShowScheduler(false);
    onClose();
  };

  // Handle tab selection with haptic feedback
  const handleTabSelect = (tab: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMode(tab);
    setIsPhoneNumberMode(tab === 'Number');
    setIsBusinessMode(tab === 'Businesses');
    setIsContactsMode(tab === 'Contacts');
    setShowModeSelector(false);
  };

  // Toggle minimize
  const toggleMinimize = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsMinimized(!isMinimized);
  };

  // Render search result item
  const renderSearchResultItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => addToCallList(item)}
      activeOpacity={0.8}
    >
      <View style={styles.resultIconContainer}>
        {item.type === 'contact' ? (
          <Users size={16} color={HEYWAY_COLORS.text.primary} />
        ) : item.type === 'business' ? (
          <Building size={16} color={HEYWAY_COLORS.text.primary} />
        ) : (
          <Phone size={16} color={HEYWAY_COLORS.text.primary} />
        )}
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
        {item.address && (
          <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => (
    <Animated.View
      style={[
        styles.modalContainer,
        {
          width: panelWidth,
          transform: [
            {
              translateX: slideInAnim
            }
          ],
          height: minimizeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [screenHeight, 60],
          }),
        }
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Apple Mail-style Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.composeLabel}>New Call</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.7}
              onPress={toggleMinimize}
            >
              {isMinimized ? <Maximize2 size={16} color={HEYWAY_COLORS.text.secondary} /> : <Minimize2 size={16} color={HEYWAY_COLORS.text.secondary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.7}
              onPress={handleClose}
            >
              <X size={16} color={HEYWAY_COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {!isMinimized && (
          <>
            {/* Apple Mail-style Form */}
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.form}>
                {/* To Field */}
                <View style={styles.formRow}>
                  <Text style={styles.fieldLabel}>To:</Text>
                  <View style={styles.fieldInput}>
                    <TextInput
                      style={styles.recipientInput}
                      placeholder="Add contacts, phone numbers, or businesses..."
                      placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                    />

                    {/* Mode Selector */}
                    <TouchableOpacity
                      style={styles.modeSelector}
                      onPress={() => setShowModeSelector(!showModeSelector)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modeSelectorText}>{mode}</Text>
                      <ChevronDown size={14} color={HEYWAY_COLORS.text.secondary} />
                    </TouchableOpacity>

                    {showModeSelector && (
                      <View style={styles.modeDropdown}>
                        <TouchableOpacity style={styles.modeOption} onPress={() => handleTabSelect('Everyone')}>
                          <Text style={styles.modeOptionText}>Everyone</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modeOption} onPress={() => handleTabSelect('Contacts')}>
                          <Text style={styles.modeOptionText}>Contacts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modeOption} onPress={() => handleTabSelect('Businesses')}>
                          <Text style={styles.modeOptionText}>Businesses</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modeOption} onPress={() => handleTabSelect('Number')}>
                          <Text style={styles.modeOptionText}>Phone Number</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {searchResults.length > 0 && (
                      <View style={styles.searchResults}>
                        {searchResults.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.searchResultItem}
                            onPress={() => addToCallList(item)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.resultIconContainer}>
                              {item.type === 'contact' ? (
                                <Users size={16} color={HEYWAY_COLORS.text.primary} />
                              ) : item.type === 'business' ? (
                                <Building size={16} color={HEYWAY_COLORS.text.primary} />
                              ) : (
                                <Phone size={16} color={HEYWAY_COLORS.text.primary} />
                              )}
                            </View>
                            <View style={styles.resultContent}>
                              <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                              {item.address && (
                                <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Call Prompt */}
                <View style={styles.formRow}>
                  <Text style={styles.fieldLabel}>Prompt:</Text>
                  <View style={styles.fieldInput}>
                    <TextInput
                      style={styles.promptInput}
                      placeholder="Enter your call prompt..."
                      placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                      value={callPrompt}
                      onChangeText={setCallPrompt}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                {/* Selected Recipients Display */}
                {selectedCallList.length > 0 && (
                  <View style={styles.recipientsDisplay}>
                    <Text style={styles.recipientsTitle}>Recipients:</Text>
                    <View style={styles.recipientsChips}>
                      {selectedCallList.map((item) => (
                        <View key={item.phoneNumber} style={styles.recipientChip}>
                          <Text style={styles.recipientChipText}>{item.name}</Text>
                          <TouchableOpacity
                            onPress={() => removeFromCallList(item.phoneNumber)}
                            style={styles.removeChipButton}
                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                          >
                            <X size={12} color={HEYWAY_COLORS.text.secondary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => setShowScheduler(true)}
                activeOpacity={0.8}
              >
                <Calendar size={18} color={HEYWAY_COLORS.text.primary} />
                <Text style={styles.scheduleButtonText}>Schedule</Text>
              </TouchableOpacity>

              <Animated.View style={{ transform: [{ scale: fabPulseAnim }] }}>
                <TouchableOpacity
                  style={[
                    styles.callButton,
                    selectedCallList.length === 0 && styles.callButtonDisabled
                  ]}
                  onPress={handleMakeCall}
                  disabled={aiCallerPrompts.isLoading || selectedCallList.length === 0}
                  activeOpacity={0.9}
                >
                  <Phone size={18} color={HEYWAY_COLORS.text.inverse} />
                  <Text style={[
                    styles.callButtonText,
                    selectedCallList.length === 0 && styles.callButtonTextDisabled
                  ]}>
                    Call Now
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Animated.View>
  );

  if (asPanel) {
    return visible ? renderContent() : null;
  }

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.modalBackground}>
        {renderContent()}

        {/* Enhanced Modals */}
        <CallScheduler
          visible={showScheduler}
          onClose={() => setShowScheduler(false)}
          onSchedule={handleScheduleCall}
          recipients={selectedCallList.map(item => item.phoneNumber)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  /* BACKDROP */
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  /* RIGHT PANEL CONTAINER */
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: HEYWAY_RADIUS.xxl,
    borderBottomLeftRadius: HEYWAY_RADIUS.xxl,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#E3E5E8',
    ...HEYWAY_SHADOWS.light.xl,
    height: '100%',
  },
  keyboardContainer: { flex: 1 },

  /* HEADER — quiet, Mail-like */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E5E8',
    borderTopLeftRadius: HEYWAY_RADIUS.xxl,
  },
  headerLeft: { flex: 1 },
  composeLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: '700' as const,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.3,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: HEYWAY_SPACING.xs },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: HEYWAY_RADIUS.xl,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  /* FORM AREA */
  formContainer: { flex: 1 },
  form: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingTop: HEYWAY_SPACING.md,
    paddingBottom: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.lg,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HEYWAY_SPACING.md,
  },
  fieldLabel: {
    width: 60,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    paddingTop: HEYWAY_SPACING.sm,
    letterSpacing: -0.1,
  },
  fieldInput: { flex: 1, position: 'relative' },

  /* INPUTS — capsule underlines → subtle bordered fields */
  recipientInput: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    color: HEYWAY_COLORS.text.primary,
    paddingVertical: HEYWAY_SPACING.sm,
    borderBottomWidth: 0,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 12,
    paddingHorizontal: HEYWAY_SPACING.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  promptInput: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    color: HEYWAY_COLORS.text.primary,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 12,
    minHeight: 96,
    textAlignVertical: 'top',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  /* MODE SELECTOR — subtle capsule */
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: HEYWAY_SPACING.xs,
    marginTop: HEYWAY_SPACING.xs,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  modeSelectorText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.1,
  },
  modeDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: HEYWAY_RADIUS.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    zIndex: 1000,
    marginTop: HEYWAY_SPACING.xs,
    ...HEYWAY_SHADOWS.light.md,
  },
  modeOption: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.subtle,
  },
  modeOptionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
  },

  /* RECIPIENT CHIPS */
  recipientsDisplay: { marginTop: -HEYWAY_SPACING.xs },
  recipientsTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  recipientsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: HEYWAY_SPACING.xs },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 999,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  recipientChipText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.primary,
    marginRight: HEYWAY_SPACING.xs,
    letterSpacing: -0.1,
  },
  removeChipButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: HEYWAY_COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },

  /* SEARCH RESULTS — sheet menu */
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: HEYWAY_RADIUS.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    maxHeight: 220,
    zIndex: 1000,
    marginTop: HEYWAY_SPACING.xs,
    overflow: 'hidden',
    ...HEYWAY_SHADOWS.light.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: HEYWAY_SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.subtle,
    gap: HEYWAY_SPACING.sm,
  },
  resultIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: HEYWAY_COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  resultContent: { flex: 1 },
  resultName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  resultAddress: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: 0,
  },

  /* FOOTER ACTIONS — quiet card bar */
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    backgroundColor: '#F8F9FA',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E5E8',
    borderBottomLeftRadius: HEYWAY_RADIUS.xxl,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.md,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E3E5E8',
    ...HEYWAY_SHADOWS.light.sm,
  },
  scheduleButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: '600' as const,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.1,
  },

  /* PRIMARY CTA — capsule */
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.status.success,
    borderRadius: 999,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    paddingVertical: HEYWAY_SPACING.md,
    minHeight: 44,
    borderWidth: 0,
    ...HEYWAY_SHADOWS.light.md,
  },
  callButtonDisabled: {
    opacity: 0.55,
    backgroundColor: HEYWAY_COLORS.interactive.disabled,
  },
  callButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: '700' as const,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: -0.1,
  },
  callButtonTextDisabled: { color: HEYWAY_COLORS.text.tertiary },
});
