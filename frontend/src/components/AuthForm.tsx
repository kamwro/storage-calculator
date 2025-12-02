import React, { useState } from 'react';
import api, { setToken } from '../api';

const AuthForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    try {
      const res = await api.post(`/auth/${mode}`, { username, password });
      const token = res.data.token;

      localStorage.setItem('token', token);
      setToken(token);
      onSuccess();
    } catch (e: any) {
      setErr(e.response?.data?.message ?? 'Error');
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: '2rem auto' }}>
      <h3>{mode === 'login' ? 'Login' : 'Register'}</h3>

      <form onSubmit={submit}>
        <input
          style={{ width: '100%', marginBottom: '0.5rem' }}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={{ width: '100%', marginBottom: '0.5rem' }}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <p style={{ color: 'red' }}>{err}</p>}

        <button type="submit" style={{ marginRight: '0.5rem' }}>
          {mode === 'login' ? 'Login' : 'Register'}
        </button>

        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          Switch to {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
