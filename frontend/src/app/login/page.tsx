'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-blue-700 mb-4">Storage Calculator</h1>
      <AuthForm onSuccess={() => router.push('/dashboard')} />
    </div>
  );
}
