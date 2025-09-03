import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  InteractionManager,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, X, Check, ChevronDown, Users, MessageSquare } from 'lucide-react-native';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '@/styles/HEYWAY_STYLE_GUIDE';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '@/services/apiService';

interface CallSchedulerProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (scheduledTime: Date, notes: string) => void;
  recipients: string[];
}

const { width: screenWidth } = Dimensions.get('window');

export default function CallScheduler({ visible, onClose, onSchedule, recipients }: CallSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [notes, setNotes] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (visible) {
      // Reset form when opening
      setSelectedDate(new Date());
      setSelectedTime('09:00');
      setNotes('');
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // Generate next 21 days for date picker (3 weeks)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // Generate time options in 30-minute increments for better UX
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 7; hour < 22; hour++) { // 7 AM to 10 PM
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const militaryTime = `${formattedHour}:${formattedMinute}`;
        times.push(militaryTime);
      }
    }
    return times;
  };

  // Format military time to 12-hour format for display
  const formatTimeDisplay = (militaryTime: string) => {
    const [hours, minutes] = militaryTime.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    }
  };

  const formatFullDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    if (!notes.trim()) {
      Alert.alert('Error', 'Please provide instructions for the AI');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create a Date object with the selected date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // Check if the scheduled time is in the past
      if (scheduledDateTime <= new Date()) {
        Alert.alert('Invalid Time', 'Please select a future date and time');
        setIsSubmitting(false);
        return;
      }

      // Determine caller ID preference
      let callerId: string | undefined = undefined;
      try {
        const pref = await apiService.getCallerIdPreference();
        callerId = pref?.callerId || undefined;
      } catch (e) {
        // Non-fatal, backend will validate
      }

      // Schedule the call via API
      const response = await apiService.scheduleCall({
        scheduledTime: scheduledDateTime.toISOString(),
        recipients,
        notes: notes.trim(),
        callMode: 'ai-only',
        callerId
      });

      console.log('✅ Schedule API response:', response);

      // Use InteractionManager to ensure UI animations finish before state updates
      InteractionManager.runAfterInteractions(() => {
        // Call the onSchedule callback
        onSchedule(scheduledDateTime, notes.trim());

        // Reset form
        setSelectedDate(new Date());
        setSelectedTime('09:00');
        setNotes('');

        // Show success message
        setTimeout(() => {
          Alert.alert(
            'Call Scheduled! 📅', 
            `Your AI call has been scheduled for ${formatFullDate(scheduledDateTime)} at ${formatTimeDisplay(selectedTime)}.\n\nYou'll receive a notification when the call is about to start.`
          );
        }, 300);
      });

      // Close modal with a slight delay to ensure smooth animation
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('Failed to schedule call:', error);
      const message = (error as any)?.message || 'Failed to schedule call. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ModalComponent = Platform.OS === 'web' ? WebModal : Modal;

  return (
    <ModalComponent
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.modalContent,
          { 
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim 
          }
        ]}
      >
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerContent}>
            <Calendar size={24} color={COLORS.accent} />
            <Text style={styles.modalTitle}>Schedule Call</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Recipients Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Users size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Recipients</Text>
                </View>
                <View style={styles.recipientsContainer}>
                  <Text style={styles.recipientsText}>
                    {recipients.length} {recipients.length === 1 ? 'contact' : 'contacts'} selected
                  </Text>
                  <Text style={styles.recipientsSubtext}>
                    {recipients.slice(0, 3).join(', ')}
                    {recipients.length > 3 && ` +${recipients.length - 3} more`}
                  </Text>
                </View>
              </View>

              {/* Date Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Calendar size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Date</Text>
                </View>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                  activeOpacity={0.7}
                >
                  <View style={styles.pickerButtonContent}>
                    <Text style={styles.pickerButtonText}>{formatDate(selectedDate)}</Text>
                    <Text style={styles.pickerButtonSubtext}>{formatFullDate(selectedDate)}</Text>
                  </View>
                  <ChevronDown 
                    size={20} 
                    color={COLORS.text.secondary} 
                    style={[
                      styles.chevron,
                      showDatePicker && styles.chevronRotated
                    ]}
                  />
                </TouchableOpacity>

                {showDatePicker && (
                  <View style={styles.optionsContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.dateOptionsContent}
                    >
                      {generateDateOptions().map((date, index) => {
                        const isSelected = selectedDate.toDateString() === date.toDateString();
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.dateOption,
                              isSelected && styles.selectedDateOption
                            ]}
                            onPress={() => {
                              setSelectedDate(date);
                              setShowDatePicker(false);
                            }}
                            activeOpacity={0.7}
                          >
                            {isSelected ? (
                                      <LinearGradient
          colors={['#34C759', '#30D158']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.selectedDateGradient}
        >
                                <Text style={styles.selectedDateOptionText}>
                                  {formatDate(date)}
                                </Text>
                              </LinearGradient>
                            ) : (
                              <Text style={styles.dateOptionText}>
                                {formatDate(date)}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Time Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Time</Text>
                </View>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowTimePicker(!showTimePicker)}
                  activeOpacity={0.7}
                >
                  <View style={styles.pickerButtonContent}>
                    <Text style={styles.pickerButtonText}>{formatTimeDisplay(selectedTime)}</Text>
                    <Text style={styles.pickerButtonSubtext}>Military time: {selectedTime}</Text>
                  </View>
                  <ChevronDown 
                    size={20} 
                    color={COLORS.text.secondary} 
                    style={[
                      styles.chevron,
                      showTimePicker && styles.chevronRotated
                    ]}
                  />
                </TouchableOpacity>

                {showTimePicker && (
                  <View style={styles.optionsContainer}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={styles.timeOptionsScroll}
                      contentContainerStyle={styles.timeOptionsContent}
                    >
                      {generateTimeOptions().map((time, index) => {
                        const isSelected = selectedTime === time;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.timeOption,
                              isSelected && styles.selectedTimeOption
                            ]}
                            onPress={() => {
                              setSelectedTime(time);
                              setShowTimePicker(false);
                            }}
                            activeOpacity={0.7}
                          >
                            {isSelected ? (
                                      <LinearGradient
          colors={['#34C759', '#30D158']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.selectedTimeGradient}
        >
                                <Text style={styles.selectedTimeOptionText}>
                                  {formatTimeDisplay(time)}
                                </Text>
                              </LinearGradient>
                            ) : (
                              <Text style={styles.timeOptionText}>
                                {formatTimeDisplay(time)}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Notes Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MessageSquare size={18} color={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Instructions for the AI</Text>
                </View>
                <TextInput
                  style={styles.notesInput}
                  placeholder="E.g., Schedule a haircut appointment. Ask about availability next week and mention my name. Get their callback number for confirmation."
                  placeholderTextColor={COLORS.text.tertiary}
                  multiline
                  numberOfLines={4}
                  value={notes}
                  onChangeText={setNotes}
                  textAlignVertical="top"
                />
                <Text style={styles.notesHint}>
                  Be specific about what the AI should accomplish during the call
                </Text>
              </View>

              {/* Schedule Button */}
              <TouchableOpacity
                style={[
                  styles.scheduleButton,
                  (!notes.trim() || isSubmitting) && styles.scheduleButtonDisabled
                ]}
                onPress={handleSchedule}
                disabled={!notes.trim() || isSubmitting}
                activeOpacity={0.8}
              >
                        <LinearGradient
          colors={['#34C759', '#30D158']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scheduleButtonGradient}
        >
                  {isSubmitting ? (
                    <View style={styles.buttonContent}>
                      <Text style={styles.scheduleButtonText}>Scheduling...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Check size={20} color={COLORS.text.onDark} />
                      <Text style={styles.scheduleButtonText}>Schedule Call</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
    </ModalComponent>
  );
}

