import React, { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import api, { setToken } from './api';
import ItemTypesManager from './components/ItemTypesManager';
import Header from './components/Header';
import ContainersList from './components/ContainersList';
import ContainerDetail from './components/ContainerDetail';
import CalculatorPanel from './components/CalculatorPanel';
import { useFetch } from './hooks/useFetch';
import type { Container, ItemType, User } from './types';

const App = () => {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);

  const {
    data: containers,
    loading: containersLoading,
    refetch: refetchContainers,
  } = useFetch<Container[]>('/containers', { skip: !auth });

  const {
    data: itemTypes,
    loading: itemTypesLoading,
    refetch: refetchItemTypes,
  } = useFetch<ItemType[]>('/item-types', { skip: !auth });

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setAuth(true);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, [auth]);

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
            refetchItemTypes();
            refetchContainers();
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
          {itemTypesLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <ItemTypesManager
              itemTypes={itemTypes ?? []}
              canCreate={user?.role === 'admin'}
              onCreated={refetchItemTypes}
            />
          )}
        </div>
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Containers</h2>
          {containersLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <ContainersList
              containers={containers ?? []}
              onSelect={(id) => setSelectedContainerId(id)}
              onCreated={refetchContainers}
            />
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Container Detail</h2>
          {selectedContainerId ? (
            <ContainerDetail id={selectedContainerId} itemTypes={itemTypes ?? []} onChanged={refetchContainers} />
          ) : (
            <p className="text-sm text-gray-600">Select a container to view details.</p>
          )}
        </div>
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Calculator</h2>
          <CalculatorPanel itemTypes={itemTypes ?? []} containers={containers ?? []} />
        </div>
      </section>
    </div>
  );
};

export default App;
