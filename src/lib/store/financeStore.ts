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

const initialReimbursements: Reimbursement[] = [
  { id: 'rem-1', userName: 'Risa Amalia', title: 'Kopi & Snack Meeting Client Raja Usus', amount: 185000, date: '2026-06-10', notes: 'Meeting kick-off campaign sosmed', status: 'approved' },
  { id: 'rem-2', userName: 'Dimas Prasetyo', title: 'Pembelian Asset Design Stock', amount: 350000, date: '2026-06-12', notes: 'Asset 3D & Vector untuk Rebranding Kopi Nusantara', status: 'pending' },
  { id: 'rem-3', userName: 'Bagas Eko', title: 'Bensin & Tol Visit Office Client Sambal Bakar', amount: 120000, date: '2026-06-14', notes: 'Audit performance ads & setup tracking', status: 'paid' },
  { id: 'rem-4', userName: 'Dewi PM', title: 'Langganan Software Project Management (Zoom)', amount: 450000, date: '2026-06-15', notes: 'Zoom Pro 1 bulan untuk meeting client', status: 'approved' },
];

const initialJournal: JournalEntry[] = [
  // 1. Aset Lancar
  { id: 'init_1', date: '2026-05-31', description: 'Saldo Awal - M-Banking', account: 'Bank Mandiri - 1710074092001', accountCode: '1.1.1.1.1.0', accountName: 'Bank Mandiri - 1710074092001', type: 'debit', amount: 17076777 },
  { id: 'init_2', date: '2026-05-31', description: 'Saldo Awal - Bank PT', account: 'Bank Mandiri - PT Bertumbuh', accountCode: '1.1.1.1.2.0', accountName: 'Bank Mandiri - PT Bertumbuh', type: 'debit', amount: 11537003 },
  { id: 'init_3', date: '2026-05-31', description: 'Saldo Awal - Piutang Jasa', account: 'Piutang Jasa', accountCode: '1.1.2.1.3.0', accountName: 'Piutang Jasa', type: 'debit', amount: 84183000 },
  { id: 'init_4', date: '2026-05-31', description: 'Saldo Awal - Beban Dibayar di Muka', account: 'Beban Dibayar di Muka', accountCode: '1.1.2.3.2.0', accountName: 'Beban Dibayar di Muka', type: 'debit', amount: 1742975 },
  { id: 'init_5', date: '2026-05-31', description: 'Saldo Awal - Pajak Dibayar Dimuka', account: 'Pajak Dibayar Dimuka', accountCode: '1.1.2.3.4.0', accountName: 'Pajak Dibayar Dimuka', type: 'debit', amount: 2775868 },
  
  // 2. Aset Tidak Lancar
  { id: 'init_6', date: '2026-05-31', description: 'Saldo Awal - Peralatan Produksi', account: 'Peralatan Produksi', accountCode: '1.2.1.1.0.0', accountName: 'Peralatan Produksi', type: 'debit', amount: 100921898 },
  { id: 'init_7', date: '2026-05-31', description: 'Saldo Awal - Peralatan Kantor', account: 'Peralatan Kantor', accountCode: '1.2.1.2.0.0', accountName: 'Peralatan Kantor', type: 'debit', amount: 20655710 },
  
  // 3. Kewajiban
  { id: 'init_8', date: '2026-05-31', description: 'Saldo Awal - Hutang Usaha', account: 'Hutang Usaha', accountCode: '2.1.1.0.0.0', accountName: 'Hutang Usaha', type: 'credit', amount: 56816900 },
  
  // 4. Ekuitas
  { id: 'init_9', date: '2026-05-31', description: 'Saldo Awal - Modal Saham', account: 'Modal Saham', accountCode: '3.1.0.0.0.0', accountName: 'Modal Saham', type: 'credit', amount: 50000000 },
  { id: 'init_10', date: '2026-05-31', description: 'Saldo Awal - Laba Ditahan', account: 'Laba Ditahan', accountCode: '3.2.0.0.0.0', accountName: 'Laba Ditahan', type: 'credit', amount: 115913511 },

  // 5. Pendapatan (YTD up to May)
  { id: 'init_11', date: '2026-05-31', description: 'Pendapatan Jasa Kumulatif YTD', account: 'Pendapatan Jasa', accountCode: '4.1.0.0.0.0', accountName: 'Pendapatan Jasa', type: 'credit', amount: 387624245 },
  { id: 'init_12', date: '2026-05-31', description: 'Pendapatan Ads Kumulatif YTD', account: 'Pendapatan Ads', accountCode: '4.2.0.0.0.0', accountName: 'Pendapatan Ads', type: 'credit', amount: 74647000 },
  { id: 'init_13', date: '2026-05-31', description: 'Pendapatan Lain Lain Kumulatif YTD', account: 'Pendapatan Lain Lain', accountCode: '4.4.0.0.0.0', accountName: 'Pendapatan Lain Lain', type: 'credit', amount: 9601184 },

  // 6. Harga Pokok Jasa (YTD up to May)
  { id: 'init_14', date: '2026-05-31', description: 'Beban Gaji Full-time YTD', account: 'Beban Gaji Full-time', accountCode: '5.1.1.0.0.0', accountName: 'Beban Gaji Full-time', type: 'debit', amount: 204650000 },
  { id: 'init_15', date: '2026-05-31', description: 'Beban Gaji Freelance YTD', account: 'Beban Gaji Freelance', accountCode: '5.1.2.0.0.0', accountName: 'Beban Gaji Freelance', type: 'debit', amount: 81262000 },
  { id: 'init_16', date: '2026-05-31', description: 'Beban Perlengkapan Produksi YTD', account: 'Beban Perlengkapan Produksi', accountCode: '5.1.4.0.0.0', accountName: 'Beban Perlengkapan Produksi', type: 'debit', amount: 370426 },
  { id: 'init_17', date: '2026-05-31', description: 'Beban Transportasi Produksi YTD', account: 'Beban Transportasi Produksi', accountCode: '5.1.5.0.0.0', accountName: 'Beban Transportasi Produksi', type: 'debit', amount: 1730000 },
  { id: 'init_18', date: '2026-05-31', description: 'Beban Konsumsi Produksi YTD', account: 'Beban Konsumsi Produksi', accountCode: '5.1.6.0.0.0', accountName: 'Beban Konsumsi Produksi', type: 'debit', amount: 2183584 },
  { id: 'init_19', date: '2026-05-31', description: 'Beban Sewa Alat YTD', account: 'Beban Sewa Alat', accountCode: '5.1.7.0.0.0', accountName: 'Beban Sewa Alat', type: 'debit', amount: 1175000 },
  { id: 'init_20', date: '2026-05-31', description: 'Beban Talent YTD', account: 'Beban Talent', accountCode: '5.1.8.0.0.0', accountName: 'Beban Talent', type: 'debit', amount: 550000 },
  { id: 'init_21', date: '2026-05-31', description: 'Beban Web YTD', account: 'Beban Web', accountCode: '5.1.9.0.0.0', accountName: 'Beban Web', type: 'debit', amount: 1517149 },
  { id: 'init_22', date: '2026-05-31', description: 'Beban Software YTD', account: 'Beban Software', accountCode: '5.1.10.0.0.0', accountName: 'Beban Software', type: 'debit', amount: 3063255 },
  { id: 'init_23', date: '2026-05-31', description: 'Beban Ads Internal YTD', account: 'Beban Ads Internal', accountCode: '5.1.12.0.0.0', accountName: 'Beban Ads Internal', type: 'debit', amount: 1300000 },
  { id: 'init_24', date: '2026-05-31', description: 'Beban Ads Klien YTD', account: 'Beban Ads Klien', accountCode: '5.1.13.0.0.0', accountName: 'Beban Ads Klien', type: 'debit', amount: 82360000 },
  { id: 'init_25', date: '2026-05-31', description: 'Beban Listrik & Wifi YTD', account: 'Beban Listrik & Wifi', accountCode: '5.1.14.0.0.0', accountName: 'Beban Listrik & Wifi', type: 'debit', amount: 8648525 },
  { id: 'init_26', date: '2026-05-31', description: 'Beban R&D Jasa YTD', account: 'Beban R&D Jasa', accountCode: '5.1.15.0.0.0', accountName: 'Beban R&D Jasa', type: 'debit', amount: 16800000 },
  { id: 'init_27', date: '2026-05-31', description: 'Beban Komisi Penjualan YTD', account: 'Beban Komisi Penjualan', accountCode: '5.1.16.0.0.0', accountName: 'Beban Komisi Penjualan', type: 'debit', amount: 2625000 },
  { id: 'init_28', date: '2026-05-31', description: 'Beban Produksi Lainnya YTD', account: 'Beban Produksi Lainnya', accountCode: '5.1.17.0.0.0', accountName: 'Beban Produksi Lainnya', type: 'debit', amount: 670000 },

  // 7. Beban Operasional / SGA (YTD up to May)
  { id: 'init_29', date: '2026-05-31', description: 'Beban Rumah Tangga Kantor YTD', account: 'Beban Rumah Tangga Kantor', accountCode: '6.1.2.0.0.0', accountName: 'Beban Rumah Tangga Kantor', type: 'debit', amount: 9484782 },
  { id: 'init_30', date: '2026-05-31', description: 'Beban Perjalanan Dinas Kantor YTD', account: 'Beban Perjalanan Dinas Kantor', accountCode: '6.1.3.0.0.0', accountName: 'Beban Perjalanan Dinas Kantor', type: 'debit', amount: 2382100 },
  { id: 'init_31', date: '2026-05-31', description: 'Beban Entertaiment YTD', account: 'Beban Entertaiment', accountCode: '6.1.4.0.0.0', accountName: 'Beban Entertaiment', type: 'debit', amount: 12860800 },
  { id: 'init_32', date: '2026-05-31', description: 'Beban Sedekah YTD', account: 'Beban Sedekah', accountCode: '6.1.5.0.0.0', accountName: 'Beban Sedekah', type: 'debit', amount: 817000 },
  { id: 'init_33', date: '2026-05-31', description: 'Beban ATK Kantor YTD', account: 'Beban ATK Kantor', accountCode: '6.1.7.0.0.0', accountName: 'Beban ATK Kantor', type: 'debit', amount: 304370 },
  { id: 'init_34', date: '2026-05-31', description: 'Beban Cetak/Print YTD', account: 'Beban Cetak/Print', accountCode: '6.1.8.0.0.0', accountName: 'Beban Cetak/Print', type: 'debit', amount: 558828 },
  { id: 'init_35', date: '2026-05-31', description: 'Beban Pelatihan YTD', account: 'Beban Pelatihan', accountCode: '6.1.12.0.0.0', accountName: 'Beban Pelatihan', type: 'debit', amount: 667000 },
  { id: 'init_36', date: '2026-05-31', description: 'Beban Adm Bank YTD', account: 'Beban Adm Bank', accountCode: '6.1.13.0.0.0', accountName: 'Beban Adm Bank', type: 'debit', amount: 217155 },
  { id: 'init_37', date: '2026-05-31', description: 'Beban Administrasi Flip YTD', account: 'Beban Administrasi Flip', accountCode: '6.1.14.0.0.0', accountName: 'Beban Administrasi Flip', type: 'debit', amount: 494170 },
  { id: 'init_38', date: '2026-05-31', description: 'Beban Servis Peralatan YTD', account: 'Beban Servis Peralatan', accountCode: '6.1.15.0.0.0', accountName: 'Beban Servis Peralatan', type: 'debit', amount: 1085000 },
  { id: 'init_39', date: '2026-05-31', description: 'Beban Lainnya YTD', account: 'Beban Lainnya', accountCode: '6.1.16.0.0.0', accountName: 'Beban Lainnya', type: 'debit', amount: 13638467 },
  { id: 'init_40', date: '2026-05-31', description: 'Beban PPh Pasal 23 YTD', account: 'Beban PPh Pasal 23 (Pendapatan)', accountCode: '6.3.2.0.0.0', accountName: 'Beban PPh Pasal 23 (Pendapatan)', type: 'debit', amount: 4294998 }
];

