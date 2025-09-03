import { useState } from 'react';

export const usePromptForm = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<'call' | 'schedule' | 'order' | 'history' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callPrompt, setCallPrompt] = useState('');
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState<string | null>('None');
  const [addedNumbers, setAddedNumbers] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({
    items: [{ name: '', quantity: '1' }],
    knowCaller: null,
    whenCalled: '',
    additionalInfo: '',
    serviceType: '',
    timePreference: '',
    dayOfWeek: '',
    timeOfDay: '',
  });

  const resetForm = () => {
    setSelectedPrompt(null);
    setPhoneNumber('');
    setCallPrompt('');
    setSelectedPromptTemplate('None');
    setAddedNumbers([]);
    setFormData({
      items: [{ name: '', quantity: '1' }],
      knowCaller: null,
      whenCalled: '',
      additionalInfo: '',
      serviceType: '',
      timePreference: '',
      dayOfWeek: '',
      timeOfDay: '',
    });
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  return {
    selectedPrompt,
    phoneNumber,
    callPrompt,
    selectedPromptTemplate,
    addedNumbers,
    formData,
    setSelectedPrompt,
    setPhoneNumber,
    setCallPrompt,
    setSelectedPromptTemplate,
    setAddedNumbers,
    setFormData,
    updateFormData,
    resetForm,
  };
};