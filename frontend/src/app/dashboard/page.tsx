'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import CalculatorPanel from '@/components/CalculatorPanel';
import ContainerDetail from '@/components/ContainerDetail';
import ContainersList from '@/components/ContainersList';
import Header from '@/components/Header';
import ItemTypesManager from '@/components/ItemTypesManager';
import { useFetch } from '@/hooks/useFetch';
import api, { setToken } from '@/lib/api';
import type { Container, ItemType, User } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const {
    data: containers,
    loading: containersLoading,
    refetch: refetchContainers,
  } = useFetch<Container[]>('/containers', { skip: !ready });

  const {
    data: itemTypes,
    loading: itemTypesLoading,
    refetch: refetchItemTypes,
  } = useFetch<ItemType[]>('/item-types', { skip: !ready });

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.replace('/login');
      return;
    }
    setToken(t);
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
        setReady(true);
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('token');
        router.replace('/login');
      });
  }, [router]);

  if (!ready) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <p className="text-sm text-gray-500">Loading…</p>
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
          router.replace('/login');
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
}
