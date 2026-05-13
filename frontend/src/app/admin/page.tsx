'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import UserList from '@/components/UserList';
import api, { setToken } from '@/lib/api';
import type { User } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);

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
        const user: User = res.data;
        if (user.role !== 'admin') {
          router.replace('/dashboard');
          return;
        }
        setReady(true);
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('token');
        queryClient.clear();
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
      <header className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold text-blue-700">Admin Panel</h1>
        <Link
          href="/dashboard"
          className="px-4 py-1.5 rounded bg-blue-700 text-white text-sm font-medium hover:bg-blue-800"
        >
          ← Back to Dashboard
        </Link>
      </header>

      <section className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <UserList />
      </section>
    </div>
  );
}
