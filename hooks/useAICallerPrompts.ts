import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { apiService } from '../services/apiService';

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

type PromptType = 'standard' | 'order' | 'callback' | 'schedule' | null;

export function useAICallerPrompts() {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptType>(null);
  const [formData, setFormData] = useState<FormData>({
    items: [{ name: '', quantity: '1' }],
    urgency: 'medium'
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updateOrderItem = useCallback((index: number, field: 'name' | 'quantity', value: string) => {
    setFormData(prev => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  }, []);

  const addOrderItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { name: '', quantity: '1' }]
    }));
  }, []);

  const removeOrderItem = useCallback((index: number) => {
    setFormData(prev => {
      if ((prev.items || []).length <= 1) return prev;
      const newItems = (prev.items || []).filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
  }, []);

  const generateAIPrompt = useCallback((): string => {
    // If there's a direct message, use it regardless of selected prompt
    if (formData.message?.trim()) {
      return formData.message.trim();
    }

    // If no selectedPrompt, return default message
    if (!selectedPrompt) {
      return 'I wanted to give you a call.';
    }

    switch (selectedPrompt) {
      case 'standard':
        return formData.message || 'I wanted to give you a call.';

      case 'order':
        if (!formData.items || formData.items.length === 0 || !formData.items[0].name.trim()) {
          return 'I\'d like to place an order.';
        }

        const itemsList = formData.items
          .filter(item => item.name.trim())
          .map(item => {
            const quantity = item.quantity && item.quantity !== '1' ? parseInt(item.quantity) : 1;
            const itemName = item.name.trim();
            return quantity === 1 ? itemName : `${quantity} ${itemName}`;
          })
          .join(', ');

        let prompt = `I'd like to place an order for ${itemsList}`;
        if (formData.deliveryOption) {
          prompt += ` for ${formData.deliveryOption}`;
        }
        if (formData.specialInstructions?.trim()) {
          prompt += `. Special instructions: ${formData.specialInstructions.trim()}`;
        }
        return prompt + '.';

      case 'callback':
        let callbackPrompt = 'I\'m returning your call';
        if (formData.callerName?.trim()) {
          callbackPrompt = `I'm calling back ${formData.callerName.trim()}`;
        }
        if (formData.reason?.trim()) {
          callbackPrompt += ` regarding ${formData.reason.trim()}`;
        }
        if (formData.urgency === 'high') {
          callbackPrompt += '. This is urgent';
        } else if (formData.urgency === 'low') {
          callbackPrompt += '. No rush, just wanted to follow up when convenient for you';
        }
        if (formData.additionalInfo?.trim()) {
          callbackPrompt += `. ${formData.additionalInfo.trim()}`;
        }
        return callbackPrompt + '.';

      case 'schedule':
        if (!formData.serviceType?.trim()) {
          return 'I\'d like to schedule an appointment.';
        }

        const serviceType = formData.serviceType.trim();
        const lowerService = serviceType.toLowerCase().trim();
        const vowelStart = /^[aeiou]/i.test(lowerService);
        const article = vowelStart ? 'an' : 'a';

        let schedulePrompt = `I'd like to schedule an appointment for ${article} ${serviceType}`;

        if (formData.timePreference) {
          schedulePrompt += `. I'm looking for availability ${formData.timePreference}`;
          if (formData.dayOfWeek) {
            schedulePrompt += ` on ${formData.dayOfWeek}`;
          }
          if (formData.timeOfDay) {
            schedulePrompt += ` in the ${formData.timeOfDay}`;
          }
        }

        return schedulePrompt + '. Could you please check if you have any openings during that time?';

      default:
        return 'I wanted to give you a call.';
    }
  }, [selectedPrompt, formData]);

  const handlePromptSelect = useCallback((promptType: PromptType) => {
    setSelectedPrompt(promptType);

    // Reset form data based on prompt type
    switch (promptType) {
      case 'standard':
        setFormData(prev => ({ ...prev, message: '' }));
        break;
      case 'order':
        setFormData(prev => ({
          ...prev,
          items: [{ name: '', quantity: '1' }],
          deliveryOption: '',
          specialInstructions: ''
        }));
        break;
      case 'callback':
        setFormData(prev => ({
          ...prev,
          callerName: '',
          reason: '',
          urgency: 'medium',
          additionalInfo: ''
        }));
        break;
      case 'schedule':
        setFormData(prev => ({
          ...prev,
          serviceType: '',
          timePreference: '',
          dayOfWeek: '',
          timeOfDay: ''
        }));
        break;
    }
  }, []);

  const makeAICall = useCallback(async (selectedCallList: any[]) => {
    if (selectedCallList.length === 0) {
      Alert.alert('No Recipients', 'Please add contacts to call first.');
      return;
    }

    // Generate AI prompt from form data or message
    const aiPrompt = generateAIPrompt();

    // Only validate specific prompt requirements if a prompt is selected
    if (selectedPrompt === 'order' && (!formData.items || !formData.items[0]?.name.trim())) {
      Alert.alert('Missing Information', 'Please specify what you want to order.');
      return;
    }

    if (selectedPrompt === 'schedule' && !formData.serviceType?.trim()) {
      Alert.alert('Missing Information', 'Please specify the type of appointment.');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare recipients from selected call list
      const recipients = selectedCallList.map(item => item.phoneNumber);

      // Make the AI call using the generated prompt
      const response = await apiService.initiateCall({
        recipients,
        callMode: 'ai-only', // Use AI-only mode for TwilioService integration
        notes: aiPrompt, // The generated AI prompt becomes the notes
        metadata: {
          promptType: selectedPrompt,
          formData: formData,
          timestamp: new Date().toISOString()
        }
      });

      if (response.callId) {
        Alert.alert('Call Initiated', `AI call started successfully to ${recipients.length} recipient(s).`);

        // Reset form after successful call
        setSelectedPrompt(null);
        setFormData({
          items: [{ name: '', quantity: '1' }],
          urgency: 'medium'
        });

        return true;
      } else {
        throw new Error('Failed to initiate call');
      }
    } catch (error) {
      console.error('AI call error:', error);
      Alert.alert('Call Failed', 'Failed to initiate call. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPrompt, formData, generateAIPrompt]);


  const resetForm = useCallback(() => {
    setSelectedPrompt(null);
    setFormData({
      items: [{ name: '', quantity: '1' }],
      urgency: 'medium'
    });
  }, []);

  return {
    selectedPrompt,
    formData,
    isLoading,
    updateFormData,
    updateOrderItem,
    addOrderItem,
    removeOrderItem,
    handlePromptSelect,
    generateAIPrompt,
    makeAICall,
    resetForm
  };
}