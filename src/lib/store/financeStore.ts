import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabaseDataService } from '@/lib/services/supabaseDataService';


export interface Reimbursement {
  id: string;
  userName: string;
  title: string;
  amount: number;
  date: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  attachmentUrl?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  account: string; // Keep for compatibility (maps to accountName)
  accountCode: string; // e.g., '1.1.1.1.1.0'
  accountName: string; // e.g., 'Bank Mandiri - 1710074092001'
  type: 'debit' | 'credit';
  amount: number;
  referenceId?: string; // e.g., invoiceId, reimbursementId
  isVoided?: boolean;
  isSimulation?: boolean;
}

export interface PayrollHistory {
  id: string;
  userId: string;
  userName: string;
  department?: string;
  month: string;
  year: number;
  baseSalary: number;
  allowance: number;
  overtimePay: number;
  deductions: number;
  netPay: number;
  status: 'pending' | 'paid';
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  bankAccount: string;
  status: 'active' | 'inactive';
}

export interface InvoiceLineItemDetail {
  id: string;
  type: 'retainer' | 'addon_kol' | 'ads_spend' | 'service';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  dealId?: string;
  projectName: string;
  issueDate?: string;
  dueDate: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  lineItems: InvoiceLineItemDetail[];
}

export interface AccountCOA {
  code: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  normalBalance: 'debit' | 'credit';
}

