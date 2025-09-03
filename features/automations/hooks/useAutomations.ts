// features/automations/hooks/useAutomations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AutomationsAPI } from '../api/automations.api';
import type { 
  Automation, 
  CreateAutomationInput, 
  UpdateAutomationInput,
  EnqueuePayload,
  DryRunResult,
  ExecutionResult
} from '../types';

export function useAutomations(q?: string) {
  const qc = useQueryClient();

  const list = useQuery<Automation[]>({
    queryKey: ['automations', { q: q ?? '' }],
    queryFn: () => AutomationsAPI.list(q),
  });

  const create = useMutation({
    mutationFn: (input: CreateAutomationInput) => AutomationsAPI.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAutomationInput }) =>
      AutomationsAPI.update(id, input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['automations'] });
      qc.invalidateQueries({ queryKey: ['automation', { id: vars.id }] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => AutomationsAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      AutomationsAPI.toggle(id, isActive),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['automations'] });
      qc.invalidateQueries({ queryKey: ['automation', { id: vars.id }] });
    },
  });

  const enqueue = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EnqueuePayload }) =>
      AutomationsAPI.enqueueCampaign(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['automation', { id: vars.id }] });
    },
  });

  const dryRun = useMutation({
    mutationFn: ({ 
      id, 
      contacts, 
      referenceDateColumn 
    }: { 
      id: string; 
      contacts: any[]; 
      referenceDateColumn?: string; 
    }) => AutomationsAPI.dryRun(id, contacts, referenceDateColumn),
  });

  const execute = useMutation({
    mutationFn: ({ 
      id, 
      contacts, 
      referenceDateColumn 
    }: { 
      id: string; 
      contacts: any[]; 
      referenceDateColumn?: string; 
    }) => AutomationsAPI.execute(id, contacts, referenceDateColumn),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['automation', { id: vars.id }] });
      qc.invalidateQueries({ queryKey: ['automation-contacts', { id: vars.id }] });
    },
  });

  const addContacts = useMutation({
    mutationFn: ({ id, contacts }: { id: string; contacts: any[] }) =>
      AutomationsAPI.addContacts(id, contacts),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['automation-contacts', { id: vars.id }] });
    },
  });

  return { 
    list, 
    create, 
    update, 
    remove, 
    toggle, 
    enqueue, 
    dryRun, 
    execute, 
    addContacts 
  };
}

export function useAutomation(id?: string) {
  const qc = useQueryClient();

  const automation = useQuery({
    queryKey: ['automation', { id }],
    queryFn: () => {
      if (!id) throw new Error('id required');
      return AutomationsAPI.getById(id);
    },
    enabled: !!id,
  });

  const contacts = useQuery({
    queryKey: ['automation-contacts', { id }],
    queryFn: () => {
      if (!id) throw new Error('id required');
      return AutomationsAPI.getContacts(id);
    },
    enabled: !!id,
  });

  const calls = useQuery({
    queryKey: ['automation-calls', { id }],
    queryFn: () => {
      if (!id) throw new Error('id required');
      return AutomationsAPI.getCalls(id);
    },
    enabled: !!id,
    refetchInterval: 5000, // Poll for real-time updates
  });

  return { 
    automation, 
    contacts, 
    calls,
    // Helper to invalidate all queries for this automation
    invalidate: () => {
      qc.invalidateQueries({ queryKey: ['automation', { id }] });
      qc.invalidateQueries({ queryKey: ['automation-contacts', { id }] });
      qc.invalidateQueries({ queryKey: ['automation-calls', { id }] });
    }
  };
}