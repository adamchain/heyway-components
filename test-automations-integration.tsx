// test-automations-integration.tsx
// Temporary test file to verify the new automations data layer
// You can import this in your home.tsx to test the integration

import React from 'react';
import { View, Text, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useAutomations, useAutomation } from '@/features/automations';
import type { CreateAutomationInput } from '@/features/automations';

export function TestAutomationsIntegration() {
  const {
    list: { data: automations, isLoading: listLoading, error: listError },
    create,
    toggle
  } = useAutomations();

  const testCreate = () => {
    // Test creating an on_date automation with proper date/time formatting
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 30, 0, 0); // 9:30 AM

    const testAutomation: CreateAutomationInput = {
      name: `Test On-Date Automation ${Date.now()}`,
      description: 'Created by new React Query data layer with proper date formatting',
      triggerType: 'on_date',
      offsetDays: 0, // Not used for on_date but required by type
      offsetTime: '09:30', // Not used for on_date but required by type
      onDate: tomorrow.toISOString().slice(0, 10), // YYYY-MM-DD format
      onTime: '09:30', // HH:MM format
      aiInstructions: 'This is a test automation to verify date/time formatting works correctly.',
      isActive: false,
    };

    create.mutate(testAutomation, {
      onSuccess: (result) => {
        Alert.alert('✅ Success!', `Created automation: ${result.name}\nScheduled for: ${testAutomation.onDate} at ${testAutomation.onTime}`);
      },
      onError: (error) => {
        Alert.alert('❌ Error', `Failed to create: ${error.message}`);
        console.error('Creation error details:', error);
      }
    });
  };

  const testCreateOffset = () => {
    // Test creating a date_offset automation (simpler case)
    const testAutomation: CreateAutomationInput = {
      name: `Test Offset Automation ${Date.now()}`,
      description: 'Date offset automation test',
      triggerType: 'date_offset',
      offsetDays: 3,
      offsetDirection: 'before',
      offsetTime: '14:00', // 2:00 PM
      aiInstructions: 'This is a date offset test automation.',
      isActive: false,
    };

    create.mutate(testAutomation, {
      onSuccess: (result) => {
        Alert.alert('✅ Success!', `Created offset automation: ${result.name}\n3 days before at 14:00`);
      },
      onError: (error) => {
        Alert.alert('❌ Error', `Failed to create: ${error.message}`);
        console.error('Creation error details:', error);
      }
    });
  };

  const testToggle = () => {
    if (!automations?.length) {
      Alert.alert('No Automations', 'Create an automation first to test toggle');
      return;
    }
    
    const first = automations[0];
    toggle.mutate({ id: first.id, isActive: !first.isActive }, {
      onSuccess: () => {
        Alert.alert('✅ Success!', `Toggled ${first.name} to ${!first.isActive ? 'Active' : 'Paused'}`);
      },
      onError: (error) => {
        Alert.alert('❌ Error', `Failed to toggle: ${error.message}`);
      }
    });
  };

  if (listLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading automations with React Query...</Text>
      </View>
    );
  }

  if (listError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading automations:</Text>
        <Text style={styles.errorDetail}>{String(listError)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Automations Data Layer Test</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Automations loaded: {automations?.length ?? 0}</Text>
        
        {automations?.slice(0, 3).map(automation => (
          <View key={automation.id} style={styles.automationItem}>
            <Text style={styles.automationName}>• {automation.name}</Text>
            <Text style={styles.automationStatus}>
              {automation.isActive ? '🟢 Active' : '⏸️ Paused'}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title={create.isPending ? '⏳ Creating...' : '➕ Test On-Date Automation'} 
          onPress={testCreate}
          disabled={create.isPending}
        />
        
        <Button 
          title={create.isPending ? '⏳ Creating...' : '📅 Test Date-Offset Automation'} 
          onPress={testCreateOffset}
          disabled={create.isPending}
        />
        
        <Button 
          title={toggle.isPending ? '⏳ Toggling...' : '🔄 Test Toggle First Automation'} 
          onPress={testToggle}
          disabled={toggle.isPending || !automations?.length}
        />
      </View>

      {automations?.length > 0 && (
        <TestAutomationDetails automationId={automations[0].id} />
      )}
    </View>
  );
}

// Test individual automation details
function TestAutomationDetails({ automationId }: { automationId: string }) {
  const {
    automation: { data: automation, isLoading },
    contacts: { data: contacts },
    calls: { data: calls }
  } = useAutomation(automationId);

  if (isLoading) {
    return (
      <View style={styles.detailsContainer}>
        <ActivityIndicator size="small" />
        <Text>Loading automation details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>📋 Detail Test (useAutomation hook)</Text>
      <Text style={styles.detailsText}>Name: {automation?.name ?? 'Unknown'}</Text>
      <Text style={styles.detailsText}>Contacts: {contacts?.length ?? 0}</Text>
      <Text style={styles.detailsText}>Calls: {calls?.length ?? 0}</Text>
      <Text style={styles.detailsText}>
        Status: {automation?.isActive ? '🟢 Active' : '⏸️ Paused'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorDetail: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  automationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  automationName: {
    flex: 1,
    fontSize: 14,
  },
  automationStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: 10,
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'stretch',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 12,
    marginVertical: 2,
  },
});

export default TestAutomationsIntegration;