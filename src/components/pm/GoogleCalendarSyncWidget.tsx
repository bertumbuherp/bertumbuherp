'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleCalendarSync, GoogleCalendarConnectionState } from '@/lib/services/GoogleCalendarSync';
import { Calendar, RefreshCw, CheckCircle2, AlertCircle, Link2, Unlink, ExternalLink } from 'lucide-react';

export default function GoogleCalendarSyncWidget() {
  const { session } = useAuth();
  const userEmail = session?.email || 'pm@bertumbuh.id';

  const [state, setState] = useState<GoogleCalendarConnectionState>({
    isConnected: false,
    autoSyncEnabled: false,
    syncCount: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setState(GoogleCalendarSync.getConnectionState(userEmail));
  }, [userEmail]);

  const handleConnect = () => {
    window.open('https://calendar.google.com/', '_blank');
    const newState = GoogleCalendarSync.connect(userEmail);
    setState(newState);
    showToast(`Berhasil terhubung! Membuka Google Calendar (${userEmail})...`);
  };


  const handleDisconnect = () => {
    const newState = GoogleCalendarSync.disconnect();
    setState(newState);
    showToast('Koneksi Google Calendar terputus.');
  };

  const handleToggleAutoSync = () => {
    const newState = GoogleCalendarSync.toggleAutoSync(!state.autoSyncEnabled);
    setState(newState);
    showToast(`Auto 2-Way Sync ${!state.autoSyncEnabled ? 'diaktifkan' : 'dinonaktifkan'}.`);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const result = GoogleCalendarSync.syncEvent({
        title: 'Manual Sync - Timetable PM',
        startDate: new Date().toISOString().split('T')[0],
      });
      setState(GoogleCalendarSync.getConnectionState());
      setIsSyncing(false);
      showToast(result.message);
      if (result.gcalLink) {
        window.open(result.gcalLink, '_blank');
      }
    }, 600);
  };

  const handleOpenGoogleCalendar = () => {
    window.open('https://calendar.google.com/', '_blank');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="card p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
      {toast && (
        <div className="mb-3 p-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-md fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            {toast}
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-800">Integrasi Google Calendar (2-Way Sync)</h4>
              {state.isConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 size={11} /> Terhubung ({state.googleEmail || userEmail})
                </span>

              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <AlertCircle size={11} /> Belum Terhubung
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {state.isConnected
                ? `Akun Google: ${state.googleEmail} · Total Sync: ${state.syncCount} Event · Auto 2-Way Active`
                : 'Otomatiskan sinkronisasi jadwal rapat & deadline PM ke Google Calendar pribadi'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {state.isConnected ? (
            <>
              <button
                onClick={handleOpenGoogleCalendar}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1 transition-all"
                title="Buka Google Calendar Web"
              >
                <ExternalLink size={13} /> Buka Google Calendar ↗
              </button>

              <button
                onClick={handleToggleAutoSync}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  state.autoSyncEnabled
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Auto-Sync: {state.autoSyncEnabled ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Menyingkronkan...' : 'Sync Sekarang'}
              </button>

              <button
                onClick={handleDisconnect}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                title="Putuskan koneksi Google Calendar"
              >
                <Unlink size={13} />
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Link2 size={14} /> Hubungkan Google Calendar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
