'use client';
import { useState } from 'react';
import { useSystemStatusStore, SystemErrorLog } from '@/lib/store/systemStatusStore';
import { Activity, Database, Server, Code, HardDrive, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Info, ShieldCheck, Bug, Search } from 'lucide-react';

export default function SystemStatusView() {
  const {
    databaseStatus,
    serverStatus,
    codeRuntimeStatus,
    storageStatus,
    errorLogs,
    isDiagnosticsRunning,
    runDiagnostics,
    resolveError,
    clearResolvedErrors,
  } = useSystemStatusStore();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredErrors = errorLogs.filter((e) => {
    const matchesSeverity =
      severityFilter === 'all' ||
      (severityFilter === 'resolved' ? e.status === 'resolved' : e.severity === severityFilter);
    const matchesSearch =
      e.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.componentRoute && e.componentRoute.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSeverity && matchesSearch;
  });

  const unresolvedCount = errorLogs.filter((e) => e.status !== 'resolved').length;

  const renderStatusBadge = (status: 'operational' | 'degraded' | 'down') => {
    if (status === 'operational') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          <CheckCircle2 size={12} className="text-emerald-600" /> Operational
        </span>
      );
    }
    if (status === 'degraded') {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          <AlertTriangle size={12} className="text-amber-600" /> Terdegradasi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
        <XCircle size={12} className="text-rose-600" /> System Down
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Run Diagnostics Action */}
      <div className="card p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Real-Time System Status &amp; Health Monitor</h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                LIVE STATUS
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Pemantauan real-time status database Supabase, API route server, integritas runtime kode, dan konsol exception error.
            </p>
          </div>
        </div>

        <button
          onClick={() => runDiagnostics()}
          disabled={isDiagnosticsRunning}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
        >
          <RefreshCw size={14} className={isDiagnosticsRunning ? 'animate-spin' : ''} />
          <span>{isDiagnosticsRunning ? 'Uji Diagnostik...' : 'Jalankan Diagnostik System'}</span>
        </button>
      </div>

      {/* 4 Health Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Database Supabase */}
        <div className="card p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database size={20} />
            </div>
            {renderStatusBadge(databaseStatus.status)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{databaseStatus.name}</h3>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{databaseStatus.details}</p>
          </div>
          <div className="pt-2 border-t flex justify-between items-center text-[10px] text-gray-400 font-semibold">
            <span>Ping: <strong className="text-gray-800">{databaseStatus.latencyMs} ms</strong></span>
            <span>Checked: {new Date(databaseStatus.lastChecked).toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

        {/* 2. Server & API */}
        <div className="card p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server size={20} />
            </div>
            {renderStatusBadge(serverStatus.status)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{serverStatus.name}</h3>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{serverStatus.details}</p>
          </div>
          <div className="pt-2 border-t flex justify-between items-center text-[10px] text-gray-400 font-semibold">
            <span>Latensi: <strong className="text-gray-800">{serverStatus.latencyMs} ms</strong></span>
            <span>Checked: {new Date(serverStatus.lastChecked).toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

        {/* 3. Code & Runtime */}
        <div className="card p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Code size={20} />
            </div>
            {renderStatusBadge(codeRuntimeStatus.status)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{codeRuntimeStatus.name}</h3>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{codeRuntimeStatus.details}</p>
          </div>
          <div className="pt-2 border-t flex justify-between items-center text-[10px] text-gray-400 font-semibold">
            <span>Execution: <strong className="text-gray-800">{codeRuntimeStatus.latencyMs} ms</strong></span>
            <span>Checked: {new Date(codeRuntimeStatus.lastChecked).toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

        {/* 4. Storage & State */}
        <div className="card p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HardDrive size={20} />
            </div>
            {renderStatusBadge(storageStatus.status)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{storageStatus.name}</h3>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{storageStatus.details}</p>
          </div>
          <div className="pt-2 border-t flex justify-between items-center text-[10px] text-gray-400 font-semibold">
            <span>Sync: <strong className="text-gray-800">{storageStatus.latencyMs} ms</strong></span>
            <span>Checked: {new Date(storageStatus.lastChecked).toLocaleTimeString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Exception Error Log Console */}
      <div className="card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-2">
            <Bug className="text-rose-600" size={20} />
            <h3 className="font-bold text-gray-900 text-base">Konsol Real-Time Error &amp; Exception Logs</h3>
            {unresolvedCount > 0 && (
              <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200">
                {unresolvedCount} Perlu Ditinjau
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pesan error, rute..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-red-500"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-red-500"
            >
              <option value="all">Semua Severity</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="resolved">Selesai (Resolved)</option>
            </select>

            <button
              onClick={() => clearResolvedErrors()}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Bersihkan Resolved
            </button>
          </div>
        </div>

        {/* Error Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Waktu Kejadian</th>
                <th className="py-3 px-4">Tingkat Keparahan</th>
                <th className="py-3 px-4">Modul / Rute</th>
                <th className="py-3 px-4">Pesan Error / Exception Details</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredErrors.map((err) => (
                <tr key={err.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(err.timestamp).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        err.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : err.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {err.severity.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-mono text-gray-900 font-bold">{err.module}</p>
                    {err.componentRoute && <p className="text-[10px] text-gray-400 font-mono">{err.componentRoute}</p>}
                  </td>

                  <td className="py-3 px-4">
                    <p className="text-gray-800 font-normal leading-relaxed">{err.errorMessage}</p>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        err.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : err.status === 'investigating'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {err.status === 'resolved' ? '● Selesai' : err.status === 'investigating' ? '⚡ Diproses' : '🔴 Terbuka'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {err.status !== 'resolved' && (
                      <button
                        onClick={() => resolveError(err.id)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Tandai Selesai
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredErrors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Sistem bersih. Tidak ditemukan exception error yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