const initialPayrolls: PayrollHistory[] = [
  { id: 'pay1', userId: 'u6', userName: 'Risa Amalia', department: 'Sosmed/CC', month: 'Juni', year: 2026, baseSalary: 9000000, allowance: 1000000, overtimePay: 450000, deductions: 250000, netPay: 10200000, status: 'pending' },
  { id: 'pay2', userId: 'u7', userName: 'Dimas Prasetyo', department: 'Design', month: 'Juni', year: 2026, baseSalary: 10000000, allowance: 1200000, overtimePay: 600000, deductions: 300000, netPay: 11500000, status: 'pending' },
  { id: 'pay3', userId: 'u8', userName: 'Bagas Eko', department: 'Performance', month: 'Juni', year: 2026, baseSalary: 10500000, allowance: 1000000, overtimePay: 300000, deductions: 280000, netPay: 11520000, status: 'paid' },
];

export const useFinanceStore = create<FinanceStoreState>()(
  persist(
    (set, get) => ({
      reimbursements: initialReimbursements,
      journal: initialJournal,
      payrolls: initialPayrolls,
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

      invoices: [
        { 
          id: 'inv1', 
          invoiceNumber: 'INV-2026-05-001', 
          clientId: 'c1', 
          clientName: 'PT Maju Bersama', 
          dealId: 'd1', 
          projectName: 'Brand Revamp Q2', 
          issueDate: '2026-05-01', 
          dueDate: '2026-05-15', 
          total: 30250000, 
          status: 'paid', 
          lineItems: [
            { id: 'li1', type: 'retainer', description: 'Retainer Bulanan Branding Q2', quantity: 1, unitPrice: 20000000, total: 20000000 },
            { id: 'li2', type: 'addon_kol', description: 'Add-on Talent KOL Influencer', quantity: 2, unitPrice: 2500000, total: 5000000 },
            { id: 'li3', type: 'ads_spend', description: 'Reimbursement Meta & Google Ads Spend', quantity: 1, unitPrice: 5250000, total: 5250000 }
          ] 
        },
        { 
          id: 'inv2', 
          invoiceNumber: 'INV-2026-06-002', 
          clientId: 'c2', 
          clientName: 'Kopi Nusantara', 
          dealId: 'd2', 
          projectName: 'Social Media Retainer Mei', 
          issueDate: '2026-06-01', 
          dueDate: '2026-06-15', 
          total: 25000000, 
          status: 'sent', 
          lineItems: [
            { id: 'li4', type: 'retainer', description: 'Sosmed Management Retainer Mei 2026', quantity: 1, unitPrice: 25000000, total: 25000000 }
          ] 
        },
        { 
          id: 'inv3', 
          invoiceNumber: 'INV-2026-06-003', 
          clientId: 'c4', 
          clientName: 'Edu Academy', 
          projectName: 'Performance Ads Q2', 
          issueDate: '2026-06-05', 
          dueDate: '2026-06-20', 
          total: 18000000, 
          status: 'paid', 
          lineItems: [
            { id: 'li5', type: 'retainer', description: 'Performance Marketing Retainer', quantity: 1, unitPrice: 12000000, total: 12000000 },
            { id: 'li6', type: 'ads_spend', description: 'Google Ads Spend Budget Q2', quantity: 1, unitPrice: 6000000, total: 6000000 }
          ] 
        }
      ],

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

