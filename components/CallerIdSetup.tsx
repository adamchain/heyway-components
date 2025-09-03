import React from 'react';
import CallerIdManagement from './CallerIdManagement';
import { HEYWAY_COLORS } from '../styles/HEYWAY_STYLE_GUIDE';

interface CallerIdSetupProps {
  visible: boolean;
  onClose: () => void;
  onCallerIdChange?: (callerId: string) => void;
  initialShowAddModal?: boolean;
}

export default function CallerIdSetup({ visible, onClose, onCallerIdChange, initialShowAddModal = false }: CallerIdSetupProps) {
  return (
    <CallerIdManagement
      visible={visible}
      onClose={onClose}
      initialShowAddModal={initialShowAddModal}
      onCallerIdChange={(callerId) => {
        console.log('Caller ID changed to:', callerId);
        // Call the parent callback if provided
        onCallerIdChange?.(callerId);
      }}
    />
  );
}