// ============================================================
// Agency ERP — TypeScript Types (sesuai PRD v1.2)
// ============================================================

export type Role = 'owner' | 'super_admin' | 'ae' | 'pm' | 'finance' | 'hr' | 'team_member';

export type Resource =
  | 'dashboard' | 'crm' | 'clients' | 'projects' | 'finance'
  | 'hr' | 'settings' | 'pm_dashboard' | 'tasks' | 'invoices'
  | 'employees' | 'reports' | 'overtime' | 'calendar';

export type Action = 'read' | 'write' | 'delete' | 'approve';

export interface Permission {
  resource: Resource;
  actions: Action[];
}

export interface AuthSession {
  userId: string;
  organizationId: string;
  name: string;
  email: string;
  roles: Role[];
  avatarInitials: string;
  /** ISO timestamp — used to validate session expiry */
  expiresAt: string;
}

export type ClientStatus = 'prospect' | 'active' | 'inactive';
export type ProjectStatus = 'planning' | 'on_track' | 'at_risk' | 'delayed' | 'completed';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
export type DealStage = 'lead' | 'kualifikasi' | 'penawaran' | 'pitching' | 'negosiasi' | 'won' | 'lost';
export type BillingType = 'project' | 'retainer';
export type SubTeam = 'Brand' | 'Sosmed/CC' | 'Produksi' | 'Design' | 'Performance';

// ── User & Organization ─────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  revenueTarget: number; // monthly
  utilizationTarget: number; // percentage
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  avatar?: string;
  roles: Role[];
  department?: SubTeam;
  isActive: boolean;
  createdAt: string;
}

// ── Client & CRM ────────────────────────────────────────────

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  industry: string;
  status: ClientStatus;
  contacts: Contact[];
  ownedByAe?: string; // user id
  totalRevenue: number;
  activeProjects: number;
  createdAt: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface Deal {
  id: string;
  organizationId: string;
  clientName: string;
  clientId?: string;
  title: string;
  stage: DealStage;
  value: number;
  probability: number; // 0-100
  aeId: string;
  aeName: string;
  source: string;
  notes?: string;
  pitchingDate?: string;
  pitchingLocation?: string;
  pitchingNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  deliverables: string[];
  color: string;
  status: 'approved' | 'pending' | 'rejected';
  requestedBy?: string;
}

// ── Quotation (Penawaran) ───────────────────────────────────

export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface QuotationLineItem {
  id: string;
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  total: number;
}

export interface Quotation {
  id: string;
  organizationId: string;
  quotationNumber: string;
  clientId: string;
  clientName: string;
  dealId?: string;
  issueDate: string;
  validityDays: number; // 7, 14, 30 days
  lineItems: QuotationLineItem[];
  subtotal: number;
  tax: number; // 11% PPN
  total: number;
  status: QuotationStatus;
  notes?: string;
}

// ── Project ─────────────────────────────────────────────────

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  clientId: string;
  clientName: string;
  pmId: string;
  pmName: string;
  status: ProjectStatus;
  billingType: BillingType;
  packageTier?: PackageTierType;
  packageServices?: string[];
  contractStartDate?: string;
  contractEndDate?: string;
  monthlyRetainerFee?: number;
  contractValue: number;
  budget: number;
  actualCost: number;
  startDate: string;
  endDate: string;
  description?: string;
  members: ProjectMember[];
  addOns: AddOn[];
  milestones: Milestone[];
  subTeams: SubTeam[];
  reports: ProjectReport[];
  activities: ProjectActivity[];
  createdAt: string;
}

export interface ProjectReport {
  id: string;
  projectId: string;
  week: 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4' | 'Full Month';
  status: 'On Going' | 'Sent';
  performanceScore: number; // e.g. out of 100
  notes?: string;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  userName: string;
  action: string; // e.g., 'mengubah status tugas', 'menambahkan report'
  target: string; // e.g., 'Desain Logo Utama', 'Week 1'
  timestamp: string; // ISO date
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  role: string;
  subTeam: SubTeam;
  billableRate: number; // per hour
  costRate: number; // per hour (snapshot)
}

export interface AddOn {
  id: string;
  projectId: string;
  name: string;
  category: string; // Budget Ads, KOL, sewa, talent, dll
  procurementCost: number;
  billingPrice: number; // markup
  invoiced: boolean;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  dueDate: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeId: string;
  assigneeName: string;
  subTeam: SubTeam;
  status: TaskStatus;
  priority: TaskPriority;
  phase?: 'pra' | 'ongoing' | 'post'; // Added for Gantt Chart phases
  evidenceLink?: string; // Added for task submission
  estimatedHours: number;
  loggedHours: number;
  startDate?: string;
  dueDate: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId: string;
  userId: string;
  userName: string;
  date: string;
  hours: number;
  isBillable: boolean;
  isOvertime: boolean;
  description: string;
  costRateSnapshot: number;
  billableRateSnapshot: number;
}

