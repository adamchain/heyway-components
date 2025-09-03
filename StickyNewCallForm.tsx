import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import { ChevronDown, ChevronUp, Phone, X, User, Plus } from 'lucide-react-native';
import { useContacts } from '@/hooks/useContacts';

interface Contact {
  id: string;
  name: string;
  number: string;
}

interface StickyNewCallFormProps {
  onCallInitiated?: (recipients: string[], searchQuery: string) => void;
}

export default function StickyNewCallForm({ onCallInitiated }: StickyNewCallFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const contacts = useContacts();
  const animatedHeight = useRef(new Animated.Value(48)).current; // Collapsed height
  const searchInputRef = useRef<TextInput>(null);

  // Phone number validation regex
  const phoneRegex = /^[\+]?[\s\-\(\)]?[0-9\s\-\(\)]{10,}$/;

  useEffect(() => {
    if (searchQuery.trim()) {
      const isPhoneNumber = phoneRegex.test(searchQuery.replace(/\s/g, ''));
      
      if (isPhoneNumber) {
        // For phone numbers, don't show contact results
        setFilteredContacts([]);
      } else {
        // Filter contacts by name or number
        const filtered = contacts.contacts
          .filter(contact => 
            contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.number?.includes(searchQuery)
          )
          .slice(0, 10); // Limit to 10 results for performance
        
        setFilteredContacts(filtered);
      }
      setShowResults(true);
    } else {
      setFilteredContacts([]);
      setShowResults(false);
    }
  }, [searchQuery, contacts.contacts]);

  const toggleExpanded = () => {
    const toValue = isExpanded ? 48 : 220; // Collapsed: 48, Expanded: 220
    
    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    
    setIsExpanded(!isExpanded);
    
    // Focus search input when expanding
    if (!isExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      Keyboard.dismiss();
      setShowResults(false);
      setSearchQuery('');
    }
  };

  const addRecipient = (recipient: string, name?: string) => {
    if (!selectedRecipients.includes(recipient)) {
      setSelectedRecipients([...selectedRecipients, recipient]);
    }
    setSearchQuery('');
    setShowResults(false);
    setFilteredContacts([]);
  };

  const removeRecipient = (recipient: string) => {
    setSelectedRecipients(selectedRecipients.filter(r => r !== recipient));
  };

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      const isPhoneNumber = phoneRegex.test(trimmedQuery.replace(/\s/g, ''));
      if (isPhoneNumber) {
        addRecipient(trimmedQuery);
      }
    }
  };

  const handleCall = () => {
    if (selectedRecipients.length > 0) {
      onCallInitiated?.(selectedRecipients, searchQuery);
      // Reset form after call
      setSelectedRecipients([]);
      setSearchQuery('');
      setIsExpanded(false);
      Animated.spring(animatedHeight, {
        toValue: 48,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => addRecipient(item.number, item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.contactAvatar}>
        <User size={16} color="#8E8E93" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.contactNumber} numberOfLines={1}>
          {item.number}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecipientChip = (recipient: string, index: number) => (
    <View key={index} style={styles.recipientChip}>
      <Text style={styles.recipientChipText} numberOfLines={1}>
        {recipient}
      </Text>
      <TouchableOpacity
        style={styles.removeChipButton}
        onPress={() => removeRecipient(recipient)}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <X size={14} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { height: animatedHeight }]}>
      {/* Expanded Content - Appears above header */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Add contacts or enter phone number"
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="done"
              keyboardType={phoneRegex.test(searchQuery.replace(/\s/g, '')) ? 'phone-pad' : 'default'}
            />
          </View>

          {/* Selected Recipients */}
          {selectedRecipients.length > 0 && (
            <View style={styles.recipientsContainer}>
              <Text style={styles.recipientsLabel}>To:</Text>
              <View style={styles.recipientsList}>
                {selectedRecipients.map(renderRecipientChip)}
              </View>
            </View>
          )}

          {/* Search Results */}
          {showResults && filteredContacts.length > 0 && (
            <View style={styles.resultsContainer}>
              <FlatList
                data={filteredContacts}
                renderItem={renderContactItem}
                keyExtractor={(item) => item.id}
                style={styles.resultsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Call Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.callButton,
                selectedRecipients.length === 0 && styles.callButtonDisabled
              ]}
              onPress={handleCall}
              disabled={selectedRecipients.length === 0}
              activeOpacity={0.8}
            >
              <Phone size={18} color={selectedRecipients.length > 0 ? "#FFFFFF" : "#8E8E93"} />
              <Text style={[
                styles.callButtonText,
                selectedRecipients.length === 0 && styles.callButtonTextDisabled
              ]}>
                Start Call ({selectedRecipients.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header - Always at bottom */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.composeIcon}>
              <Plus size={16} color="#007AFF" />
            </View>
            <Text style={styles.headerTitle}>New Call</Text>
          </View>
          <View style={styles.headerRight}>
            {isExpanded ? (
              <ChevronDown size={20} color="#8E8E93" />
            ) : (
              <ChevronUp size={20} color="#8E8E93" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
    zIndex: 1000,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  header: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  composeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },

  headerRight: {
    padding: 4,
  },

  expandedContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  searchContainer: {
    marginBottom: 12,
  },

  searchInput: {
    height: 36,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  recipientsContainer: {
    marginBottom: 12,
  },

  recipientsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 6,
  },

  recipientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    maxWidth: 200,
  },

  recipientChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 6,
    flex: 1,
  },

  removeChipButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultsContainer: {
    flex: 1,
    maxHeight: 120,
    marginBottom: 16,
  },

  resultsList: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },

  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  contactInfo: {
    flex: 1,
  },

  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },

  contactNumber: {
    fontSize: 14,
    color: '#8E8E93',
  },

  actionContainer: {
    paddingTop: 8,
  },

  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  callButtonDisabled: {
    backgroundColor: '#3A3A3C',
  },

  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },

  callButtonTextDisabled: {
    color: '#8E8E93',
  },
});