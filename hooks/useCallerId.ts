import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

export interface CallerIdInfo {
  callerId: string;
  formattedNumber: string;
  last4Digits: string;
}

export const useCallerId = () => {
  const [callerIdInfo, setCallerIdInfo] = useState<CallerIdInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove any non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // If it starts with +1, format as US number
    if (cleaned.startsWith('+1') && cleaned.length === 12) {
      const number = cleaned.slice(2); // Remove +1
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }

    // If it's a 10-digit US number
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // Return as is for other formats
    return phoneNumber;
  };

  const getLastFourDigits = (phoneNumber: string): string => {
    // Extract only digits
    const digits = phoneNumber.replace(/\D/g, '');
    // Return last 4 digits, or the whole number if less than 4 digits
    return digits.length >= 4 ? digits.slice(-4) : digits;
  };

  const loadCallerIdPreference = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const preference = await apiService.getCallerIdPreference();

      if (preference?.callerId) {
        const formattedNumber = formatPhoneNumber(preference.callerId);
        const last4Digits = getLastFourDigits(preference.callerId);

        setCallerIdInfo({
          callerId: preference.callerId,
          formattedNumber,
          last4Digits,
        });
      } else {
        setCallerIdInfo(null);
      }
    } catch (err) {
      console.error('Failed to load caller ID preference:', err);
      setError('Failed to load caller ID');
      setCallerIdInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCallerIdPreference = useCallback(async (callerId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.saveCallerIdPreference(callerId);

      const formattedNumber = formatPhoneNumber(callerId);
      const last4Digits = getLastFourDigits(callerId);

      setCallerIdInfo({
        callerId,
        formattedNumber,
        last4Digits,
      });
    } catch (err) {
      console.error('Failed to save caller ID preference:', err);
      setError('Failed to save caller ID');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCallerIdPreference = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const preference = await apiService.getCallerIdPreference();
      if (!preference?.callerId) {
        setCallerIdInfo(null);
      } else {
        const formattedNumber = formatPhoneNumber(preference.callerId);
        const last4Digits = getLastFourDigits(preference.callerId);
        setCallerIdInfo({
          callerId: preference.callerId,
          formattedNumber,
          last4Digits,
        });
      }
    } catch (err) {
      console.error('Failed to clear caller ID preference:', err);
      setError('Failed to clear caller ID');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadCallerIdPreference();
    // Removed interval polling for caller ID preference
  }, [loadCallerIdPreference]);

  return {
    callerIdInfo,
    isLoading,
    error,
    loadCallerIdPreference,
    saveCallerIdPreference,
    clearCallerIdPreference,
    refresh: loadCallerIdPreference, // Alias for manual refresh
  };
};