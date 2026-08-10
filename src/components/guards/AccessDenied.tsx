'use client';
import { ShieldOff } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_DEFAULT_ROUTE } from '@/lib/permissions';

interface AccessDeniedProps {
  message?: string;
}

export default function AccessDenied({ message }: AccessDeniedProps) {
  const { primaryRole } = useAuth();
  const backTo = primaryRole ? ROLE_DEFAULT_ROUTE[primaryRole] : '/login';

  return (
    <div className="flex flex-col items-center justify-center min-h-96 p-12 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--red-err-dim)' }}>
        <ShieldOff size={28} style={{ color: 'var(--red-err)' }} />
      </div>
      <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Akses Ditolak
      </h2>
      <p className="text-sm mb-6 max-w-sm" style={{ color: 'var(--text-muted)' }}>
        {message || 'Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi admin jika ini adalah kesalahan.'}
      </p>
      <Link href={backTo} className="btn-primary px-5 py-2 text-sm">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
