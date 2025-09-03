// features/automations/test-integration.tsx
// Quick integration test component to verify the new data layer

import React from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { useAutomations, useAutomation } from '@/features/automations';

export function AutomationsTestComponent() {
  const {
    list: { data: automations, isLoading: listLoading, error: listError },
    create,
    toggle
  } = useAutomations();

  const testCreate = () => {
    const testAutomation = {
      name: 'Test Automation',
      description: 'Created by new data layer',
      triggerType: 'date_offset' as const,
      offsetDays: 1,
      offsetTime: '09:00',
      aiInstructions: 'Test instructions',
      isActive: false,
    };

    create.mutate(testAutomation, {
      onSuccess: (result) => {
        Alert.alert('Success!', `Created automation: ${result.name}`);
      },
      onError: (error) => {
        Alert.alert('Error', `Failed to create: ${error.message}`);
      }
    });
  };

  const testToggle = () => {
    if (!automations?.length) {
      Alert.alert('No Automations', 'Create an automation first');
      return;
    }
    
    const first = automations[0];
    toggle.mutate({ id: first.id, isActive: !first.isActive }, {
      onSuccess: () => {
        Alert.alert('Success!', `Toggled ${first.name}`);
      },
      onError: (error) => {
        Alert.alert('Error', `Failed to toggle: ${error.message}`);
      }
    });
  };

  if (listLoading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading automations...</Text>
      </View>
    );
  }

  if (listError) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error loading automations</Text>
        <Text>{String(listError)}</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Automations Data Layer Test
      </Text>
      
      <Text>Automations loaded: {automations?.length ?? 0}</Text>
      
      {automations?.slice(0, 3).map(automation => (
        <Text key={automation.id} style={{ marginVertical: 2 }}>
          • {automation.name} ({automation.isActive ? 'Active' : 'Paused'})
        </Text>
      ))}
      
      <Button 
        title={create.isPending ? 'Creating...' : 'Test Create Automation'} 
        onPress={testCreate}
        disabled={create.isPending}
      />
      
      <Button 
        title={toggle.isPending ? 'Toggling...' : 'Test Toggle First Automation'} 
        onPress={testToggle}
        disabled={toggle.isPending || !automations?.length}
      />
    </View>
  );
}

// Individual automation test
export function AutomationDetailTest({ automationId }: { automationId?: string }) {
  const {
    automation: { data: automation, isLoading },
    contacts: { data: contacts },
    calls: { data: calls }
  } = useAutomation(automationId);

  if (!automationId) {
    return <Text>No automation ID provided</Text>;
  }

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#eee' }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        Detail Test: {automation?.name ?? 'Unknown'}
      </Text>
      <Text>Contacts: {contacts?.length ?? 0}</Text>
      <Text>Calls: {calls?.length ?? 0}</Text>
      <Text>Status: {automation?.isActive ? 'Active' : 'Paused'}</Text>
    </View>
  );
}