'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import CalculatorPanel from '@/components/CalculatorPanel';
import ContainerDetail from '@/components/ContainerDetail';
import ContainersList from '@/components/ContainersList';
import Header from '@/components/Header';
import ItemTypesManager from '@/components/ItemTypesManager';
import api, { setToken } from '@/lib/api';
import type { Container, ItemType, User } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const { data: containers = [], isLoading: containersLoading } = useQuery<Container[]>({
    queryKey: ['containers'],
    queryFn: () => api.get('/containers').then((r) => r.data?.data ?? r.data),
    enabled: ready,
  });

  const { data: itemTypes = [], isLoading: itemTypesLoading } = useQuery<ItemType[]>({
    queryKey: ['item-types'],
    queryFn: () => api.get('/item-types').then((r) => r.data?.data ?? r.data),
    enabled: ready,
  });

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
            <ItemTypesManager itemTypes={itemTypes} canCreate={user?.role === 'admin'} />
          )}
        </div>
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Containers</h2>
          {containersLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <ContainersList
              containers={containers}
              onSelect={(id) => setSelectedContainerId(id)}
              onDelete={(id) => {
                if (selectedContainerId === id) setSelectedContainerId(null);
              }}
            />
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Container Detail</h2>
          {selectedContainerId ? (
            <ContainerDetail id={selectedContainerId} itemTypes={itemTypes} />
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
}
