import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Animated, Easing, Dimensions, Keyboard, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hooks
import { useCallHistory } from '@/hooks/useCallHistory';
import { useContacts } from '@/hooks/useContacts';
import { useModals } from '@/hooks/useModals';
import { useAICallerPrompts } from '@/hooks/useAICallerPrompts';
import { useRealTimeAutomations } from '@/hooks/useRealTimeAutomations';
import { apiService } from '../services/apiService';
import type { Automation } from '@/components/CreateAutomationModal';

export const useHomeScreen = () => {
  // Custom hooks
  const callHistory = useCallHistory();
  const contacts = useContacts();
  const modals = useModals();
  const aiCallerPrompts = useAICallerPrompts();

  // Real-time automations
  const {
    automations: realTimeAutomations,
    refresh: refreshAutomations
  } = useRealTimeAutomations({
    enabled: true,
    pollingInterval: 5000
  });

  // Local state
  const [showNewCallModal, setShowNewCallModal] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('recents');
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [showInboundModal, setShowInboundModal] = useState(false);
  const [inboundActive, setInboundActive] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCheckedCallerIds, setHasCheckedCallerIds] = useState(false);
  const [showCallerIdBanner, setShowCallerIdBanner] = useState(false);
  const [hasVerifiedCallerId, setHasVerifiedCallerId] = useState(false);
  const [showScheduledActivityBanner, setShowScheduledActivityBanner] = useState(false);
  const [hasCheckedScheduledActivity, setHasCheckedScheduledActivity] = useState(false);
  const [contactsActiveSection, setContactsActiveSection] = useState('all');
  const [showCSVImportModal, setShowCSVImportModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAutomationContactsModal, setShowAutomationContactsModal] = useState(false);
  const [selectedContactsForAutomation, setSelectedContactsForAutomation] = useState<any[]>([]);
  const [businessActiveSection, setBusinessActiveSection] = useState('search');
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [businessLocationQuery, setBusinessLocationQuery] = useState('');
  const [isBusinessSearchLoading, setIsBusinessSearchLoading] = useState(false);
  const [automationsActiveSection, setAutomationsActiveSection] = useState('all');
  const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
  const [showCreateAutomationModal, setShowCreateAutomationModal] = useState(false);
  const [showEditAutomationModal, setShowEditAutomationModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [callsActiveSection, setCallsActiveSection] = useState('all');
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [showCallPanel, setShowCallPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlusDropdown, setShowPlusDropdown] = useState(false);
  const [groups, setGroups] = useState<Array<{ id: string; name: string; calls: any[] }>>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Animation refs
  const aiGlowAnim = useRef(new Animated.Value(0)).current;
  const callHistoryLoadedRef = useRef(false);
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const contentSlideAnim = useRef(new Animated.Value(0)).current;
  const navIndicatorAnim = useRef(new Animated.Value(0)).current;
  const previousActiveNavItem = useRef('recents');

  // Calculate dynamic dimensions
  const screenDimensions = Dimensions.get('window');
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  // Check for scheduled activity (calls and automations)
  const checkScheduledActivity = useCallback(async () => {
    try {
      // Check for scheduled calls
      const scheduledCalls = await apiService.getScheduledCalls('scheduled');
      const hasScheduledCalls = Array.isArray(scheduledCalls) && scheduledCalls.length > 0;

      // Check for active automations with pending calls
      // Use real-time automations if available, otherwise fetch fresh data
      const automations = realTimeAutomations.length > 0 ? realTimeAutomations : await apiService.getAutomations();
      const hasActiveAutomations = Array.isArray(automations) &&
        automations.some((auto: any) => auto.isActive && auto.pendingCount > 0);

      const hasScheduledActivity = hasScheduledCalls || hasActiveAutomations;
      setShowScheduledActivityBanner(hasScheduledActivity);
      setHasCheckedScheduledActivity(true);
    } catch (error) {
      console.error('Failed to check scheduled activity:', error);
      setHasCheckedScheduledActivity(true);
    }
  }, []);

  // Check inbound status on mount and when modal closes
  const checkInboundStatus = useCallback(async () => {
    try {
      const forwardingEnabled = await AsyncStorage.getItem('inboundForwardingEnabled');
      setInboundActive(forwardingEnabled === 'true');
    } catch (error) {
      console.error('Failed to check inbound status:', error);
      setInboundActive(false);
    }
  }, []);

  // Check if user has verified caller IDs
  const checkCallerIds = useCallback(async () => {
    try {
      const callerIds = await apiService.getCallerIds();
      const hasVerified = callerIds && callerIds.length > 0 &&
        callerIds.some((id: any) => id.verified === true);

      setHasVerifiedCallerId(hasVerified);

      // Check if user has seen onboarding before
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const hasSeenBannerPrompt = await AsyncStorage.getItem('hasSeenCallerIdBanner');

      if (!hasVerified && !hasSeenOnboarding) {
        setShowOnboarding(true);
      } else if (!hasVerified && hasSeenOnboarding && !hasSeenBannerPrompt) {
        setShowCallerIdBanner(true);
      }

      setHasCheckedCallerIds(true);
    } catch (error) {
      console.error('Failed to check caller IDs:', error);
      setHasCheckedCallerIds(true);
    }
  }, []);

  // Page transition animation
  useEffect(() => {
    if (previousActiveNavItem.current !== activeNavItem) {
      // Fade out current content
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }).start(() => {
        // Update the previous nav item and fade back in
        previousActiveNavItem.current = activeNavItem;
        Animated.parallel([
          Animated.timing(contentFadeAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.spring(contentSlideAnim, {
            toValue: 0,
            tension: 300,
            friction: 30,
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Slight slide effect for smoother transition
      Animated.timing(contentSlideAnim, {
        toValue: 20,
        duration: 150,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }).start();

      // Refresh scheduled activity when switching to recents tab
      if (activeNavItem === 'recents' && hasCheckedScheduledActivity) {
        checkScheduledActivity();
      }
    }
  }, [activeNavItem, hasCheckedScheduledActivity, checkScheduledActivity]);

  // AI Glow Animation
  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(aiGlowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(aiGlowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (showPlusDropdown) {
      const timer = setTimeout(() => {
        // Auto close after 10 seconds as fallback
        setShowPlusDropdown(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showPlusDropdown]);

  // Effects
  useFocusEffect(
    useCallback(() => {
      // Stagger focus-triggered data loads to avoid rate limiting
      const loadFocusData = async () => {
        // Load call history if not already loaded
        if (!callHistoryLoadedRef.current) {
          callHistoryLoadedRef.current = true;
          await callHistory.loadCallHistory();
        }

        // Set AI prompt if needed
        if (!aiCallerPrompts.selectedPrompt) {
          aiCallerPrompts.handlePromptSelect('standard');
        }

        // Wait before loading contacts to avoid parallel requests
        await new Promise(resolve => setTimeout(resolve, 200));

        // Load contacts if empty
        if (contacts.contacts.length === 0) {
          await contacts.loadContacts();
        }

        // Wait before checking scheduled activity
        await new Promise(resolve => setTimeout(resolve, 200));

        // Refresh scheduled activity when screen comes into focus
        if (hasCheckedScheduledActivity) {
          await checkScheduledActivity();
        }
      };

      loadFocusData();
    }, [hasCheckedScheduledActivity, checkScheduledActivity])
  );

  useEffect(() => {
    // Stagger initial API calls to avoid rate limiting
    const initializeAppData = async () => {
      try {
        // Check inbound status first (quickest call)
        await checkInboundStatus();

        // Wait a bit then check caller IDs
        await new Promise(resolve => setTimeout(resolve, 300));
        await checkCallerIds();

        // Wait a bit then check scheduled activity
        await new Promise(resolve => setTimeout(resolve, 300));
        await checkScheduledActivity();
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };

    initializeAppData();
  }, [checkInboundStatus, checkCallerIds, checkScheduledActivity]);

  // Lift footer above keyboard
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: any) => setKeyboardOffset(e?.endCoordinates?.height || 0);
    const onHide = () => setKeyboardOffset(0);
    const subShow = Keyboard.addListener(showEvent as any, onShow);
    const subHide = Keyboard.addListener(hideEvent as any, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  // Check status when inbound modal closes
  useEffect(() => {
    if (!showInboundModal) {
      checkInboundStatus();
    }
  }, [showInboundModal, checkInboundStatus]);

  // Event handlers
  const handleNavItemPress = (key: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setActiveNavItem(key);
    // Auto-close mobile menu when selecting nav item
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const handleItemSelect = (item: any) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Check if item already exists
    const exists = selectedContacts.find(contact => contact.phoneNumber === item.phoneNumber);
    if (!exists) {
      setSelectedContacts(prev => [...prev, item]);
    }
  };

  const removeSelectedContact = (phoneNumber: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedContacts(prev => prev.filter(contact => contact.phoneNumber !== phoneNumber));
  };

  const handleContinue = () => {
    setShowNewCallModal(true);
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  const handleOnboardingSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  const handleBannerDismiss = async () => {
    try {
      await AsyncStorage.setItem('hasSeenCallerIdBanner', 'true');
      setShowCallerIdBanner(false);
    } catch (error) {
      console.error('Failed to save banner status:', error);
      setShowCallerIdBanner(false);
    }
  };

  const handleBusinessSearch = () => {
    setIsBusinessSearchLoading(true);
  };

  const handleBusinessSearchComplete = () => {
    setIsBusinessSearchLoading(false);
  };

  const handleBusinessSectionChange = (section: string) => {
    setBusinessActiveSection(section);
  };

  const handleBusinessSearchQueryChange = (query: string) => {
    setBusinessSearchQuery(query);
  };

  const handleBusinessLocationQueryChange = (query: string) => {
    setBusinessLocationQuery(query);
  };

  const handleCreateAutomation = async (automationData: Partial<Automation>) => {
    try {
      await apiService.createAutomation({
        name: automationData.name!,
        description: automationData.description || '',
        triggerType: automationData.triggerType || 'date_offset',
        offsetDays: automationData.offsetDays,
        offsetDirection: automationData.offsetDirection,
        offsetTime: automationData.offsetTime,
        onDate: automationData.onDate,
        onTime: automationData.onTime,
        aiInstructions: automationData.aiInstructions!,
        voiceMessage: automationData.voiceMessage,
        voiceAudioUri: automationData.voiceAudioUri,
        voiceAudioDuration: automationData.voiceAudioDuration,
        isActive: false, // Start as paused
      });

      Alert.alert('Success', 'Automation created successfully! It starts paused - activate it when ready.');
      setShowCreateAutomationModal(false);
      // Refresh real-time automations after creating
      await refreshAutomations();
    } catch (error) {
      console.error('Failed to create automation:', error);
      Alert.alert('Error', 'Failed to create automation');
    }
  };

  const handleEditAutomation = async (automationData: Partial<Automation>) => {
    try {
      if (!editingAutomation) return;

      await apiService.updateAutomation(editingAutomation.id || editingAutomation._id, {
        name: automationData.name,
        description: automationData.description,
        triggerType: automationData.triggerType || editingAutomation.triggerType || 'date_offset',
        offsetDays: automationData.offsetDays,
        offsetDirection: automationData.offsetDirection,
        offsetTime: automationData.offsetTime,
        onDate: automationData.onDate,
        onTime: automationData.onTime,
        aiInstructions: automationData.aiInstructions,
        voiceMessage: automationData.voiceMessage,
        voiceAudioUri: automationData.voiceAudioUri,
        voiceAudioDuration: automationData.voiceAudioDuration,
      });

      Alert.alert('Success', 'Automation updated successfully!');
      setShowEditAutomationModal(false);
      setEditingAutomation(null);
      // Refresh real-time automations after editing
      await refreshAutomations();
    } catch (error) {
      console.error('Failed to update automation:', error);
      Alert.alert('Error', 'Failed to update automation');
    }
  };

  const handleAutomationToggle = async (automationId: string) => {
    try {
      const automation = selectedAutomation;
      await apiService.toggleAutomation(automationId, !automation.isActive);
      // Refresh the automation data
      const updatedAutomation = await apiService.getAutomation(automationId);
      setSelectedAutomation(updatedAutomation);
      // Refresh real-time automations after toggling
      await refreshAutomations();
    } catch (error) {
      console.error('Failed to toggle automation:', error);
      Alert.alert('Error', 'Failed to update automation status');
    }
  };

  const handleAutomationDelete = async (automationId: string) => {
    try {
      await apiService.deleteAutomation(automationId);
      setSelectedAutomation(null);
      // Refresh real-time automations after deleting
      await refreshAutomations();
    } catch (error) {
      console.error('Failed to delete automation:', error);
      Alert.alert('Error', 'Failed to delete automation');
    }
  };

  const handleImportContacts = async (contacts: any[], referenceDateColumn?: string) => {
    try {
      if (editingAutomation && editingAutomation.triggerType === 'date_offset' && !referenceDateColumn) {
        Alert.alert('Missing Reference Date', 'Please select a reference date column for this automation.');
        return;
      }

      if (editingAutomation) {
        await apiService.executeAutomation(editingAutomation.id || editingAutomation._id, contacts, referenceDateColumn);
      } else {
        // Convert contacts array to CSV format
        const csvHeaders = 'name,phone,email\n';
        const csvRows = contacts.map(contact =>
          `${contact.name || ''},${contact.phone || ''},${contact.email || ''}`
        ).join('\n');
        const csvData = csvHeaders + csvRows;

        await apiService.importContactsCSV(csvData);
      }
    } catch (error) {
      console.error('Failed to import contacts:', error);
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error occurred';
      Alert.alert('Import Failed', `There was an error importing contacts: ${errorMessage}`);
      throw error;
    }
  };

  const handleAddContactsToAutomation = async (contacts: any[]) => {
    try {
      if (editingAutomation && contacts.length > 0) {
        // Check if this is a date_offset automation with reference dates
        if (editingAutomation.triggerType === 'date_offset' && contacts.some(c => c.referenceDate)) {
          // For date_offset automations with reference dates, use executeAutomation
          // We need to create a "referenceDateColumn" to match the expected format
          const contactsWithReferenceDateAsColumn = contacts.map(contact => ({
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            email: contact.email,
            referenceDate: contact.referenceDate // This will act as the reference date column
          }));

          console.log('🔍 Executing automation with reference dates:', {
            automationId: editingAutomation.id,
            contactsCount: contactsWithReferenceDateAsColumn.length,
            referenceDateColumn: 'referenceDate',
            sampleContact: contactsWithReferenceDateAsColumn[0],
            allContacts: contactsWithReferenceDateAsColumn
          });

          await apiService.executeAutomation(
            editingAutomation.id,
            contactsWithReferenceDateAsColumn,
            'referenceDate' // Tell the API that 'referenceDate' field contains the reference date
          );
        } else {
          // For non-date_offset automations or when no reference date is provided
          await apiService.addContactsToAutomation(
            editingAutomation.id,
            contacts.map(contact => ({
              name: contact.name,
              phoneNumber: contact.phoneNumber,
              email: contact.email
            }))
          );
        }
      }
    } catch (error) {
      console.error('Failed to add contacts to automation:', error);
      Alert.alert('Error', 'Failed to add contacts to automation');
      throw error;
    }
  };

  const handleContactSelectedForAutomation = (contact: any) => {
    setSelectedContactsForAutomation(prevSelected => {
      // Check if contact is already selected
      const isAlreadySelected = prevSelected.some(
        c => c.phoneNumber === contact.phoneNumber
      );

      if (isAlreadySelected) {
        // Remove from selection
        return prevSelected.filter(c => c.phoneNumber !== contact.phoneNumber);
      } else {
        // Add to selection
        return [...prevSelected, contact];
      }
    });
  };

  // Group handlers
  const handleCreateGroup = useCallback(async (groupName: string) => {
    try {
      const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        calls: [],
        createdAt: new Date().toISOString()
      };
      setGroups(prevGroups => [...prevGroups, newGroup]);
      // You can add API call here to persist groups if needed
      // await apiService.createGroup(newGroup);
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  }, []);

  const handleGroupSelect = useCallback((group: any) => {
    setSelectedGroupId(group.id);
    // Navigate to group view or filter calls by group
    // This can be expanded based on your needs
  }, []);

  const handleAddCallToGroup = useCallback(async (callId: string, groupId: string) => {
    try {
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? { ...group, calls: [...group.calls.filter(c => c !== callId), callId] }
            : group
        )
      );
      // You can add API call here to persist the association
      // await apiService.addCallToGroup(callId, groupId);
    } catch (error) {
      console.error('Failed to add call to group:', error);
      Alert.alert('Error', 'Failed to add call to group');
    }
  }, []);

  const handleRemoveCallFromGroup = useCallback(async (callId: string, groupId: string) => {
    try {
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? { ...group, calls: group.calls.filter(c => c !== callId) }
            : group
        )
      );
      // You can add API call here to persist the change
      // await apiService.removeCallFromGroup(callId, groupId);
    } catch (error) {
      console.error('Failed to remove call from group:', error);
      Alert.alert('Error', 'Failed to remove call from group');
    }
  }, []);

  return {
    // State
    showNewCallModal,
    activeNavItem,
    showSettingsSidebar,
    showMobileMenu,
    selectedContacts,
    showInboundModal,
    inboundActive,
    keyboardOffset,
    showOnboarding,
    hasCheckedCallerIds,
    showCallerIdBanner,
    hasVerifiedCallerId,
    showScheduledActivityBanner,
    hasCheckedScheduledActivity,
    contactsActiveSection,
    showCSVImportModal,
    showAddContactModal,
    showAutomationContactsModal,
    selectedContactsForAutomation,
    businessActiveSection,
    businessSearchQuery,
    businessLocationQuery,
    isBusinessSearchLoading,
    automationsActiveSection,
    selectedAutomation,
    showCreateAutomationModal,
    showEditAutomationModal,
    editingAutomation,
    callsActiveSection,
    selectedCall,
    showCallPanel,
    searchQuery,
    showPlusDropdown,
    groups,
    selectedGroupId,
    showCreateGroupModal,

    // Dimensions
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,

    // Animation refs
    aiGlowAnim,
    contentFadeAnim,
    contentSlideAnim,
    navIndicatorAnim,

    // Hooks
    callHistory,
    contacts,
    modals,
    aiCallerPrompts,

    // Setters
    setShowNewCallModal,
    setActiveNavItem,
    setShowSettingsSidebar,
    setShowMobileMenu,
    setSelectedContacts,
    setShowInboundModal,
    setInboundActive,
    setShowOnboarding,
    setShowCallerIdBanner,
    setShowScheduledActivityBanner,
    setContactsActiveSection,
    setShowCSVImportModal,
    setShowAddContactModal,
    setShowAutomationContactsModal,
    setSelectedContactsForAutomation,
    setBusinessActiveSection,
    setBusinessSearchQuery,
    setBusinessLocationQuery,
    setIsBusinessSearchLoading,
    setAutomationsActiveSection,
    setSelectedAutomation,
    setShowCreateAutomationModal,
    setShowEditAutomationModal,
    setEditingAutomation,
    setCallsActiveSection,
    setSelectedCall,
    setShowCallPanel,
    setSearchQuery,
    setShowPlusDropdown,
    setGroups,
    setSelectedGroupId,
    setShowCreateGroupModal,

    // Handlers
    handleNavItemPress,
    handleItemSelect,
    removeSelectedContact,
    handleContinue,
    handleOnboardingComplete,
    handleOnboardingSkip,
    handleBannerDismiss,
    handleBusinessSearch,
    handleBusinessSearchComplete,
    handleBusinessSectionChange,
    handleBusinessSearchQueryChange,
    handleBusinessLocationQueryChange,
    handleCreateAutomation,
    handleEditAutomation,
    handleAutomationToggle,
    handleAutomationDelete,
    handleImportContacts,
    handleAddContactsToAutomation,
    handleContactSelectedForAutomation,
    handleCreateGroup,
    handleGroupSelect,
    handleAddCallToGroup,
    handleRemoveCallFromGroup,

    // Utility functions
    checkScheduledActivity,
    checkInboundStatus,
    checkCallerIds,
  };
};
