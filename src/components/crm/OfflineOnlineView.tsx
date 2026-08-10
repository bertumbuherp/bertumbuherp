'use client';
import React, { useState } from 'react';
import { useCrmStore } from '@/lib/store/crmStore';
import { formatCurrency } from '@/lib/utils';
import { Users, Presentation, Calendar, Award } from 'lucide-react';

export function OfflineOnlineView() {
  const deals = useCrmStore(s => s.deals);
  const [selectedPeriod, setSelectedPeriod] = useState('Semua');

  // Dynamically extract available periods (Month Year) from deals
  const periods = Array.from(new Set(deals.map(d => {
    if (!d.createdAt) return '';
    const date = new Date(d.createdAt);
    return `${date.toLocaleString('id-ID', { month: 'long' })} ${date.getFullYear()}`;
  }))).filter(Boolean).sort((a, b) => {
    // Basic chronological sort (newest first)
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // Filter deals based on chosen period
  const filteredDeals = deals.filter(d => {
    if (selectedPeriod === 'Semua') return true;
    if (!d.createdAt) return false;
    const date = new Date(d.createdAt);
    const periodStr = `${date.toLocaleString('id-ID', { month: 'long' })} ${date.getFullYear()}`;
    return periodStr === selectedPeriod;
  });

  const onlineDeals = filteredDeals.filter(d => ['Instagram', 'LinkedIn', 'Website'].includes(d.source));
  const offlineDeals = filteredDeals.filter(d => !['Instagram', 'LinkedIn', 'Website'].includes(d.source));

  const onlineCount = onlineDeals.length;
  const offlineCount = offlineDeals.length;
  const totalLeads = onlineCount + offlineCount || 1;

  const onlineValue = onlineDeals.reduce((sum, d) => sum + d.value, 0);
  const offlineValue = offlineDeals.reduce((sum, d) => sum + d.value, 0);

  // Donut chart math
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.2
  const onlinePercent = (onlineCount / totalLeads) * 100;
  const offlinePercent = 100 - onlinePercent;
  const onlineDash = (onlinePercent / 100) * circumference;
  const offlineDash = (offlinePercent / 100) * circumference;

  // Extract channels list dynamically
  const uniqueChannels = Array.from(new Set(deals.map(d => d.source)));
  const channelData = uniqueChannels.map(channel => {
    const channelDeals = filteredDeals.filter(d => d.source === channel);
    const leadsCount = channelDeals.length;
    const totalVal = channelDeals.reduce((sum, d) => sum + d.value, 0);
    const wonCount = channelDeals.filter(d => d.stage === 'won').length;
    const conversionRate = leadsCount > 0 ? (wonCount / leadsCount) * 100 : 0;

    // Define colors for visual style
    let color = '#6B7280';
    if (channel === 'Instagram') color = '#E1306C';
    else if (channel === 'LinkedIn') color = '#0077B5';
    else if (channel === 'Website') color = '#3B82F6';
    else if (channel === 'Referral') color = '#10B981';
    else if (channel === 'Event') color = '#F59E0B';
    else if (channel === 'Cold Outreach') color = '#6366F1';

    return { name: channel, leads: leadsCount, value: totalVal, conversion: conversionRate, color };
  }).sort((a, b) => b.leads - a.leads); // Sort by leads count

  return (
    <div className="p-6">
      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Prospek Offline vs Online</h2>
          <p className="text-sm text-gray-500 mt-1">Perbandingan sumber prospek klien untuk evaluasi channel sales</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <select 
            value={selectedPeriod} 
            onChange={e => setSelectedPeriod(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-red-500 font-medium"
          >
            <option value="Semua">Semua Periode</option>
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Main KPI Summary with Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Online Card */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Jalur Online</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><Users size={16} /></div>
            </div>
            <p className="text-3xl font-black text-gray-800 mb-1">{onlineCount} <span className="text-xs font-semibold text-gray-400">Leads</span></p>
            <p className="text-base font-bold text-gray-500">{formatCurrency(onlineValue)}</p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 font-bold mb-1">
              <span>Rasio</span>
              <span>{onlinePercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${onlinePercent}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Instagram, LinkedIn, Website</p>
          </div>
        </div>

        {/* Donut Chart Panel */}
        <div className="card p-6 flex flex-col items-center justify-center bg-gray-50/50">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Distribusi Channel</h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle chart */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F3F4F6" strokeWidth="10" />
              
              {/* Online segment */}
              {onlineDash > 0 && (
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--blue)" strokeWidth="10" 
                  strokeDasharray={`${onlineDash} ${circumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-500"
                />
              )}
              
              {/* Offline segment */}
              {offlineDash > 0 && (
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--green)" strokeWidth="10" 
                  strokeDasharray={`${offlineDash} ${circumference}`}
                  strokeDashoffset={-onlineDash}
                  className="transition-all duration-500"
                />
              )}
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-gray-800">{filteredDeals.length}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Leads</span>
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Offline / Ref</span>
            </div>
          </div>
        </div>

        {/* Offline Card */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Jalur Offline / Referral</span>
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center"><Presentation size={16} /></div>
            </div>
            <p className="text-3xl font-black text-gray-800 mb-1">{offlineCount} <span className="text-xs font-semibold text-gray-400">Leads</span></p>
            <p className="text-base font-bold text-gray-500">{formatCurrency(offlineValue)}</p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 font-bold mb-1">
              <span>Rasio</span>
              <span>{offlinePercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${offlinePercent}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Referral, Event, Cold Outreach, dll</p>
          </div>
        </div>
      </div>

      {/* Dynamic Channels performance table */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={18} className="text-[var(--red)]" />
          <h3 className="text-sm font-bold text-gray-800">Detail &amp; Performa Channel Prospek</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-400 text-xs uppercase font-bold" style={{ borderColor: 'var(--border)' }}>
                <th className="py-2.5 pb-3 font-semibold">Channel Sumber</th>
                <th className="py-2.5 pb-3 font-semibold text-center">Jumlah Prospek</th>
                <th className="py-2.5 pb-3 font-semibold text-right">Total Nilai Pipeline</th>
                <th className="py-2.5 pb-3 font-semibold text-center">Conversion Rate (Won)</th>
                <th className="py-2.5 pb-3 font-semibold w-1/4">Visual Distribusi</th>
              </tr>
            </thead>
            <tbody>
              {channelData.map(ch => {
                const totalFilteredLeals = filteredDeals.length || 1;
                const distPercent = (ch.leads / totalFilteredLeals) * 100;
                return (
                  <tr key={ch.name} className="border-b last:border-0 hover:bg-gray-50 transition-colors text-sm" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                      {ch.name}
                    </td>
                    <td className="py-3 text-center font-bold text-gray-700">{ch.leads}</td>
                    <td className="py-3 text-right font-bold text-gray-800">{formatCurrency(ch.value)}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        ch.conversion > 50 ? 'bg-green-100 text-green-700' :
                        ch.conversion > 20 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ch.conversion.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${distPercent}%`, backgroundColor: ch.color }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {channelData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">Tidak ada data untuk periode terpilih.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
