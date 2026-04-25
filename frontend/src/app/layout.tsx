import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Storage Calculator',
  description: 'Plan how item types fit into storage containers under weight and volume constraints',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
