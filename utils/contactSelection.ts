import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the storage interface
interface StorageInterface {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}

// Use AsyncStorage for all platforms
const Storage: StorageInterface = AsyncStorage;

const STORAGE_KEY = 'selectedContacts';
const FAVORITES_KEY = 'favorites';
const LISTS_KEY = 'contactLists';
const SEARCH_HISTORY_KEY = 'searchHistory';

export interface Contact {
    id: string;
    phoneNumber: string;
    name?: string;
    selected?: boolean;
}

export interface ContactList {
    id: string;
    name: string;
    contacts: string[]; // Array of phone numbers
    createdAt: string;
}

export class ContactSelectionManager {
    static async saveSelectedContacts(phoneNumbers: string[]): Promise<void> {
        try {
            if (!Array.isArray(phoneNumbers)) {
                throw new Error('phoneNumbers must be an array');
            }
            
            // Deduplicate phone numbers before saving
            const uniquePhoneNumbers = [...new Set(phoneNumbers)];
            
            await Storage.setItem(STORAGE_KEY, JSON.stringify(uniquePhoneNumbers));
            console.log('💾 Saved selected contacts:', uniquePhoneNumbers);
        } catch (error) {
            console.error('Failed to save selected contacts:', error);
            // Don't re-throw to prevent crashes
        }
    }

