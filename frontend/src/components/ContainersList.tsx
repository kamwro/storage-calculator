'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import api from '@/lib/api';
import type { Container, CreateContainerPayload } from '@/types';

import ErrorBanner from './ErrorBanner';
import FormField from './FormField';

type Props = {
  containers: Container[];
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
};

const ContainersList = ({ containers, onSelect, onDelete }: Props) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateContainerPayload>();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/containers/${id}`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['containers'] });
      onDelete?.(id);
    },
    onError: (e: unknown) => {
      setServerError(e instanceof Error ? e.message : 'Error deleting container');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateContainerPayload) => api.post('/containers', data),
    onSuccess: () => {
      reset();
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ['containers'] });
    },
    onError: (e: unknown) => {
      setServerError(e instanceof Error ? e.message : 'Error creating container');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      api.patch(`/containers/${id}`, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] });
    },
    onError: (e: unknown) => {
      setServerError(e instanceof Error ? e.message : 'Error updating container');
    },
  });

  const sorted = [...containers].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-3">
      <ul className="divide-y">
        {sorted.map((c) => (
          <li key={c.id} className="py-2 flex items-center justify-between text-sm">
            {!c.isFavorite ? (
              <button
                onClick={() => updateMutation.mutate({ id: c.id, isFavorite: true })}
                disabled={updateMutation.isPending}
                className="px-2 py-0.5 rounded text-xs bg-yellow-200 text-teal-950 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Favorite
              </button>
            ) : (
              <button
                onClick={() => updateMutation.mutate({ id: c.id, isFavorite: false })}
                disabled={updateMutation.isPending}
                className="px-2 py-0.5 rounded text-xs bg-green-500 text-teal-950 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unfavorite
              </button>
            )}
            <button className="text-left hover:underline" onClick={() => onSelect(c.id)} title="Select container">
              <span className="font-medium">{c.name}</span>
              <span className="text-gray-600">
                {' '}
                — W:{c.maxWeightKg}kg · V:{c.maxVolumeM3}m³
              </span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete container "${c.name}"? This will also remove all its items.`)) {
                  deleteMutation.mutate(c.id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="ml-2 px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </li>
        ))}
        {containers.length === 0 && <li className="py-2 text-sm text-gray-500">No containers yet.</li>}
      </ul>

      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="flex flex-wrap gap-2 items-end">
        <FormField label="Mark as Favorite" error={errors.isFavorite?.message}>
          <input className="border rounded px-2 py-1" type={'checkbox'} {...register('isFavorite', { required: false })} />
        </FormField>
        <FormField label="Name" error={errors.name?.message}>
          <input
            className="border rounded px-2 py-1"
            placeholder="Container A"
            {...register('name', { required: 'Name is required' })}
          />
        </FormField>
        <FormField label="Max Weight (kg)" error={errors.maxWeightKg?.message}>
          <input
            className="border rounded px-2 py-1"
            type="number"
            step="0.1"
            {...register('maxWeightKg', {
              valueAsNumber: true,
              required: 'Required',
              min: { value: 0, message: 'Must be ≥ 0' },
            })}
          />
        </FormField>
        <FormField label="Max Volume (m³)" error={errors.maxVolumeM3?.message}>
          <input
            className="border rounded px-2 py-1"
            type="number"
            step="0.01"
            {...register('maxVolumeM3', {
              valueAsNumber: true,
              required: 'Required',
              min: { value: 0, message: 'Must be ≥ 0' },
            })}
          />
        </FormField>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createMutation.isPending ? 'Creating…' : 'Create'}
        </button>
      </form>
      <ErrorBanner message={serverError} />
    </div>
  );
};

export default ContainersList;
