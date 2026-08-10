'use client';
import { Bell, Search, FolderKanban, Users, DollarSign, Briefcase, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAlerts } from '@/lib/data-access';
import { ROLE_LABELS_MAP } from '@/lib/permissions';
import { usePMStore } from '@/lib/store/pmStore';
import { useCrmStore } from '@/lib/store/crmStore';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

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

  // Global Search State (BUG-009)
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const { projects } = usePMStore();
  const { clients, deals } = useCrmStore();
  const { invoices } = useFinanceStore();

  useEffect(() => {
    if (!session) return;
    const ctx = { userId: session.userId, organizationId: session.organizationId, roles: session.roles };
    setAlerts(getAlerts(ctx));
    
    // Listen for global mock notifications
    const handleNewNotif = (e: Event) => {
      const customEvent = e as CustomEvent<{ targetUserId?: string; message: string; severity?: string }>;
      const { targetUserId, message, severity } = customEvent.detail;
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

  // Search Results
  const matchedProjects = searchQuery.trim() ? projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.clientName.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const matchedClients = searchQuery.trim() ? clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.industry.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const matchedDeals = searchQuery.trim() ? deals.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.clientName.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const matchedInvoices = searchQuery.trim() ? invoices.filter(i => i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || i.clientName.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  const totalSearchHits = matchedProjects.length + matchedClients.length + matchedDeals.length + matchedInvoices.length;

  return (
    <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-40"
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
      <div>
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Input (BUG-009 & BUG-024) */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 z-10" style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Cari proyek, klien, invoice..." 
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearchModal(true); }}
            onFocus={() => setShowSearchModal(true)}
            aria-label="Pencarian Global ERP"
            className="input pl-9 pr-8 py-2 text-sm w-64 focus:outline-red-500" 
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowSearchModal(false); }}
              aria-label="Bersihkan pencarian"
              className="absolute right-2.5 text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer z-10"
            >
              ✕
            </button>
          )}

          {/* Global Search Modal Dropdown (BUG-009) */}
          {showSearchModal && searchQuery.trim() !== '' && (
            <div className="absolute left-0 top-11 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden fade-in max-h-[80vh] flex flex-col">
              <div className="p-3 bg-gray-50 border-b flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Hasil Pencarian: "{searchQuery}" ({totalSearchHits})</span>
                <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>
              <div className="overflow-y-auto p-3 space-y-4 divide-y divide-gray-100">
                {/* Proyek */}
                {matchedProjects.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <FolderKanban size={12} className="text-purple-500" /> Proyek ({matchedProjects.length})
                    </p>
                    <div className="space-y-1.5">
                      {matchedProjects.slice(0, 3).map(p => (
                        <Link key={p.id} href="/pm/projects" onClick={() => setShowSearchModal(false)} className="block p-2 rounded-lg hover:bg-gray-50 transition-colors text-xs">
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <p className="text-[10px] text-gray-500">{p.clientName} · Status: {p.status}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Klien */}
                {matchedClients.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Users size={12} className="text-blue-500" /> Klien ({matchedClients.length})
                    </p>
                    <div className="space-y-1.5">
                      {matchedClients.slice(0, 3).map(c => (
                        <Link key={c.id} href="/crm/clients" onClick={() => setShowSearchModal(false)} className="block p-2 rounded-lg hover:bg-gray-50 transition-colors text-xs">
                          <p className="font-bold text-gray-800">{c.name}</p>
                          <p className="text-[10px] text-gray-500">{c.industry} · Revenue: {formatCurrency(c.totalRevenue)}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deals */}
                {matchedDeals.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Briefcase size={12} className="text-emerald-500" /> Deals CRM ({matchedDeals.length})
                    </p>
                    <div className="space-y-1.5">
                      {matchedDeals.slice(0, 3).map(d => (
                        <Link key={d.id} href="/crm/deals" onClick={() => setShowSearchModal(false)} className="block p-2 rounded-lg hover:bg-gray-50 transition-colors text-xs">
                          <p className="font-bold text-gray-800">{d.title}</p>
                          <p className="text-[10px] text-gray-500">{d.clientName} · Nilai: {formatCurrency(d.value)}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoices */}
                {matchedInvoices.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <DollarSign size={12} className="text-amber-500" /> Invoice ({matchedInvoices.length})
                    </p>
                    <div className="space-y-1.5">
                      {matchedInvoices.slice(0, 3).map(i => (
                        <Link key={i.id} href="/ceo/finance" onClick={() => setShowSearchModal(false)} className="block p-2 rounded-lg hover:bg-gray-50 transition-colors text-xs">
                          <p className="font-bold text-gray-800">{i.invoiceNumber}</p>
                          <p className="text-[10px] text-gray-500">{i.clientName} · Total: {formatCurrency(i.total)} ({i.status})</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {totalSearchHits === 0 && (
                  <div className="py-6 text-center text-xs text-gray-400">
                    Tidak ada proyek, klien, atau invoice yang cocok.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications (BUG-024) */}
        {can('dashboard', 'read') && (
          <div className="relative">
            <button 
              onClick={() => setShowNotif(!showNotif)}
              aria-label="Notifikasi Sistem"
              title="Lihat notifikasi"
              className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 cursor-pointer"
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
