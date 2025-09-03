import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
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
  offsetDays: number; // number of days offset (always positive)
  offsetDirection: 'before' | 'after'; // direction of offset
  offsetTime: string; // time of day (HH:MM)
  onDate?: string; // ISO date string for 'on_date' trigger type
  onTime?: string; // time of day (HH:MM) for 'on_date' trigger type
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
  callbackEnabled?: boolean; // callback option for voicemail detection
  callbackTime?: string; // time to call back if voicemail detected (HH:MM)
}

export interface CreateAutomationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (automation: Partial<Automation>) => void;
  editingAutomation?: Automation | null;
}

const CreateAutomationModal: React.FC<CreateAutomationModalProps> = ({
  visible,
  onClose,
  onSave,
  editingAutomation,
}) => {
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
  const [callbackHour, setCallbackHour] = useState(9);
  const [callbackMinute, setCallbackMinute] = useState(0);
  const [callbackPeriod, setCallbackPeriod] = useState<'AM' | 'PM'>('AM');

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
        const local = new Date(dateString + 'T12:00:00'); // noon to avoid TZ skew
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
        // Handle 'on_date' trigger type
        const dateStr = editingAutomation.onDate || '';
        setOnDate(dateStr);
        setOnDateValue(dateStr ? new Date(dateStr + 'T12:00:00') : new Date());
        const { hour, minute, period } = parseTimeSafe(editingAutomation.onTime, { h: 9, m: 0 });
        setOnDateHour(hour); setOnDateMinute(minute); setOnDatePeriod(period);
      } else {
        // Handle 'date_offset' trigger type - backward compatibility
        if (editingAutomation.offsetDirection) {
          setOffsetDays(editingAutomation.offsetDays);
          setOffsetDaysText(editingAutomation.offsetDays.toString());
          setOffsetDirection(editingAutomation.offsetDirection);
        } else {
          // Legacy support: negative offsetDays means "before"
          const absOffsetDays = Math.abs(editingAutomation.offsetDays);
          setOffsetDays(absOffsetDays === 0 ? 1 : absOffsetDays);
          setOffsetDaysText((absOffsetDays === 0 ? 1 : absOffsetDays).toString());
          setOffsetDirection(editingAutomation.offsetDays < 0 ? 'before' : 'after');
        }

        // Parse existing time for date_offset
        const { hour, minute, period } = parseTimeSafe(editingAutomation.offsetTime, { h: 9, m: 0 });
        setSelectedHour(hour); setSelectedMinute(minute); setSelectedPeriod(period);
      }

      setAiInstructions(editingAutomation.aiInstructions);
      setVoiceMessage(editingAutomation.voiceMessage || '');
      setVoiceAudioUri(editingAutomation.voiceAudioUri || null);
      setVoiceAudioDuration(editingAutomation.voiceAudioDuration || 0);
      setCallbackEnabled(editingAutomation.callbackEnabled || false);
      if (editingAutomation.callbackTime) {
        const { hour, minute, period } = parseTimeSafe(editingAutomation.callbackTime, { h: 9, m: 0 });
        setCallbackHour(hour); setCallbackMinute(minute); setCallbackPeriod(period);
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
      setCallbackHour(9);
      setCallbackMinute(0);
      setCallbackPeriod('AM');
    }
  }, [editingAutomation, visible]);

  // Update offsetDays when text changes
  const handleDaysTextChange = (text: string) => {
    // Only allow positive numbers now that we have separate direction selection
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

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Error', 'Please enter an automation name');
    if (!aiInstructions.trim()) return Alert.alert('Error', 'Please provide AI instructions');

    const callbackTime = callbackEnabled
      ? formatTimeToMilitary(callbackHour || 9, callbackMinute || 0, callbackPeriod)
      : undefined;

    if (triggerType === 'on_date') {
      if (!onDate) return Alert.alert('Error', 'Please select a date for the automation');
      const onTime = formatTimeToMilitary(onDateHour || 9, onDateMinute || 0, onDatePeriod);

      // Past date/time guard (uses local)
      const [hStr, mStr] = onTime.split(':');
      const when = new Date(onDateValue);
      when.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
      if (when.getTime() <= Date.now()) {
        return Alert.alert('Invalid time', 'Please choose a future date & time.');
      }

      onSave({
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
        callbackTime,
      });
    } else {
      const militaryTime = formatTimeToMilitary(selectedHour || 9, selectedMinute || 0, selectedPeriod);
      onSave({
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
        callbackTime,
      });
    }

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.headerButton}
            activeOpacity={0.6}
          >
            <X size={20} color={HEYWAY_COLORS.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingAutomation ? 'Edit Automation' : 'Create Automation'}
          </Text>
          <View style={[styles.headerButton, { opacity: 0 }]} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Basic Information Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Settings size={20} color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Automation Name *</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Appointment Reminders"
                placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g., Remind customers about upcoming appointments"
                placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              />
            </View>
          </View>

          {/* Timing Settings Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.sectionTitle}>Timing Settings</Text>
            </View>

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

            <View style={styles.timingContainer}>
              {triggerType === 'date_offset' ? (
                <>
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>Schedule:</Text>
                    <View style={styles.scheduleContainer}>
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

                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>Time (EST):</Text>
                    <View style={styles.timePickerContainer}>
                      <View style={styles.timePickerSection}>
                        <Text style={styles.timePickerLabel}>Hour</Text>
                        <TextInput
                          style={styles.timePickerInput}
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
                          selectTextOnFocus={true}
                        />
                      </View>

                      <Text style={styles.timeSeparator}>:</Text>

                      <View style={styles.timePickerSection}>
                        <Text style={styles.timePickerLabel}>Min</Text>
                        <TextInput
                          style={styles.timePickerInput}
                          value={selectedMinute.toString().padStart(2, '0')}
                          onChangeText={(text) => {
                            const num = parseInt(text);
                            if (!isNaN(num) && num >= 0 && num <= 59) {
                              setSelectedMinute(num);
                            } else if (text === '') {
                              setSelectedMinute(0);
                            }
                          }}
                          keyboardType="number-pad"
                          maxLength={2}
                          selectTextOnFocus={true}
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
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>Date:</Text>
                    <View style={styles.scheduleContainer}>
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
                              fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
                              fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
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
                  </View>

                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>Time (EST):</Text>
                    <View style={styles.timePickerContainer}>
                      <View style={styles.timePickerSection}>
                        <Text style={styles.timePickerLabel}>Hour</Text>
                        <TextInput
                          style={styles.timePickerInput}
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
                          selectTextOnFocus={true}
                        />
                      </View>

                      <Text style={styles.timeSeparator}>:</Text>

                      <View style={styles.timePickerSection}>
                        <Text style={styles.timePickerLabel}>Min</Text>
                        <TextInput
                          style={styles.timePickerInput}
                          value={onDateMinute.toString().padStart(2, '0')}
                          onChangeText={(text) => {
                            const num = parseInt(text);
                            if (!isNaN(num) && num >= 0 && num <= 59) {
                              setOnDateMinute(num);
                            } else if (text === '') {
                              setOnDateMinute(0);
                            }
                          }}
                          keyboardType="number-pad"
                          maxLength={2}
                          selectTextOnFocus={true}
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

            {triggerType === 'date_offset' ? (
              <>
                <Text style={styles.timingHint}>
                  Example: 1 day Before at 9:00 AM EST = call 1 day before reference date at 9 AM Eastern
                </Text>
                <Text style={styles.timingHint}>
                  For appointment reminders, use "Before" to call customers ahead of their appointment.
                </Text>
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Important: When importing contacts for this automation, you'll need to specify a "reference date" column containing the date each call should be relative to (e.g., appointment date, sale date, etc.).
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.timingHint}>
                Example: 2024-12-25 at 9:00 AM EST = call everyone on the list on December 25th, 2024 at 9 AM Eastern
              </Text>
            )}
          </View>

          {/* Callback Option Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MessageCircle size={20} color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.sectionTitle}>Callback Options</Text>
            </View>

            <View style={styles.callbackContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setCallbackEnabled(!callbackEnabled)}
              >
                <View style={[styles.checkbox, callbackEnabled && styles.checkboxChecked]}>
                  {callbackEnabled && <Check size={14} color={HEYWAY_COLORS.text.inverse} />}
                </View>
                <Text style={styles.checkboxText}>Enable callback if voicemail detected</Text>
              </TouchableOpacity>

              {callbackEnabled && (
                <View style={styles.callbackTimeContainer}>
                  <Text style={styles.callbackTimeLabel}>Call back at:</Text>
                  <View style={styles.timePickerContainer}>
                    <View style={styles.timePickerSection}>
                      <Text style={styles.timePickerLabel}>Hour</Text>
                      <TextInput
                        style={styles.timePickerInput}
                        value={callbackHour.toString()}
                        onChangeText={(text) => {
                          if (text === '') {
                            setCallbackHour(0);
                            return;
                          }
                          const num = parseInt(text);
                          if (!isNaN(num) && num >= 1 && num <= 12) {
                            setCallbackHour(num);
                          }
                        }}
                        keyboardType="number-pad"
                        maxLength={2}
                        selectTextOnFocus={true}
                      />
                    </View>

                    <Text style={styles.timeSeparator}>:</Text>

                    <View style={styles.timePickerSection}>
                      <Text style={styles.timePickerLabel}>Min</Text>
                      <TextInput
                        style={styles.timePickerInput}
                        value={callbackMinute.toString().padStart(2, '0')}
                        onChangeText={(text) => {
                          const num = parseInt(text);
                          if (!isNaN(num) && num >= 0 && num <= 59) {
                            setCallbackMinute(num);
                          } else if (text === '') {
                            setCallbackMinute(0);
                          }
                        }}
                        keyboardType="number-pad"
                        maxLength={2}
                        selectTextOnFocus={true}
                      />
                    </View>

                    <View style={styles.periodSelector}>
                      <TouchableOpacity
                        style={[styles.periodButton, callbackPeriod === 'AM' && styles.periodButtonActive]}
                        onPress={() => setCallbackPeriod('AM')}
                      >
                        <Text style={[styles.periodText, callbackPeriod === 'AM' && styles.periodTextActive]}>
                          AM
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.periodButton, callbackPeriod === 'PM' && styles.periodButtonActive]}
                        onPress={() => setCallbackPeriod('PM')}
                      >
                        <Text style={[styles.periodText, callbackPeriod === 'PM' && styles.periodTextActive]}>
                          PM
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
            <Text style={styles.fieldHint}>
              If enabled and voicemail is detected, the system will automatically call back at the specified time.
            </Text>
          </View>

          {/* Audio Recording Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Play size={20} color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.sectionTitle}>Voice Message (Optional)</Text>
            </View>

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
            <Text style={styles.fieldHint}>
              Record a personal voice message that will play first, before AI instructions.
            </Text>
          </View>

          {/* AI Instructions Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Users size={20} color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.sectionTitle}>AI Instructions *</Text>
            </View>

            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={aiInstructions}
              onChangeText={setAiInstructions}
              placeholder="e.g., Remind the customer about their appointment tomorrow. Ask if they need to reschedule and get confirmation that they'll attend."
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Create Button */}
          <View style={styles.createButtonContainer}>
            <TouchableOpacity
              style={[styles.createButton, (!name.trim() || !aiInstructions.trim()) && styles.createButtonDisabled]}
              onPress={handleSave}
              disabled={!name.trim() || !aiInstructions.trim()}
            >
              <Text style={[styles.createButtonText, (!name.trim() || !aiInstructions.trim()) && styles.createButtonTextDisabled]}>
                {editingAutomation ? 'Update Automation' : 'Create Automation'}
              </Text>
            </TouchableOpacity>
            {(!name.trim() || !aiInstructions.trim()) && (
              <Text style={styles.validationHint}>
                Please fill in all required fields (*)
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Bottom padding for scroll */}
        <View style={styles.bottomPadding} />

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
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal styles with HeyWay design
  modalContainer: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? HEYWAY_SPACING.giant : HEYWAY_SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.divider,
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  headerButton: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    height: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.xs,
  },
  modalTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: HEYWAY_SPACING.xl,
    paddingTop: HEYWAY_SPACING.xl,
  },
  sectionContainer: {
    marginBottom: HEYWAY_SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    marginBottom: HEYWAY_SPACING.lg,
  },
  sectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  formSection: {
    marginBottom: HEYWAY_SPACING.lg,
  },
  formLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.md,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },
  formInput: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderColor: HEYWAY_COLORS.border.primary,
    borderWidth: 1,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.xs,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  timingContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
    marginTop: HEYWAY_SPACING.sm,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: HEYWAY_SPACING.lg,
  },
  timingLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    flex: 1,
    justifyContent: 'flex-end',
  },
  daysInput: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    width: 70,
    textAlign: 'center',
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  daysUnit: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
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
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  directionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
  },
  directionTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    flex: 1,
    justifyContent: 'flex-end',
  },
  timePickerSection: {
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
    color: HEYWAY_COLORS.text.secondary,
    marginBottom: HEYWAY_SPACING.xs,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },
  timePickerInput: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.sm,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    width: 50,
    textAlign: 'center',
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  timeSeparator: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.small,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
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
    minWidth: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  periodText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },
  periodTextActive: {
    color: HEYWAY_COLORS.text.inverse,
  },
  triggerTypeSelector: {
    flexDirection: 'row',
    marginBottom: HEYWAY_SPACING.lg,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.lg,
    padding: HEYWAY_SPACING.xs,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.tertiary,
  },
  triggerTypeButton: {
    flex: 1,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerTypeButtonActive: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    ...HEYWAY_SHADOWS.light.sm,
  },
  triggerTypeText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  triggerTypeTextActive: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
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
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
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
  timingHint: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    color: HEYWAY_COLORS.text.tertiary,
    marginTop: HEYWAY_SPACING.md,
    fontStyle: 'italic',
    lineHeight: 16,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.secondarySecondary,
    borderRadius: HEYWAY_RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: HEYWAY_COLORS.interactive.primary,
  },
  warningContainer: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.sm,
    padding: HEYWAY_SPACING.md,
    marginTop: HEYWAY_SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: HEYWAY_COLORS.accent.warning,
  },
  warningText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    color: HEYWAY_COLORS.text.primary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  fieldHint: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    color: HEYWAY_COLORS.text.tertiary,
    marginTop: HEYWAY_SPACING.sm,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  // Callback styles
  callbackContainer: {
    backgroundColor: HEYWAY_COLORS.background.card,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.component.padding.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    ...HEYWAY_SHADOWS.light.sm
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  checkboxChecked: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderColor: HEYWAY_COLORS.interactive.primary,
  },
  checkboxText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    flex: 1,
  },
  callbackTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: HEYWAY_SPACING.xl,
  },
  callbackTimeLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
  },
  // Recording section styles
  recordingSection: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
    alignItems: 'center',
  },
  // Create button styles
  createButtonContainer: {
    marginTop: HEYWAY_SPACING.xl,
    marginBottom: HEYWAY_SPACING.xxl,
  },
  createButton: {
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.large,
    ...HEYWAY_SHADOWS.light.sm,
  },
  createButtonDisabled: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    ...HEYWAY_SHADOWS.light.none,
  },
  createButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },
  createButtonTextDisabled: {
    color: HEYWAY_COLORS.text.tertiary,
  },
  validationHint: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    color: HEYWAY_COLORS.status.error,
    textAlign: 'center',
    marginTop: HEYWAY_SPACING.md,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
  },
  bottomPadding: {
    height: HEYWAY_SPACING.xxl,
  },
});

export default CreateAutomationModal;