'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { usePMStore } from '@/lib/store/pmStore';
import { useCrmStore } from '@/lib/store/crmStore';
import { useHRStore } from '@/lib/store/hrStore';
import { useFinanceStore } from '@/lib/store/financeStore';
import { useCalendarStore, CustomEvent } from '@/lib/store/calendarStore';
import { useUserStore } from '@/lib/store/userStore';
import { 

  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, 
  Clock, User, DollarSign, Briefcase, FileText, CheckCircle, Info, X,
  Plus, Trash2, Edit, Send
} from 'lucide-react';
import GoogleCalendarSyncWidget from '@/components/pm/GoogleCalendarSyncWidget';

const CATEGORY_COLORS = {
  proyek: 'var(--blue)',
  crm: 'var(--yellow)',
  hr: 'var(--orange)',
  finance: 'var(--red-err)',
  custom: 'var(--violet)'
};

export interface CalendarUnifiedEvent {
  id: string;
  title: string;
  dateStr: string;
  category: string;
  color: string;
  isEditable: boolean;
  details: {
    type: string;
    subtitle: string;
    desc: string;
    meta?: string;
    startTime?: string;
    endTime?: string;
    startDate?: string;
    endDate?: string;
    assigneeId?: string;
    assigneeName?: string;
    color?: string;
    catType?: 'meeting' | 'task' | 'milestone' | 'general';
    createdBy?: string;
  };
}

