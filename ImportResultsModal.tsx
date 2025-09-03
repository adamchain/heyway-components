import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { X, Download, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react-native';

// Import design system
import {
  HEYWAY_COLORS,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_SPACING,
  HEYWAY_ACCESSIBILITY,
} from '../styles/HEYWAY_STYLE_GUIDE';

interface ImportError {
  index?: number;
  contactId?: string | null;
  raw?: Record<string, any>;
  code: string;
  message: string;
  field?: string;
  timestamp?: string;
}

interface ErrorBucket {
  code: string;
  count: number;
  message: string;
}

interface ImportResultsModalProps {
  visible: boolean;
  onClose: () => void;
  executionResult?: {
    contactsProcessed: number;
    successCount: number;
    errorCount: number;
    errors: ImportError[];
    executedAt: string;
  };
  preImportEstimate?: number;
  errorBuckets?: ErrorBucket[];
  title?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ImportResultsModal({
  visible,
  onClose,
  executionResult,
  preImportEstimate,
  errorBuckets,
  title = "Import Results"
}: ImportResultsModalProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'failures'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedErrorCode, setSelectedErrorCode] = useState<string | null>(null);

  if (!executionResult) return null;

  const { contactsProcessed, successCount, errorCount, errors, executedAt } = executionResult;

  // Create error buckets from errors if not provided
  const computedErrorBuckets = errorBuckets || (() => {
    const buckets: { [key: string]: { count: number; message: string } } = {};
    errors.forEach(error => {
      const code = error.code;
      if (!buckets[code]) {
        buckets[code] = { count: 0, message: error.message };
      }
      buckets[code].count++;
    });

    return Object.entries(buckets).map(([code, data]) => ({
      code,
      count: data.count,
      message: data.message
    })).sort((a, b) => b.count - a.count);
  })();

  // Filter errors based on search and selected error code
  const filteredErrors = errors.filter(error => {
    const matchesSearch = !searchQuery ||
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.raw?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.raw?.phoneNumber?.includes(searchQuery);

    const matchesCode = !selectedErrorCode || error.code === selectedErrorCode;

    return matchesSearch && matchesCode;
  });

  const formatErrorCode = (code: string) => {
    return code.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return dateString;
    }
  };

  const handleExportCSV = () => {
    // In a real implementation, this would generate and download a CSV
    const csvContent = [
      ['Row', 'Contact Name', 'Phone', 'Field', 'Error Code', 'Error Message'],
      ...filteredErrors.map(error => [
        error.index?.toString() || '',
        error.raw?.name || '',
        error.raw?.phoneNumber || '',
        error.field || '',
        error.code,
        error.message
      ])
    ].map(row => row.join(',')).join('\n');

    Alert.alert(
      'Export CSV',
      `Would export ${filteredErrors.length} error records to CSV.\n\nIn production, this would download the file.`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const renderSummaryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Summary Banner */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryHeader}>
          <CheckCircle size={32} color={HEYWAY_COLORS.status.success} />
          <Text style={styles.summaryTitle}>Import Complete</Text>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{contactsProcessed}</Text>
            <Text style={styles.statLabel}>Processed</Text>
          </View>

          <View style={[styles.statItem, styles.statItemBorder]}>
            <Text style={[styles.statValue, { color: HEYWAY_COLORS.status.success }]}>
              {successCount}
            </Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>

          {errorCount > 0 && (
            <View style={[styles.statItem, styles.statItemBorder]}>
              <Text style={[styles.statValue, { color: HEYWAY_COLORS.status.error }]}>
                {errorCount}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          )}
        </View>

        <Text style={styles.summaryTimestamp}>
          Completed: {formatDateTime(executedAt)}
        </Text>
      </View>

      {/* Discrepancy Notice */}
      {preImportEstimate && preImportEstimate !== successCount && (
        <View style={styles.discrepancyNotice}>
          <AlertCircle size={20} color={HEYWAY_COLORS.status.warning} />
          <View style={styles.discrepancyContent}>
            <Text style={styles.discrepancyTitle}>Heads-up</Text>
            <Text style={styles.discrepancyText}>
              Pre-import estimate was {preImportEstimate}, but {successCount} were actually scheduled.
              The estimate used different filters than the final validator. We've normalized these now.
            </Text>
          </View>
        </View>
      )}

      {/* Error Buckets */}
      {computedErrorBuckets.length > 0 && (
        <View style={styles.bucketsContainer}>
          <Text style={styles.sectionTitle}>Failure Reasons</Text>

          <View style={styles.bucketsGrid}>
            {computedErrorBuckets.map((bucket) => (
              <TouchableOpacity
                key={bucket.code}
                style={[
                  styles.bucketChip,
                  selectedErrorCode === bucket.code && styles.bucketChipActive
                ]}
                onPress={() => {
                  setSelectedErrorCode(selectedErrorCode === bucket.code ? null : bucket.code);
                  setActiveTab('failures');
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.bucketCode,
                  selectedErrorCode === bucket.code && styles.bucketCodeActive
                ]}>
                  {formatErrorCode(bucket.code)}
                </Text>
                <Text style={[
                  styles.bucketCount,
                  selectedErrorCode === bucket.code && styles.bucketCountActive
                ]}>
                  {bucket.count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {errorCount > 0 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => setActiveTab('failures')}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllButtonText}>View All Failures</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderFailuresTab = () => (
    <View style={styles.failuresContainer}>
      {/* Search and Filter Controls */}
      <View style={styles.filterControls}>
        <View style={styles.searchContainer}>
          <Search size={16} color={HEYWAY_COLORS.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts or errors..."
            placeholderTextColor={HEYWAY_COLORS.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportCSV}
          activeOpacity={0.8}
        >
          <Download size={16} color={HEYWAY_COLORS.interactive.primary} />
          <Text style={styles.exportButtonText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Error Code Filter */}
      {selectedErrorCode && (
        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>
            Filtered by: {formatErrorCode(selectedErrorCode)}
          </Text>
          <TouchableOpacity onPress={() => setSelectedErrorCode(null)}>
            <X size={16} color={HEYWAY_COLORS.text.secondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Failures List */}
      <ScrollView style={styles.failuresList} showsVerticalScrollIndicator={false}>
        {filteredErrors.map((error, index) => (
          <View key={index} style={styles.errorItem}>
            <View style={styles.errorHeader}>
              <Text style={styles.errorContact}>
                {error.raw?.name || `Row ${error.index || index + 1}`}
              </Text>
              <View style={styles.errorCodeChip}>
                <Text style={styles.errorCodeText}>
                  {formatErrorCode(error.code)}
                </Text>
              </View>
            </View>

            {error.raw?.phoneNumber && (
              <Text style={styles.errorPhone}>{error.raw.phoneNumber}</Text>
            )}

            <Text style={styles.errorMessage}>{error.message}</Text>

            {error.field && (
              <Text style={styles.errorField}>Field: {error.field}</Text>
            )}
          </View>
        ))}

        {filteredErrors.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No errors match your search</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={HEYWAY_COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
            onPress={() => setActiveTab('summary')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'summary' && styles.tabTextActive
            ]}>
              Summary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'failures' && styles.tabActive]}
            onPress={() => setActiveTab('failures')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'failures' && styles.tabTextActive
            ]}>
              Failures ({errorCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'summary' ? renderSummaryTab() : renderFailuresTab()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    paddingVertical: HEYWAY_SPACING.component.padding.md,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: '600' as any,
    color: HEYWAY_COLORS.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.component.button.sm,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.component.padding.md,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: HEYWAY_COLORS.interactive.primary,
  },
  tabText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as any,
    color: HEYWAY_COLORS.text.secondary,
  },
  tabTextActive: {
    color: HEYWAY_COLORS.interactive.primary,
    fontWeight: '600' as any,
  },
  tabContent: {
    flex: 1,
    padding: HEYWAY_SPACING.component.padding.lg,
  },
  summaryBanner: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.component.padding.lg,
    borderWidth: 0,
    ...HEYWAY_SHADOWS.light.sm,
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.component.margin.xl,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.component.margin.lg,
  },
  summaryTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.small,
    fontWeight: '700' as any,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.component.margin.sm,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.component.margin.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: HEYWAY_COLORS.border.primary,
  },
  statValue: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: '700' as any,
    color: HEYWAY_COLORS.text.primary,
  },
  statLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '500' as any,
    color: HEYWAY_COLORS.text.secondary,
    marginTop: HEYWAY_SPACING.component.margin.xs,
  },
  summaryTimestamp: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.tertiary,
  },
  discrepancyNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(216, 41, 40, 0.1)', // Light warning background
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.status.warning,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.component.padding.md,
    marginBottom: HEYWAY_SPACING.component.margin.xl,
    alignItems: 'flex-start',
  },
  discrepancyContent: {
    flex: 1,
    marginLeft: HEYWAY_SPACING.component.margin.sm,
  },
  discrepancyTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '600' as any,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.component.margin.xs,
  },
  discrepancyText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
  },
  bucketsContainer: {
    marginBottom: HEYWAY_SPACING.component.margin.xl,
  },
  sectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: '600' as any,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.component.margin.md,
  },
  bucketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HEYWAY_SPACING.component.gap.sm,
    marginBottom: HEYWAY_SPACING.component.margin.md,
  },
  bucketChip: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingHorizontal: HEYWAY_SPACING.component.padding.md,
    paddingVertical: HEYWAY_SPACING.component.padding.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  bucketChipActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
  },
  bucketCode: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '500' as any,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.component.margin.xs / 2,
  },
  bucketCodeActive: {
    color: HEYWAY_COLORS.text.inverse,
  },
  bucketCount: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.small,
    fontWeight: '700' as any,
    color: HEYWAY_COLORS.status.error,
  },
  bucketCountActive: {
    color: HEYWAY_COLORS.text.inverse,
  },
  viewAllButton: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.component.padding.sm,
    paddingHorizontal: HEYWAY_SPACING.component.padding.md,
    alignItems: 'center',
    alignSelf: 'center',
  },
  viewAllButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as any,
    color: HEYWAY_COLORS.interactive.primary,
  },
  failuresContainer: {
    flex: 1,
  },
  filterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.component.gap.sm,
    marginBottom: HEYWAY_SPACING.component.margin.md,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
    paddingTop: HEYWAY_SPACING.component.padding.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    paddingHorizontal: HEYWAY_SPACING.component.padding.sm,
    paddingVertical: HEYWAY_SPACING.component.padding.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    marginLeft: HEYWAY_SPACING.component.margin.sm,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingHorizontal: HEYWAY_SPACING.component.padding.md,
    paddingVertical: HEYWAY_SPACING.component.padding.sm,
    gap: HEYWAY_SPACING.component.gap.xs,
  },
  exportButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '500' as any,
    color: HEYWAY_COLORS.interactive.primary,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(67, 180, 255, 0.1)', // Light info background
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.component.card.sm,
    paddingHorizontal: HEYWAY_SPACING.component.padding.md,
    paddingVertical: HEYWAY_SPACING.component.padding.sm,
    marginHorizontal: HEYWAY_SPACING.component.margin.lg,
    marginBottom: HEYWAY_SPACING.component.margin.md,
  },
  activeFilterText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '500' as any,
    color: HEYWAY_COLORS.interactive.primary,
  },
  failuresList: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.component.padding.lg,
  },
  errorItem: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.component.padding.lg,
    borderWidth: 0,
    ...HEYWAY_SHADOWS.light.sm,
    marginBottom: HEYWAY_SPACING.component.margin.md,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.component.margin.sm,
  },
  errorContact: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as any,
    color: HEYWAY_COLORS.text.primary,
    flex: 1,
  },
  errorCodeChip: {
    backgroundColor: 'rgba(255, 59, 47, 0.1)', // Light error background
    borderRadius: HEYWAY_RADIUS.component.button.sm,
    paddingHorizontal: HEYWAY_SPACING.component.padding.xs,
    paddingVertical: HEYWAY_SPACING.component.padding.xs / 2,
  },
  errorCodeText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: '500' as any,
    color: HEYWAY_COLORS.status.error,
  },
  errorPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.component.margin.sm,
  },
  errorMessage: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: HEYWAY_SPACING.component.margin.sm,
  },
  errorField: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.tertiary,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.component.padding.xl,
  },
  emptyStateText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.secondary,
  },
});