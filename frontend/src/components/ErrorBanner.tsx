import React from 'react';

export default function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div className="border border-red-300 bg-red-50 text-red-700 text-sm rounded px-3 py-2">
      {message}
    </div>
  );
}
