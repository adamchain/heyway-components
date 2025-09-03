import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  useWindowDimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { X, Upload, Check, ArrowRight, FileText, Users, Settings, Clock } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { apiService } from '../services/apiService';
import { getQueueTimingMessage } from '@/utils/queueEstimate';

import {
  HEYWAY_COLORS,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_SPACING,
  HEYWAY_ACCESSIBILITY,
} from '../styles/HEYWAY_STYLE_GUIDE';

interface CSVImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport?: (contacts: any[], referenceDateColumn?: string) => void;
  onImportComplete?: () => void;
  title?: string;
  subtitle?: string;
  requireReferenceDate?: boolean;
}

interface ColumnMapping {
  name: number | null;
  phoneNumber: number | null;
  email?: number | null;
  referenceDate?: number | null;
}

interface PreviewData {
  headers: string[];
  rows: string[][];
}

interface ContactPreview {
  name: string;
  phoneNumber: string;
  email?: string;
  referenceDate?: string;
}

export default function CSVImportModal({
  visible,
  onClose,
  onImport,
  onImportComplete,
  title = 'Import Contacts',
  subtitle = 'Import contacts from a CSV file',
  requireReferenceDate = false,
}: CSVImportModalProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [csvFile, setCsvFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'map' | 'preview' | 'importing'>('select');
  const [csvContent, setCsvContent] = useState<string>('');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: null,
    phoneNumber: null,
    email: null,
    referenceDate: null,
  });
  const [importResults, setImportResults] = useState<{
    imported: number;
    updated: number;
    errors: number;
  } | null>(null);

  // Animation refs
  const modalAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Modal entrance animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(modalAnim, {
          toValue: 1,
          tension: 280,
          friction: 30,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 280,
          friction: 30,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, modalAnim, scaleAnim]);

  const resetState = () => {
    setCsvFile(null);
    setCsvContent('');
    setPreviewData(null);
    setColumnMapping({
      name: null,
      phoneNumber: null,
      email: null,
      referenceDate: null,
    });
    setStep('select');
    setImportResults(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const pickCSVFile = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setCsvFile(file);

        const response = await fetch(file.uri);
        const text = await response.text();
        setCsvContent(text);
        parseCSVPreview(text);
        setStep('map');
      }
    } catch (error) {
      console.error('Error picking CSV file:', error);
      Alert.alert('Error', 'Failed to read CSV file. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseCSVPreview = (csvText: string) => {
    try {
      const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) throw new Error('CSV file is empty');

      const headers = lines[0]
        .split(',')
        .map(h => h.trim())
        .filter(h => h !== '');
      if (headers.length === 0) throw new Error('CSV headers are empty');

      const previewRows = lines
        .slice(1, Math.min(6, lines.length))
        .filter(line => line.trim() !== '')
        .map(line => {
          const cells = line.split(',').map(cell => {
            const trimmed = cell.trim();
            return trimmed === '' ? 'N/A' : trimmed;
          });
          while (cells.length < headers.length) cells.push('N/A');
          return cells.slice(0, headers.length);
        });

      if (previewRows.length === 0) throw new Error('No valid data rows found in CSV');

      setPreviewData({ headers, rows: previewRows });

      const nameIndex = headers.findIndex(h => /name|contact|person/i.test(h));
      const phoneIndex = headers.findIndex(h => /phone|mobile|cell|number/i.test(h));
      const emailIndex = headers.findIndex(h => /email|e-mail|mail/i.test(h));
      const referenceDateIndex = headers.findIndex(h =>
        /date|reference|appointment|meeting|schedule|due|created|sold|purchased|sale|birthday|birth|dob/i.test(h),
      );

      setColumnMapping({
        name: nameIndex !== -1 ? nameIndex : null,
        phoneNumber: phoneIndex !== -1 ? phoneIndex : null,
        email: emailIndex !== -1 ? emailIndex : null,
        referenceDate: referenceDateIndex !== -1 ? referenceDateIndex : null,
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      Alert.alert('Error', 'Failed to parse CSV file. Please check the format and try again.');
    }
  };

  const handleColumnSelect = (field: keyof ColumnMapping, index: number) => {
    setColumnMapping(prev => {
      const updated: ColumnMapping = { ...prev };
      (Object.keys(updated) as (keyof ColumnMapping)[]).forEach(key => {
        if (key !== field && updated[key] === index) {
          updated[key] = null as any;
        }
      });
      updated[field] = prev[field] === index ? (null as any) : (index as any);
      return updated;
    });
  };

  const validateMapping = () => {
    if (columnMapping.name === null) {
      Alert.alert('Missing Mapping', 'Please select a column for contact names.');
      return false;
    }
    if (columnMapping.phoneNumber === null) {
      Alert.alert('Missing Mapping', 'Please select a column for phone numbers.');
      return false;
    }
    if (requireReferenceDate && columnMapping.referenceDate === null) {
      Alert.alert('Missing Mapping', 'Please select a column for the reference date.');
      return false;
    }
    return true;
  };

  const proceedToPreview = () => {
    if (validateMapping()) setStep('preview');
  };

  const importContacts = async () => {
    if (!csvContent || !validateMapping()) return;
    try {
      setStep('importing');
      setIsLoading(true);

      const transformedCSV = transformCSVWithMapping(csvContent, columnMapping);

      if (onImport) {
        const parsedContacts = parseContactsFromCSV(csvContent, columnMapping);
        const referenceDateColumn =
          typeof columnMapping.referenceDate === 'number' &&
            previewData?.headers &&
            columnMapping.referenceDate >= 0 &&
            columnMapping.referenceDate < previewData.headers.length
            ? previewData.headers[columnMapping.referenceDate]
            : undefined;

        onImport(parsedContacts, referenceDateColumn);

        setImportResults({
          imported: parsedContacts.length,
          updated: 0,
          errors: 0,
        });
      } else {
        type ImportContactsResult =
          | { imported: number; updated: number; errors?: Record<string, any>[] }
          | any[];

        const result: ImportContactsResult = await apiService.importContactsCSV(transformedCSV);

        if (Array.isArray(result)) {
          setImportResults({ imported: result.length, updated: 0, errors: 0 });
        } else {
          setImportResults({
            imported: (result as { imported: number }).imported || 0,
            updated: (result as { updated: number }).updated || 0,
            errors: Array.isArray((result as { errors?: any[] }).errors)
              ? (result as { errors?: any[] }).errors!.length
              : 0,
          });
        }
        onImportComplete?.();
      }

      setTimeout(() => handleClose(), 3000);
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'There was an error importing your contacts. Please try again.');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const parseContactsFromCSV = (csv: string, mapping: ColumnMapping): any[] => {
    try {
      const lines = csv.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) return [];

      return lines
        .slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
          const cells = line.split(',').map(cell => {
            const cleaned = cell.trim().replace(/"/g, '');
            return cleaned === '' ? null : cleaned;
          });

          const contact = {
            name:
              mapping.name !== null && mapping.name < cells.length && cells[mapping.name]
                ? cells[mapping.name]
                : null,
            phoneNumber:
              mapping.phoneNumber !== null &&
                mapping.phoneNumber < cells.length &&
                cells[mapping.phoneNumber]
                ? cells[mapping.phoneNumber]
                : null,
            email:
              typeof mapping.email === 'number' &&
                mapping.email < cells.length &&
                cells[mapping.email]
                ? cells[mapping.email]
                : undefined,
            referenceDate:
              typeof mapping.referenceDate === 'number' &&
                mapping.referenceDate < cells.length &&
                cells[mapping.referenceDate]
                ? cells[mapping.referenceDate]
                : undefined,
          };

          return contact;
        })
        .filter(contact => contact.name && contact.phoneNumber)
        .map(contact => ({
          ...contact,
          name: contact.name || 'Unknown',
          phoneNumber: contact.phoneNumber || '',
        }));
    } catch (error) {
      console.error('Error parsing contacts from CSV:', error);
      return [];
    }
  };

  const transformCSVWithMapping = (csv: string, mapping: ColumnMapping): string => {
    try {
      const lines = csv.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) throw new Error('CSV must have header and at least one data row');

      const newHeaders = ['name', 'phoneNumber', 'email'];

      const transformedRows = lines
        .slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
          const cells = line.split(',').map(cell => {
            const cleaned = cell.trim().replace(/"/g, '');
            return cleaned === '' ? 'N/A' : cleaned;
          });

          const newRow = [
            mapping.name !== null && mapping.name < cells.length && cells[mapping.name] !== 'N/A'
              ? cells[mapping.name]
              : 'Unknown',
            mapping.phoneNumber !== null &&
              mapping.phoneNumber < cells.length &&
              cells[mapping.phoneNumber] !== 'N/A'
              ? cells[mapping.phoneNumber]
              : '',
            typeof mapping.email === 'number' &&
              mapping.email < cells.length &&
              cells[mapping.email] !== 'N/A'
              ? cells[mapping.email]
              : '',
          ];
          return newRow.join(',');
        })
        .filter(row => row.includes(',') && !row.startsWith('Unknown,'));

      if (transformedRows.length === 0) throw new Error('No valid data rows after transformation');

      return [newHeaders.join(','), ...transformedRows].join('\n');
    } catch (error) {
      console.error('Error transforming CSV:', error);
      throw new Error('Failed to transform CSV data');
    }
  };

  const renderSelectStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepIconContainer}>
        <FileText size={48} color={HEYWAY_COLORS.interactive.primary} />
      </View>

      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{subtitle}</Text>

      <View style={styles.fileUploadSection}>
        <TouchableOpacity style={styles.fileButton} onPress={pickCSVFile} disabled={isLoading} activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator size="small" color={HEYWAY_COLORS.interactive.primary} />
          ) : (
            <>
              <Upload size={24} color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.fileButtonText}>Select CSV File</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <Users size={16} color={HEYWAY_COLORS.text.secondary} />
          <Text style={styles.infoTitle}>Import Requirements</Text>
        </View>
        <Text style={styles.infoText}>
          All imports must contain a first name and phone number. Email addresses are optional but recommended.
        </Text>
      </View>
    </View>
  );

  const renderMappingStep = () => {
    if (!previewData) return null;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepIconContainer}>
          <Settings size={48} color={HEYWAY_COLORS.interactive.primary} />
        </View>

        <Text style={styles.stepTitle}>Map CSV Columns</Text>
        <Text style={styles.stepDescription}>
          Select which columns contain the contact information. We'll automatically detect common column names.
        </Text>

        <ScrollView style={styles.mappingScrollView} showsVerticalScrollIndicator={false}>
          {previewData.headers.map((header, index) => (
            <View key={index} style={styles.columnCard}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnHeaderText}>{header}</Text>
                <View style={styles.columnIndex}>
                  <Text style={styles.columnIndexText}>Column {index + 1}</Text>
                </View>
              </View>

              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Sample data:</Text>
                <View style={styles.previewData}>
                  {previewData.rows.slice(0, 3).map((row, rowIndex) => (
                    <Text key={rowIndex} style={styles.previewText} numberOfLines={1}>
                      {row[index] || 'N/A'}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.mappingButtons}>
                <TouchableOpacity
                  style={[styles.mappingButton, columnMapping.name === index && styles.mappingButtonActive]}
                  onPress={() => handleColumnSelect('name', index)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.mappingButtonText,
                      columnMapping.name === index && styles.mappingButtonTextActive,
                    ]}
                  >
                    Name
                  </Text>
                  {columnMapping.name === index && <Check size={16} color={HEYWAY_COLORS.text.inverse} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mappingButton, columnMapping.phoneNumber === index && styles.mappingButtonActive]}
                  onPress={() => handleColumnSelect('phoneNumber', index)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.mappingButtonText,
                      columnMapping.phoneNumber === index && styles.mappingButtonTextActive,
                    ]}
                  >
                    Phone
                  </Text>
                  {columnMapping.phoneNumber === index && <Check size={16} color={HEYWAY_COLORS.text.inverse} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mappingButton, columnMapping.email === index && styles.mappingButtonActive]}
                  onPress={() => handleColumnSelect('email', index)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.mappingButtonText,
                      columnMapping.email === index && styles.mappingButtonTextActive,
                    ]}
                  >
                    Email
                  </Text>
                  {columnMapping.email === index && <Check size={16} color={HEYWAY_COLORS.text.inverse} />}
                </TouchableOpacity>

                {requireReferenceDate && (
                  <TouchableOpacity
                    style={[
                      styles.mappingButton,
                      columnMapping.referenceDate === index && styles.mappingButtonActive,
                    ]}
                    onPress={() => handleColumnSelect('referenceDate', index)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.mappingButtonText,
                        columnMapping.referenceDate === index && styles.mappingButtonTextActive,
                      ]}
                    >
                      Reference Date
                    </Text>
                    {columnMapping.referenceDate === index && <Check size={16} color={HEYWAY_COLORS.text.inverse} />}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.selectionSummary}>
          <Text style={styles.summaryTitle}>Current Selection:</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Name:</Text>
            <Text style={styles.summaryValue}>
              {columnMapping.name !== null ? previewData.headers[columnMapping.name] : 'Not selected'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phone:</Text>
            <Text style={styles.summaryValue}>
              {columnMapping.phoneNumber !== null ? previewData.headers[columnMapping.phoneNumber] : 'Not selected'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Email:</Text>
            <Text style={styles.summaryValue}>
              {typeof columnMapping.email === 'number' ? previewData.headers[columnMapping.email] : 'Optional'}
            </Text>
          </View>
          {requireReferenceDate && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Reference Date:</Text>
              <Text style={styles.summaryValue}>
                {typeof columnMapping.referenceDate === 'number'
                  ? previewData.headers[columnMapping.referenceDate]
                  : 'Not selected'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            (columnMapping.name === null ||
              columnMapping.phoneNumber === null ||
              (requireReferenceDate && columnMapping.referenceDate === null)) &&
            styles.nextButtonDisabled,
          ]}
          onPress={proceedToPreview}
          disabled={
            columnMapping.name === null ||
            columnMapping.phoneNumber === null ||
            (requireReferenceDate && columnMapping.referenceDate === null)
          }
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <ArrowRight size={20} color={HEYWAY_COLORS.text.inverse} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPreviewStep = () => {
    if (!previewData || columnMapping.name === null || columnMapping.phoneNumber === null) return null;

    const mappedContacts: ContactPreview[] = previewData.rows.map(row => ({
      name: columnMapping.name !== null ? row[columnMapping.name] || 'No Name' : 'No Name',
      phoneNumber:
        columnMapping.phoneNumber !== null ? row[columnMapping.phoneNumber] || 'No Phone' : 'No Phone',
      email: typeof columnMapping.email === 'number' ? row[columnMapping.email] || undefined : undefined,
      referenceDate:
        typeof columnMapping.referenceDate === 'number' && columnMapping.referenceDate < row.length
          ? row[columnMapping.referenceDate] || undefined
          : undefined,
    }));

    const queueMessage = getQueueTimingMessage(mappedContacts.length);

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepIconContainer}>
          <Users size={48} color={HEYWAY_COLORS.interactive.primary} />
        </View>

        <Text style={styles.stepTitle}>Preview Contacts</Text>
        <Text style={styles.stepDescription}>
          Review your contacts before importing. {mappedContacts.length} contacts will be imported.
        </Text>

        {queueMessage ? (
          <View style={styles.queueTimingBanner}>
            <View style={styles.queueTimingHeader}>
              <Clock size={16} color={HEYWAY_COLORS.accent.warning} />
              <Text style={styles.queueTimingTitle}>Large Import Notice</Text>
            </View>
            <Text style={styles.queueTimingMessage}>{queueMessage}</Text>
          </View>
        ) : null}

        <ScrollView style={styles.previewList} showsVerticalScrollIndicator={false}>
          {mappedContacts.map((contact, index) => (
            <View key={index} style={styles.previewItem}>
              <View style={styles.previewItemHeader}>
                <Text style={styles.previewName}>{contact.name || 'No Name'}</Text>
                <Text style={styles.previewPhone}>{contact.phoneNumber || 'No Phone'}</Text>
              </View>
              {contact.email ? <Text style={styles.previewEmail}>{contact.email}</Text> : null}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.importButton} onPress={importContacts} disabled={isLoading} activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator size="small" color={HEYWAY_COLORS.text.inverse} />
          ) : (
            <>
              <Upload size={20} color={HEYWAY_COLORS.text.inverse} />
              <Text style={styles.importButtonText}>Import Contacts</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderImportingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
        <Text style={styles.loadingText}>Importing contacts...</Text>
        <Text style={styles.loadingSubtext}>Please wait while we process your data</Text>
      </View>
    </View>
  );

  const renderImportResults = () => {
    if (!importResults) return null;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Check size={40} color={HEYWAY_COLORS.status.success} />
          </View>

          <Text style={styles.successTitle}>Import Complete</Text>
          <Text style={styles.successSubtitle}>Your contacts have been successfully imported</Text>

          <View style={styles.resultsContainer}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>New Contacts:</Text>
              <Text style={styles.resultValue}>{importResults.imported}</Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Updated Contacts:</Text>
              <Text style={styles.resultValue}>{importResults.updated}</Text>
            </View>

            {importResults.errors > 0 ? (
              <View style={styles.resultItem}>
                <Text style={[styles.resultLabel, { color: HEYWAY_COLORS.status.error }]}>Errors:</Text>
                <Text style={[styles.resultValue, { color: HEYWAY_COLORS.status.error }]}>
                  {importResults.errors}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.closingText}>This window will close automatically...</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackground}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleClose} disabled={isLoading} style={styles.closeButton}>
              <X size={24} color={isLoading ? HEYWAY_COLORS.text.tertiary : HEYWAY_COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {step === 'select' && renderSelectStep()}
            {step === 'map' && renderMappingStep()}
            {step === 'preview' && renderPreviewStep()}
            {step === 'importing' && renderImportingStep()}
            {importResults && renderImportResults()}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HEYWAY_SPACING.lg,
  },
  modalContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...HEYWAY_SHADOWS.light.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    borderTopLeftRadius: HEYWAY_RADIUS.lg,
    borderTopRightRadius: HEYWAY_RADIUS.lg,
  },
  headerTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: HEYWAY_RADIUS.sm,
    backgroundColor: HEYWAY_COLORS.interactive.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  content: {
    flex: 1,
    padding: HEYWAY_SPACING.lg,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.lg,
  },
  stepIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HEYWAY_SPACING.xl,
    ...HEYWAY_SHADOWS.light.md,
  },
  stepTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.tight,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.sm,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.xl,
  },
  fileUploadSection: {
    width: '100%',
    marginBottom: HEYWAY_SPACING.xl,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.interactive.secondary,
    borderRadius: HEYWAY_RADIUS.lg,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.xl,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    width: '100%',
  },
  fileButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.interactive.primary,
    marginLeft: HEYWAY_SPACING.sm,
  },
  infoContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
    width: '100%',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.sm,
  },
  infoTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary,
    marginLeft: HEYWAY_SPACING.sm,
  },
  infoText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.secondary,
  },
  mappingScrollView: {
    maxHeight: 400,
    marginVertical: HEYWAY_SPACING.md,
    width: '100%',
  },
  columnCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
    marginBottom: HEYWAY_SPACING.xl,
    padding: HEYWAY_SPACING.lg,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.md,
  },
  columnHeaderText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary,
    flex: 1,
    marginRight: HEYWAY_SPACING.sm,
  },
  columnIndex: {
    backgroundColor: HEYWAY_COLORS.interactive.secondary,
    paddingHorizontal: HEYWAY_SPACING.xs,
    paddingVertical: HEYWAY_SPACING.xs / 2,
    borderRadius: HEYWAY_RADIUS.sm,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  columnIndexText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.tertiary,
  },
  previewContainer: {
    marginBottom: HEYWAY_SPACING.lg,
  },
  previewLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.tertiary,
    marginBottom: HEYWAY_SPACING.sm,
  },
  previewData: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.sm,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  previewText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.sm,
  },
  mappingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: HEYWAY_SPACING.md,
  },
  mappingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    minWidth: 100,
    marginRight: HEYWAY_SPACING.sm,
    marginBottom: HEYWAY_SPACING.sm,
  },
  mappingButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.md,
  },
  mappingButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
  },
  mappingButtonTextActive: {
    color: HEYWAY_COLORS.text.inverse,
  },
  selectionSummary: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
    marginVertical: HEYWAY_SPACING.lg,
    padding: HEYWAY_SPACING.lg,
    width: '100%',
  },
  summaryTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.sm,
  },
  summaryLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    marginRight: HEYWAY_SPACING.sm,
  },
  summaryValue: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },
  nextButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.xl,
    borderRadius: HEYWAY_RADIUS.lg,
    width: '100%',
    ...HEYWAY_SHADOWS.light.md,
    marginTop: HEYWAY_SPACING.md,
  },
  nextButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  nextButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    marginRight: HEYWAY_SPACING.xs,
  },
  previewList: {
    width: '100%',
    maxHeight: 400,
    marginBottom: HEYWAY_SPACING.xl,
  },
  previewItem: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
    marginBottom: HEYWAY_SPACING.sm,
  },
  previewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HEYWAY_SPACING.xs / 2,
  },
  previewName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
  },
  previewPhone: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
  },
  previewEmail: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginTop: HEYWAY_SPACING.xs / 2,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.status.success,
    borderRadius: HEYWAY_RADIUS.lg,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.xl,
    width: '100%',
    ...HEYWAY_SHADOWS.light.md,
  },
  importButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    marginLeft: HEYWAY_SPACING.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    marginTop: HEYWAY_SPACING.md,
  },
  loadingSubtext: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    color: HEYWAY_COLORS.text.secondary,
    marginTop: HEYWAY_SPACING.sm,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: HEYWAY_COLORS.background.whatsappChat,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HEYWAY_SPACING.xl,
    ...HEYWAY_SHADOWS.light.md,
  },
  successTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.tight,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.sm,
  },
  successSubtitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.xl,
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
    width: '100%',
    marginBottom: HEYWAY_SPACING.xl,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HEYWAY_SPACING.sm,
  },
  resultLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
  },
  resultValue: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
  },
  closingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.tertiary,
    fontStyle: 'italic',
  },
  queueTimingBanner: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.accent.warning,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.lg,
    width: '100%',
  },
  queueTimingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.sm,
  },
  queueTimingTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.accent.warning,
    marginLeft: HEYWAY_SPACING.sm,
  },
  queueTimingMessage: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed,
  },
});
