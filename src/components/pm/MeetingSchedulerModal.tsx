'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendarStore, CustomEvent } from '@/lib/store/calendarStore';
import { usePMStore } from '@/lib/store/pmStore';
import { GoogleCalendarSync } from '@/lib/services/GoogleCalendarSync';
import { Calendar, Clock, Video, Users, CheckCircle2, X, Sparkles, ExternalLink } from 'lucide-react';

export type MeetingCategoryType = 'PITCHING_BRANDING' | 'STRATEGY_SOSMED' | 'EVALUATION_PERFORMANCE' | 'GENERAL_SYNC';

interface MeetingSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_PRESETS: Record<MeetingCategoryType, {
  label: string;
  subTeamFocus: string;
  defaultParticipants: string[];
  color: string;
  bgLight: string;
  borderLight: string;
}> = {
  PITCHING_BRANDING: {
    label: 'Meeting Pitching Klien (Team Branding)',
    subTeamFocus: 'Brand & AE',
    defaultParticipants: ['ae', 'pm', 'Brand'],
    color: '#8b5cf6',
    bgLight: 'bg-purple-50 text-purple-900',
    borderLight: 'border-purple-300',
  },
  STRATEGY_SOSMED: {
    label: 'Meeting Strategy, Ideation & Planning (Team Sosmed)',
    subTeamFocus: 'Sosmed / Content Creator',
    defaultParticipants: ['pm', 'Sosmed/CC', 'Design'],
    color: '#3b82f6',
    bgLight: 'bg-blue-50 text-blue-900',
    borderLight: 'border-blue-300',
  },
  EVALUATION_PERFORMANCE: {
    label: 'Meeting Evaluasi (Team Branding & Performance)',
    subTeamFocus: 'Brand & Performance',
    defaultParticipants: ['pm', 'Brand', 'Performance'],
    color: '#10b981',
    bgLight: 'bg-emerald-50 text-emerald-900',
    borderLight: 'border-emerald-300',
  },
  GENERAL_SYNC: {
    label: 'Meeting Sync Operasional Umum',
    subTeamFocus: 'Seluruh Tim',
    defaultParticipants: ['pm'],
    color: '#f59e0b',
    bgLight: 'bg-amber-50 text-amber-900',
    borderLight: 'border-amber-300',
  },
};

export default function MeetingSchedulerModal({ isOpen, onClose }: MeetingSchedulerModalProps) {
  const { session } = useAuth();
  const { addCustomEvent } = useCalendarStore();
  const { projects } = usePMStore();

  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<MeetingCategoryType>('STRATEGY_SOSMED');
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/abc-defg-hij');
  const [notes, setNotes] = useState('');
  const [syncedLink, setSyncedLink] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const currentPreset = CATEGORY_PRESETS[category];
  const targetProject = projects.find(p => p.id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    const eventId = `meet_${Date.now()}`;
    const eventDescription = `Rapat: ${currentPreset.label}\nProyek: ${targetProject?.name || 'Umum'} (${targetProject?.clientName || '-'})\nCatatan Agenda: ${notes}\nLink Meet: ${meetLink}`;

    const newMeetingEvent: CustomEvent = {
      id: eventId,
      title: `[${currentPreset.subTeamFocus}] ${title}`,
      description: eventDescription,
      startDate,
      endDate: startDate,
      category: 'meeting',
      color: currentPreset.color,
      createdBy: session?.userId || 'u4',
      createdAt: new Date().toISOString(),
    };

    addCustomEvent(newMeetingEvent);

    // Generate real Google Calendar Event Template URL & sync
    const syncResult = GoogleCalendarSync.syncEvent({
      title: newMeetingEvent.title,
      description: eventDescription,
      startDate,
      startTime,
      endTime,
    });

    if (syncResult.gcalLink) {
      setSyncedLink(syncResult.gcalLink);
      window.open(syncResult.gcalLink, '_blank');
    }

    setToast(syncResult.message);
    setTimeout(() => {
      setToast(null);
      onClose();
      setTitle('');
      setNotes('');
      setSyncedLink(null);
    }, 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 text-gray-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {toast && (
          <div className="p-3.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-lg fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              {toast}
            </span>
            {syncedLink && (
              <a
                href={syncedLink}
                target="_blank"
                rel="noreferrer"
                className="underline flex items-center gap-1 font-bold hover:text-emerald-100"
              >
                Buka di GCal ↗
              </a>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 text-gray-900">
              <Sparkles size={18} className="text-purple-600" />
              Jadwalkan Meeting Timeline Tim
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Form pembuatan rapat dinamis & auto-sync Google Calendar</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Preset Category Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih Jenis / Preset Meeting</label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(CATEGORY_PRESETS) as MeetingCategoryType[]).map((key) => {
                const preset = CATEGORY_PRESETS[key];
                const isSelected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? `${preset.bgLight} ${preset.borderLight} font-bold shadow-xs ring-1 ring-purple-400`
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{preset.label}</p>
                      <p className="text-[11px] text-gray-500 font-medium">Target Tim: {preset.subTeamFocus}</p>
                    </div>
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ background: preset.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Judul Agenda Meeting</label>
              <input
                type="text"
                placeholder="Contoh: Ideation Campaign Q3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 focus:bg-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Proyek Terkait</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 focus:bg-white focus:border-purple-500 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-2 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 focus:bg-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mulai</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 focus:bg-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Selesai</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 focus:bg-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Google Meet Link */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Video size={14} className="text-blue-600" /> Tautan Google Meet / Lokasi
            </label>
            <input
              type="text"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 focus:bg-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Catatan / Agenda */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Agenda & Discussion Points</label>
            <textarea
              rows={2}
              placeholder="Tuliskan poin pembahasan rapat..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 focus:bg-white focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Auto Google Calendar Sync Notice */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-blue-600" />
              Otomatis ter-sync & membuka tab Google Calendar
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">2-Way Sync</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Batal
            </button>
            <button type="submit" className="btn-primary px-4 py-2 text-xs font-bold shadow-md cursor-pointer">
              Simpan & Sync Google Calendar ↗
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