export function CalendarView({ role }: { role: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Auth details
  const { session, primaryRole } = useAuth();
  
  // Normalization of roles
  const getNormalizedRole = (roleStr: string) => {
    const r = (roleStr || '').toLowerCase();
    if (r.includes('ceo') || r.includes('owner')) return 'owner';
    if (r.includes('pm') || r.includes('project manager')) return 'pm';
    if (r.includes('ae') || r.includes('crm')) return 'ae';
    if (r.includes('hr')) return 'hr';
    if (r.includes('finance')) return 'finance';
    if (r.includes('member') || r.includes('team')) return 'team_member';
    return r;
  };
  
  const activeNormalizedRole = getNormalizedRole(role || primaryRole || '');
  const currentUserId = session?.userId;

  // Store connections
  const { projects, tasks } = usePMStore();
  const { deals } = useCrmStore();
  const { leaves } = useHRStore();
  const { invoices } = useFinanceStore();
  const { customEvents, addCustomEvent, updateCustomEvent, deleteCustomEvent } = useCalendarStore();
  const { users: employees } = useUserStore();


  // Filters Panel
  const [filters, setFilters] = useState({
    proyek: true,
    crm: true,
    hr: true,
    finance: true,
    custom: true
  });

  // Modal / Detail states
  const [selectedEvent, setSelectedEvent] = useState<CalendarUnifiedEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<'meeting' | 'task' | 'milestone' | 'general'>('meeting');
  const [formStartDate, setFormStartDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndDate, setFormEndDate] = useState('');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formColor, setFormColor] = useState('var(--violet)');

  // Formatting helpers
  const extractDateStr = (isoString: string) => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // --- AGGREGATE ROLE-BASED EVENTS ---
  const aggregatedEvents: CalendarUnifiedEvent[] = [];

  const showProyek = filters.proyek && ['owner', 'pm', 'ae', 'finance', 'team_member'].includes(activeNormalizedRole);
  const showCrm = filters.crm && ['owner', 'ae'].includes(activeNormalizedRole);
  const showHr = filters.hr && ['owner', 'hr', 'pm', 'team_member'].includes(activeNormalizedRole);
  const showFinance = filters.finance && ['owner', 'finance'].includes(activeNormalizedRole);
  const showCustom = filters.custom;

  // 1. Projects Deadlines (PM Store)
  if (showProyek) {
    projects.forEach(p => {
      if (p.endDate) {
        aggregatedEvents.push({
          id: `p-dl-${p.id}`,
          title: `DL Proyek: ${p.name}`,
          dateStr: extractDateStr(p.endDate),
          category: 'proyek',
          color: 'var(--blue)',
          isEditable: false,
          details: {
            type: 'Deadline Proyek',
            subtitle: `Klien: ${p.clientName}`,
            desc: `Manajer Proyek: ${p.pmName} | Status: ${p.status.toUpperCase()}`,
            meta: `Nilai Kontrak: ${formatCurrency(p.contractValue)}`
          }
        });
      }
    });

    tasks.forEach(t => {
      if (t.dueDate) {
        const isMyTask = t.assigneeId === currentUserId;
        const isManager = ['owner', 'pm'].includes(activeNormalizedRole);
        
        // Team members only see their own tasks in their calendar
        if (isManager || isMyTask) {
          const proj = projects.find(p => p.id === t.projectId);
          aggregatedEvents.push({
            id: `t-dl-${t.id}`,
            title: `Tugas: ${t.title}`,
            dateStr: extractDateStr(t.dueDate),
            category: 'proyek',
            color: 'var(--blue)',
            isEditable: false,
            details: {
              type: 'Deadline Tugas Proyek',
              subtitle: `Proyek: ${proj ? proj.name : 'Tidak Diketahui'}`,
              desc: `Penanggung Jawab: ${t.assigneeName} | Prioritas: ${t.priority.toUpperCase()}`,
              meta: `Status Tugas: ${t.status.toUpperCase()}`,
              assigneeId: t.assigneeId
            }
          });
        }
      }
    });
  }

  // 2. CRM Pitching & Negotiation (CRM Store)
  if (showCrm) {
    deals.forEach(d => {
      const dateStr = extractDateStr(d.updatedAt || d.createdAt);
      if (dateStr) {
        aggregatedEvents.push({
          id: `d-pt-${d.id}`,
          title: `CRM Deal: ${d.title}`,
          dateStr: dateStr,
          category: 'crm',
          color: 'var(--yellow)',
          isEditable: false,
          details: {
            type: `Prospek CRM (Tahap ${d.stage.toUpperCase()})`,
            subtitle: `Klien: ${d.clientName}`,
            desc: `Account Executive: ${d.aeName} | Probabilitas: ${d.probability}%`,
            meta: `Estimasi Nilai: ${formatCurrency(d.value)}`
          }
        });
      }
    });
  }

  // 3. HR Cuti/Leaves (HR Store)
  if (showHr) {
    leaves.forEach(l => {
      const isApprovedOrPending = ['approved_hr', 'approved_pm', 'pending'].includes(l.status);
      const isMyLeave = l.userId === currentUserId || l.userName === session?.name;
      const isHRorManager = ['owner', 'hr', 'pm'].includes(activeNormalizedRole);

      if (isApprovedOrPending && (isHRorManager || isMyLeave)) {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        
        let current = new Date(start);
        while (current <= end) {
          const dStr = current.toISOString().split('T')[0];
          aggregatedEvents.push({
            id: `l-lv-${l.id}-${dStr}`,
            title: `Cuti: ${l.userName}`,
            dateStr: dStr,
            category: 'hr',
            color: 'var(--orange)',
            isEditable: false,
            details: {
              type: `Cuti Karyawan (${l.type})`,
              subtitle: `Nama: ${l.userName}`,
              desc: `Alasan: ${l.reason} | Durasi: ${l.durationDays} hari`,
              meta: `Status Persetujuan: ${l.status.toUpperCase()}`
            }
          });
          current.setDate(current.getDate() + 1);
        }
      }
    });
  }

  // 4. Finance Invoice Due Dates (Finance Store)
  if (showFinance) {
    invoices.forEach(inv => {
      if (inv.dueDate) {
        aggregatedEvents.push({
          id: `i-dd-${inv.id}`,
          title: `Invoice: ${inv.invoiceNumber}`,
          dateStr: extractDateStr(inv.dueDate),
          category: 'finance',
          color: 'var(--red-err)',
          isEditable: false,
          details: {
            type: 'Jatuh Tempo Invoice',
            subtitle: `Klien: ${inv.clientName}`,
            desc: `Proyek: ${inv.projectName} | Status Pembayaran: ${inv.status.toUpperCase()}`,
            meta: `Total Tagihan: ${formatCurrency(inv.total)}`
          }
        });
      }
    });
  }

  // 5. Custom Events (Calendar Store)
  if (showCustom) {
    customEvents.forEach((evt: CustomEvent) => {
      const isAssignedToMe = evt.assigneeId === currentUserId;
      const isCreatedByMe = evt.createdBy === currentUserId;
      const isManagerOrAdmin = ['owner', 'pm', 'hr', 'finance', 'ae'].includes(activeNormalizedRole);

      if (isManagerOrAdmin || isAssignedToMe || isCreatedByMe) {
        aggregatedEvents.push({
          id: evt.id,
          title: evt.title,
          dateStr: evt.startDate,
          category: 'custom',
          color: evt.color || 'var(--violet)',
          isEditable: isManagerOrAdmin || isCreatedByMe,
          details: {
            type: `Agenda ${evt.category.toUpperCase()}`,
            subtitle: `Penanggung Jawab: ${evt.assigneeName || 'Belum ditugaskan'}`,
            desc: evt.description || 'Tidak ada deskripsi.',
            meta: `Pukul: ${evt.startTime || '00:00'} - ${evt.endTime || '23:59'}`,
            startTime: evt.startTime,
            endTime: evt.endTime,
            startDate: evt.startDate,
            endDate: evt.endDate,
            assigneeId: evt.assigneeId,
            assigneeName: evt.assigneeName,
            color: evt.color,
            catType: evt.category,
            createdBy: evt.createdBy
          }
        });
      }
    });
  }

  // --- GENERATE MONTH GRID DATA ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const gridCells: { dayNum: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevDate = new Date(year, month - 1, d);
    const dateStr = prevDate.toISOString().split('T')[0];
    gridCells.push({ dayNum: d, isCurrentMonth: false, dateStr });
  }

  // Current month
  for (let d = 1; d <= totalDays; d++) {
    const curDate = new Date(year, month, d);
    const dateStr = curDate.toISOString().split('T')[0];
    gridCells.push({ dayNum: d, isCurrentMonth: true, dateStr });
  }

  // Next month padding
  const remainingCells = 42 - gridCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = nextDate.toISOString().split('T')[0];
    gridCells.push({ dayNum: d, isCurrentMonth: false, dateStr });
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // --- CRUD OPERATIONS & ACTION HANDLERS ---

  const handleOpenCreateModal = (prefilledDate?: string) => {
    const defaultDate = prefilledDate || new Date().toISOString().split('T')[0];
    setFormTitle('');
    setFormDesc('');
    setFormCategory('meeting');
    setFormStartDate(defaultDate);
    setFormStartTime('09:00');
    setFormEndDate(defaultDate);
    setFormEndTime('10:00');
    setFormColor('var(--violet)');
    
    // Default assignee to self for team member, empty for managers
    if (activeNormalizedRole === 'team_member') {
      setFormAssigneeId(currentUserId || '');
    } else {
      setFormAssigneeId('');
    }

    setIsCreateModalOpen(true);
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return alert('Judul agenda wajib diisi.');
    
    const assigneeObj = employees.find(emp => emp.id === formAssigneeId);

    const newEvent: CustomEvent = {
      id: `evt-${Date.now()}`,
      title: formTitle,
      description: formDesc,
      startDate: formStartDate,
      startTime: formStartTime,
      endDate: formEndDate,
      endTime: formEndTime,
      assigneeId: formAssigneeId || undefined,
      assigneeName: assigneeObj ? assigneeObj.name : undefined,
      category: formCategory,
      color: formColor,
      createdBy: currentUserId || 'guest',
      createdAt: new Date().toISOString()
    };

    addCustomEvent(newEvent);
    setIsCreateModalOpen(false);
  };

  const handleOpenEditModal = (evt: CalendarUnifiedEvent) => {
    setSelectedEvent(evt);
    setFormTitle(evt.title);
    setFormDesc(evt.details.desc);
    setFormCategory(evt.details.catType || 'meeting');
    setFormStartDate(evt.details.startDate || evt.dateStr);
    setFormStartTime(evt.details.startTime || '09:00');
    setFormEndDate(evt.details.endDate || evt.dateStr);
    setFormEndTime(evt.details.endTime || '10:00');
    setFormAssigneeId(evt.details.assigneeId || '');
    setFormColor(evt.color);
    
    setIsEditModalOpen(true);
  };

  const handleEditEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return alert('Judul agenda wajib diisi.');
    if (!selectedEvent) return;

    const assigneeObj = employees.find(emp => emp.id === formAssigneeId);

    const updatedEvent: CustomEvent = {
      id: selectedEvent.id,
      title: formTitle,
      description: formDesc,
      startDate: formStartDate,
      startTime: formStartTime,
      endDate: formEndDate,
      endTime: formEndTime,
      assigneeId: formAssigneeId || undefined,
      assigneeName: assigneeObj ? assigneeObj.name : undefined,
      category: formCategory,
      color: formColor,
      createdBy: selectedEvent.details.createdBy || currentUserId || 'guest',
      createdAt: new Date().toISOString()
    };

    updateCustomEvent(updatedEvent);
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEventClick = (eventId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      deleteCustomEvent(eventId);
      setSelectedEvent(null);
    }
  };

  // --- GOOGLE CALENDAR LINK GENERATION ---
  const getGoogleCalendarUrl = (evt: CalendarUnifiedEvent) => {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    
    // Format dates: YYYYMMDDTHHmmSS (Local Time)
    const dateStr = evt.dateStr.replace(/-/g, '');
    const startTimeStr = evt.details.startTime ? evt.details.startTime.replace(':', '') + '00' : '090000';
    const endTimeStr = evt.details.endTime ? evt.details.endTime.replace(':', '') + '00' : '100000';
    
    const startStr = `${dateStr}T${startTimeStr}`;
    const endStr = `${dateStr}T${endTimeStr}`;
    
    const text = encodeURIComponent(evt.title);
    
    let desc = `${evt.details.subtitle || ''}\n\n${evt.details.desc || ''}`;
    if (evt.details.meta) {
      desc += `\n\nKeterangan: ${evt.details.meta}`;
    }
    const details = encodeURIComponent(desc);
    
    // Get guest email if it exists
    let addEmail = '';
    if (evt.category === 'custom' && evt.details.assigneeId) {
      const emp = employees.find(e => e.id === evt.details.assigneeId);
      if (emp) addEmail = emp.email;
    } else if (evt.category === 'hr') {
      const emp = employees.find(e => e.name === evt.details.subtitle.replace('Nama: ', ''));
      if (emp) addEmail = emp.email;
    } else if (evt.category === 'proyek' && evt.details.assigneeId) {
      const emp = employees.find(e => e.id === evt.details.assigneeId);
      if (emp) addEmail = emp.email;
    }
    
    const addParam = addEmail ? `&add=${encodeURIComponent(addEmail)}` : '';
    
    return `${base}&text=${text}&dates=${startStr}/${endStr}&details=${details}${addParam}`;
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Kalender Perusahaan" subtitle={`Agenda Terpadu - Mode (${role || 'Global'})`} />
      
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full space-y-6 fade-in">
        {/* Google Calendar 2-Way Sync Control Widget */}
        <GoogleCalendarSyncWidget />

        <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Filter Sidebar Panel */}
        <div className="w-full lg:w-64 shrink-0 space-y-4">
          
          {/* Tambah Agenda Button */}
          <button 
            onClick={() => handleOpenCreateModal()}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
            style={{ background: 'var(--red)' }}
          >
            <Plus size={18} />
            <span>Tambah Agenda</span>
          </button>

          <div className="card p-5">
            <h3 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b">
              <Filter size={16} /> Filter Agenda
            </h3>
            
            <div className="space-y-3.5">
              {['owner', 'pm', 'ae', 'finance', 'team_member'].includes(activeNormalizedRole) && (
                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={filters.proyek} 
                    onChange={() => toggleFilter('proyek')}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-4 h-4" 
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    PM & Proyek
                  </span>
                </label>
              )}

              {['owner', 'ae'].includes(activeNormalizedRole) && (
                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={filters.crm} 
                    onChange={() => toggleFilter('crm')}
                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-4 h-4" 
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                    CRM & Prospek Klien
                  </span>
                </label>
              )}

              {['owner', 'hr', 'pm', 'team_member'].includes(activeNormalizedRole) && (
                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={filters.hr} 
                    onChange={() => toggleFilter('hr')}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4" 
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                    Cuti & Absen HR
                  </span>
                </label>
              )}

              {['owner', 'finance'].includes(activeNormalizedRole) && (
                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={filters.finance} 
                    onChange={() => toggleFilter('finance')}
                    className="rounded border-gray-300 text-red-500 focus:ring-red-500 w-4 h-4" 
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    Invoice Keuangan
                  </span>
                </label>
              )}

              <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                <input 
                  type="checkbox" 
                  checked={filters.custom} 
                  onChange={() => toggleFilter('custom')}
                  className="rounded border-gray-300 text-violet-500 focus:ring-violet-500 w-4 h-4" 
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
                  Rapat & Jadwal Kustom
                </span>
              </label>
            </div>
          </div>

          <div className="card p-5 bg-red-50 border-red-100">
            <h4 className="font-bold text-xs text-red-800 flex items-center gap-1.5 mb-2">
              <Info size={14} /> Informasi Kalender
            </h4>
            <p className="text-[11px] text-red-700 leading-relaxed font-medium">
              Data kalender terintegrasi langsung dengan database ERP. Klik pada sel tanggal mana pun untuk membuat agenda/rapat baru langsung di tanggal tersebut.
            </p>
          </div>
        </div>

        {/* Right Side: Main Calendar Grid */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Calendar Header Nav */}
          <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth} 
                className="p-1.5 rounded-lg border hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-md font-bold text-gray-800 min-w-[140px] text-center">
                {monthNames[month]} {year}
              </h2>
              <button 
                onClick={handleNextMonth} 
                className="p-1.5 rounded-lg border hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleToday} 
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold transition-colors border border-red-200"
              >
                Hari Ini
              </button>
            </div>
          </div>

          {/* Month Grid */}
          <div className="card overflow-hidden">
            
            {/* Week header names */}
            <div className="grid grid-cols-7 bg-gray-50 border-b text-center font-bold text-[11px] text-gray-500 py-2.5">
              <div>Min</div>
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div>Sab</div>
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 grid-rows-6 auto-rows-[100px] sm:auto-rows-[120px] bg-gray-100 gap-[1px]">
              {gridCells.map((cell, idx) => {
                const dayEvents = aggregatedEvents.filter(e => e.dateStr === cell.dateStr);
                const isCurrent = cell.isCurrentMonth;
                const isCellToday = isToday(cell.dateStr);

                return (
                  <div 
                    key={idx} 
                    onClick={() => isCurrent && handleOpenCreateModal(cell.dateStr)}
                    className={`bg-white p-1.5 flex flex-col justify-between overflow-hidden relative transition-colors cursor-pointer hover:bg-gray-50/70 ${
                      !isCurrent ? 'bg-gray-50/70 text-gray-400 opacity-60' : 'text-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isCellToday ? 'bg-red-500 text-white shadow-sm' : ''
                      }`}>
                        {cell.dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1 rounded sm:hidden">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                    
                    {/* Events list inside cell */}
                    <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin hidden sm:block">
                      {dayEvents.map(evt => (
                        <button
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          className="w-full text-left text-[10px] truncate px-1 py-0.5 rounded transition-all font-semibold hover:opacity-85"
                          style={{ 
                            background: `${evt.color}15`, 
                            color: evt.color,
                            borderLeft: `2.5px solid ${evt.color}`
                          }}
                        >
                          {evt.title}
                        </button>
                      ))}
                    </div>

                    {/* Tiny dots indicator for mobile views */}
                    <div className="flex gap-1 flex-wrap sm:hidden justify-center pb-1">
                      {dayEvents.slice(0, 3).map(evt => (
                        <div 
                          key={evt.id} 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: evt.color }} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Detail Event Modal */}
      {selectedEvent && !isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="card w-full max-w-md bg-white p-6 shadow-2xl relative animate-scaleUp">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b pb-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${selectedEvent.color}15`, color: selectedEvent.color }}
              >
                {selectedEvent.category === 'proyek' && <Briefcase size={20} />}
                {selectedEvent.category === 'crm' && <CalendarIcon size={20} />}
                {selectedEvent.category === 'hr' && <User size={20} />}
                {selectedEvent.category === 'finance' && <DollarSign size={20} />}
                {selectedEvent.category === 'custom' && <Clock size={20} />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${selectedEvent.color}15`, color: selectedEvent.color }}>
                  {selectedEvent.details.type}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selectedEvent.dateStr).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-800">
                  {selectedEvent.title.replace('DL Proyek: ', '').replace('Tugas: ', '').replace('CRM Deal: ', '')}
                </h3>
                <p className="text-sm font-semibold text-gray-600 mt-1">{selectedEvent.details.subtitle}</p>
              </div>

              {selectedEvent.details.desc && (
                <div className="bg-gray-50 p-3 rounded-lg border text-xs text-gray-600 leading-relaxed font-medium">
                  {selectedEvent.details.desc}
                </div>
              )}

              {selectedEvent.details.meta && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border text-xs">
                  <span className="font-bold text-gray-500">Waktu / Keterangan:</span>
                  <span className="font-bold text-gray-800">{selectedEvent.details.meta}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href={getGoogleCalendarUrl(selectedEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-white font-bold rounded-lg transition-transform hover:scale-[1.01]"
                style={{ background: 'var(--green)' }}
              >
                <Send size={16} />
                <span>Ingatkan di Google Calendar</span>
              </a>

              <div className="flex gap-2">
                {selectedEvent.isEditable && (
                  <>
                    <button
                      onClick={() => handleOpenEditModal(selectedEvent)}
                      className="flex-1 btn-ghost py-2 border flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 rounded-lg"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEventClick(selectedEvent.id)}
                      className="flex-1 btn-ghost py-2 border border-red-200 flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 btn-ghost py-2 border text-xs font-bold text-gray-500 rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Create Custom Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="card w-full max-w-md bg-white p-6 shadow-2xl relative animate-scaleUp">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-lg text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <Plus size={18} className="text-violet-500" />
              <span>Buat Agenda / Rapat Baru</span>
            </h3>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Agenda *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Rapat Koordinasi Kreatif"
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Agenda</label>
                <textarea 
                  placeholder="Membahas agenda pengerjaan desain, timeline, dan budget..."
                  value={formDesc} 
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                  <select 
                    value={formCategory} 
                    onChange={(e) => setFormCategory(e.target.value as CustomEvent['category'])}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                  >
                    <option value="meeting">Rapat (Meeting)</option>
                    <option value="task">Tugas (Task)</option>
                    <option value="milestone">Milestone</option>
                    <option value="general">Umum (General)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Label Warna</label>
                  <div className="flex items-center gap-1.5 h-[42px]">
                    {[
                      { key: 'blue', value: 'var(--blue)' },
                      { key: 'violet', value: 'var(--violet)' },
                      { key: 'orange', value: 'var(--orange)' },
                      { key: 'green', value: 'var(--green)' },
                      { key: 'yellow', value: 'var(--yellow)' },
                      { key: 'red', value: 'var(--red-err)' }
                    ].map(c => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setFormColor(c.value)}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${formColor === c.value ? 'scale-125 border-gray-600' : 'border-transparent'}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Mulai *</label>
                  <input 
                    type="date" 
                    required
                    value={formStartDate} 
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jam Mulai</label>
                  <input 
                    type="time" 
                    value={formStartTime} 
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Selesai *</label>
                  <input 
                    type="date" 
                    required
                    value={formEndDate} 
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jam Selesai</label>
                  <input 
                    type="time" 
                    value={formEndTime} 
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tugaskan Ke (Assignee)</label>
                {activeNormalizedRole === 'team_member' ? (
                  <div className="p-2.5 bg-gray-50 border rounded-lg text-sm font-semibold text-gray-600">
                    Ditugaskan otomatis ke Anda sendiri ({session?.name})
                  </div>
                ) : (
                  <select 
                    value={formAssigneeId} 
                    onChange={(e) => setFormAssigneeId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                  >
                    <option value="">-- Tanpa Assignee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.position})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 btn-ghost py-2.5 border font-bold text-gray-600 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 font-bold text-white rounded-lg"
                  style={{ background: 'var(--red)' }}
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Edit Custom Event Modal */}
      {isEditModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="card w-full max-w-md bg-white p-6 shadow-2xl relative animate-scaleUp">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-extrabold text-lg text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <Edit size={18} className="text-violet-500" />
              <span>Edit Agenda / Rapat</span>
            </h3>

            <form onSubmit={handleEditEventSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Agenda *</label>
                <input 
                  type="text" 
                  required
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Agenda</label>
                <textarea 
                  value={formDesc} 
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                  <select 
                    value={formCategory} 
                    onChange={(e) => setFormCategory(e.target.value as CustomEvent['category'])}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                  >
                    <option value="meeting">Rapat (Meeting)</option>
                    <option value="task">Tugas (Task)</option>
                    <option value="milestone">Milestone</option>
                    <option value="general">Umum (General)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Label Warna</label>
                  <div className="flex items-center gap-1.5 h-[42px]">
                    {[
                      { key: 'blue', value: 'var(--blue)' },
                      { key: 'violet', value: 'var(--violet)' },
                      { key: 'orange', value: 'var(--orange)' },
                      { key: 'green', value: 'var(--green)' },
                      { key: 'yellow', value: 'var(--yellow)' },
                      { key: 'red', value: 'var(--red-err)' }
                    ].map(c => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setFormColor(c.value)}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${formColor === c.value ? 'scale-125 border-gray-600' : 'border-transparent'}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Mulai *</label>
                  <input 
                    type="date" 
                    required
                    value={formStartDate} 
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jam Mulai</label>
                  <input 
                    type="time" 
                    value={formStartTime} 
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Selesai *</label>
                  <input 
                    type="date" 
                    required
                    value={formEndDate} 
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jam Selesai</label>
                  <input 
                    type="time" 
                    value={formEndTime} 
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tugaskan Ke (Assignee)</label>
                {activeNormalizedRole === 'team_member' ? (
                  <div className="p-2.5 bg-gray-50 border rounded-lg text-sm font-semibold text-gray-600">
                    Ditugaskan otomatis ke Anda sendiri ({session?.name})
                  </div>
                ) : (
                  <select 
                    value={formAssigneeId} 
                    onChange={(e) => setFormAssigneeId(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                  >
                    <option value="">-- Tanpa Assignee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.position})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 btn-ghost py-2.5 border font-bold text-gray-600 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 font-bold text-white rounded-lg"
                  style={{ background: 'var(--red)' }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
