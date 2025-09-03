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
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@styles/HEYWAY_STYLE_GUIDE';

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
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.xs,
  },
  filterButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  filterButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  filterButtonTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingBottom: 100,
  },
  callItem: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    marginBottom: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  callItemContent: {
    padding: HEYWAY_SPACING.lg,
  },
  callInfo: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.sm,
  },
  callContact: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    flex: 1,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  callStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
  },
  callStatusText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  successText: {
    color: HEYWAY_COLORS.status.success,
  },
  errorText: {
    color: HEYWAY_COLORS.status.error,
  },
  callTime: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  callPrompt: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.tertiary,
    fontStyle: 'italic',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});

export default CallHistoryList;