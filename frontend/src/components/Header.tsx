import React from 'react';
import { setToken } from '../api';

type Props = {
  user?: { username: string; role: 'admin' | 'user' } | null;
  onLogout: () => void;
};

const Header: React.FC<Props> = ({ user, onLogout }) => {
  return (
    <header className="flex items-center justify-between py-4">
      <h1 className="text-2xl font-semibold text-blue-700">Storage Calculator</h1>
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-gray-600">
            {user.username} · <span className="uppercase font-medium">{user.role}</span>
          </span>
        )}
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => {
            setToken(null);
            localStorage.removeItem('token');
            onLogout();
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