    static async loadSelectedContacts(): Promise<string[]> {
        try {
            const stored = await Storage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    console.log('📱 Loaded selected contacts:', parsed);
                    return parsed;
                }
            }
            return [];
        } catch (error) {
            console.error('Failed to load selected contacts:', error);
            return [];
        }
    }

    static async toggleContactSelection(phoneNumber: string): Promise<{
        isSelected: boolean;
        allSelected: string[];
    }> {
        try {
            if (!phoneNumber || typeof phoneNumber !== 'string') {
                throw new Error('Invalid phone number provided');
            }

            const current = await this.loadSelectedContacts();
            const isCurrentlySelected = current.includes(phoneNumber);

            let updated: string[];
            if (isCurrentlySelected) {
                updated = current.filter(phone => phone !== phoneNumber);
            } else {
                updated = [...current, phoneNumber];
            }

            await this.saveSelectedContacts(updated);

            return {
                isSelected: !isCurrentlySelected,
                allSelected: updated
            };
        } catch (error) {
            console.error('Failed to toggle contact selection:', error);
            return {
                isSelected: false,
                allSelected: []
            };
        }
    }

    static async clearSelectedContacts(): Promise<void> {
        try {
            await this.saveSelectedContacts([]);
        } catch (error) {
            console.error('Failed to clear selected contacts:', error);
        }
    }

    static async setSelectedContacts(phoneNumbers: string[]): Promise<void> {
        try {
            await this.saveSelectedContacts(phoneNumbers);
        } catch (error) {
            console.error('Failed to set selected contacts:', error);
        }
    }

    // Favorites management
    static async saveFavorites(phoneNumbers: string[]): Promise<void> {
        try {
            // Deduplicate before saving
            const uniquePhoneNumbers = [...new Set(phoneNumbers)];
            await Storage.setItem(FAVORITES_KEY, JSON.stringify(uniquePhoneNumbers));
            console.log('💾 Saved favorites:', uniquePhoneNumbers);
        } catch (error) {
            console.error('Failed to save favorites:', error);
        }
    }

    static async loadFavorites(): Promise<string[]> {
        try {
            const stored = await Storage.getItem(FAVORITES_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
            return [];
        } catch (error) {
            console.error('Failed to load favorites:', error);
            return [];
        }
    }

    static async toggleFavorite(phoneNumber: string): Promise<{
        isFavorite: boolean;
        allFavorites: string[];
    }> {
        try {
            const current = await this.loadFavorites();
            const isCurrentlyFavorite = current.includes(phoneNumber);

            let updated: string[];
            if (isCurrentlyFavorite) {
                updated = current.filter(phone => phone !== phoneNumber);
            } else {
                updated = [...current, phoneNumber];
            }

            await this.saveFavorites(updated);

            return {
                isFavorite: !isCurrentlyFavorite,
                allFavorites: updated
            };
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            return {
                isFavorite: false,
                allFavorites: []
            };
        }
    }

    // Contact lists management
    static async saveContactLists(lists: ContactList[]): Promise<void> {
        try {
            await Storage.setItem(LISTS_KEY, JSON.stringify(lists));
            console.log('💾 Saved contact lists:', lists);
        } catch (error) {
            console.error('Failed to save contact lists:', error);
        }
    }

    static async loadContactLists(): Promise<ContactList[]> {
        try {
            const stored = await Storage.getItem(LISTS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
            return [];
        } catch (error) {
            console.error('Failed to load contact lists:', error);
            return [];
        }
    }

    static async createContactList(name: string, contacts: string[] = []): Promise<ContactList> {
        try {
            const lists = await this.loadContactLists();
            
            // Deduplicate contacts for the new list
            const uniqueContacts = [...new Set(contacts)];
            
            const newList: ContactList = {
                id: Date.now().toString(),
                name,
                contacts: uniqueContacts,
                createdAt: new Date().toISOString()
            };

            await this.saveContactLists([...lists, newList]);
            return newList;
        } catch (error) {
            console.error('Failed to create contact list:', error);
            throw error;
        }
    }

    static async updateContactList(listId: string, updates: Partial<ContactList>): Promise<ContactList | null> {
        try {
            const lists = await this.loadContactLists();
            const index = lists.findIndex(list => list.id === listId);

            if (index === -1) {
                return null;
            }

            // If updating contacts, deduplicate them
            if (updates.contacts) {
                updates.contacts = [...new Set(updates.contacts)];
            }

            const updatedList = { ...lists[index], ...updates };
            lists[index] = updatedList;

            await this.saveContactLists(lists);
            return updatedList;
        } catch (error) {
            console.error('Failed to update contact list:', error);
            throw error;
        }
    }

    static async deleteContactList(listId: string): Promise<boolean> {
        try {
            const lists = await this.loadContactLists();
            const filteredLists = lists.filter(list => list.id !== listId);

            if (filteredLists.length === lists.length) {
                return false; // No list was removed
            }

            await this.saveContactLists(filteredLists);
            return true;
        } catch (error) {
            console.error('Failed to delete contact list:', error);
            throw error;
        }
    }

    static async addContactToList(listId: string, phoneNumber: string): Promise<boolean> {
        try {
            const lists = await this.loadContactLists();
            const index = lists.findIndex(list => list.id === listId);

            if (index === -1) {
                return false;
            }

            if (!lists[index].contacts.includes(phoneNumber)) {
                lists[index].contacts.push(phoneNumber);
                await this.saveContactLists(lists);
            }

            return true;
        } catch (error) {
            console.error('Failed to add contact to list:', error);
            throw error;
        }
    }

    static async removeContactFromList(listId: string, phoneNumber: string): Promise<boolean> {
        try {
            const lists = await this.loadContactLists();
            const index = lists.findIndex(list => list.id === listId);

            if (index === -1) {
                return false;
            }

            lists[index].contacts = lists[index].contacts.filter(phone => phone !== phoneNumber);
            await this.saveContactLists(lists);
            return true;
        } catch (error) {
            console.error('Failed to remove contact from list:', error);
            throw error;
        }
    }

    // Search history management
    static async saveSearchHistory(history: string[]): Promise<void> {
        try {
            await Storage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }

    static async loadSearchHistory(): Promise<string[]> {
        try {
            const history = await Storage.getItem(SEARCH_HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load search history:', error);
            return [];
        }
    }
    
    // New method to deduplicate contacts
    static deduplicateContacts(contacts: Contact[]): Contact[] {
        const uniquePhoneNumbers = new Set<string>();
        const uniqueContacts: Contact[] = [];
        
        for (const contact of contacts) {
            if (!uniquePhoneNumbers.has(contact.phoneNumber)) {
                uniquePhoneNumbers.add(contact.phoneNumber);
                uniqueContacts.push(contact);
            }
        }
        
        return uniqueContacts;
    }
    
    // New method to deduplicate by name and phone number
    static deduplicateContactsByNameAndPhone(contacts: Contact[]): Contact[] {
        const uniqueKeys = new Set<string>();
        const uniqueContacts: Contact[] = [];
        
        for (const contact of contacts) {
            const key = `${contact.name || ''}:${contact.phoneNumber}`;
            if (!uniqueKeys.has(key)) {
                uniqueKeys.add(key);
                uniqueContacts.push(contact);
            }
        }
        
        return uniqueContacts;
    }
}

export default ContactSelectionManager;