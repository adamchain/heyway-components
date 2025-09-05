import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  X,
  Check,
  Calendar,
  Clock,
  Settings,
  Users,
  MessageCircle,
  Play,
} from 'lucide-react-native';
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_LAYOUT,
  HEYWAY_COMPONENTS,
  HEYWAY_SHADOWS,
  HEYWAY_ACCESSIBILITY
} from '../styles/HEYWAY_STYLE_GUIDE';
import AudioRecorder from './AudioRecorder';

export interface Automation {
  id: string;
  name: string;
  description: string;
  triggerType: 'date_offset' | 'fixed_date' | 'on_date';
  offsetDays: number;
  offsetDirection: 'before' | 'after';
  offsetTime: string;
  onDate?: string;
  onTime?: string;
  isActive: boolean;
  contactsCount: number;
  completedCount: number;
  pendingCount: number;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
  voiceMessage?: string;
  voiceAudioUri?: string;
  voiceAudioDuration?: number;
  aiInstructions: string;
  callbackEnabled?: boolean;
  callbackDelay?: '15min' | '30min' | '1hr' | '2hr' | '4hr' | '8hr' | '12hr' | '24hr' | 'custom';
  callbackCustomTime?: string;
  callbackCustomDay?: 'today' | 'tomorrow';
}

export interface CreateAutomationPanelProps {
  visible: boolean;
  onClose: () => void;
  onSave: (automation: Partial<Automation>) => void;
  editingAutomation?: Automation | null;
}

