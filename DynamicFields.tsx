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

interface DynamicFieldsProps {
  selectedPromptTemplate: string | null;
  formData: any;
  updateFormData: (key: string, value: any) => void;
  updateOrderItem?: (index: number, field: 'name' | 'quantity', value: string) => void;
}

// iOS Dark Mode Colors to match NewCallModal
const IOS_COLORS = {
  background: '#000000',
  cardBackground: '#1C1C1E',
  secondaryBackground: '#2C2C2E',
  buttonBackground: '#3A3A3C',
  text: {
    primary: '#FFFFFF',
    secondary: '#AEAEB2',
    tertiary: '#636366',
  },
  accent: '#007AFF',
  separator: '#3A3A3C',
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
    marginBottom: 90,
  },
  formSection: {
    backgroundColor: IOS_COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: IOS_COLORS.buttonBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: IOS_COLORS.text.primary,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: IOS_COLORS.text.primary,
    marginBottom: 8,
  },

  // Option Buttons
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: IOS_COLORS.buttonBackground,
    gap: 6,
  },
  optionButtonSelected: {
    backgroundColor: IOS_COLORS.accent,
    borderColor: IOS_COLORS.accent,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: IOS_COLORS.text.primary,
  },
  optionButtonTextSelected: {
    color: '#ffffff',
  },
  checkIcon: {
    marginLeft: 4,
  },

  // Scrollable Options
  scrollContainer: {
    paddingHorizontal: 4,
  },
  timeOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: IOS_COLORS.buttonBackground,
  },
  timeOptionWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeOptionSelected: {
    backgroundColor: IOS_COLORS.accent,
    borderColor: IOS_COLORS.accent,
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: IOS_COLORS.text.primary,
  },
  timeOptionTextSelected: {
    color: '#ffffff',
  },
  timeOptionEmoji: {
    fontSize: 14,
  },

  // Day Buttons
  daysRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: IOS_COLORS.buttonBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: IOS_COLORS.accent,
    borderColor: IOS_COLORS.accent,
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: IOS_COLORS.text.primary,
  },
  dayButtonTextSelected: {
    color: '#ffffff',
  },

  // Input Fields
  inputContainer: {
    backgroundColor: IOS_COLORS.buttonBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '400',
    color: IOS_COLORS.text.primary,
    backgroundColor: 'transparent',
  },
  textAreaContainer: {
    backgroundColor: IOS_COLORS.buttonBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '400',
    color: IOS_COLORS.text.primary,
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
    minHeight: 60,
  },

  // Order Form Specific
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  orderItemInput: {
    flex: 1,
  },
  quantityInput: {
    width: 80,
  },
});

export default DynamicFields;