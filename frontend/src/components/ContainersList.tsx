import React, { useState } from 'react';
import api from '../api';

type Container = { id: string; name: string; maxWeightKg: number; maxVolumeM3: number };

type Props = {
  containers: Container[];
  onSelect: (id: string) => void;
  onCreated?: () => void;
};

const ContainersList: React.FC<Props> = ({ containers, onSelect, onCreated }) => {
  const [name, setName] = useState('');
  const [maxWeightKg, setMaxWeightKg] = useState<number | ''>('');
  const [maxVolumeM3, setMaxVolumeM3] = useState<number | ''>('');
  const [err, setErr] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await api.post('/containers', {
        name,
        maxWeightKg: Number(maxWeightKg || 0),
        maxVolumeM3: Number(maxVolumeM3 || 0),
      });
      setName('');
      setMaxWeightKg('');
      setMaxVolumeM3('');
      onCreated?.();
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? 'Error creating container');
    }
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y">
        {containers.map((c) => (
          <li key={c.id} className="py-2 flex items-center justify-between text-sm">
            <button
              className="text-left hover:underline"
              onClick={() => onSelect(c.id)}
              title="Select container"
            >
              <span className="font-medium">{c.name}</span>
              <span className="text-gray-600"> — W:{c.maxWeightKg}kg · V:{c.maxVolumeM3}m³</span>
            </button>
          </li>
        ))}
        {containers.length === 0 && <li className="py-2 text-sm text-gray-500">No containers yet.</li>}
      </ul>

      <form onSubmit={create} className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Name</label>
          <input className="border rounded px-2 py-1" placeholder="Container A" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Max Weight (kg)</label>
          <input
            className="border rounded px-2 py-1"
            type="number"
            step="0.1"
            value={maxWeightKg}
            onChange={(e) => setMaxWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Max Volume (m³)</label>
          <input
            className="border rounded px-2 py-1"
            type="number"
            step="0.01"
            value={maxVolumeM3}
            onChange={(e) => setMaxVolumeM3(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <button type="submit" className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Create</button>
        {err && <span className="text-red-600 text-sm">{err}</span>}
      </form>
    </div>
  );
};

export default ContainersList;
