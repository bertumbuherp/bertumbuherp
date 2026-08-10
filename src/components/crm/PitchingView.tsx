'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCrmStore } from '@/lib/store/crmStore';
import { formatCurrency, STAGE_LABELS } from '@/lib/utils';
import { DealStage, Deal } from '@/lib/types';
import { Calendar, MapPin, FileText, Clock, Check, X, AlertCircle, Video, ExternalLink, Plus, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const STAGE_COLORS: Record<DealStage, string> = {
  lead: '#9CA3AF', kualifikasi: 'var(--blue)', penawaran: 'var(--violet)',
  pitching: 'var(--yellow)', negosiasi: 'var(--orange)', won: 'var(--green)', lost: 'var(--red-err)',
};

export function PitchingView() {
  const deals = useCrmStore(s => s.deals);
  const clients = useCrmStore(s => s.clients);
  const addDeal = useCrmStore(s => s.addDeal);
  const updateDealPitching = useCrmStore(s => s.updateDealPitching);
  
  // Pitching deals are those in 'penawaran' or 'pitching' stage
  const pitchingDeals = deals.filter(d => ['penawaran', 'pitching'].includes(d.stage));
  
  const [mounted, setMounted] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  
  // Form states for scheduling
  const [meetingMode, setMeetingMode] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    notes: '',
    attendees: 'Account Executive, Creative Lead, Strategist'
  });

  // Form states for new prospective client deal
  const [newDealClient, setNewDealClient] = useState('');
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealValue, setNewDealValue] = useState<string>('');

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenSchedule = (deal: Deal) => {
    setActiveDeal(deal);
    setMeetingMode(deal.pitchingLocation?.includes('http') || deal.pitchingLocation?.includes('Meet') ? 'ONLINE' : 'OFFLINE');
    setFormData({
      date: deal.pitchingDate ? deal.pitchingDate.substring(0, 16) : '',
      location: deal.pitchingLocation || 'https://meet.google.com/new',
      notes: deal.pitchingNotes || '',
      attendees: 'Account Executive, Creative Lead, Strategist'
    });
    setIsModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeal) return;
    
    updateDealPitching(activeDeal.id, {
      pitchingDate: formData.date ? new Date(formData.date).toISOString() : undefined,
      pitchingLocation: formData.location,
      pitchingNotes: formData.notes,
      stage: 'pitching' // Automatically advance to pitching stage if scheduled
    });

    // Auto open Google Calendar sync
    const title = encodeURIComponent(`[Pitching Proposal] ${activeDeal.clientName} - ${activeDeal.title}`);
    const details = encodeURIComponent(`Meeting Presentasi Proposal Pitching Klien: ${activeDeal.clientName}.\nCatatan: ${formData.notes}\nAnggota Tim: ${formData.attendees}`);
    const location = encodeURIComponent(formData.location);
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    
    window.open(gcalUrl, '_blank');

    setToast(`🎉 Jadwal Pitching untuk "${activeDeal.clientName}" berhasil disimpan & disinkronkan ke Google Calendar!`);
    setTimeout(() => setToast(null), 5000);
    
    setIsModalOpen(false);
    setActiveDeal(null);
  };

  const handleCreateNewPitchingDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealClient || !newDealTitle) return;
    const parsedValue = parseInt(newDealValue.replace(/\D/g, ''), 10) || 0;

    addDeal({
      organizationId: 'org-1',
      clientName: newDealClient,
      title: newDealTitle,
      stage: 'pitching',
      value: parsedValue,
      probability: 70,
      aeId: 'u1',
      aeName: 'Anda (Account Executive)',
      source: 'Direct AE Proposal',
      notes: 'Prospek pitching baru dischedule oleh AE.'
    });

    setToast(`Prospek Pitching "${newDealTitle}" berhasil ditambahkan!`);
    setTimeout(() => setToast(null), 5000);
    setIsNewDealModalOpen(false);
    setNewDealClient('');
    setNewDealTitle('');
    setNewDealValue('');
  };

  const handleOutcome = (dealId: string, outcome: 'won' | 'lost') => {
    const confirmMsg = outcome === 'won' 
      ? 'Tandai pitching ini sebagai SUKSES? Deal akan otomatis dikonversi menjadi Proyek baru.' 
      : 'Tandai pitching ini sebagai GAGAL?';
    
    if (window.confirm(confirmMsg)) {
      updateDealPitching(dealId, { stage: outcome });
      setToast(`Status Pitching diperbarui ke: ${outcome === 'won' ? 'SUKSES (Won)' : 'GAGAL (Lost)'}`);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="p-6">
      {/* Toast Feedback */}
      {toast && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-md fade-in no-print">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white hover:text-gray-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Meeting Scheduling Pitching / Proposal Phase</h2>
          <p className="text-sm text-gray-500 mt-1">Penjadwalan presentasi proposal ke calon klien (Online / Offline) &amp; Auto-sync Google Calendar</p>
        </div>
        <button
          type="button"
          onClick={() => setIsNewDealModalOpen(true)}
          className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm font-bold shadow-md cursor-pointer shrink-0"
        >
          <Plus size={16} /> + Tambah Prospek Pitching Baru
        </button>
      </div>

      {/* SCHEDULE PITCHING MODAL (PORTAL) */}
      {isModalOpen && activeDeal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-gray-100 text-gray-800">
            <div className="flex justify-between items-start border-b pb-3 border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={18} className="text-red-500" /> Penjadwalan Pitching / Proposal
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Klien: <strong>{activeDeal.clientName}</strong> · Proyek: {activeDeal.title}</p>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setActiveDeal(null); }} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSchedule} className="space-y-4 text-sm">
              {/* Mode Meeting Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Modus Meeting Presentasi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMeetingMode('ONLINE');
                      if (!formData.location || formData.location.includes('Kantor')) {
                        setFormData({ ...formData, location: 'https://meet.google.com/new' });
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      meetingMode === 'ONLINE'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Video size={16} className="text-blue-600" /> Online (G-Meet / Zoom)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMeetingMode('OFFLINE');
                      setFormData({ ...formData, location: 'Kantor Klien / On-Site' });
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      meetingMode === 'OFFLINE'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin size={16} className="text-emerald-600" /> Offline / On-Site
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal &amp; Jam Meeting</label>
                  <input 
                    required 
                    type="datetime-local" 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-gray-50 font-semibold text-gray-900 focus:outline-none focus:border-red-500" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {meetingMode === 'ONLINE' ? 'Tautan Meeting Online' : 'Lokasi / Alamat Meeting'}
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder={meetingMode === 'ONLINE' ? 'https://meet.google.com/xyz' : 'Jl. Sudirman No. 12, Jakarta'} 
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-gray-50 font-medium text-gray-900 focus:outline-none focus:border-red-500" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tim Pendamping (Invitees)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: AE Lead, Creative Director, Strategic Planner" 
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-gray-50 font-medium text-gray-900 focus:outline-none focus:border-red-500" 
                  value={formData.attendees} 
                  onChange={e => setFormData({...formData, attendees: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Agenda &amp; Persiapan Proposal</label>
                <textarea 
                  rows={3} 
                  placeholder="Catatan poin presentasi, deck proposal, deliverables..." 
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-gray-50 font-medium text-gray-900 focus:outline-none focus:border-red-500 resize-none" 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setActiveDeal(null); }} 
                  className="px-4 py-2 text-xs text-gray-600 font-semibold border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary px-4 py-2 text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar size={14} /> Simpan &amp; Sync Google Calendar ↗
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* NEW PITCHING DEAL MODAL (PORTAL) */}
      {isNewDealModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-100 text-gray-800">
            <div className="flex justify-between items-start border-b pb-3 border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus size={18} className="text-red-500" /> Tambah Prospek Pitching Baru
              </h3>
              <button 
                onClick={() => setIsNewDealModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewPitchingDeal} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Klien / Perusahaan</label>
                <input 
                  required
                  type="text"
                  placeholder="Contoh: PT Harapan Jaya"
                  value={newDealClient}
                  onChange={e => setNewDealClient(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-gray-50 font-semibold text-gray-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Project Pitching</label>
                <input 
                  required
                  type="text"
                  placeholder="Contoh: Pitching Campaign Launch Q4"
                  value={newDealTitle}
                  onChange={e => setNewDealTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-gray-50 font-semibold text-gray-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Estimasi Nilai Prospek (Rp)</label>
                <input 
                  required
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 25000000"
                  value={newDealValue}
                  onChange={e => setNewDealValue(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-gray-50 font-bold text-gray-900 focus:outline-none focus:border-red-500"
                />
                {newDealValue && <p className="text-xs text-gray-500 mt-1">{formatCurrency(parseInt(newDealValue) || 0)}</p>}
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsNewDealModalOpen(false)} 
                  className="px-4 py-2 text-xs text-gray-600 font-semibold border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
                >
                  Simpan Prospek Pitching
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Main List */}
      <div className="grid grid-cols-1 gap-6">
        {pitchingDeals.map(d => {
          const hasSchedule = !!d.pitchingDate;
          const isOnline = d.pitchingLocation?.includes('http') || d.pitchingLocation?.includes('Meet');
          
          return (
            <div key={d.id} className="card p-5 border-l-4 transition-all hover:shadow-md bg-white border-gray-200" style={{ borderLeftColor: STAGE_COLORS[d.stage] }}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                
                {/* Details Section */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-gray-800">{d.clientName}</h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: STAGE_COLORS[d.stage] + '20', color: STAGE_COLORS[d.stage] }}>
                      {STAGE_LABELS[d.stage]}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">{d.title} — <span className="text-emerald-600 font-bold">{formatCurrency(d.value)}</span></p>
                  
                  {/* Pitching details info box */}
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {hasSchedule ? (
                      <>
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                          <Clock size={16} className="text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-700">Waktu Presentasi</p>
                            <p className="font-medium text-gray-800">{new Date(d.pitchingDate!).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                          {isOnline ? <Video size={16} className="text-blue-600 shrink-0 mt-0.5" /> : <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />}
                          <div>
                            <p className="font-bold text-gray-700">Mode &amp; Lokasi Meeting</p>
                            {isOnline ? (
                              <a href={d.pitchingLocation} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold flex items-center gap-1">
                                {d.pitchingLocation} <ExternalLink size={11} />
                              </a>
                            ) : (
                              <p className="font-medium text-gray-800">{d.pitchingLocation}</p>
                            )}
                          </div>
                        </div>
                        {d.pitchingNotes && (
                          <div className="col-span-1 md:col-span-2 flex items-start gap-2 text-xs text-gray-500 border-t pt-2 mt-1 border-gray-200">
                            <FileText size={14} className="text-orange-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-gray-700">Catatan Persiapan Proposal</p>
                              <p className="italic text-gray-800">{d.pitchingNotes}</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="col-span-2 flex items-center gap-2 text-xs text-amber-700 font-semibold py-1">
                        <AlertCircle size={16} className="text-amber-500" />
                        <span>Jadwal presentasi belum diatur. Silakan klik <strong>Jadwalkan Pitching</strong>.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleOpenSchedule(d)}
                      className="flex-1 sm:flex-initial text-xs py-2 px-3.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold rounded-xl border border-blue-200 transition-colors shadow-xs"
                    >
                      {hasSchedule ? 'Ubah Jadwal' : 'Jadwalkan Pitching'}
                    </button>
                    
                    <Link 
                      href="/crm/dashboard?tab=penawaran"
                      className="flex-1 sm:flex-initial text-xs py-2 px-3.5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-300 text-center transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <FileText size={13} /> Quotation
                    </Link>
                  </div>

                  {hasSchedule && (
                    <div className="flex gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      <button 
                        onClick={() => handleOutcome(d.id, 'won')}
                        className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                        title="Pitching Sukses (Won)"
                      >
                        <Check size={13} /> Sukses (Won)
                      </button>
                      <button 
                        onClick={() => handleOutcome(d.id, 'lost')}
                        className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                        title="Pitching Gagal (Lost)"
                      >
                        <X size={13} /> Gagal (Lost)
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
        
        {pitchingDeals.length === 0 && (
          <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            Belum ada prospek klien di tahap penawaran atau pitching saat ini.
          </div>
        )}
      </div>
    </div>
  );
}
