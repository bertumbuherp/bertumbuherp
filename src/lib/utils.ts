import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 2 
  }).format(amount).replace(/\s/g, '');
}

export function formatCurrencyFull(amount: number): string {
  return formatCurrency(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getDaysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead', kualifikasi: 'Kualifikasi', penawaran: 'Penawaran',
  pitching: 'Pitching', negosiasi: 'Negosiasi', won: 'Won', lost: 'Lost',
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Aktif', prospect: 'Prospek', inactive: 'Non-aktif',
  on_track: 'On Track', at_risk: 'At Risk', delayed: 'Terlambat',
  planning: 'Planning', completed: 'Selesai',
  draft: 'Draft', sent: 'Terkirim', paid: 'Lunas', overdue: 'Jatuh Tempo', void: 'Void',
  todo: 'Belum', in_progress: 'Dikerjakan', review: 'Review', done: 'Selesai',
};

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner', super_admin: 'Super Admin', ae: 'Account Executive',
  pm: 'Project Manager', finance: 'Finance', hr: 'HR', team_member: 'Team Member',
};
