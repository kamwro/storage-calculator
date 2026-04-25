'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import api, { setToken } from '@/lib/api';

import ErrorBanner from './ErrorBanner';
import FormField from './FormField';

type AuthFormData = { username: string; password: string };

const AuthForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFormData>();

  const onSubmit = async (data: AuthFormData) => {
    setServerError(null);
    try {
      const res = await api.post(`/auth/${mode}`, data);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      onSuccess();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : 'Error');
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setServerError(null);
    reset();
  };

  return (
    <div className="max-w-sm space-y-4">
      <h3 className="text-lg font-semibold">{mode === 'login' ? 'Login' : 'Register'}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <FormField label="Username" error={errors.username?.message}>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Username"
            {...register('username', { required: 'Username is required' })}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <input
            className="border rounded px-2 py-1 w-full"
            type="password"
            placeholder="Password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 4, message: 'Minimum 4 characters' },
            })}
          />
        </FormField>

        <ErrorBanner message={serverError} />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
          </button>
          <button type="button" className="px-4 py-1.5 rounded border hover:bg-gray-50" onClick={switchMode}>
            Switch to {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
