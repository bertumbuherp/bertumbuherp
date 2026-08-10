'use client';
import React, { useState, useEffect } from 'react';
import { useCrmStore } from '@/lib/store/crmStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Target, Users, TrendingUp, Handshake, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CRMDashboard() {
  const { deals, clients } = useCrmStore();
  const { session } = useAuth();

  if (!session) return null;

  // Filter deals for the current AE (or all if not AE)
  let myDeals = deals.filter(d => d.aeId === session.userId || d.aeName === session.name);
  if (myDeals.length === 0) myDeals = deals; // fallback for mock

  const activeDeals = myDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const wonDeals = myDeals.filter(d => d.stage === 'won');
  
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const totalWonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  // Targets (Mock)
  const targetValue = 500000000; // 500 Juta
  const targetProgress = Math.min((totalWonValue / targetValue) * 100, 100);

  return (
    <div className="space-y-6 fade-in">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-gray-500">Total Pencapaian (Won)</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><TrendingUp size={16}/></div>
          </div>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(totalWonValue)}</p>
          <p className="text-xs text-gray-400 mt-2">Dari {wonDeals.length} Deal Berhasil</p>
        </div>

        <div className="card p-5 border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-gray-500">Pipeline Aktif</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><DollarSign size={16}/></div>
          </div>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(totalPipelineValue)}</p>
          <p className="text-xs text-gray-400 mt-2">Dalam {activeDeals.length} Deal Aktif</p>
        </div>

        <div className="card p-5 border-l-4 border-orange-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-gray-500">Peluang Pitching/Nego</p>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><Handshake size={16}/></div>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {myDeals.filter(d => d.stage === 'pitching' || d.stage === 'negosiasi').length}
          </p>
          <p className="text-xs text-gray-400 mt-2">Deal hampir ditutup</p>
        </div>

        <div className="card p-5 border-l-4 border-purple-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-gray-500">Database Klien</p>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center"><Users size={16}/></div>
          </div>
          <p className="text-xl font-bold text-gray-800">{clients.length}</p>
          <p className="text-xs text-gray-400 mt-2">{clients.filter(c => c.status === 'active').length} Klien Aktif</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Target Penjualan (Bulan Ini)</h3>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalWonValue)}</p>
                <p className="text-xs text-gray-500">Tercapai dari target {formatCurrency(targetValue)}</p>
              </div>
              <p className="text-xl font-bold text-gray-800">{targetProgress.toFixed(1)}%</p>
            </div>
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${targetProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                style={{ width: `${targetProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Peluang Utama (Hot Deals)</h3>
              <Link href="/crm/deals" className="text-sm text-red-500 hover:underline flex items-center gap-1">Lihat Papan <ArrowRight size={14}/></Link>
            </div>
            <div className="space-y-4">
              {activeDeals
                .sort((a, b) => b.probability - a.probability)
                .slice(0, 4)
                .map(deal => (
                <div key={deal.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-800">{deal.title}</h4>
                    <p className="text-xs text-gray-500">{deal.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatCurrency(deal.value)}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-bold uppercase tracking-wider">
                      {deal.stage.replace('_', ' ')} · {deal.probability}%
                    </span>
                  </div>
                </div>
              ))}
              {activeDeals.length === 0 && (
                <p className="text-center text-gray-500 text-sm">Tidak ada deal aktif saat ini.</p>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100/50 border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Target size={20}/>
              </div>
              <div>
                <h3 className="font-bold text-red-800">Aksi Cepat</h3>
                <p className="text-xs text-red-600">Jaga momentum penjualan!</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link href="/crm/deals" className="block w-full py-2.5 px-4 bg-white hover:bg-red-50 text-red-700 text-sm font-bold text-center rounded-lg border border-red-200 transition-colors shadow-sm">
                Perbarui Papan Pipeline
              </Link>
              <Link href="/crm/clients" className="block w-full py-2.5 px-4 bg-white hover:bg-red-50 text-red-700 text-sm font-bold text-center rounded-lg border border-red-200 transition-colors shadow-sm">
                Lihat Database Klien
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
