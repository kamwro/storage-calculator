import React, { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import { setToken } from './api';
import ItemTypesManager from './components/ItemTypesManager';
import ProjectsManager from './components/ProjectsManager';

const App = () => {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setAuth(true);
    }
  }, []);

  if (!auth) {
    return <AuthForm onSuccess={() => setAuth(true)} />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '1rem auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Storage Calculator</h2>
        <button
          onClick={() => {
            setToken(null);
            localStorage.removeItem('token');
            setAuth(false);
          }}
        >
          Logout
        </button>
      </header>

      <ItemTypesManager />
      <ProjectsManager />
    </div>
  );
};

export default App;
