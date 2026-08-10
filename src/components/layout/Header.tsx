'use client';
import { Bell, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAlerts } from '@/lib/data-access';
import { ROLE_LABELS_MAP } from '@/lib/permissions';

interface HeaderProps { title: string; subtitle?: string; }

interface HeaderAlert {
  id: string;
  type?: string;
  message: string;
  severity: string;
  timestamp?: string;
  projectId?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { session, can } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [alerts, setAlerts] = useState<HeaderAlert[]>([]);

  useEffect(() => {
    if (!session) return;
    const ctx = { userId: session.userId, organizationId: session.organizationId, roles: session.roles };
    setAlerts(getAlerts(ctx));
    
    // Listen for global mock notifications
    const handleNewNotif = (e: Event) => {
      const customEvent = e as CustomEvent<{ targetUserId?: string; message: string; severity?: string }>;
      const { targetUserId, message, severity } = customEvent.detail;
      // If targetUserId is provided, only add if it matches the current session
      if (!targetUserId || targetUserId === session.userId) {
        setAlerts(prev => [
          { id: `alert_${Date.now()}`, message, severity: severity || 'medium', timestamp: new Date().toISOString() },
          ...prev
        ]);
      }
    };
    
    window.addEventListener('new-notification', handleNewNotif);
    return () => window.removeEventListener('new-notification', handleNewNotif);
  }, [session]);

  if (!session) return null;

  const highAlerts = alerts.filter(a => a.severity === 'high').length;
  const roleLabel = ROLE_LABELS_MAP[session.roles[0]] ?? session.roles[0];

  return (
    <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-40"
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
      <div>
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3" style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Cari..." className="input pl-9 pr-4 py-2 text-sm w-48" />
        </div>

        {/* Notifications */}
        {can('dashboard', 'read') && (
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ background: 'var(--bg-page)', border: '1px solid var(--border)' }}>
              <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
              {highAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold shadow-sm"
                  style={{ background: 'var(--red-err)', color: 'white', fontSize: 10 }}>{highAlerts}</span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-11 w-80 rounded-xl shadow-lg z-50 overflow-hidden card bg-white"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                <div className="px-4 py-3 flex items-center justify-between bg-gray-50 border-b">
                  <p className="text-sm font-bold text-gray-800">Notifikasi</p>
                  {highAlerts > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{highAlerts} Baru</span>}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {alerts.map(alert => (
                    <div key={alert.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-0">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: alert.severity === 'high' ? 'var(--red-err)' : alert.severity === 'medium' ? 'var(--yellow)' : 'var(--text-muted)' }} />
                      <p className="text-xs leading-relaxed font-medium text-gray-700">{alert.message}</p>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">Tidak ada notifikasi</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="w-px h-6" style={{ background: 'var(--border)' }} />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--red)', color: '#fff' }}>
            {session.avatarInitials}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{session.name}</p>
            <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{roleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
