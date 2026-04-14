import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';
import type { Item, ItemType, ContainerSummary, CreateItemPayload } from '../types';
import ErrorBanner from './ErrorBanner';
import FormField from './FormField';

const SummaryRow = ({ label, value, unit }: { label: string; value: number; unit?: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{label}</span>
    <span>
      {value.toFixed(3)}
      {unit ? ` ${unit}` : ''}
    </span>
  </div>
);

export default function ContainerDetail({
  id,
  itemTypes,
  onChanged,
}: {
  id: string;
  itemTypes: ItemType[];
  onChanged?: () => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState<ContainerSummary | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateItemPayload>({ defaultValues: { quantity: 1 } });

  const load = async () => {
    const [itemsRes, sumRes] = await Promise.all([
      api.get(`/containers/${id}/items`),
      api.get(`/containers/${id}/summary`),
    ]);
    setItems(itemsRes.data?.data ?? itemsRes.data);
    setSummary(sumRes.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const onAddItem = async (data: CreateItemPayload) => {
    setServerError(null);
    try {
      await api.post(`/containers/${id}/items`, {
        itemTypeId: data.itemTypeId,
        quantity: Number(data.quantity),
        note: data.note || undefined,
      });
      reset({ quantity: 1 });
      await load();
      onChanged?.();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : 'Failed to add item');
    }
  };

  const updateQty = async (itemId: string, quantity: number) => {
    await api.patch(`/items/${itemId}`, { quantity: Number(quantity) });
    await load();
    onChanged?.();
  };

  const remove = async (itemId: string) => {
    await api.delete(`/items/${itemId}`);
    await load();
    onChanged?.();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Items</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Type</th>
              <th className="text-right p-2">Qty</th>
              <th className="text-right p-2">Unit W (kg)</th>
              <th className="text-right p-2">Unit V (m³)</th>
              <th className="p-2">Note</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.itemType.name}</td>
                <td className="p-2 text-right">
                  <input
                    className="border rounded px-1 py-0.5 w-20 text-right"
                    type="number"
                    value={it.quantity}
                    onChange={(e) => updateQty(it.id, Number(e.target.value))}
                  />
                </td>
                <td className="p-2 text-right">{it.itemType.unitWeightKg}</td>
                <td className="p-2 text-right">{it.itemType.unitVolumeM3}</td>
                <td className="p-2 text-xs text-gray-600">{it.note ?? ''}</td>
                <td className="p-2 text-right">
                  <button className="text-red-600 hover:underline" onClick={() => remove(it.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-2 text-sm text-gray-500" colSpan={6}>
                  No items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit(onAddItem)} className="flex flex-wrap gap-2 items-end">
        <FormField label="Item Type" error={errors.itemTypeId?.message}>
          <select
            className="border rounded px-2 py-1 min-w-40"
            {...register('itemTypeId', { required: 'Select an item type' })}
          >
            <option value="">Select…</option>
            {itemTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Quantity" error={errors.quantity?.message}>
          <input
            className="border rounded px-2 py-1 w-24 text-right"
            type="number"
            {...register('quantity', {
              valueAsNumber: true,
              required: 'Required',
              min: { value: 1, message: 'Must be ≥ 1' },
            })}
          />
        </FormField>
        <FormField label="Note">
          <input className="border rounded px-2 py-1" placeholder="Optional note" {...register('note')} />
        </FormField>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding…' : 'Add Item'}
        </button>
      </form>
      <ErrorBanner message={serverError} />

      {summary && (
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-2">Summary</h3>
          <div className="space-y-1">
            <SummaryRow label="Total Weight" value={summary.totalWeightKg} unit="kg" />
            <SummaryRow label="Total Volume" value={summary.totalVolumeM3} unit="m³" />
            <SummaryRow label="Max Weight" value={summary.maxWeightKg} unit="kg" />
            <SummaryRow label="Max Volume" value={summary.maxVolumeM3} unit="m³" />
          </div>
          {summary.utilization && (
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Weight Utilization</span>
                  <span>{Math.round(summary.utilization.weightPct * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className={`${summary.weightExceeded ? 'bg-red-600' : 'bg-green-600'} h-2 rounded`}
                    style={{ width: `${Math.min(100, Math.round(summary.utilization.weightPct * 100))}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Volume Utilization</span>
                  <span>{Math.round(summary.utilization.volumePct * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className={`${summary.volumeExceeded ? 'bg-red-600' : 'bg-blue-600'} h-2 rounded`}
                    style={{ width: `${Math.min(100, Math.round(summary.utilization.volumePct * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="mt-2 text-sm">
            <span className={summary.weightExceeded ? 'text-red-600' : 'text-green-700'}>
              {summary.weightExceeded ? 'Weight exceeded' : 'Weight OK'}
            </span>
            {' · '}
            <span className={summary.volumeExceeded ? 'text-red-600' : 'text-green-700'}>
              {summary.volumeExceeded ? 'Volume exceeded' : 'Volume OK'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
