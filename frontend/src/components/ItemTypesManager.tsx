import React, { useEffect, useState } from 'react';
import api from '../api';

type Props = {
  onCreated?: () => void;
  canCreate?: boolean;
};

const ItemTypesManager: React.FC<Props> = ({ onCreated, canCreate }) => {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [unitWeightKg, setUnitWeightKg] = useState<number | ''>('');
  const [unitVolumeM3, setUnitVolumeM3] = useState<number | ''>('');

  const load = async () => {
    const res = await api.get('/item-types');
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/item-types', {
      name,
      unitWeightKg: Number(unitWeightKg || 0),
      unitVolumeM3: Number(unitVolumeM3 || 0),
    });
    setName('');
    setUnitWeightKg('');
    setUnitVolumeM3('');
    await load();
    onCreated?.();
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y">
        {items.map((i) => (
          <li key={i.id} className="py-2 flex justify-between text-sm">
            <span className="font-medium">{i.name}</span>
            <span className="text-gray-600">
              w: {i.unitWeightKg} kg · v: {i.unitVolumeM3} m³
            </span>
          </li>
        ))}
        {items.length === 0 && <li className="py-2 text-sm text-gray-500">No item types yet.</li>}
      </ul>

      {canCreate && (
        <form onSubmit={add} className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Name</label>
            <input
              className="border rounded px-2 py-1"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Unit Weight (kg)</label>
            <input
              className="border rounded px-2 py-1"
              type="number"
              step="0.01"
              placeholder="1"
              value={unitWeightKg}
              onChange={(e) => setUnitWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Unit Volume (m³)</label>
            <input
              className="border rounded px-2 py-1"
              type="number"
              step="0.001"
              placeholder="0.02"
              value={unitVolumeM3}
              onChange={(e) => setUnitVolumeM3(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <button type="submit" className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">
            Add (admin)
          </button>
        </form>
      )}
    </div>
  );
};

export default ItemTypesManager;
