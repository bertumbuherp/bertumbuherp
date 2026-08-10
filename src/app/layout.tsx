import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Bertumbuh ERP — Agency Management Platform',
  description: 'Platform ERP terintegrasi untuk agensi kreatif. Kelola proyek, klien, keuangan, dan tim dalam satu sistem.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
