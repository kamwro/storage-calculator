'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import api from '@/lib/api';
import type { CreateItemTypePayload, ItemType } from '@/types';

import ErrorBanner from './ErrorBanner';
import FormField from './FormField';

type Props = {
  itemTypes: ItemType[];
  onCreated?: () => void;
  canCreate?: boolean;
};

const ItemTypesManager = ({ itemTypes, onCreated, canCreate }: Props) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateItemTypePayload>();

  const onSubmit = async (data: CreateItemTypePayload) => {
    setServerError(null);
    try {
      await api.post('/item-types', data);
      reset();
      onCreated?.();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : 'Error creating item type');
    }
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y">
        {itemTypes.map((i) => (
          <li key={i.id} className="py-2 flex justify-between text-sm">
            <span className="font-medium">{i.name}</span>
            <span className="text-gray-600">
              w: {i.unitWeightKg} kg · v: {i.unitVolumeM3} m³
            </span>
          </li>
        ))}
        {itemTypes.length === 0 && <li className="py-2 text-sm text-gray-500">No item types yet.</li>}
      </ul>

      {canCreate && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-2 items-end">
            <FormField label="Name" error={errors.name?.message}>
              <input
                className="border rounded px-2 py-1"
                placeholder="Name"
                {...register('name', { required: 'Name is required' })}
              />
            </FormField>
            <FormField label="Unit Weight (kg)" error={errors.unitWeightKg?.message}>
              <input
                className="border rounded px-2 py-1"
                type="number"
                step="0.01"
                placeholder="1"
                {...register('unitWeightKg', {
                  valueAsNumber: true,
                  required: 'Required',
                  min: { value: 0, message: 'Must be ≥ 0' },
                })}
              />
            </FormField>
            <FormField label="Unit Volume (m³)" error={errors.unitVolumeM3?.message}>
              <input
                className="border rounded px-2 py-1"
                type="number"
                step="0.001"
                placeholder="0.02"
                {...register('unitVolumeM3', {
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
              {isSubmitting ? 'Adding…' : 'Add (admin)'}
            </button>
          </form>
          <ErrorBanner message={serverError} />
        </>
      )}
    </div>
  );
};

export default ItemTypesManager;