// Web Modal component for React Native Web
const WebModal = ({ visible, children }: any) => {
  if (!visible) return null;

  return (
    <View style={webModalStyles.overlay}>
      <View style={webModalStyles.container}>
        {children}
      </View>
    </View>
  );
};

const webModalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E3E5E8',
    width: '90%',
    maxWidth: 520,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 12,
  }
});

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    width: '92%',
    maxWidth: 520,
    maxHeight: '88%',
    ...HEYWAY_SHADOWS.light.xl,
  },

  /* Header — quiet bar */
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: HEYWAY_SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderTopLeftRadius: HEYWAY_RADIUS.component.card.xxl,
    borderTopRightRadius: HEYWAY_RADIUS.component.card.xxl,
  },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: HEYWAY_SPACING.sm 
  },
  modalTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },

  /* Content padding */
  scrollContent: { padding: HEYWAY_SPACING.lg },

  /* Sections */
  section: { marginBottom: HEYWAY_SPACING.xl },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: HEYWAY_SPACING.sm, 
    marginBottom: HEYWAY_SPACING.sm 
  },
  sectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  /* Recipients card */
  recipientsContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  recipientsText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  recipientsSubtext: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    lineHeight: 18,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  /* Pickers (date/time) */
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  pickerButtonContent: { flex: 1 },
  pickerButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  pickerButtonSubtext: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  chevron: { marginLeft: HEYWAY_SPACING.md },
  chevronRotated: { transform: [{ rotate: '180deg' }] },

  /* Options panels */
  optionsContainer: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.md,
    marginTop: HEYWAY_SPACING.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    padding: HEYWAY_SPACING.sm,
    ...HEYWAY_SHADOWS.light.sm,
  },

  /* Date options */
  dateOptionsContent: { 
    paddingVertical: HEYWAY_SPACING.xs, 
    gap: HEYWAY_SPACING.sm 
  },
  dateOption: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    marginHorizontal: HEYWAY_SPACING.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    minWidth: 90,
    alignItems: 'center',
  },
  selectedDateOption: {
    borderColor: HEYWAY_COLORS.status.success,
    backgroundColor: HEYWAY_COLORS.interactive.selected,
  },
  selectedDateGradient: {
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    marginHorizontal: -HEYWAY_SPACING.md,
    marginVertical: -HEYWAY_SPACING.sm,
    alignItems: 'center',
    minWidth: 90,
  },
  dateOptionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  selectedDateOptionText: {
    color: HEYWAY_COLORS.status.success,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  /* Time options */
  timeOptionsScroll: { maxHeight: 220 },
  timeOptionsContent: { 
    paddingVertical: HEYWAY_SPACING.xs, 
    gap: HEYWAY_SPACING.sm 
  },
  timeOption: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    alignItems: 'center',
  },
  selectedTimeOption: {
    borderColor: HEYWAY_COLORS.status.success,
    backgroundColor: HEYWAY_COLORS.interactive.selected,
  },
  selectedTimeGradient: {
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    marginHorizontal: -HEYWAY_SPACING.md,
    marginVertical: -HEYWAY_SPACING.md,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  selectedTimeOptionText: {
    color: HEYWAY_COLORS.status.success,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  /* Notes */
  notesInput: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.input.md,
    padding: HEYWAY_SPACING.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    minHeight: 110,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    ...HEYWAY_SHADOWS.light.xs,
  },
  notesHint: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    marginTop: HEYWAY_SPACING.sm,
    fontStyle: 'italic',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.normal * HEYWAY_TYPOGRAPHY.fontSize.caption.large,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  /* CTA */
  scheduleButton: {
    borderRadius: HEYWAY_RADIUS.component.button.md,
    marginBottom: HEYWAY_SPACING.xxl,
    marginTop: HEYWAY_SPACING.sm,
    shadowColor: HEYWAY_COLORS.status.success,
    ...HEYWAY_SHADOWS.light.md,
  },
  scheduleButtonDisabled: { opacity: 0.5 },
  scheduleButtonGradient: {
    borderRadius: HEYWAY_RADIUS.component.button.md,
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    alignItems: 'center',
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
  },
  buttonContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: HEYWAY_SPACING.sm 
  },
  scheduleButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.bold,
    color: HEYWAY_COLORS.text.inverse,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});