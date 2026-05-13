'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import api from '@/lib/api';
import type { AdminUser, Container } from '@/types';
import ErrorBanner from './ErrorBanner';

export default function UserList() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data?.data ?? r.data),
  });

  const { data: containers = [], isLoading: containersLoading } = useQuery<Container[]>({
    queryKey: ['admin-user-containers', selectedUserId],
    queryFn: () => api.get(`/users/${selectedUserId}/containers`).then((r) => r.data?.data ?? r.data),
    enabled: !!selectedUserId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: (_data, id) => {
      if (selectedUserId === id) setSelectedUserId(null);
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: unknown) => {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete user');
    },
  });

  const handleDelete = (user: AdminUser) => {
    if (!window.confirm(`Delete user "${user.name}" and all their containers? This cannot be undone.`)) return;
    deleteMutation.mutate(user.id);
  };

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Users table */}
        <div>
          {usersLoading ? (
            <p className="text-sm text-gray-500">Loading users…</p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 font-medium">Username</th>
                  <th className="text-left p-2 font-medium">Role</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id === selectedUserId ? null : u.id)}
                    className={`border-t cursor-pointer hover:bg-gray-50 ${
                      selectedUserId === u.id ? 'bg-blue-50 font-medium' : ''
                    }`}
                  >
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">
                      <span
                        className={`text-xs font-medium uppercase px-1.5 py-0.5 rounded ${
                          u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(u);
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td className="p-2 text-gray-500" colSpan={3}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected user detail */}
        <div>
          {!selectedUser ? (
            <p className="text-sm text-gray-500">Select a user to view details.</p>
          ) : (
            <div className="space-y-4">
              <div className="border rounded p-3 bg-gray-50 space-y-1 text-sm">
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="text-xs text-gray-400 hover:text-gray-700 px-1"
                    aria-label="Clear selection"
                  >
                    ✕ Clear
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Username</span>
                  <span className="font-medium">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role</span>
                  <span
                    className={`text-xs font-medium uppercase px-1.5 py-0.5 rounded ${
                      selectedUser.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Containers</h3>
                {containersLoading ? (
                  <p className="text-sm text-gray-500">Loading…</p>
                ) : containers.length === 0 ? (
                  <p className="text-sm text-gray-500">No containers.</p>
                ) : (
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2 font-medium">Name</th>
                        <th className="text-right p-2 font-medium">Max W (kg)</th>
                        <th className="text-right p-2 font-medium">Max V (m³)</th>
                        <th className="text-center p-2 font-medium">Fav</th>
                      </tr>
                    </thead>
                    <tbody>
                      {containers.map((c) => (
                        <tr key={c.id} className="border-t">
                          <td className="p-2">{c.name}</td>
                          <td className="p-2 text-right">{c.maxWeightKg}</td>
                          <td className="p-2 text-right">{c.maxVolumeM3}</td>
                          <td className="p-2 text-center">{c.isFavorite ? '★' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ErrorBanner message={deleteError} />
    </div>
  );
}