export const CHART_OF_ACCOUNTS: AccountCOA[] = [
  // ASET LANCAR
  { code: '1.1.1.1.1.0', name: 'Bank Mandiri - 1710074092001', category: 'Asset', normalBalance: 'debit' },
  { code: '1.1.1.1.2.0', name: 'Bank Mandiri - PT Bertumbuh', category: 'Asset', normalBalance: 'debit' },
  { code: '1.1.1.1.3.0', name: 'Kas di Tangan', category: 'Asset', normalBalance: 'debit' },
  { code: '1.1.2.1.3.0', name: 'Piutang Jasa', category: 'Asset', normalBalance: 'debit' },
  { code: '1.1.2.2.1.1', name: 'Piutang Klien', category: 'Asset', normalBalance: 'debit' },
  { code: '1.1.2.3.2.0', name: 'Beban Dibayar di Muka', category: 'Asset', normalBalance: 'debit' },
  { code: '1.1.2.3.4.0', name: 'Pajak Dibayar Dimuka', category: 'Asset', normalBalance: 'debit' },
  
  // ASET TIDAK LANCAR
  { code: '1.2.1.1.0.0', name: 'Peralatan Produksi', category: 'Asset', normalBalance: 'debit' },
  { code: '1.2.1.2.0.0', name: 'Peralatan Kantor', category: 'Asset', normalBalance: 'debit' },
  
  // KEWAJIBAN
  { code: '2.1.1.0.0.0', name: 'Hutang Usaha', category: 'Liability', normalBalance: 'credit' },
  
  // EKUITAS
  { code: '3.1.0.0.0.0', name: 'Modal Saham', category: 'Equity', normalBalance: 'credit' },
  { code: '3.2.0.0.0.0', name: 'Laba Ditahan', category: 'Equity', normalBalance: 'credit' },
  { code: '3.3.0.0.0.0', name: 'Dividen', category: 'Equity', normalBalance: 'debit' },
  { code: '3.4.0.0.0.0', name: 'Laba Rugi Tahun Berjalan', category: 'Equity', normalBalance: 'credit' },
  
  // PENDAPATAN
  { code: '4.1.0.0.0.0', name: 'Pendapatan Jasa', category: 'Revenue', normalBalance: 'credit' },
  { code: '4.2.0.0.0.0', name: 'Pendapatan Ads', category: 'Revenue', normalBalance: 'credit' },
  { code: '4.4.0.0.0.0', name: 'Pendapatan Lain Lain', category: 'Revenue', normalBalance: 'credit' },
  
  // HARGA POKOK JASA
  { code: '5.1.1.0.0.0', name: 'Beban Gaji Full-time', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.2.0.0.0', name: 'Beban Gaji Freelance', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.4.0.0.0', name: 'Beban Perlengkapan Produksi', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.5.0.0.0', name: 'Beban Transportasi Produksi', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.6.0.0.0', name: 'Beban Konsumsi Produksi', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.7.0.0.0', name: 'Beban Sewa Alat', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.8.0.0.0', name: 'Beban Talent', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.9.0.0.0', name: 'Beban Web', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.10.0.0.0', name: 'Beban Software', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.12.0.0.0', name: 'Beban Ads Internal', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.13.0.0.0', name: 'Beban Ads Klien', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.14.0.0.0', name: 'Beban Listrik & Wifi', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.15.0.0.0', name: 'Beban R&D Jasa', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.16.0.0.0', name: 'Beban Komisi Penjualan', category: 'Expense', normalBalance: 'debit' },
  { code: '5.1.17.0.0.0', name: 'Beban Produksi Lainnya', category: 'Expense', normalBalance: 'debit' },
  
  // BEBAN OPERASIONAL/SGA
  { code: '6.1.2.0.0.0', name: 'Beban Rumah Tangga Kantor', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.3.0.0.0', name: 'Beban Perjalanan Dinas Kantor', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.4.0.0.0', name: 'Beban Entertaiment', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.5.0.0.0', name: 'Beban Sedekah', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.7.0.0.0', name: 'Beban ATK Kantor', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.8.0.0.0', name: 'Beban Cetak/Print', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.12.0.0.0', name: 'Beban Pelatihan', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.13.0.0.0', name: 'Beban Adm Bank', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.14.0.0.0', name: 'Beban Administrasi Flip', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.15.0.0.0', name: 'Beban Servis Peralatan', category: 'Expense', normalBalance: 'debit' },
  { code: '6.1.16.0.0.0', name: 'Beban Lainnya', category: 'Expense', normalBalance: 'debit' },
  { code: '6.3.2.0.0.0', name: 'Beban PPh Pasal 23 (Pendapatan)', category: 'Expense', normalBalance: 'debit' }
];

interface FinanceStoreState {
  reimbursements: Reimbursement[];
  journal: JournalEntry[];
  payrolls: PayrollHistory[];
  vendors: Vendor[];
  invoices: Invoice[];
  coaList: AccountCOA[];
  
  fetchFromSupabase: () => Promise<void>;
  clearMockData: () => void;
  
  addReimbursement: (reimbursement: Reimbursement) => void;
  updateReimbursementStatus: (id: string, status: Reimbursement['status']) => void;
  
  addJournalEntry: (entry: JournalEntry) => void;
  addJournalEntries: (entries: JournalEntry[]) => void;
  editJournalEntry: (id: string, updated: Partial<JournalEntry>) => void;
  voidJournalEntry: (id: string) => void;
  
  addPayroll: (payroll: PayrollHistory) => void;
  syncHRPayrolls: (hrPayrolls: PayrollHistory[]) => void;
  updatePayrollStatus: (id: string, status: PayrollHistory['status']) => void;
  
  addVendor: (vendor: Vendor) => void;
  
  addInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  
  addCOA: (account: AccountCOA) => void;
  updateCOA: (code: string, updated: Partial<AccountCOA>) => void;
}

const initialReimbursements: Reimbursement[] = [];
const initialJournal: JournalEntry[] = [];
const initialPayrolls: PayrollHistory[] = [];

export const useFinanceStore = create<FinanceStoreState>()(
  persist(
    (set, get) => ({
      reimbursements: [],
      journal: [],
      payrolls: [],
      vendors: [],
      coaList: CHART_OF_ACCOUNTS,

      fetchFromSupabase: async () => {
        const [dbJournal, dbReimbursements] = await Promise.all([
          supabaseDataService.getJournalEntries(),
          supabaseDataService.getReimbursements(),
        ]);

        if (dbJournal && dbJournal.length > 0) {
          const mappedJournal: JournalEntry[] = dbJournal.map((j: any) => ({
            id: j.id,
            date: j.date,
            description: j.description,
            account: j.account,
            accountCode: j.account_code,
            accountName: j.account_name,
            type: j.type,
            amount: Number(j.amount) || 0,
            referenceId: j.reference_id,
            isVoided: j.is_voided,
            isSimulation: j.is_simulation,
          }));
          set({ journal: mappedJournal });
        }

        if (dbReimbursements && dbReimbursements.length > 0) {
          const mappedRem: Reimbursement[] = dbReimbursements.map((r: any) => ({
            id: r.id,
            userName: r.user_name,
            title: r.title,
            amount: Number(r.amount) || 0,
            date: r.date,
            notes: r.notes || '',
            status: r.status || 'pending',
            attachmentUrl: r.attachment_url,
          }));
          set({ reimbursements: mappedRem });
        }
      },

      clearMockData: () => {
        set({ reimbursements: [], journal: [], payrolls: [], invoices: [] });
      },

      invoices: [],

      addReimbursement: (reimbursement) => set((state) => ({ reimbursements: [reimbursement, ...state.reimbursements] })),
      
      updateReimbursementStatus: (id, status) => set((state) => {
        const reimbursements = state.reimbursements.map(r => r.id === id ? { ...r, status } : r);
        const newState = { reimbursements } as Partial<FinanceStoreState>;
        
        // Auto-create journal entry if paid
        if (status === 'paid') {
          const r = state.reimbursements.find(x => x.id === id);
          if (r) {
            const newEntries: JournalEntry[] = [
              { id: 'j_' + Date.now() + '_1', date: new Date().toISOString().split('T')[0], description: `Reimbursement ${r.userName} - ${r.title}`, account: 'Beban Lainnya', accountCode: '6.1.16.0.0.0', accountName: 'Beban Lainnya', type: 'debit', amount: r.amount, referenceId: id },
              { id: 'j_' + Date.now() + '_2', date: new Date().toISOString().split('T')[0], description: `Kas Keluar (Reimbursement ${r.userName})`, account: 'Bank Mandiri - PT Bertumbuh', accountCode: '1.1.1.1.2.0', accountName: 'Bank Mandiri - PT Bertumbuh', type: 'credit', amount: r.amount, referenceId: id },
            ];
            newState.journal = [...newEntries, ...state.journal];
          }
        }
        return newState;
      }),

      addJournalEntry: (entry) => set((state) => ({ journal: [entry, ...state.journal] })),
      addJournalEntries: (entries) => set((state) => ({ journal: [...entries, ...state.journal] })),
      
      editJournalEntry: (id, updated) => set((state) => ({
        journal: state.journal.map(j => j.id === id ? { ...j, ...updated } : j)
      })),

      voidJournalEntry: (id) => set((state) => {
        const target = state.journal.find(j => j.id === id);
        if (!target) return state;
        const reversalEntry: JournalEntry = {
          id: 'j_void_' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          description: `[VOID REVERSAL] ${target.description}`,
          account: target.account,
          accountCode: target.accountCode,
          accountName: target.accountName,
          type: target.type === 'debit' ? 'credit' : 'debit',
          amount: target.amount,
          referenceId: target.id,
          isVoided: true
        };
        return {
          journal: [
            reversalEntry,
            ...state.journal.map(j => j.id === id ? { ...j, isVoided: true } : j)
          ]
        };
      }),
      
      addPayroll: (payroll) => set((state) => ({ payrolls: [payroll, ...state.payrolls] })),
      
      syncHRPayrolls: (hrPayrolls) => set((state) => {
        const existingIds = new Set(state.payrolls.map(p => p.id));
        const newPayrolls = hrPayrolls.filter(p => !existingIds.has(p.id));
        return { payrolls: [...newPayrolls, ...state.payrolls] };
      }),
      
      updatePayrollStatus: (id, status) => set((state) => {
        const payrolls = state.payrolls.map(p => p.id === id ? { ...p, status } : p);
        const newState = { payrolls } as Partial<FinanceStoreState>;
        
        if (status === 'paid') {
          const p = state.payrolls.find(x => x.id === id);
          if (p) {
            const newEntries: JournalEntry[] = [
              { id: 'j_' + Date.now() + '_p1', date: new Date().toISOString().split('T')[0], description: `Gaji ${p.month} ${p.year} - ${p.userName}`, account: 'Beban Gaji Full-time', accountCode: '5.1.1.0.0.0', accountName: 'Beban Gaji Full-time', type: 'debit', amount: p.netPay, referenceId: id },
              { id: 'j_' + Date.now() + '_p2', date: new Date().toISOString().split('T')[0], description: `Kas Keluar (Gaji ${p.userName})`, account: 'Bank Mandiri - PT Bertumbuh', accountCode: '1.1.1.1.2.0', accountName: 'Bank Mandiri - PT Bertumbuh', type: 'credit', amount: p.netPay, referenceId: id },
            ];
            newState.journal = [...newEntries, ...state.journal];
          }
        }
        return newState;
      }),

      addVendor: (vendor) => set((state) => ({ vendors: [vendor, ...state.vendors] })),
      
      addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
      
      updateInvoiceStatus: (id, status) => set((state) => {
        const invoices = state.invoices.map(i => i.id === id ? { ...i, status } : i);
        const newState = { invoices } as Partial<FinanceStoreState>;
        
        if (status === 'paid') {
          const inv = state.invoices.find(x => x.id === id);
          if (inv) {
            const newEntries: JournalEntry[] = [
              { id: 'j_' + Date.now() + '_i1', date: new Date().toISOString().split('T')[0], description: `Pelunasan Invoice ${inv.invoiceNumber} - ${inv.clientName}`, account: 'Bank Mandiri - PT Bertumbuh', accountCode: '1.1.1.1.2.0', accountName: 'Bank Mandiri - PT Bertumbuh', type: 'debit', amount: inv.total, referenceId: id },
              { id: 'j_' + Date.now() + '_i2', date: new Date().toISOString().split('T')[0], description: `Pendapatan Jasa (${inv.projectName})`, account: 'Pendapatan Jasa', accountCode: '4.1.0.0.0.0', accountName: 'Pendapatan Jasa', type: 'credit', amount: inv.total, referenceId: id },
            ];
            newState.journal = [...newEntries, ...state.journal];
          }
        }
        return newState;
      }),

      addCOA: (account) => set((state) => ({ coaList: [...state.coaList, account] })),
      
      updateCOA: (code, updated) => set((state) => ({
        coaList: state.coaList.map(c => c.code === code ? { ...c, ...updated } : c)
      })),
    }),
    {
      name: 'bertumbuh-finance-storage',
    }
  )
);

