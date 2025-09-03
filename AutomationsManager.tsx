import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {
  Clock,
  Users,
  Plus,
  Settings,
  Upload,
  Trash2,
  Play,
  Pause,
  Edit3,
  Target,
  ChevronRight,
  X,
  Check,
  UserPlus,
  Building,
  Phone,
  List,
  Search,
  RefreshCw,
} from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';
import CSVImportModal from './CSVImportModal';
import ImportResultsModal from './ImportResultsModal';
import CreateAutomationModal, { Automation, CreateAutomationModalProps } from './CreateAutomationModal';
import { apiService } from '@/services/apiService';
import { useRealTimeAutomations } from '@/hooks/useRealTimeAutomations';



interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
}

interface BusinessResult {
  id: string;
  name: string;
  phoneNumber: string;
  address?: string;
  rating?: number;
}

interface ContactList {
  id: string;
  name: string;
  contacts: Contact[];
}


export default function AutomationsManager() {
  // Use real-time automations hook
  const {
    automations,
    isLoading,
    error: realTimeError,
    lastUpdated,
    refresh: refreshAutomations,
    setAutomations
  } = useRealTimeAutomations({
    enabled: true,
    pollingInterval: 5000, // Poll every 5 seconds
    onUpdate: (updatedAutomations) => {
      console.log('🔄 Automations updated via real-time polling:', updatedAutomations.length);
    }
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showImportResults, setShowImportResults] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [importExecutionResult, setImportExecutionResult] = useState<any>(null);
  const [preImportEstimate, setPreImportEstimate] = useState<number | null>(null);
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [expandedAutomation, setExpandedAutomation] = useState<string | null>(null);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [availableContactLists, setAvailableContactLists] = useState<ContactList[]>([]);
  const [selectedContactsForAutomation, setSelectedContactsForAutomation] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<'contacts' | 'lists' | 'business'>('contacts');
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [businessSearchResults, setBusinessSearchResults] = useState<BusinessResult[]>([]);

  useEffect(() => {
    loadContactsAndLists();
  }, []);

  const loadContactsAndLists = async () => {
    try {
      const [contacts, contactLists] = await Promise.all([
        apiService.getContacts(),
        apiService.getContactLists()
      ]);
      setAvailableContacts(contacts);
      setAvailableContactLists(contactLists);
    } catch (error) {
      console.error('Failed to load contacts and lists:', error);
    }
  };

  const loadAutomations = async () => {
    // This function is now handled by the useRealTimeAutomations hook
    // Just call the refresh function instead
    await refreshAutomations();
  };

  const handleCreateAutomation = async (automationData: Partial<Automation>) => {
    try {
      const newAutomation = await apiService.createAutomation({
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

      await refreshAutomations(); // Refresh the list with real-time hook
      Alert.alert('Success', 'Automation created successfully! It starts paused - activate it when ready.');
    } catch (error) {
      console.error('Failed to create automation:', error);
      Alert.alert('Error', 'Failed to create automation');
    }
  };

  const handleEditAutomation = async (automationData: Partial<Automation>) => {
    try {
      if (!editingAutomation) return;

      await apiService.updateAutomation(editingAutomation.id, {
        name: automationData.name,
        description: automationData.description,
        triggerType: automationData.triggerType,
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

      setEditingAutomation(null);
      await refreshAutomations(); // Refresh the list with real-time hook
      Alert.alert('Success', 'Automation updated successfully!');
    } catch (error) {
      console.error('Failed to update automation:', error);
      Alert.alert('Error', 'Failed to update automation');
    }
  };

  const toggleAutomation = async (automationId: string) => {
    try {
      console.log('🔍 Toggling automation with ID:', automationId);
      console.log('🔍 Available automations:', automations.map(a => ({ id: a.id, name: a.name })));

      if (!automationId) {
        console.error('❌ Automation ID is undefined or null');
        return;
      }

      const automation = automations.find(a => a.id === automationId);
      if (!automation) {
        console.error('❌ Automation not found with ID:', automationId);
        console.log('Available automations:', automations.map(a => ({ id: a.id, name: a.name })));
        return;
      }

      console.log('✅ Found automation:', { id: automation.id, name: automation.name, isActive: automation.isActive });

      // Optimistic update for immediate UI feedback
      setAutomations(prev => prev.map(a =>
        a.id === automationId
          ? { ...a, isActive: !a.isActive }
          : a
      ));

      await apiService.toggleAutomation(automationId, !automation.isActive);
      // Real-time polling will update the state automatically, but we can also force a refresh
      await refreshAutomations();
    } catch (error: any) {
      console.error('❌ Failed to toggle automation:', error);
      console.log('Error type:', typeof error);
      console.log('Error structure:', error);

      // Revert optimistic update on error
      setAutomations(prev => prev.map(a =>
        a.id === automationId
          ? { ...a, isActive: !a.isActive } // Revert to original state
          : a
      ));

      // Handle the specific "Cannot read property 'data' of undefined" error
      if (error && error.message && error.message.includes("Cannot read property 'data' of undefined")) {
        console.error('🔍 Detected "data of undefined" error - this suggests a response structure issue');
        Alert.alert('Error', 'Failed to update automation status: Server response format error');
        return;
      }

      let errorMessage = 'Failed to update automation status';
      if (error && typeof error === 'object') {
        // Axios error structure
        if ('isAxiosError' in error && error.isAxiosError) {
          if (error.response) {
            if (error.response?.data && error.response.data.error) {
              errorMessage += `: ${error.response.data.error}`;
            } else if (typeof error.response.data === 'string') {
              errorMessage += `: ${error.response.data}`;
            } else if (error.response.status) {
              errorMessage += ` (HTTP ${error.response.status})`;
            }
          } else if (error.message) {
            errorMessage += `: ${error.message}`;
          }
        } else if ('message' in error && error.message) {
          errorMessage += `: ${error.message}`;
        }
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const deleteAutomation = async (automationId: string) => {
    Alert.alert(
      'Delete Automation',
      'Are you sure you want to delete this automation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAutomation(automationId);
              // Remove from local state immediately for better UX
              setAutomations(prev => prev.filter(a => a.id !== automationId));
              Alert.alert('Success', 'Automation deleted successfully');
            } catch (error: any) {
              // Log automationId for debugging
              console.error(`Failed to delete automation (id: ${automationId}):`, error);
              let errorMessage = `Failed to delete automation (id: ${automationId})`;
              // AxiosError type guard
              if (error && typeof error === 'object') {
                if (
                  'isAxiosError' in error && error.isAxiosError &&
                  error.response && error.response?.data
                ) {
                  if (error.response?.data?.error) {
                    errorMessage += `: ${error.response.data.error}`;
                  } else if (typeof error.response?.data === 'string') {
                    errorMessage += `: ${error.response.data}`;
                  }
                } else if ('message' in error && error.message) {
                  errorMessage += `: ${error.message}`;
                }
              }
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  const