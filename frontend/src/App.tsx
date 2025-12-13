import React, { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import api, { setToken } from './api';
import ItemTypesManager from './components/ItemTypesManager';
import Header from './components/Header';
import ContainersList from './components/ContainersList';
import ContainerDetail from './components/ContainerDetail';
import CalculatorPanel from './components/CalculatorPanel';

const App = () => {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState<{ username: string; role: 'admin' | 'user' } | null>(null);
  const [containers, setContainers] = useState<any[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [itemTypes, setItemTypes] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setAuth(true);
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
      api.get('/item-types').then((res) => setItemTypes(res.data));
      api.get('/containers').then((res) => setContainers(res.data));
    }
  }, []);

  if (!auth) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-semibold text-blue-700 mb-4">Storage Calculator</h1>
        <AuthForm
          onSuccess={async () => {
            setAuth(true);
            try {
              const me = await api.get('/auth/me');
              setUser(me.data);
            } catch {}
            const [its, cs] = await Promise.all([api.get('/item-types'), api.get('/containers')]);
            setItemTypes(its.data);
            setContainers(cs.data);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Header
        user={user}
        onLogout={() => {
          setToken(null);
          localStorage.removeItem('token');
          setAuth(false);
          setUser(null);
        }}
      />

      <section className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Item Types</h2>
          <ItemTypesManager canCreate={user?.role === 'admin'} onCreated={async () => {
            const res = await api.get('/item-types');
            setItemTypes(res.data);
          }} />
        </div>
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Containers</h2>
          <ContainersList
            containers={containers}
            onSelect={(id) => setSelectedContainerId(id)}
            onCreated={async () => {
              const res = await api.get('/containers');
              setContainers(res.data);
            }}
          />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Container Detail</h2>
          {selectedContainerId ? (
            <ContainerDetail
              id={selectedContainerId}
              itemTypes={itemTypes}
              onChanged={async () => {
                // refresh containers to reflect potential changes
                const res = await api.get('/containers');
                setContainers(res.data);
              }}
            />
          ) : (
            <p className="text-sm text-gray-600">Select a container to view details.</p>
          )}
        </div>
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Calculator</h2>
          <CalculatorPanel itemTypes={itemTypes} containers={containers} />
        </div>
      </section>
    </div>
  );
};

export default App;
