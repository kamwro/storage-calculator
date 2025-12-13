import React, { useState } from 'react';
import api from '../api';

type ItemType = { id: string; name: string; unitWeightKg: number; unitVolumeM3: number };
type Container = { id: string; name: string; maxWeightKg: number; maxVolumeM3: number };

type Props = {
  itemTypes: ItemType[];
  containers: Container[];
};

type DraftItem = { itemTypeId: string; quantity: number };

const CalculatorPanel: React.FC<Props> = ({ itemTypes, containers }) => {
  const [items, setItems] = useState<DraftItem[]>([]);
  const [strategy, setStrategy] = useState<'first_fit' | 'best_fit' | 'single_container_only'>('best_fit');
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canRun = items.length > 0 && selectedContainers.length > 0;

  const addRow = () => setItems((arr) => [...arr, { itemTypeId: '', quantity: 1 }]);
  const removeRow = (idx: number) => setItems((arr) => arr.filter((_, i) => i !== idx));

  const toggleContainer = (id: string) => {
    setSelectedContainers((arr) => (arr.includes(id) ? arr.filter((c) => c !== id) : [...arr, id]));
  };

  const run = async () => {
    setErr(null);
    setResult(null);
    try {
      const payload = {
        items: items.map((i) => ({ itemTypeId: i.itemTypeId, quantity: Number(i.quantity) })),
        containers: selectedContainers,
        strategy,
      };
      const res = await api.post('/calculator/evaluate', payload);
      setResult(res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? 'Failed to evaluate');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Items</h3>
          <button className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700" onClick={addRow}>
            Add
          </button>
        </div>
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Item Type</th>
              <th className="text-right p-2">Qty</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">
                  <select
                    className="border rounded px-2 py-1 min-w-40"
                    value={row.itemTypeId}
                    onChange={(e) =>
                      setItems((arr) => arr.map((r, i) => (i === idx ? { ...r, itemTypeId: e.target.value } : r)))
                    }
                  >
                    <option value="">Select…</option>
                    {itemTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 text-right">
                  <input
                    className="border rounded px-2 py-1 w-24 text-right"
                    type="number"
                    min={0}
                    value={row.quantity}
                    onChange={(e) =>
                      setItems((arr) => arr.map((r, i) => (i === idx ? { ...r, quantity: Number(e.target.value) } : r)))
                    }
                  />
                </td>
                <td className="p-2 text-right">
                  <button className="text-red-600 hover:underline" onClick={() => removeRow(idx)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-2 text-sm text-gray-500" colSpan={3}>
                  Add some items to evaluate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Target Containers</h3>
        <div className="flex flex-wrap gap-2">
          {containers.map((c) => (
            <label
              key={c.id}
              className={`px-2 py-1 border rounded cursor-pointer ${selectedContainers.includes(c.id) ? 'bg-blue-50 border-blue-400' : ''}`}
            >
              <input
                type="checkbox"
                className="mr-1 align-middle"
                checked={selectedContainers.includes(c.id)}
                onChange={() => toggleContainer(c.id)}
              />
              {c.name}
            </label>
          ))}
          {containers.length === 0 && <span className="text-sm text-gray-500">No containers available.</span>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700">Strategy</label>
        <select className="border rounded px-2 py-1" value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
          <option value="first_fit">first_fit</option>
          <option value="best_fit">best_fit</option>
          <option value="single_container_only">single_container_only</option>
        </select>
        <button
          disabled={!canRun}
          className={`px-3 py-1 rounded text-white ${canRun ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          onClick={run}
        >
          Evaluate
        </button>
        {err && <span className="text-red-600 text-sm">{err}</span>}
      </div>

      {result && (
        <div className="space-y-2">
          <h3 className="font-semibold">Result {result.feasible ? '— Feasible' : '— Partially allocated'}</h3>
          <div className="space-y-3">
            {result.byContainer.map((bc: any) => (
              <div key={bc.containerId} className="border rounded p-2 text-sm">
                <div>
                  Total Weight: {bc.totalWeightKg.toFixed(3)} kg; Total Volume: {bc.totalVolumeM3.toFixed(3)} m³
                </div>
                <div>
                  Utilization — W: {(bc.utilization.weightPct * 100).toFixed(1)}%, V:{' '}
                  {(bc.utilization.volumePct * 100).toFixed(1)}%
                </div>
                <div className="mt-1">
                  Items: {bc.items.map((it: any) => `${it.itemTypeId.slice(0, 8)}…×${it.quantity}`).join(', ') || '—'}
                </div>
              </div>
            ))}
          </div>
          {result.unallocated?.length ? (
            <div className="text-sm text-gray-700">
              Unallocated: {result.unallocated.map((u: any) => `${u.itemTypeId.slice(0, 8)}…×${u.quantity}`).join(', ')}
            </div>
          ) : (
            <div className="text-sm text-green-700">All items allocated.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorPanel;
