import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Plus, X, Phone } from 'lucide-react-native';
import { COLORS, RADIUS } from '@/components/designSystem';

interface OrderItem {
  name: string;
  quantity: string;
}

interface FormData {
  // Standard form
  message?: string;
  
  // Order form
  items?: OrderItem[];
  deliveryOption?: string;
  specialInstructions?: string;
  
  // Callback form
  callerName?: string;
  reason?: string;
  urgency?: 'low' | 'medium' | 'high';
  additionalInfo?: string;
  
  // Schedule form
  serviceType?: string;
  timePreference?: string;
  dayOfWeek?: string;
  timeOfDay?: string;
}

interface AICallerFormsProps {
  selectedPrompt: 'standard' | 'order' | 'callback' | 'schedule' | null;
  formData: FormData;
  updateFormData: (field: string, value: any) => void;
  updateOrderItem: (index: number, field: 'name' | 'quantity', value: string) => void;
  addOrderItem: () => void;
  removeOrderItem: (index: number) => void;
  onMakeCall: () => void;
  selectedCallList: any[];
  isLoading: boolean;
}

export default function AICallerForms({ 
  selectedPrompt, 
  formData, 
  updateFormData, 
  updateOrderItem,
  addOrderItem,
  removeOrderItem,
  onMakeCall,
  selectedCallList,
  isLoading
}: AICallerFormsProps) {
  if (!selectedPrompt) return null;

  const renderStandardForm = () => (
    <View style={styles.formSection}>
      <TextInput
        style={styles.textInput}
        placeholder="What would you like to say?"
        placeholderTextColor={COLORS.text.tertiary}
        value={formData.message || ''}
        onChangeText={(text) => updateFormData('message', text)}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderOrderForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Items to order</Text>
      {(formData.items || [{ name: '', quantity: '1' }]).map((item, index) => (
        <View key={index} style={styles.orderItemRow}>
          <TextInput
            style={[styles.textInput, { flex: 1, marginRight: 8 }]}
            placeholder="Item name"
            placeholderTextColor={COLORS.text.tertiary}
            value={item.name}
            onChangeText={(text) => updateOrderItem(index, 'name', text)}
          />
          <TextInput
            style={[styles.textInput, { width: 60, marginRight: 8 }]}
            placeholder="Qty"
            placeholderTextColor={COLORS.text.tertiary}
            value={item.quantity}
            onChangeText={(text) => updateOrderItem(index, 'quantity', text)}
            keyboardType="numeric"
          />
          {(formData.items || []).length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeOrderItem(index)}
            >
              <X size={16} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      
      <TouchableOpacity style={styles.addButton} onPress={addOrderItem}>
        <Plus size={16} color={COLORS.text.primary} />
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>

      <Text style={styles.formLabel}>Delivery Option</Text>
      <View style={styles.optionsRow}>
        {['pickup', 'delivery'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              formData.deliveryOption === option && styles.optionButtonSelected
            ]}
            onPress={() => updateFormData('deliveryOption', option)}
          >
            <Text style={[
              styles.optionText,
              formData.deliveryOption === option && styles.optionTextSelected
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.formLabel}>Special Instructions (optional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Any special requests..."
        placeholderTextColor={COLORS.text.tertiary}
        value={formData.specialInstructions || ''}
        onChangeText={(text) => updateFormData('specialInstructions', text)}
        multiline
        numberOfLines={2}
      />
    </View>
  );

  const renderCallbackForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Who called?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Enter caller's name"
        placeholderTextColor={COLORS.text.tertiary}
        value={formData.callerName || ''}
        onChangeText={(text) => updateFormData('callerName', text)}
      />

      <Text style={styles.formLabel}>Reason for call</Text>
      <TextInput
        style={styles.textInput}
        placeholder="What was the call about?"
        placeholderTextColor={COLORS.text.tertiary}
        value={formData.reason || ''}
        onChangeText={(text) => updateFormData('reason', text)}
        multiline
        numberOfLines={2}
      />

      <Text style={styles.formLabel}>Urgency Level</Text>
      <View style={styles.optionsRow}>
        {[
          { key: 'low', label: 'Low' },
          { key: 'medium', label: 'Medium' },
          { key: 'high', label: 'High' }
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionButton,
              formData.urgency === option.key && styles.optionButtonSelected
            ]}
            onPress={() => updateFormData('urgency', option.key)}
          >
            <Text style={[
              styles.optionText,
              formData.urgency === option.key && styles.optionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.formLabel}>Additional Information (optional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Any other details..."
        placeholderTextColor={COLORS.text.tertiary}
        value={formData.additionalInfo || ''}
        onChangeText={(text) => updateFormData('additionalInfo', text)}
        multiline
        numberOfLines={2}
      />
    </View>
  );

  const renderScheduleForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Service Type</Text>
      <TextInput
        style={styles.textInput}
        placeholder="What type of appointment?"
        placeholderTextColor={COLORS.text.tertiary}
        value={formData.serviceType || ''}
        onChangeText={(text) => updateFormData('serviceType', text)}
      />

      <Text style={styles.formLabel}>When would you like to schedule?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeOptionsRow}>
          {[
            { key: 'today', label: 'Today' },
            { key: 'tomorrow', label: 'Tomorrow' },
            { key: 'this week', label: 'This Week' },
            { key: 'next week', label: 'Next Week' },
            { key: 'flexible', label: 'Flexible' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.timeOption,
                formData.timePreference === option.key && styles.timeOptionSelected
              ]}
              onPress={() => updateFormData('timePreference', option.key)}
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

      <Text style={styles.formLabel}>Preferred Day (optional)</Text>
      <View style={styles.optionsRow}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              formData.dayOfWeek === day && styles.dayButtonSelected
            ]}
            onPress={() => updateFormData('dayOfWeek', day)}
          >
            <Text style={[
              styles.dayButtonText,
              formData.dayOfWeek === day && styles.dayButtonTextSelected
            ]}>
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.formLabel}>Time of Day (optional)</Text>
      <View style={styles.optionsRow}>
        {['morning', 'afternoon', 'evening'].map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.optionButton,
              formData.timeOfDay === time && styles.optionButtonSelected
            ]}
            onPress={() => updateFormData('timeOfDay', time)}
          >
            <Text style={[
              styles.optionText,
              formData.timeOfDay === time && styles.optionTextSelected
            ]}>
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {selectedPrompt === 'standard' && renderStandardForm()}
      {selectedPrompt === 'order' && renderOrderForm()}
      {selectedPrompt === 'callback' && renderCallbackForm()}
      {selectedPrompt === 'schedule' && renderScheduleForm()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  formSection: {
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    padding: 16,
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    paddingVertical: 10,
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  optionTextSelected: {
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  timeOptionsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  timeOptionSelected: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  timeOptionText: {
    fontSize: 14,
    color: COLORS.text.primary,
    whiteSpace: 'nowrap',
  },
  timeOptionTextSelected: {
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  dayButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: COLORS.text.primary,
    borderColor: COLORS.text.primary,
  },
  dayButtonText: {
    fontSize: 12,
    color: COLORS.text.primary,
  },
  dayButtonTextSelected: {
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  // Input with circular button styles
  inputWithButtonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInputWithButton: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  circularCallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  circularCallButtonDisabled: {
    backgroundColor: COLORS.text.tertiary,
    opacity: 0.6,
  },
});