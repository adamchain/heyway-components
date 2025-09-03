import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Calendar, Package, MessageSquare, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { HEYWAY_COLORS, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_ACCESSIBILITY } from '../styles/HEYWAY_STYLE_GUIDE';

interface DynamicFieldsProps {
  selectedPromptTemplate: string | null;
  formData: any;
  updateFormData: (key: string, value: any) => void;
  updateOrderItem?: (index: number, field: 'name' | 'quantity', value: string) => void;
}

// iOS Dark Mode Colors to match NewCallModal
const IOS_COLORS = {
  background: HEYWAY_COLORS.background.whatsappPanel,
  cardBackground: HEYWAY_COLORS.background.secondary,
  secondaryBackground: HEYWAY_COLORS.background.tertiary,
  buttonBackground: HEYWAY_COLORS.background.tertiary,
  text: {
    primary: HEYWAY_COLORS.text.primary,
    secondary: HEYWAY_COLORS.text.secondary,
    tertiary: HEYWAY_COLORS.text.tertiary,
  },
  accent: HEYWAY_COLORS.interactive.primary,
  separator: HEYWAY_COLORS.border.primary,
};

const DynamicFields: React.FC<DynamicFieldsProps> = ({
  selectedPromptTemplate,
  formData,
  updateFormData,
  updateOrderItem,
}) => {
  if (!selectedPromptTemplate || selectedPromptTemplate === 'None') return null;

  const handleHapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderCallBackForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formSection}>
        {/* Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <MessageSquare size={14} color={IOS_COLORS.text.primary} />
          </View>
          <Text style={styles.sectionTitle}>Call Back Details</Text>
        </View>

        {/* Know Caller Question */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Do you know who called?</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                formData.knowCaller === true && styles.optionButtonSelected
              ]}
              onPress={() => {
                handleHapticFeedback();
                updateFormData('knowCaller', true);
              }}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.optionButtonText,
                formData.knowCaller === true && styles.optionButtonTextSelected
              ]}>
                Yes
              </Text>
              {formData.knowCaller === true && (
                <CheckCircle size={14} color="#FFFFFF" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                formData.knowCaller === false && styles.optionButtonSelected
              ]}
              onPress={() => {
                handleHapticFeedback();
                updateFormData('knowCaller', false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.optionButtonText,
                formData.knowCaller === false && styles.optionButtonTextSelected
              ]}>
                No
              </Text>
              {formData.knowCaller === false && (
                <CheckCircle size={14} color="#FFFFFF" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* When Called Question */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>When did they call?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <View style={styles.timeOptionsRow}>
              {['Just now', 'Earlier today', 'Yesterday', 'This week', 'Last week', 'Not sure'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.timeOption,
                    formData.whenCalled === option && styles.timeOptionSelected
                  ]}
                  onPress={() => {
                    handleHapticFeedback();
                    updateFormData('whenCalled', option);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.timeOptionText,
                    formData.whenCalled === option && styles.timeOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Additional Info */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Additional context</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Any context about the call..."
              placeholderTextColor={IOS_COLORS.text.tertiary}
              value={formData.additionalInfo}
              onChangeText={(text) => updateFormData('additionalInfo', text)}
              multiline
              numberOfLines={3}
              selectionColor="#000"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderScheduleForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formSection}>
        {/* Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Calendar size={14} color={IOS_COLORS.text.primary} />
          </View>
          <Text style={styles.sectionTitle}>Schedule Appointment</Text>
        </View>

        {/* Service Type */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Appointment type</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Dinner, Haircut, Consultation"
              placeholderTextColor={IOS_COLORS.text.tertiary}
              value={formData.serviceType}
              onChangeText={(text) => updateFormData('serviceType', text)}
              selectionColor="#000"
            />
          </View>
        </View>

        {/* Time Preference */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>When would you like to schedule?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <View style={styles.timeOptionsRow}>
              {[
                { key: 'today', label: 'Today' },
                { key: 'tomorrow', label: 'Tomorrow' },
                { key: 'this-week', label: 'This week' },
                { key: 'next-week', label: 'Next week' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.timeOption,
                    formData.timePreference === option.key && styles.timeOptionSelected
                  ]}
                  onPress={() => {
                    handleHapticFeedback();
                    updateFormData('timePreference', option.key);
                    if (option.key === 'today' || option.key === 'tomorrow') {
                      updateFormData('dayOfWeek', '');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.timeOptionText,
                    formData.timePreference === option.key && styles.timeOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Day Selection */}
        {(formData.timePreference === 'this-week' || formData.timePreference === 'next-week') && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Which day?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              <View style={styles.daysRow}>
                {[
                  { key: 'mon', label: 'Mon' },
                  { key: 'tue', label: 'Tue' },
                  { key: 'wed', label: 'Wed' },
                  { key: 'thu', label: 'Thu' },
                  { key: 'fri', label: 'Fri' },
                  { key: 'sat', label: 'Sat' },
                  { key: 'sun', label: 'Sun' }
                ].map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayButton,
                      formData.dayOfWeek === day.key && styles.dayButtonSelected
                    ]}
                    onPress={() => {
                      handleHapticFeedback();
                      updateFormData('dayOfWeek', day.key);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      formData.dayOfWeek === day.key && styles.dayButtonTextSelected
                    ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Time of Day */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Time preference</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <View style={styles.timeOptionsRow}>
              {[
                { key: 'asap', label: 'ASAP', icon: '' },
                { key: 'morning', label: 'Morning', icon: '' },
                { key: 'afternoon', label: 'Afternoon', icon: '' },
                { key: 'evening', label: 'Evening', icon: '' }

              ].map((time) => (
                <TouchableOpacity
                  key={time.key}
                  style={[
                    styles.timeOption,
                    styles.timeOptionWithIcon,
                    formData.timeOfDay === time.key && styles.timeOptionSelected
                  ]}
                  onPress={() => {
                    handleHapticFeedback();
                    updateFormData('timeOfDay', time.key);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timeOptionEmoji}>{time.icon}</Text>
                  <Text style={[
                    styles.timeOptionText,
                    formData.timeOfDay === time.key && styles.timeOptionTextSelected
                  ]}>
                    {time.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );

  const renderOrderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formSection}>
        {/* Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Package size={14} color={IOS_COLORS.text.primary} />
          </View>
          <Text style={styles.sectionTitle}>Order Items</Text>
        </View>

        {/* Order Items */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Items to order</Text>
          {formData.items?.map((item: any, index: number) => (
            <View key={index} style={styles.orderItemRow}>
              <View style={[styles.inputContainer, styles.orderItemInput]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Item name"
                  placeholderTextColor={IOS_COLORS.text.tertiary}
                  value={item.name}
                  onChangeText={(text) => updateOrderItem?.(index, 'name', text)}
                  selectionColor="#000"
                />
              </View>
              <View style={[styles.inputContainer, styles.quantityInput]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Qty"
                  placeholderTextColor={IOS_COLORS.text.tertiary}
                  value={item.quantity}
                  onChangeText={(text) => updateOrderItem?.(index, 'quantity', text)}
                  keyboardType="numeric"
                  selectionColor="#000"
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Render appropriate form based on template
  switch (selectedPromptTemplate) {
    case 'Call Back':
      return renderCallBackForm();
    case 'Schedule':
      return renderScheduleForm();
    case 'Order':
      return renderOrderForm();
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: HEYWAY_SPACING.xxxxl * 2,
  },
  formSection: {
    backgroundColor: IOS_COLORS.cardBackground,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    padding: HEYWAY_SPACING.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    marginBottom: HEYWAY_SPACING.xs,
    ...HEYWAY_SHADOWS.light.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEYWAY_SPACING.lg,
    paddingBottom: HEYWAY_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.subtle,
  },
  sectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: HEYWAY_RADIUS.component.avatar.sm,
    backgroundColor: IOS_COLORS.buttonBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.md,
  },
  sectionTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: IOS_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  fieldGroup: {
    marginBottom: HEYWAY_SPACING.lg,
  },
  fieldLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: IOS_COLORS.text.primary,
    marginBottom: HEYWAY_SPACING.sm,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  // Option Buttons
  optionsRow: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    backgroundColor: IOS_COLORS.buttonBackground,
    gap: HEYWAY_SPACING.xs,
    minHeight: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    ...HEYWAY_SHADOWS.light.xs,
  },
  optionButtonSelected: {
    backgroundColor: IOS_COLORS.accent,
    borderColor: IOS_COLORS.accent,
    ...HEYWAY_SHADOWS.light.sm,
  },
  optionButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: IOS_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  optionButtonTextSelected: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  checkIcon: {
    marginLeft: HEYWAY_SPACING.xs,
  },

  // Scrollable Options
  scrollContainer: {
    paddingHorizontal: HEYWAY_SPACING.xs,
  },
  timeOptionsRow: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
  },
  timeOption: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.component.button.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    backgroundColor: IOS_COLORS.buttonBackground,
    ...HEYWAY_SHADOWS.light.xs,
  },
  timeOptionWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.xs,
  },
  timeOptionSelected: {
    backgroundColor: IOS_COLORS.accent,
    borderColor: IOS_COLORS.accent,
    ...HEYWAY_SHADOWS.light.sm,
  },
  timeOptionText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: IOS_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  timeOptionTextSelected: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },
  timeOptionEmoji: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
  },

  // Day Buttons
  daysRow: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.sm,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: HEYWAY_RADIUS.component.button.full,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    backgroundColor: IOS_COLORS.buttonBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...HEYWAY_SHADOWS.light.xs,
  },
  dayButtonSelected: {
    backgroundColor: IOS_COLORS.accent,
    borderColor: IOS_COLORS.accent,
    ...HEYWAY_SHADOWS.light.sm,
  },
  dayButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: IOS_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  dayButtonTextSelected: {
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
  },

  // Input Fields
  inputContainer: {
    backgroundColor: IOS_COLORS.buttonBackground,
    borderRadius: HEYWAY_RADIUS.component.input.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    ...HEYWAY_SHADOWS.light.xs,
  },
  textInput: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: IOS_COLORS.text.primary,
    backgroundColor: 'transparent',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  textAreaContainer: {
    backgroundColor: IOS_COLORS.buttonBackground,
    borderRadius: HEYWAY_RADIUS.component.input.lg,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.subtle,
    ...HEYWAY_SHADOWS.light.xs,
  },
  textArea: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: IOS_COLORS.text.primary,
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
    minHeight: 60,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  // Order Form Specific
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    marginBottom: HEYWAY_SPACING.md,
  },
  orderItemInput: {
    flex: 1,
  },
  quantityInput: {
    width: 80,
  },
});

export default DynamicFields;