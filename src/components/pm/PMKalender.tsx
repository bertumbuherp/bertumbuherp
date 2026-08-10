'use client';

import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { usePMStore } from '@/lib/store/pmStore';
import { useCalendarStore } from '@/lib/store/calendarStore';
import MeetingSchedulerModal from './MeetingSchedulerModal';
import GoogleCalendarSyncWidget from './GoogleCalendarSyncWidget';

const STATUS_COLORS: Record<string, string> = {
  on_track: 'var(--green)', at_risk: 'var(--yellow)', delayed: 'var(--red-err)',
  planning: 'var(--blue)', completed: 'var(--violet)',
};

const PROJECT_COLORS = ['var(--red)', 'var(--blue)', 'var(--violet)', 'var(--green)', 'var(--orange)'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function PMKalender() {
  const { projects, tasks } = usePMStore();
  const { customEvents } = useCalendarStore();

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  // Dynamic Event Aggregator for each day
  const getEventsForDay = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const events: { label: string; color: string; type: string }[] = [];

    // Dynamic Projects Timeline
    projects.forEach((p, i) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      if (date >= start && date <= end) {
        events.push({ label: p.name.split(' ').slice(0, 2).join(' '), color: PROJECT_COLORS[i % PROJECT_COLORS.length], type: 'project' });
      }
    });

    // Dynamic PM Tasks Deadlines
    tasks.filter(t => t.status !== 'done').forEach(t => {
      const due = new Date(t.dueDate);
      if (due.getFullYear() === viewYear && due.getMonth() === viewMonth && due.getDate() === day) {
        events.push({ label: t.title.slice(0, 20), color: 'var(--yellow)', type: 'task' });
      }
    });

    // Dynamic Custom & Scheduled Meeting Events
    customEvents.forEach(ce => {
      if (ce.startDate === dateStr) {
        events.push({ label: ce.title, color: ce.color || '#8b5cf6', type: 'meeting' });
      }
    });

    return events;
  };

  const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="space-y-5 fade-in">
      {/* Google Calendar 2-Way Sync Control Widget */}
      <GoogleCalendarSyncWidget />

      {/* Meeting Scheduler Header */}
      <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <Sparkles size={16} className="text-purple-600" /> Meeting Timeline Scheduling Tim
          </h3>
          <p className="text-xs text-gray-500">
            Jadwalkan Rapat Pitching Client (Team Branding), Strategy & Ideation (Team Sosmed), atau Evaluasi (Team Performance).
          </p>
        </div>
        <button
          onClick={() => setIsSchedulerOpen(true)}
          className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus size={14} /> Buat Jadwal Meeting Tim
        </button>
      </div>

      <MeetingSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
      />

      {/* Legend */}
      <div className="card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>LEGENDA:</p>
          {projects.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: PROJECT_COLORS[i % PROJECT_COLORS.length] }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.name.split(' ').slice(0, 2).join(' ')}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--yellow)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Deadline tugas</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
          <p className="text-base font-bold capitalize" style={{ color: 'var(--text-primary)' }}>{monthName}</p>
          <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight size={16} /></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px" style={{ background: 'var(--border)' }}>
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 p-1.5" style={{ background: 'var(--bg-page)' }} />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const events = getEventsForDay(day);
            return (
              <div key={day} className="min-h-24 p-1.5" style={{ background: 'var(--bg-card)' }}>
                <div className="flex justify-end mb-1">
                  <span className="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full"
                    style={{ background: isToday ? 'var(--red)' : 'transparent', color: isToday ? 'white' : 'var(--text-secondary)' }}>
                    {day}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, 2).map((ev, ei) => (
                    <div key={ei} className="text-xs px-1.5 py-0.5 rounded truncate"
                      style={{ background: `${ev.color}18`, color: ev.color, fontSize: 10 }}>
                      {ev.label}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>+{events.length - 2} lagi</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project timeline bars */}
      <div className="card p-5">
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Timeline Proyek</p>
        <div className="space-y-3">
          {projects.map((p, i) => {
            const start = new Date(p.startDate);
            const end = new Date(p.endDate);
            const monthStart = new Date(viewYear, viewMonth, 1);
            const monthEnd = new Date(viewYear, viewMonth, daysInMonth);
            const overlapStart = start < monthStart ? monthStart : start;
            const overlapEnd = end > monthEnd ? monthEnd : end;
            const startOffset = Math.max(0, (overlapStart.getDate() - 1) / daysInMonth * 100);
            const width = Math.max(0, Math.min(100, (overlapEnd.getDate() - overlapStart.getDate() + 1) / daysInMonth * 100));
            const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
            return (
              <div key={p.id}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium w-40 shrink-0 truncate" style={{ color: 'var(--text-secondary)' }}>{p.name}</p>
                  <div className="flex-1 relative h-6 rounded" style={{ background: 'var(--bg-page)' }}>
                    {width > 0 && (
                      <div className="absolute top-0 h-full rounded flex items-center px-2"
                        style={{ left: `${startOffset}%`, width: `${width}%`, background: `${color}25`, border: `1px solid ${color}50` }}>
                        <span className="text-xs font-medium truncate" style={{ color, fontSize: 10 }}>{p.name.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Day markers */}
        <div className="flex mt-2" style={{ marginLeft: 160 }}>
          {[1, 8, 15, 22, 29].map(d => (
            <div key={d} className="text-center flex-1 text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{d}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
