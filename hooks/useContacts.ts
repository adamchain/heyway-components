import { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService';

export const useContacts = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const lastLoadTime = useRef<number>(0);
  const loadPromise = useRef<Promise<void> | null>(null);

  const loadContacts = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTime.current;

    // Prevent rapid successive calls (less than 2 seconds apart) unless forced
    if (!force && timeSinceLastLoad < 2000 && contacts.length > 0) {
      console.log('⏩ Skipping contacts load - too recent');
      return;
    }

    // If already loading, return the existing promise
    if (loadPromise.current) {
      console.log('⏳ Contacts already loading, waiting...');
      return loadPromise.current;
    }

    setContactsLoading(true);
    lastLoadTime.current = now;

    loadPromise.current = (async () => {
      try {
        const response = await apiService.getContacts();
        setContacts(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setContactsLoading(false);
        loadPromise.current = null;
      }
    })();

    return loadPromise.current;
  }, [contacts.length]);

  const filterContacts = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredContacts([]);
      return;
    }

    const filtered = contacts.filter(contact =>
      contact.name?.toLowerCase().includes(query.toLowerCase()) ||
      contact.phone?.includes(query) ||
      contact.email?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [contacts]);

  const toggleContactSelection = useCallback((contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  }, []);

  const clearContactSelection = useCallback(() => {
    setSelectedContacts([]);
  }, []);

  return {
    contacts,
    filteredContacts,
    contactsLoading,
    selectedContacts,
    loadContacts,
    filterContacts,
    toggleContactSelection,
    clearContactSelection,
    setSelectedContacts,
  };
};