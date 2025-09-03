import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { PhoneIncoming, PhoneOutgoing, CheckCircle, X } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS } from '@/styles/HEYWAY_STYLE_GUIDE';

interface CallHistoryListProps {
  callHistory: any[];
  isLoading: boolean;
  refreshing: boolean;
  filterType: 'all' | 'sent' | 'received';
  onRefresh: () => void;
  onFilterChange: (filter: 'all' | 'sent' | 'received') => void;
  onCallSelect: (call: any) => void;
}

const CallHistoryList: React.FC<CallHistoryListProps> = ({
  callHistory,
  isLoading,
  refreshing,
  filterType,
  onRefresh,
  onFilterChange,
  onCallSelect,
}) => {
  const renderCallResult = ({ item }: { item: any }) => {
    const isSuccess = item.status === 'completed' || item.status === 'answered';
    const isInbound = item.direction === 'received';

    const getStatusIcon = () => {
      if (isInbound) {
        return <PhoneIncoming size={16} color={HEYWAY_COLORS.accent} />;
      }
      if (isSuccess) {
        return <CheckCircle size={16} color={HEYWAY_COLORS.status.success} />;
      }
      return <X size={16} color={HEYWAY_COLORS.text.error} />;
    };

    return (
      <TouchableOpacity style={styles.callItem} onPress={() => onCallSelect(item)}>
        <View style={styles.callItemContent}>
          <View style={styles.callInfo}>
            <View style={styles.callHeader}>
              <Text style={styles.callContact}>{item.contact_name || item.phone_number}</Text>
              <View style={styles.callStatus}>
                {getStatusIcon()}
                <Text style={[
                  styles.callStatusText,
                  isSuccess ? styles.successText : styles.errorText
                ]}>
                  {isInbound ? 'Received' : (isSuccess ? 'Completed' : 'Failed')}
                </Text>
              </View>
            </View>
            <Text style={styles.callTime}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
            {item.prompt && (
              <Text style={styles.callPrompt} numberOfLines={2}>
                {item.prompt}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filterButtons = [
    { key: 'all', label: 'All Calls' },
    { key: 'sent', label: 'Sent' },
    { key: 'received', label: 'Received' },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {filterButtons.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              filterType === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text style={[
              styles.filterButtonText,
              filterType === filter.key && styles.filterButtonTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HEYWAY_COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={callHistory}
          renderItem={renderCallResult}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={HEYWAY_COLORS.accent}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: HEYWAY_COLORS.accent,
    borderColor: HEYWAY_COLORS.accent,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
  },
  filterButtonTextActive: {
    color: HEYWAY_COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  callItem: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  callItemContent: {
    padding: 16,
  },
  callInfo: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  callContact: {
    fontSize: 16,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    flex: 1,
  },
  callStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  successText: {
    color: HEYWAY_COLORS.status.success,
  },
  errorText: {
    color: HEYWAY_COLORS.text.error,
  },
  callTime: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: 8,
  },
  callPrompt: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.tertiary,
    fontStyle: 'italic',
  },
});

export default CallHistoryList;