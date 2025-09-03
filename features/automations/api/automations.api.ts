// features/automations/api/automations.api.ts
import { apiService } from '../services/apiService';
import { sanitizeDateTimeFields } from '../utils/dateTime';
import type {
  Automation,
  CreateAutomationInput,
  UpdateAutomationInput,
  ImportResult,
  EnqueuePayload,
  DryRunResult,
  ExecutionResult,
} from '../types';

export const AutomationsAPI = {
  list: async (q?: string): Promise<Automation[]> => {
    // Use existing apiService method
    const automations = await apiService.getAutomations();

    // Filter by search query if provided
    if (q) {
      const searchTerm = q.toLowerCase();
      return automations.filter((automation: any) =>
        automation.name?.toLowerCase().includes(searchTerm) ||
        automation.description?.toLowerCase().includes(searchTerm)
      );
    }

    return automations;
  },

  getById: async (id: string): Promise<Automation> => {
    return apiService.getAutomation(id);
  },

  create: async (input: CreateAutomationInput): Promise<Automation> => {
    // Sanitize date/time fields to ensure proper formatting
    const sanitizedInput = sanitizeDateTimeFields(input);

    return apiService.createAutomation({
      name: sanitizedInput.name,
      description: sanitizedInput.description,
      triggerType: sanitizedInput.triggerType,
      offsetDays: sanitizedInput.offsetDays,
      offsetDirection: sanitizedInput.offsetDirection,
      offsetTime: sanitizedInput.offsetTime,
      aiInstructions: sanitizedInput.aiInstructions,
      voiceMessage: sanitizedInput.voiceMessage,
      voiceAudioUri: sanitizedInput.voiceAudioUri,
      voiceAudioDuration: sanitizedInput.voiceAudioDuration,
      isActive: sanitizedInput.isActive ?? true,
      // Pass through onDate/onTime for on_date triggers (apiService will forward them)
      ...(sanitizedInput.triggerType === 'on_date' && {
        onDate: sanitizedInput.onDate,
        onTime: sanitizedInput.onTime,
      }),
    } as any); // Use 'as any' since apiService types don't include onDate/onTime yet
  },

  update: async (id: string, input: UpdateAutomationInput): Promise<Automation> => {
    // Sanitize date/time fields to ensure proper formatting
    const sanitizedInput = sanitizeDateTimeFields(input);

    return apiService.updateAutomation(id, {
      name: sanitizedInput.name,
      description: sanitizedInput.description,
      triggerType: sanitizedInput.triggerType,
      offsetDays: sanitizedInput.offsetDays,
      offsetDirection: sanitizedInput.offsetDirection,
      offsetTime: sanitizedInput.offsetTime,
      aiInstructions: sanitizedInput.aiInstructions,
      voiceMessage: sanitizedInput.voiceMessage,
      voiceAudioUri: sanitizedInput.voiceAudioUri,
      voiceAudioDuration: sanitizedInput.voiceAudioDuration,
      isActive: sanitizedInput.isActive,
      // Pass through onDate/onTime for on_date triggers
      ...(sanitizedInput.triggerType === 'on_date' && {
        onDate: sanitizedInput.onDate,
        onTime: sanitizedInput.onTime,
      }),
    } as any); // Use 'as any' since apiService types don't include onDate/onTime yet
  },

  delete: async (id: string): Promise<boolean> => {
    await apiService.deleteAutomation(id);
    return true;
  },

  toggle: async (id: string, isActive: boolean): Promise<Automation> => {
    return apiService.toggleAutomation(id, isActive);
  },

  // Contact management
  addContacts: async (automationId: string, contacts: any[]): Promise<any> => {
    return apiService.addContactsToAutomation(automationId, contacts);
  },

  getContacts: async (automationId: string): Promise<any[]> => {
    return apiService.getAutomationContacts(automationId);
  },

  getCalls: async (automationId: string): Promise<any[]> => {
    return apiService.getAutomationCalls(automationId);
  },

  // Execution methods
  dryRun: async (automationId: string, contacts: any[], referenceDateColumn?: string): Promise<DryRunResult> => {
    return apiService.dryRunAutomation(automationId, contacts, referenceDateColumn);
  },

  execute: async (automationId: string, contacts: any[], referenceDateColumn?: string): Promise<ExecutionResult> => {
    return apiService.executeAutomation(automationId, contacts, referenceDateColumn);
  },

  // Import methods (for CSV wizard later)
  importContacts: async (automationId: string, file: File, dryRun = false): Promise<ImportResult> => {
    // This will need to be implemented when you add CSV import to automations
    // For now, return a mock structure
    throw new Error('Import functionality not yet implemented for automations');
  },

  enqueueCampaign: async (automationId: string, payload: EnqueuePayload): Promise<any> => {
    // This will be for scheduling campaigns - placeholder for now
    throw new Error('Enqueue functionality not yet implemented for automations');
  },
};