// ── Finance ─────────────────────────────────────────────────

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface InvoiceLineItem {
  id: string;
  type: 'service' | 'addon';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Expense {
  id: string;
  organizationId: string;
  projectId?: string;
  projectName?: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  isReimbursement: boolean;
}

// ── HR ──────────────────────────────────────────────────────

export interface Employee {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  avatar?: string;
  department: SubTeam;
  position: string;
  roles: Role[];
  monthlySalary: number;
  standardHoursPerMonth: number;
  costRate: number; // derived: salary / hours
  billableRate: number;
  joinDate: string;
  isActive: boolean;
}

// ── Dashboard ────────────────────────────────────────────────

export interface DashboardMetrics {
  revenueMtd: number;
  revenueYtd: number;
  revenueTarget: number;
  grossMarginPercent: number;
  arOutstanding: number;
  utilizationRate: number;
  activeProjects: number;
  activeClients: number;
  totalClients: number;
  wip: number; // work in progress (unbilled)
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ProjectProfitability {
  projectId: string;
  projectName: string;
  clientName: string;
  revenue: number;
  laborCost: number;
  directCost: number;
  grossProfit: number;
  margin: number;
  status: ProjectStatus;
}

// ── Utility ──────────────────────────────────────────────────

// ── Package Tier & Deliverables ─────────────────────────────────

export type PackageTierType = 'TIER_A' | 'TIER_B' | 'TIER_C' | 'CUSTOM';

export interface PackageTier {
  tier: PackageTierType;
  name: string; // e.g. "Tier A (Enterprise Full Agency)"
  services: string[]; // ['SMS', 'CC', 'Production', 'Design', 'Ecommerce', 'Performance']
  monthlyRetainer: number;
}

// ── Project Addons & Ads Spend ───────────────────────────────

export type AddOnCategoryType = 'TALENT_KOL' | 'PRINTING' | 'MEDIA_PLACEMENT' | 'ADS_BUDGET' | 'OTHERS';

export interface ExtendedProjectAddOn {
  id: string;
  projectId: string;
  clientId: string;
  periodMonth: string; // YYYY-MM
  category: AddOnCategoryType;
  description: string;
  amount: number;
  receiptUrl?: string;
  status: 'pending_billing' | 'invoiced' | 'paid';
  createdBy: string;
}

export type AdsPlatform = 'META_ADS' | 'GOOGLE_ADS' | 'TIKTOK_ADS' | 'SHOPEE_ADS' | 'TOKOPEDIA_ADS';

export interface AdsSpendRecord {
  id: string;
  projectId: string;
  clientId: string;
  periodMonth: string; // YYYY-MM
  platform: AdsPlatform;
  allocatedBudget: number;
  actualSpend: number;
  status: 'unbilled' | 'invoiced';
  loggedBy: string;
}

// ── Divisional Weekly Report ─────────────────────────────────

export interface DivisionalWeeklyReport {
  id: string;
  projectId: string;
  weekNumber: number;
  periodStart: string;
  periodEnd: string;
  brandingNotes?: string;
  sosmedNotes?: string;
  performanceNotes?: string;
  designNotes?: string;
  productionNotes?: string;
  pmSummary?: string;
  status: 'draft' | 'approved_pm' | 'sent_to_client';
  updatedAt: string;
}

// ── Chart of Accounts & General Ledger ───────────────────────

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface ChartOfAccount {
  id: string;
  accountCode: string; // e.g. '1-1001', '4-1000'
  accountName: string; // e.g. 'Kas Utama', 'Pendapatan Retainer Agency'
  accountType: AccountType;
  isActive: boolean;
  isSystemProtected?: boolean;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. 'JV/2026/07/001'
  entryDate: string;
  description: string;
  referenceType?: 'INVOICE' | 'PAYROLL' | 'REIMBURSEMENT' | 'MANUAL';
  referenceId?: string;
  lines: JournalLine[];
  status: 'draft' | 'posted' | 'voided';
  createdBy: string;
}

export interface CashFlowItem {
  category: 'OPERATING' | 'INVESTING' | 'FINANCING';
  description: string;
  amount: number;
}

// ── Enhanced Payroll Components ──────────────────────────────

export interface EmployeePayrollDetail {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  performanceAllowance: number;
  attendanceAllowance: number;
  bonus: number;
  overtimePay: number;
  taxDeduction: number;
  bpjsDeduction: number;
  totalNetSalary: number;
  periodMonth: string;
  status: 'draft' | 'approved_ceo' | 'paid';
}

// ── Utility ──────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n);
}

