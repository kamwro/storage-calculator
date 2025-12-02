import React, { useEffect, useState } from 'react';
import api from '../api';

const ItemTypesManager = () => {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(0);
  const [volume, setVolume] = useState(0);

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
      weightPerUnit: Number(weight),
      volumePerUnit: Number(volume),
    });
    setName('');
    setWeight(0);
    setVolume(0);
    load();
  };

  return (
    <div>
      <h3>Item Types</h3>

      <ul>
        {items.map((i) => (
          <li key={i.id}>
            {i.name} (w: {i.weightPerUnit}, v: {i.volumePerUnit})
          </li>
        ))}
      </ul>

      <form onSubmit={add} style={{ marginTop: '1rem' }}>
        <h4>Add New Type</h4>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />

        <input
          type="number"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          style={{ marginRight: '0.5rem' }}
        />

        <input
          type="number"
          placeholder="Volume"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ marginRight: '0.5rem' }}
        />

        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default ItemTypesManager;