const CreateAutomationPanel: React.FC<CreateAutomationPanelProps> = ({
  visible,
  onClose,
  onSave,
  editingAutomation,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const panelWidth = Math.min(500, screenWidth * 0.5);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<'date_offset' | 'on_date'>('date_offset');
  const [offsetDays, setOffsetDays] = useState(1);
  const [offsetDaysText, setOffsetDaysText] = useState('1');
  const [offsetDirection, setOffsetDirection] = useState<'before' | 'after'>('before');
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [onDate, setOnDate] = useState<string>('');
  const [onDateValue, setOnDateValue] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [onDateHour, setOnDateHour] = useState(9);
  const [onDateMinute, setOnDateMinute] = useState(0);
  const [onDatePeriod, setOnDatePeriod] = useState<'AM' | 'PM'>('AM');
  const [aiInstructions, setAiInstructions] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [voiceAudioUri, setVoiceAudioUri] = useState<string | null>(null);
  const [voiceAudioDuration, setVoiceAudioDuration] = useState(0);
  const [callbackEnabled, setCallbackEnabled] = useState(false);
  const [callbackDelay, setCallbackDelay] = useState<'15min' | '30min' | '1hr' | '2hr' | '4hr' | '8hr' | '12hr' | '24hr' | 'custom'>('2hr');
  const [callbackCustomHour, setCallbackCustomHour] = useState(9);
  const [callbackCustomMinute, setCallbackCustomMinute] = useState(0);
  const [callbackCustomPeriod, setCallbackCustomPeriod] = useState<'AM' | 'PM'>('AM');
  const [callbackCustomDay, setCallbackCustomDay] = useState<'today' | 'tomorrow'>('today');

  // Helper functions for time conversion
  const clampInt = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  };

  const parseTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return { hour: displayHour, minute: minutes, period };
  };

  const parseTimeSafe = (timeString: string | undefined, fallback: { h: number, m: number }) => {
    if (!timeString) {
      return { hour: fallback.h, minute: fallback.m, period: 'AM' as 'AM' | 'PM' };
    }
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return { hour: displayHour, minute: minutes || 0, period };
    } catch {
      return { hour: fallback.h, minute: fallback.m, period: 'AM' as 'AM' | 'PM' };
    }
  };

  const formatTimeToMilitary = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    let h = clampInt(hour || 12, 1, 12);
    const m = clampInt(minute || 0, 0, 59);
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h = h + 12;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const formatDateToISO = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /** Local-date ISO (YYYY-MM-DD) without UTC shift to avoid off-by-one */
  const toLocalISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'web') {
      const dateString = event?.target?.value || event?.nativeEvent?.target?.value;
      if (dateString) {
        const local = new Date(dateString + 'T12:00:00');
        setOnDateValue(local);
        setOnDate(toLocalISODate(local));
      }
      setShowDatePicker(false);
    } else {
      setShowDatePicker(Platform.OS === 'ios');
      if (selected) {
        const local = new Date(selected);
        setOnDateValue(local);
        setOnDate(toLocalISODate(local));
      }
    }
  };

  useEffect(() => {
    if (editingAutomation) {
      setName(editingAutomation.name);
      setDescription(editingAutomation.description);
      setTriggerType(editingAutomation.triggerType === 'on_date' ? 'on_date' : 'date_offset');

      if (editingAutomation.triggerType === 'on_date') {
        const dateStr = editingAutomation.onDate || '';
        setOnDate(dateStr);
        setOnDateValue(dateStr ? new Date(dateStr + 'T12:00:00') : new Date());
        const { hour, minute, period } = parseTimeSafe(editingAutomation.onTime, { h: 9, m: 0 });
        setOnDateHour(hour); setOnDateMinute(minute); setOnDatePeriod(period);
      } else {
        if (editingAutomation.offsetDirection) {
          setOffsetDays(editingAutomation.offsetDays);
          setOffsetDaysText(editingAutomation.offsetDays.toString());
          setOffsetDirection(editingAutomation.offsetDirection);
        } else {
          const absOffsetDays = Math.abs(editingAutomation.offsetDays);
          setOffsetDays(absOffsetDays === 0 ? 1 : absOffsetDays);
          setOffsetDaysText((absOffsetDays === 0 ? 1 : absOffsetDays).toString());
          setOffsetDirection(editingAutomation.offsetDays < 0 ? 'before' : 'after');
        }

        const { hour, minute, period } = parseTimeSafe(editingAutomation.offsetTime, { h: 9, m: 0 });
        setSelectedHour(hour); setSelectedMinute(minute); setSelectedPeriod(period);
      }

      setAiInstructions(editingAutomation.aiInstructions);
      setVoiceMessage(editingAutomation.voiceMessage || '');
      setVoiceAudioUri(editingAutomation.voiceAudioUri || null);
      setVoiceAudioDuration(editingAutomation.voiceAudioDuration || 0);
      setCallbackEnabled(editingAutomation.callbackEnabled || false);
      setCallbackDelay(editingAutomation.callbackDelay || '2hr');
      setCallbackCustomDay(editingAutomation.callbackCustomDay || 'today');
      if (editingAutomation.callbackCustomTime) {
        const { hour, minute, period } = parseTimeSafe(editingAutomation.callbackCustomTime, { h: 9, m: 0 });
        setCallbackCustomHour(hour); setCallbackCustomMinute(minute); setCallbackCustomPeriod(period);
      }
    } else {
      // Reset for new automation
      setName('');
      setDescription('');
      setTriggerType('date_offset');
      setOffsetDays(1);
      setOffsetDaysText('1');
      setOffsetDirection('before');
      setSelectedHour(9);
      setSelectedMinute(0);
      setSelectedPeriod('AM');
      setOnDate('');
      setOnDateValue(new Date());
      setOnDateHour(9);
      setOnDateMinute(0);
      setOnDatePeriod('AM');
      setAiInstructions('');
      setVoiceMessage('');
      setVoiceAudioUri(null);
      setVoiceAudioDuration(0);
      setCallbackEnabled(false);
      setCallbackDelay('2hr');
      setCallbackCustomHour(9);
      setCallbackCustomMinute(0);
      setCallbackCustomPeriod('AM');
      setCallbackCustomDay('today');
    }
  }, [editingAutomation, visible]);

  const handleDaysTextChange = (text: string) => {
    if (text === '' || /^\d+$/.test(text)) {
      setOffsetDaysText(text);

      if (text !== '') {
        const numValue = parseInt(text);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 365) {
          setOffsetDays(numValue);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return Alert.alert('Missing Information', 'Please enter an automation name to continue.');
    }
    
    if (!aiInstructions.trim()) {
      return Alert.alert('Missing Information', 'Please provide AI instructions for your automation.');
    }

    const callbackCustomTime = callbackEnabled && callbackDelay === 'custom'
      ? formatTimeToMilitary(callbackCustomHour || 9, callbackCustomMinute || 0, callbackCustomPeriod)
      : undefined;

    if (triggerType === 'on_date') {
      if (!onDate) {
        return Alert.alert('Missing Date', 'Please select a date for your automation.');
      }
      
      const onTime = formatTimeToMilitary(onDateHour || 9, onDateMinute || 0, onDatePeriod);

      const [hStr, mStr] = onTime.split(':');
      const when = new Date(onDateValue);
      when.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
      if (when.getTime() <= Date.now()) {
        return Alert.alert('Invalid Time', 'The selected date and time is in the past. Please choose a future date and time for your automation.');
      }

      try {
        await onSave({
          name: name.trim(),
          description: description.trim(),
          triggerType: 'on_date',
          onDate,
          onTime,
          aiInstructions: aiInstructions.trim(),
          voiceMessage: voiceMessage.trim() || undefined,
          voiceAudioUri: voiceAudioUri || undefined,
          voiceAudioDuration: voiceAudioDuration || undefined,
          callbackEnabled,
          callbackDelay,
          callbackCustomTime,
          callbackCustomDay,
        });
        onClose();
      } catch (error) {
        console.error('Failed to save automation:', error);
        Alert.alert('Save Failed', 'Unable to save your automation. Please check your connection and try again.');
      }
    } else {
      if (offsetDays === 0 && offsetDirection === 'before') {
        Alert.alert('Invalid Configuration', 'Setting "0 days before" would result in calls on the same day. Please use "0 days after" or choose a different number of days.');
        return;
      }

      try {
        const militaryTime = formatTimeToMilitary(selectedHour || 9, selectedMinute || 0, selectedPeriod);
        await onSave({
          name: name.trim(),
          description: description.trim(),
          triggerType: 'date_offset',
          offsetDays: Math.max(0, Math.min(365, offsetDays)),
          offsetDirection,
          offsetTime: militaryTime,
          aiInstructions: aiInstructions.trim(),
          voiceMessage: voiceMessage.trim() || undefined,
          voiceAudioUri: voiceAudioUri || undefined,
          voiceAudioDuration: voiceAudioDuration || undefined,
          callbackEnabled,
          callbackDelay,
          callbackCustomTime,
          callbackCustomDay,
        });
        onClose();
      } catch (error) {
        console.error('Failed to save automation:', error);
        Alert.alert('Save Failed', 'Unable to save your automation. Please check your connection and try again.');
      }
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.panelContainer, { width: panelWidth }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Settings size={20} color={HEYWAY_COLORS.interactive.primary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {editingAutomation ? 'Edit Automation' : 'Create Automation'}
            </Text>
            <Text style={styles.subtitle}>
              {editingAutomation ? 'Update your automation settings' : 'Set up automated calling'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <X size={20} color={HEYWAY_COLORS.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Automation Name *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Appointment Reminders"
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Remind customers about upcoming appointments"
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
            />
          </View>
        </View>

        {/* Timing Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timing Settings</Text>
          
          {/* Trigger Type Selector */}
          <View style={styles.triggerTypeSelector}>
            <TouchableOpacity
              style={[styles.triggerTypeButton, triggerType === 'date_offset' && styles.triggerTypeButtonActive]}
              onPress={() => setTriggerType('date_offset')}
            >
              <Text style={[styles.triggerTypeText, triggerType === 'date_offset' && styles.triggerTypeTextActive]}>
                Reference Date
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.triggerTypeButton, triggerType === 'on_date' && styles.triggerTypeButtonActive]}
              onPress={() => setTriggerType('on_date')}
            >
              <Text style={[styles.triggerTypeText, triggerType === 'on_date' && styles.triggerTypeTextActive]}>
                On Date
              </Text>
            </TouchableOpacity>
          </View>

          {triggerType === 'date_offset' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Schedule</Text>
                <View style={styles.scheduleRow}>
                  <TextInput
                    style={styles.daysInput}
                    value={offsetDaysText}
                    onChangeText={handleDaysTextChange}
                    placeholder="1"
                    placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.daysUnit}>
                    {offsetDays === 0 ? 'same' : offsetDays === 1 ? 'day' : 'days'}
                  </Text>
                  <View style={styles.directionSelector}>
                    <TouchableOpacity
                      style={[styles.directionButton, offsetDirection === 'before' && styles.directionButtonActive]}
                      onPress={() => setOffsetDirection('before')}
                    >
                      <Text style={[styles.directionText, offsetDirection === 'before' && styles.directionTextActive]}>
                        Before
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.directionButton, offsetDirection === 'after' && styles.directionButtonActive]}
                      onPress={() => setOffsetDirection('after')}
                    >
                      <Text style={[styles.directionText, offsetDirection === 'after' && styles.directionTextActive]}>
                        After
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time (EST)</Text>
                <View style={styles.timeRow}>
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeLabel}>Hour</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={selectedHour.toString()}
                      onChangeText={(text) => {
                        if (text === '') {
                          setSelectedHour(0);
                          return;
                        }
                        const num = parseInt(text);
                        if (!isNaN(num) && num >= 1 && num <= 12) {
                          setSelectedHour(num);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeLabel}>Min</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={selectedMinute.toString().padStart(2, '0')}
                      onChangeText={(text) => {
                        if (text === '') {
                          setSelectedMinute(0);
                          return;
                        }
                        if (/^\d{1,2}$/.test(text)) {
                          const num = parseInt(text, 10);
                          if (text.length === 1 || (text.length === 2 && num <= 59)) {
                            setSelectedMinute(num);
                          }
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.periodSelector}>
                    <TouchableOpacity
                      style={[styles.periodButton, selectedPeriod === 'AM' && styles.periodButtonActive]}
                      onPress={() => setSelectedPeriod('AM')}
                    >
                      <Text style={[styles.periodText, selectedPeriod === 'AM' && styles.periodTextActive]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.periodButton, selectedPeriod === 'PM' && styles.periodButtonActive]}
                      onPress={() => setSelectedPeriod('PM')}
                    >
                      <Text style={[styles.periodText, selectedPeriod === 'PM' && styles.periodTextActive]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                {Platform.OS === 'web' ? (
                  <View style={styles.webDateInputContainer}>
                    <Calendar size={16} color={HEYWAY_COLORS.text.secondary} />
                    <input
                      type="date"
                      value={onDate}
                      onChange={handleDateChange}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: HEYWAY_COLORS.text.primary,
                        fontSize: 16,
                        outline: 'none',
                        flex: 1,
                      }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar size={16} color={HEYWAY_COLORS.text.secondary} />
                    <Text style={styles.datePickerText}>
                      {onDate ? formatDateDisplay(onDate) : 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time (EST)</Text>
                <View style={styles.timeRow}>
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeLabel}>Hour</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={onDateHour.toString()}
                      onChangeText={(text) => {
                        if (text === '') {
                          setOnDateHour(0);
                          return;
                        }
                        const num = parseInt(text);
                        if (!isNaN(num) && num >= 1 && num <= 12) {
                          setOnDateHour(num);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeLabel}>Min</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={onDateMinute.toString().padStart(2, '0')}
                      onChangeText={(text) => {
                        if (text === '') {
                          setOnDateMinute(0);
                          return;
                        }
                        if (/^\d{1,2}$/.test(text)) {
                          const num = parseInt(text, 10);
                          if (text.length === 1 || (text.length === 2 && num <= 59)) {
                            setOnDateMinute(num);
                          }
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.periodSelector}>
                    <TouchableOpacity
                      style={[styles.periodButton, onDatePeriod === 'AM' && styles.periodButtonActive]}
                      onPress={() => setOnDatePeriod('AM')}
                    >
                      <Text style={[styles.periodText, onDatePeriod === 'AM' && styles.periodTextActive]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.periodButton, onDatePeriod === 'PM' && styles.periodButtonActive]}
                      onPress={() => setOnDatePeriod('PM')}
                    >
                      <Text style={[styles.periodText, onDatePeriod === 'PM' && styles.periodTextActive]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* AI Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Instructions *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={aiInstructions}
            onChangeText={setAiInstructions}
            placeholder="e.g., Remind the customer about their appointment tomorrow. Ask if they need to reschedule and get confirmation that they'll attend."
            placeholderTextColor={HEYWAY_COLORS.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Voice Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Message (Optional)</Text>
          <View style={styles.recordingSection}>
            <AudioRecorder
              initialAudioUri={voiceAudioUri}
              onAudioRecorded={(uri, duration) => {
                setVoiceAudioUri(uri);
                setVoiceAudioDuration(duration);
                setVoiceMessage('');
              }}
              onAudioDeleted={() => {
                setVoiceAudioUri(null);
                setVoiceAudioDuration(0);
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, (!name.trim() || !aiInstructions.trim()) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || !aiInstructions.trim()}
          activeOpacity={0.8}
        >
          <Text style={[styles.saveButtonText, (!name.trim() || !aiInstructions.trim()) && styles.saveButtonTextDisabled]}>
            {editingAutomation ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={onDateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderTopLeftRadius: HEYWAY_RADIUS.xxl,
    borderBottomLeftRadius: HEYWAY_RADIUS.xxl,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: HEYWAY_SPACING.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    borderTopLeftRadius: HEYWAY_RADIUS.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: HEYWAY_SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HEYWAY_COLORS.background.intelligenceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    gap: HEYWAY_SPACING.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: HEYWAY_COLORS.text.secondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.content,
  },
  content: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingTop: HEYWAY_SPACING.lg,
  },
  section: {
    marginBottom: HEYWAY_SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.md,
  },
  inputGroup: {
    marginBottom: HEYWAY_SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.sm,
  },
  textInput: {
    backgroundColor: HEYWAY_COLORS.background.content,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    fontSize: 16,
    color: HEYWAY_COLORS.text.primary,
    minHeight: 44,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  triggerTypeSelector: {
    flexDirection: 'row',
    marginBottom: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.lg,
    padding: HEYWAY_SPACING.xs,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.tertiary,
  },
  triggerTypeButton: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerTypeButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },
  triggerTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
  },
  triggerTypeTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: '600',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
  },
  daysInput: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    fontSize: 16,
    color: HEYWAY_COLORS.text.primary,
    width: 70,
    textAlign: 'center',
    fontWeight: '600',
  },
  daysUnit: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: '500',
    minWidth: 45,
  },
  directionSelector: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.xs,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.xs,
  },
  directionButton: {
    backgroundColor: 'transparent',
    borderRadius: HEYWAY_RADIUS.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    minWidth: 70,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },
  directionText: {
    fontSize: 14,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: '500',
  },
  directionTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.xs,
    fontWeight: '500',
  },
  timeInput: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.sm,
    fontSize: 16,
    color: HEYWAY_COLORS.text.primary,
    width: 50,
    textAlign: 'center',
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 18,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: '600',
    marginTop: 18,
  },
  periodSelector: {
    flexDirection: 'column',
    gap: HEYWAY_SPACING.xs,
    marginTop: 18,
  },
  periodButton: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.sm,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
  },
  periodText: {
    fontSize: 12,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: '600',
  },
  periodTextActive: {
    color: HEYWAY_COLORS.text.inverse,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    minWidth: 180,
  },
  datePickerText: {
    fontSize: 16,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: '500',
  },
  webDateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    minWidth: 180,
  },
  recordingSection: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
    padding: HEYWAY_SPACING.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HEYWAY_COLORS.border.divider,
    borderBottomLeftRadius: HEYWAY_RADIUS.xxl,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.md,
    backgroundColor: HEYWAY_COLORS.background.content,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.md,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
  },
  saveButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.background.content,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.white,
  },
  saveButtonTextDisabled: {
    color: HEYWAY_COLORS.text.tertiary,
  },
});

export default CreateAutomationPanel;