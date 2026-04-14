import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';
import type { Container, CreateContainerPayload } from '../types';
import ErrorBanner from './ErrorBanner';
import FormField from './FormField';

type Props = {
  containers: Container[];
  onSelect: (id: string) => void;
  onCreated?: () => void;
};

const ContainersList: React.FC<Props> = ({ containers, onSelect, onCreated }) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateContainerPayload>();

  const onSubmit = async (data: CreateContainerPayload) => {
    setServerError(null);
    try {
      await api.post('/containers', data);
      reset();
      onCreated?.();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : 'Error creating container');
    }
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y">
        {containers.map((c) => (
          <li key={c.id} className="py-2 flex items-center justify-between text-sm">
            <button className="text-left hover:underline" onClick={() => onSelect(c.id)} title="Select container">
              <span className="font-medium">{c.name}</span>
              <span className="text-gray-600">
                {' '}
                — W:{c.maxWeightKg}kg · V:{c.maxVolumeM3}m³
              </span>
            </button>
          </li>
        ))}
        {containers.length === 0 && <li className="py-2 text-sm text-gray-500">No containers yet.</li>}
      </ul>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-2 items-end">
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
          disabled={isSubmitting}
          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating…' : 'Create'}
        </button>
      </form>
      <ErrorBanner message={serverError} />
    </div>
  );
};

export default ContainersList;
