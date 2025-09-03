import AsyncStorage from '@react-native-async-storage/async-storage';

const PINNED_CONTACTS_KEY = 'pinnedContacts';
const PINNED_BUSINESSES_KEY = 'pinnedBusinesses';

export interface PinnedItem {
  id: string;
  type: 'contact' | 'business';
  name?: string;
  phoneNumber: string;
  timestamp: number;
}

class ContactPinningManager {
  // Load pinned contacts
  static async loadPinnedContacts(): Promise<string[]> {
    try {
      const pinnedData = await AsyncStorage.getItem(PINNED_CONTACTS_KEY);
      if (pinnedData) {
        return JSON.parse(pinnedData);
      }
      return [];
    } catch (error) {
      console.error('Failed to load pinned contacts:', error);
      return [];
    }
  }

  // Save pinned contacts
  static async savePinnedContacts(contactIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PINNED_CONTACTS_KEY, JSON.stringify(contactIds));
    } catch (error) {
      console.error('Failed to save pinned contacts:', error);
    }
  }

  // Toggle pin status for a contact
  static async toggleContactPin(contactId: string): Promise<boolean> {
    try {
      const pinnedContacts = await this.loadPinnedContacts();
      const isPinned = pinnedContacts.includes(contactId);
      
      let updatedPins: string[];
      if (isPinned) {
        updatedPins = pinnedContacts.filter(id => id !== contactId);
      } else {
        updatedPins = [...pinnedContacts, contactId];
      }
      
      await this.savePinnedContacts(updatedPins);
      return !isPinned; // Return new pin status
    } catch (error) {
      console.error('Failed to toggle contact pin:', error);
      return false;
    }
  }

  // Check if a contact is pinned
  static async isContactPinned(contactId: string): Promise<boolean> {
    try {
      const pinnedContacts = await this.loadPinnedContacts();
      return pinnedContacts.includes(contactId);
    } catch (error) {
      console.error('Failed to check if contact is pinned:', error);
      return false;
    }
  }

  // Load pinned businesses
  static async loadPinnedBusinesses(): Promise<PinnedItem[]> {
    try {
      const pinnedData = await AsyncStorage.getItem(PINNED_BUSINESSES_KEY);
      if (pinnedData) {
        return JSON.parse(pinnedData);
      }
      return [];
    } catch (error) {
      console.error('Failed to load pinned businesses:', error);
      return [];
    }
  }

  // Save pinned businesses
  static async savePinnedBusinesses(businesses: PinnedItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PINNED_BUSINESSES_KEY, JSON.stringify(businesses));
    } catch (error) {
      console.error('Failed to save pinned businesses:', error);
    }
  }

  // Toggle pin status for a business
  static async toggleBusinessPin(business: {
    id: string;
    name: string;
    phoneNumber: string;
  }): Promise<boolean> {
    try {
      const pinnedBusinesses = await this.loadPinnedBusinesses();
      const existingIndex = pinnedBusinesses.findIndex(item => item.id === business.id);
      
      let updatedPins: PinnedItem[];
      if (existingIndex >= 0) {
        // Remove if already pinned
        updatedPins = pinnedBusinesses.filter(item => item.id !== business.id);
      } else {
        // Add new pinned business
        updatedPins = [
          ...pinnedBusinesses,
          {
            id: business.id,
            type: 'business',
            name: business.name,
            phoneNumber: business.phoneNumber,
            timestamp: Date.now()
          }
        ];
      }
      
      await this.savePinnedBusinesses(updatedPins);
      return existingIndex < 0; // Return new pin status
    } catch (error) {
      console.error('Failed to toggle business pin:', error);
      return false;
    }
  }

  // Check if a business is pinned
  static async isBusinessPinned(businessId: string): Promise<boolean> {
    try {
      const pinnedBusinesses = await this.loadPinnedBusinesses();
      return pinnedBusinesses.some(item => item.id === businessId);
    } catch (error) {
      console.error('Failed to check if business is pinned:', error);
      return false;
    }
  }

  // Get all pinned items (both contacts and businesses)
  static async getAllPinnedItems(): Promise<PinnedItem[]> {
    try {
      const [pinnedContactIds, pinnedBusinesses] = await Promise.all([
        this.loadPinnedContacts(),
        this.loadPinnedBusinesses()
      ]);
      
      // We need to fetch contact details from the API or local storage
      // For now, we'll return just the business items with complete data
      return pinnedBusinesses;
    } catch (error) {
      console.error('Failed to get all pinned items:', error);
      return [];
    }
  }
}

export default ContactPinningManager;