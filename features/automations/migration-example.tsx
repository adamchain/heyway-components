// features/automations/migration-example.tsx
// This file shows how to migrate from useRealTimeAutomations to useAutomations

// BEFORE (using useRealTimeAutomations hook):
/*
import { useRealTimeAutomations } from '@/hooks/useRealTimeAutomations';

export function AutomationsListOLD() {
  const {
    automations,
    isLoading,
    error,
    refresh: refreshAutomations
  } = useRealTimeAutomations();

  const handleCreate = async (data) => {
    try {
      await apiService.createAutomation(data);
      await refreshAutomations(); // Manual refresh needed
    } catch (error) {
      // handle error
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await apiService.toggleAutomation(id, isActive);
      await refreshAutomations(); // Manual refresh needed
    } catch (error) {
      // handle error  
    }
  };

  return (
    <View>
      {isLoading && <ActivityIndicator />}
      {automations.map(automation => (
        <AutomationCard key={automation.id} automation={automation} />
      ))}
    </View>
  );
}
*/

// AFTER (using useAutomations with React Query):
import React from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useAutomations } from '@/features/automations';
import type { CreateAutomationInput } from '@/features/automations';

export function AutomationsListNEW() {
  const {
    list: { data: automations, isLoading, error },
    create,
    toggle
  } = useAutomations();

  const handleCreate = (data: CreateAutomationInput) => {
    create.mutate(data, {
      onSuccess: () => {
        Alert.alert('Success', 'Automation created!');
        // No manual refresh needed - React Query handles it automatically
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to create automation');
      }
    });
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toggle.mutate({ id, isActive }, {
      onSuccess: () => {
        // No manual refresh needed - React Query invalidates and refetches automatically
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to toggle automation');
      }
    });
  };

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      {automations?.map(automation => (
        <View key={automation.id}>
          <Text>{automation.name}</Text>
          {/* AutomationCard component would go here */}
        </View>
      ))}
    </View>
  );
}

// For components that need individual automation details:
import { useAutomation } from '@/features/automations';

export function AutomationDetailsNEW({ automationId }: { automationId: string }) {
  const {
    automation: { data: automation, isLoading },
    contacts: { data: contacts },
    calls: { data: calls }
  } = useAutomation(automationId);

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>{automation?.name}</Text>
      <Text>Contacts: {contacts?.length ?? 0}</Text>
      <Text>Calls: {calls?.length ?? 0}</Text>
    </View>
  );
}

// Key Benefits of the New Pattern:
// 1. ✅ Automatic cache invalidation - no manual refreshAutomations() calls
// 2. ✅ Optimistic updates - UI updates immediately, rolls back on error
// 3. ✅ Better error handling - mutations have onSuccess/onError callbacks
// 4. ✅ Loading states - separate loading states for queries vs mutations
// 5. ✅ Deduplication - same requests are automatically deduplicated
// 6. ✅ Background refetching - data stays fresh automatically
// 7. ✅ Offline support - cached data available when offline

export {}; // Make this a module