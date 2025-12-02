import React, { useEffect, useState } from 'react';
import api from '../api';

const ProjectsManager = () => {
  const [itemTypes, setItemTypes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [maxWeight, setMaxWeight] = useState(100);
  const [maxVolume, setMaxVolume] = useState(100);
  const [items, setItems] = useState<{ itemTypeId: number; quantity: number }[]>([]);
  const [result, setResult] = useState<any | null>(null);

  const load = async () => {
    const [typesRes, projRes] = await Promise.all([api.get('/item-types'), api.get('/projects')]);
    setItemTypes(typesRes.data);
    setProjects(projRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const addRow = () => {
    if (itemTypes.length === 0) return;
    setItems([...items, { itemTypeId: itemTypes[0].id, quantity: 1 }]);
  };

  const updateRow = (i: number, change: Partial<{ itemTypeId: number; quantity: number }>) => {
    setItems(items.map((row, idx) => (idx === i ? { ...row, ...change } : row)));
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();

    await api.post('/projects', {
      name,
      maxWeight: Number(maxWeight),
      maxVolume: Number(maxVolume),
      items,
    });

    setName('');
    setMaxWeight(100);
    setMaxVolume(100);
    setItems([]);
    load();
  };

  const calculate = async (id: number) => {
    const res = await api.post(`/projects/${id}/calculate`);
    setResult(res.data);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Projects</h3>

      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            {p.name} — maxW: {p.maxWeight}, maxV: {p.maxVolume} <button onClick={() => calculate(p.id)}>Calc</button>
          </li>
        ))}
      </ul>

      {result && (
        <pre style={{ background: '#eee', padding: '1rem', marginTop: '1rem' }}>{JSON.stringify(result, null, 2)}</pre>
      )}

      <form onSubmit={createProject} style={{ marginTop: '1rem' }}>
        <h4>Create Project</h4>

        <input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />

        <input
          type="number"
          placeholder="Max weight"
          value={maxWeight}
          onChange={(e) => setMaxWeight(Number(e.target.value))}
          style={{ marginRight: '0.5rem' }}
        />

        <input
          type="number"
          placeholder="Max volume"
          value={maxVolume}
          onChange={(e) => setMaxVolume(Number(e.target.value))}
          style={{ marginRight: '0.5rem' }}
        />

        <h5 style={{ marginTop: '1rem' }}>Items</h5>

        {items.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <select value={row.itemTypeId} onChange={(e) => updateRow(i, { itemTypeId: Number(e.target.value) })}>
              {itemTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={row.quantity}
              onChange={(e) => updateRow(i, { quantity: Number(e.target.value) })}
            />
          </div>
        ))}

        <button type="button" onClick={addRow} style={{ marginRight: '0.5rem' }}>
          Add item
        </button>

        <button type="submit">Create project</button>
      </form>
    </div>
  );
};

export default ProjectsManager;
