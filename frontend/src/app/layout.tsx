import type { Metadata } from 'next';
import './globals.css';

import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Storage Calculator',
  description: 'Plan how item types fit into storage containers under weight and volume constraints',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
