import { Client, Deal, Project, Task, Invoice, Employee, TimeEntry, Expense, DashboardMetrics, RevenueDataPoint, ProjectProfitability, Organization } from '../../lib/types';

export const org: Organization = {
  id: 'org_bertumbuh',
  name: 'Bertumbuh Creative',
  slug: 'bertumbuh',
  revenueTarget: 150000000,
  utilizationTarget: 80,
  createdAt: '2023-01-01',
};

export const dashboardMetrics: DashboardMetrics = {
  revenueMtd: 87500000,
  revenueYtd: 420000000,
  revenueTarget: 150000000,
  grossMarginPercent: 42.3,
  arOutstanding: 63000000,
  utilizationRate: 73,
  activeProjects: 8,
  activeClients: 12,
  totalClients: 18,
  wip: 24500000,
};

export const revenueData: RevenueDataPoint[] = [
  { month: 'Des', revenue: 98000000, cost: 58000000, profit: 40000000 },
  { month: 'Jan', revenue: 112000000, cost: 65000000, profit: 47000000 },
  { month: 'Feb', revenue: 95000000, cost: 60000000, profit: 35000000 },
  { month: 'Mar', revenue: 125000000, cost: 72000000, profit: 53000000 },
  { month: 'Apr', revenue: 108000000, cost: 63000000, profit: 45000000 },
  { month: 'Mei', revenue: 87500000, cost: 50500000, profit: 37000000 },
];

export const projectProfitability: ProjectProfitability[] = [
  { projectId: 'p1', projectName: 'Brand Revamp Q2', clientName: 'PT Maju Bersama', revenue: 45000000, laborCost: 18000000, directCost: 5000000, grossProfit: 22000000, margin: 48.9, status: 'on_track' },
  { projectId: 'p2', projectName: 'Social Media Retainer', clientName: 'Kopi Nusantara', revenue: 25000000, laborCost: 12000000, directCost: 3500000, grossProfit: 9500000, margin: 38.0, status: 'on_track' },
  { projectId: 'p3', projectName: 'Campaign Lebaran', clientName: 'Batik Wastra', revenue: 38000000, laborCost: 20000000, directCost: 12000000, grossProfit: 6000000, margin: 15.8, status: 'at_risk' },
  { projectId: 'p4', projectName: 'Performance Ads Q2', clientName: 'Edu Academy', revenue: 18000000, laborCost: 8000000, directCost: 4000000, grossProfit: 6000000, margin: 33.3, status: 'on_track' },
  { projectId: 'p5', projectName: 'Video Production', clientName: 'PT Maju Bersama', revenue: 32000000, laborCost: 22000000, directCost: 8000000, grossProfit: 2000000, margin: 6.3, status: 'delayed' },
];

export const clients: Client[] = [
  { id: 'c1', organizationId: 'org_bertumbuh', name: 'PT Maju Bersama', industry: 'FMCG', status: 'active', contacts: [{ id: 'ct1', clientId: 'c1', name: 'Budi Santoso', role: 'Marketing Manager', email: 'budi@majubersama.co.id', phone: '0812-0001-1111' }], ownedByAe: 'u3', totalRevenue: 180000000, activeProjects: 2, createdAt: '2023-03-15' },
  { id: 'c2', organizationId: 'org_bertumbuh', name: 'Kopi Nusantara', industry: 'F&B', status: 'active', contacts: [{ id: 'ct2', clientId: 'c2', name: 'Sari Dewi', role: 'Brand Director', email: 'sari@kopinusantara.id', phone: '0813-0002-2222' }], ownedByAe: 'u3', totalRevenue: 95000000, activeProjects: 1, createdAt: '2023-07-20' },
  { id: 'c3', organizationId: 'org_bertumbuh', name: 'Batik Wastra', industry: 'Fashion', status: 'active', contacts: [{ id: 'ct3', clientId: 'c3', name: 'Rina Kusuma', role: 'Owner', email: 'rina@batikwastra.com', phone: '0821-0003-3333' }], ownedByAe: 'u3', totalRevenue: 62000000, activeProjects: 1, createdAt: '2026-01-10' },
  { id: 'c4', organizationId: 'org_bertumbuh', name: 'Edu Academy', industry: 'Pendidikan', status: 'active', contacts: [{ id: 'ct4', clientId: 'c4', name: 'Hendra Wijaya', role: 'CEO', email: 'hendra@eduacademy.id' }], ownedByAe: 'u3', totalRevenue: 48000000, activeProjects: 1, createdAt: '2026-02-28' },
  { id: 'c5', organizationId: 'org_bertumbuh', name: 'Teknologi Muda', industry: 'Teknologi', status: 'prospect', contacts: [{ id: 'ct5', clientId: 'c5', name: 'Agus Prasetyo', role: 'CTO', email: 'agus@tekno-muda.com' }], ownedByAe: 'u3', totalRevenue: 0, activeProjects: 0, createdAt: '2026-05-01' },
  { id: 'c6', organizationId: 'org_bertumbuh', name: 'Properti Andalan', industry: 'Properti', status: 'prospect', contacts: [{ id: 'ct6', clientId: 'c6', name: 'Maya Sari', role: 'Marketing Dir', email: 'maya@propertian.co.id' }], ownedByAe: 'u3', totalRevenue: 0, activeProjects: 0, createdAt: '2026-05-15' },
  { id: 'c7', organizationId: 'org_bertumbuh', name: 'HealthPlus Clinic', industry: 'Kesehatan', status: 'inactive', contacts: [{ id: 'ct7', clientId: 'c7', name: 'dr. Reza', role: 'Direktur', email: 'reza@healthplus.id' }], ownedByAe: 'u3', totalRevenue: 35000000, activeProjects: 0, createdAt: '2026-05-10' },
];

export const deals: Deal[] = [
  { id: 'd1', organizationId: 'org_bertumbuh', clientName: 'Teknologi Muda', title: 'Brand Identity & Digital Launch', stage: 'pitching', value: 85000000, probability: 60, aeId: 'u3', aeName: 'Andi Firmansyah', source: 'Referral', createdAt: '2026-05-01', updatedAt: '2026-05-20' },
  { id: 'd2', organizationId: 'org_bertumbuh', clientName: 'Properti Andalan', title: 'Social Media Management 6 Bulan', stage: 'negosiasi', value: 72000000, probability: 75, aeId: 'u3', aeName: 'Andi Firmansyah', source: 'LinkedIn', createdAt: '2026-05-15', updatedAt: '2026-05-27' },
  { id: 'd3', organizationId: 'org_bertumbuh', clientName: 'Resto Padang Emas', title: 'Performance Marketing Package', stage: 'penawaran', value: 48000000, probability: 40, aeId: 'u3', aeName: 'Andi Firmansyah', source: 'Cold Outreach', createdAt: '2026-05-10', updatedAt: '2026-05-22' },
  { id: 'd4', organizationId: 'org_bertumbuh', clientName: 'Studio Animasi Kreatif', title: 'Video Content Series', stage: 'kualifikasi', value: 35000000, probability: 25, aeId: 'u3', aeName: 'Andi Firmansyah', source: 'Instagram', createdAt: '2026-05-20', updatedAt: '2026-05-25' },
  { id: 'd5', organizationId: 'org_bertumbuh', clientName: 'Toko Online Segar', title: 'Paket Brand + Sosmed', stage: 'lead', value: 55000000, probability: 15, aeId: 'u3', aeName: 'Andi Firmansyah', source: 'Event', createdAt: '2026-05-25', updatedAt: '2026-05-26' },
  { id: 'd6', organizationId: 'org_bertumbuh', clientName: 'Konveksi Jaya', clientId: 'c7', title: 'Rebranding Package', stage: 'won', value: 62000000, probability: 100, aeId: 'u3', aeName: 'Andi Firmansyah', source: 'Referral', createdAt: '2026-04-10', updatedAt: '2026-05-05' },
  { id: 'd7', organizationId: 'org_bertumbuh', clientName: 'Startup Finance App', title: 'Digital Campaign', stage: 'lost', value: 40000000, probability: 0, aeId: 'u3', aeName: 'Andi Firmansyah', source: 'Cold Email', notes: 'Budget terlalu kecil', createdAt: '2026-04-20', updatedAt: '2026-05-10' },
];

export const projects: Project[] = [
  { id: 'p1', organizationId: 'org_bertumbuh', name: 'Brand Revamp Q2', clientId: 'c1', clientName: 'PT Maju Bersama', pmId: 'u4', pmName: 'Dewi Lestari', status: 'on_track', billingType: 'project', packageTier: 'TIER_A', packageServices: ['SMS', 'CC', 'Production', 'Design', 'Ecommerce', 'Performance'], contractStartDate: '2026-04-01', contractEndDate: '2026-06-30', monthlyRetainerFee: 15000000, contractValue: 45000000, budget: 28000000, actualCost: 23000000, startDate: '2026-04-01', endDate: '2026-06-30', members: [{id:'m1', projectId:'p1', userId:'u6', userName:'Risa Amalia', role:'Brand Strategist', subTeam:'Brand', billableRate:150000, costRate:50000}, {id:'m2', projectId:'p1', userId:'u7', userName:'Dimas Prasetyo', role:'Senior Designer', subTeam:'Design', billableRate:120000, costRate:40000}], addOns: [{ id: 'ao1', projectId: 'p1', name: 'Foto Produk', category: 'Produksi', procurementCost: 3500000, billingPrice: 5000000, invoiced: true }], milestones: [{ id: 'm1', projectId: 'p1', name: 'Konsep Disetujui', dueDate: '2026-04-15', completed: true }, { id: 'm2', projectId: 'p1', name: 'Desain Final', dueDate: '2026-06-30', completed: false }], subTeams: ['Brand', 'Design'], reports: [{id: 'r1', projectId: 'p1', week: 'Week 1', status: 'Sent', performanceScore: 85, notes: 'Awal yang baik'}], activities: [{id: 'a1', projectId: 'p1', userName: 'Dewi Lestari', action: 'membuat proyek', target: 'Brand Revamp Q2', timestamp: '2026-04-01T10:00:00Z'}], createdAt: '2026-04-01' },
  { id: 'p2', organizationId: 'org_bertumbuh', name: 'Social Media Retainer Mei', clientId: 'c2', clientName: 'Kopi Nusantara', pmId: 'u4', pmName: 'Dewi Lestari', status: 'on_track', billingType: 'retainer', packageTier: 'TIER_B', packageServices: ['Sosmed/CC', 'Design', 'Performance'], contractStartDate: '2026-05-01', contractEndDate: '2026-06-30', monthlyRetainerFee: 25000000, contractValue: 25000000, budget: 18000000, actualCost: 15500000, startDate: '2026-05-01', endDate: '2026-06-30', members: [], addOns: [], milestones: [], subTeams: ['Sosmed/CC', 'Design'], reports: [], activities: [], createdAt: '2026-05-01' },
  { id: 'p3', organizationId: 'org_bertumbuh', name: 'Campaign Lebaran', clientId: 'c3', clientName: 'Batik Wastra', pmId: 'u4', pmName: 'Dewi Lestari', status: 'at_risk', billingType: 'project', packageTier: 'TIER_A', packageServices: ['Brand', 'Sosmed/CC', 'Production', 'Performance'], contractStartDate: '2026-03-15', contractEndDate: '2026-06-25', monthlyRetainerFee: 38000000, contractValue: 38000000, budget: 30000000, actualCost: 32000000, startDate: '2026-03-15', endDate: '2026-06-25', members: [], addOns: [{ id: 'ao2', projectId: 'p3', name: 'Budget Ads Meta', category: 'Budget Ads', procurementCost: 8000000, billingPrice: 8500000, invoiced: false }, { id: 'ao3', projectId: 'p3', name: 'KOL Instagram', category: 'KOL', procurementCost: 5000000, billingPrice: 6500000, invoiced: false }], milestones: [], subTeams: ['Brand', 'Sosmed/CC', 'Performance'], reports: [], activities: [], createdAt: '2026-03-15' },
  { id: 'p4', organizationId: 'org_bertumbuh', name: 'Performance Ads Q2', clientId: 'c4', clientName: 'Edu Academy', pmId: 'u4', pmName: 'Dewi Lestari', status: 'on_track', billingType: 'retainer', packageTier: 'TIER_C', packageServices: ['Performance'], contractStartDate: '2026-04-01', contractEndDate: '2026-06-30', monthlyRetainerFee: 18000000, contractValue: 18000000, budget: 12000000, actualCost: 9000000, startDate: '2026-04-01', endDate: '2026-06-30', members: [], addOns: [], milestones: [], subTeams: ['Performance'], reports: [], activities: [], createdAt: '2026-04-01' },
  { id: 'p5', organizationId: 'org_bertumbuh', name: 'Video Production Series', clientId: 'c1', clientName: 'PT Maju Bersama', pmId: 'u4', pmName: 'Dewi Lestari', status: 'delayed', billingType: 'project', packageTier: 'CUSTOM', packageServices: ['Produksi', 'Design'], contractStartDate: '2026-04-15', contractEndDate: '2026-06-30', monthlyRetainerFee: 32000000, contractValue: 32000000, budget: 25000000, actualCost: 30000000, startDate: '2026-04-15', endDate: '2026-06-30', members: [], addOns: [{ id: 'ao4', projectId: 'p5', name: 'Sewa Studio', category: 'Sewa', procurementCost: 4000000, billingPrice: 5000000, invoiced: true }], milestones: [], subTeams: ['Produksi', 'Design'], reports: [], activities: [], createdAt: '2026-04-15' },
];

export const tasks: Task[] = [
  { id: 't1', projectId: 'p1', title: 'Riset kompetitor & mood board', assigneeId: 'u6', assigneeName: 'Risa Amalia', subTeam: 'Brand', status: 'done', priority: 'high', estimatedHours: 8, loggedHours: 9, dueDate: '2026-04-10', createdAt: '2026-04-01', phase: 'pra' },
  { id: 't2', projectId: 'p1', title: 'Desain logo utama 3 konsep', assigneeId: 'u7', assigneeName: 'Dimas Prasetyo', subTeam: 'Design', status: 'in_progress', priority: 'high', estimatedHours: 16, loggedHours: 10, dueDate: '2026-06-25', createdAt: '2026-04-15', phase: 'ongoing' },
  { id: 't3', projectId: 'p1', title: 'Brand guideline document', assigneeId: 'u7', assigneeName: 'Dimas Prasetyo', subTeam: 'Design', status: 'todo', priority: 'medium', estimatedHours: 12, loggedHours: 0, dueDate: '2026-06-28', createdAt: '2026-04-15', phase: 'ongoing' },
  { id: 't4', projectId: 'p1', title: 'Presentasi final ke klien', assigneeId: 'u4', assigneeName: 'Dewi Lestari', subTeam: 'Brand', status: 'todo', priority: 'high', estimatedHours: 4, loggedHours: 0, dueDate: '2026-06-30', createdAt: '2026-04-15', phase: 'post' },
  { id: 't5', projectId: 'p2', title: 'Konten feed Instagram 15 post', assigneeId: 'u6', assigneeName: 'Risa Amalia', subTeam: 'Sosmed/CC', status: 'in_progress', priority: 'high', estimatedHours: 20, loggedHours: 14, dueDate: '2026-06-28', createdAt: '2026-05-01' },
  { id: 't6', projectId: 'p2', title: 'Desain template konten', assigneeId: 'u7', assigneeName: 'Dimas Prasetyo', subTeam: 'Design', status: 'done', priority: 'medium', estimatedHours: 8, loggedHours: 7, dueDate: '2026-05-05', createdAt: '2026-05-01' },
  { id: 't7', projectId: 'p3', title: 'Strategi kampanye Lebaran', assigneeId: 'u6', assigneeName: 'Risa Amalia', subTeam: 'Brand', status: 'done', priority: 'high', estimatedHours: 10, loggedHours: 12, dueDate: '2026-03-25', createdAt: '2026-03-15' },
  { id: 't8', projectId: 'p3', title: 'Setup & optimasi Meta Ads', assigneeId: 'u8', assigneeName: 'Bagas Eko', subTeam: 'Performance', status: 'in_progress', priority: 'high', estimatedHours: 15, loggedHours: 18, dueDate: '2026-06-20', createdAt: '2026-04-01' },
  { id: 't9', projectId: 'p3', title: 'Review & laporan akhir', assigneeId: 'u4', assigneeName: 'Dewi Lestari', subTeam: 'Brand', status: 'review', priority: 'medium', estimatedHours: 6, loggedHours: 4, dueDate: '2026-06-24', createdAt: '2026-05-10' },
];

export const invoices: Invoice[] = [
  { id: 'inv1', organizationId: 'org_bertumbuh', invoiceNumber: 'INV-2026-042', projectId: 'p1', projectName: 'Brand Revamp Q2', clientId: 'c1', clientName: 'PT Maju Bersama', status: 'paid', issueDate: '2026-04-30', dueDate: '2026-05-14', paidDate: '2026-05-10', lineItems: [{ id: 'li1', type: 'service', description: 'Jasa Branding Fase 1', quantity: 1, unitPrice: 22500000, total: 22500000 }, { id: 'li2', type: 'addon', description: 'Foto Produk', quantity: 1, unitPrice: 5000000, total: 5000000 }], subtotal: 27500000, tax: 2750000, total: 30250000 },
  { id: 'inv2', organizationId: 'org_bertumbuh', invoiceNumber: 'INV-2026-045', projectId: 'p2', projectName: 'Social Media Retainer', clientId: 'c2', clientName: 'Kopi Nusantara', status: 'sent', issueDate: '2026-05-01', dueDate: '2026-05-15', lineItems: [{ id: 'li3', type: 'service', description: 'Retainer Sosial Media Mei', quantity: 1, unitPrice: 25000000, total: 25000000 }], subtotal: 25000000, tax: 2500000, total: 27500000 },
  { id: 'inv3', organizationId: 'org_bertumbuh', invoiceNumber: 'INV-2026-043', projectId: 'p3', projectName: 'Campaign Lebaran', clientId: 'c3', clientName: 'Batik Wastra', status: 'overdue', issueDate: '2026-04-20', dueDate: '2026-05-04', lineItems: [{ id: 'li4', type: 'service', description: 'Jasa Kampanye Lebaran', quantity: 1, unitPrice: 38000000, total: 38000000 }], subtotal: 38000000, tax: 3800000, total: 41800000 },
  { id: 'inv4', organizationId: 'org_bertumbuh', invoiceNumber: 'INV-2026-046', projectId: 'p4', projectName: 'Performance Ads Q2', clientId: 'c4', clientName: 'Edu Academy', status: 'sent', issueDate: '2026-05-10', dueDate: '2026-05-24', lineItems: [{ id: 'li5', type: 'service', description: 'Performance Marketing April', quantity: 1, unitPrice: 18000000, total: 18000000 }], subtotal: 18000000, tax: 1800000, total: 19800000 },
  { id: 'inv5', organizationId: 'org_bertumbuh', invoiceNumber: 'INV-2026-040', projectId: 'p5', projectName: 'Video Production', clientId: 'c1', clientName: 'PT Maju Bersama', status: 'draft', issueDate: '2026-05-25', dueDate: '2026-06-08', lineItems: [{ id: 'li6', type: 'service', description: 'Produksi Video Series (3 ep)', quantity: 1, unitPrice: 27000000, total: 27000000 }, { id: 'li7', type: 'addon', description: 'Sewa Studio 2 Hari', quantity: 1, unitPrice: 5000000, total: 5000000 }], subtotal: 32000000, tax: 3200000, total: 35200000 },
];

export const employees: Employee[] = [
  { id: 'u1', organizationId: 'org_bertumbuh', name: 'Reza Pratama', email: 'reza@bertumbuh.id', department: 'Brand', position: 'Owner / Creative Director', roles: ['owner'], monthlySalary: 25000000, standardHoursPerMonth: 160, costRate: 156250, billableRate: 350000, joinDate: '2021-01-01', isActive: true },
  { id: 'u2', organizationId: 'org_bertumbuh', name: 'Laila Hasanah', email: 'laila@bertumbuh.id', department: 'Brand', position: 'Super Admin / Ops Manager', roles: ['super_admin'], monthlySalary: 15000000, standardHoursPerMonth: 160, costRate: 93750, billableRate: 250000, joinDate: '2021-03-01', isActive: true },
  { id: 'u3', organizationId: 'org_bertumbuh', name: 'Andi Firmansyah', email: 'andi@bertumbuh.id', department: 'Brand', position: 'Account Executive', roles: ['ae'], monthlySalary: 12000000, standardHoursPerMonth: 160, costRate: 75000, billableRate: 200000, joinDate: '2022-02-01', isActive: true },
  { id: 'u4', organizationId: 'org_bertumbuh', name: 'Dewi Lestari', email: 'dewi@bertumbuh.id', department: 'Brand', position: 'Project Manager', roles: ['pm'], monthlySalary: 13000000, standardHoursPerMonth: 160, costRate: 81250, billableRate: 220000, joinDate: '2022-05-01', isActive: true },
  { id: 'u5', organizationId: 'org_bertumbuh', name: 'Hadi Nugroho', email: 'hadi@bertumbuh.id', department: 'Brand', position: 'Finance Manager', roles: ['finance'], monthlySalary: 13000000, standardHoursPerMonth: 160, costRate: 81250, billableRate: 0, joinDate: '2022-06-01', isActive: true },
  { id: 'u6', organizationId: 'org_bertumbuh', name: 'Risa Amalia', email: 'risa@bertumbuh.id', department: 'Sosmed/CC', position: 'Content Creator Lead', roles: ['team_member'], monthlySalary: 9000000, standardHoursPerMonth: 160, costRate: 56250, billableRate: 150000, joinDate: '2022-09-01', isActive: true },
  { id: 'u7', organizationId: 'org_bertumbuh', name: 'Dimas Prasetyo', email: 'dimas@bertumbuh.id', department: 'Design', position: 'Senior Designer', roles: ['team_member'], monthlySalary: 10000000, standardHoursPerMonth: 160, costRate: 62500, billableRate: 175000, joinDate: '2023-01-01', isActive: true },
  { id: 'u8', organizationId: 'org_bertumbuh', name: 'Bagas Eko', email: 'bagas@bertumbuh.id', department: 'Performance', position: 'Performance Marketer', roles: ['team_member'], monthlySalary: 10500000, standardHoursPerMonth: 160, costRate: 65625, billableRate: 180000, joinDate: '2023-04-01', isActive: true },
  { id: 'u9', organizationId: 'org_bertumbuh', name: 'Siti Aminah', email: 'siti@bertumbuh.id', department: 'Brand', position: 'HR Manager', roles: ['hr'], monthlySalary: 11000000, standardHoursPerMonth: 160, costRate: 68750, billableRate: 0, joinDate: '2022-08-01', isActive: true },
];

export const expenses: Expense[] = [
  { id: 'ex1', organizationId: 'org_bertumbuh', projectId: 'p3', projectName: 'Campaign Lebaran', category: 'Produksi', description: 'Sewa properti foto', amount: 1500000, date: '2026-04-05', submittedBy: 'Risa Amalia', status: 'approved', isReimbursement: false },
  { id: 'ex2', organizationId: 'org_bertumbuh', projectId: 'p5', projectName: 'Video Production', category: 'Sewa', description: 'Sewa kamera cinema', amount: 3500000, date: '2026-04-20', submittedBy: 'Bagas Eko', status: 'approved', isReimbursement: false },
  { id: 'ex3', organizationId: 'org_bertumbuh', category: 'Operasional', description: 'Langganan software desain', amount: 850000, date: '2026-05-01', submittedBy: 'Dimas Prasetyo', status: 'approved', isReimbursement: true },
  { id: 'ex4', organizationId: 'org_bertumbuh', projectId: 'p3', projectName: 'Campaign Lebaran', category: 'Transport', description: 'Transport shoot lokasi', amount: 450000, date: '2026-04-10', submittedBy: 'Risa Amalia', status: 'pending', isReimbursement: true },
];

export const atRiskAlerts = [
  { id: 'a1', type: 'project_delayed', message: 'Video Production Series — terlambat 5 hari', projectId: 'p5', severity: 'high' as const },
  { id: 'a2', type: 'over_budget', message: 'Campaign Lebaran — 107% dari budget', projectId: 'p3', severity: 'high' as const },
  { id: 'a3', type: 'invoice_overdue', message: 'INV-2026-043 Batik Wastra — jatuh tempo 25 hari', severity: 'high' as const },
  { id: 'a4', type: 'invoice_overdue', message: 'INV-2026-045 Kopi Nusantara — jatuh tempo 14 hari', severity: 'medium' as const },
  { id: 'a5', type: 'timesheet', message: '3 anggota tim belum mengisi timesheet minggu ini', severity: 'low' as const },
];

export const currentUser = employees[3]; // PM — Dewi Lestari

// ── PM-specific data ──────────────────────────────────────────────────────────

export const overtimeEntries = [
  { id: 'ot1', employeeId: 'u6', employeeName: 'Risa Amalia', projectId: 'p3', projectName: 'Campaign Lebaran', date: '2026-05-20', hours: 3, reason: 'Revisi konten mendadak dari klien', status: 'approved' as const, approvedBy: 'Dewi Lestari' },
  { id: 'ot2', employeeId: 'u8', employeeName: 'Bagas Eko', projectId: 'p3', projectName: 'Campaign Lebaran', date: '2026-05-21', hours: 4, reason: 'Setup ulang Meta Ads — akun kena restrict', status: 'approved' as const, approvedBy: 'Dewi Lestari' },
  { id: 'ot3', employeeId: 'u7', employeeName: 'Dimas Prasetyo', projectId: 'p5', projectName: 'Video Production Series', date: '2026-05-22', hours: 5, reason: 'Editing video episode 3 — deadline maju', status: 'pending' as const, approvedBy: '' },
  { id: 'ot4', employeeId: 'u6', employeeName: 'Risa Amalia', projectId: 'p2', projectName: 'Social Media Retainer Mei', date: '2026-05-23', hours: 2, reason: 'Tambahan konten Instagram Stories 5 piece', status: 'pending' as const, approvedBy: '' },
  { id: 'ot5', employeeId: 'u7', employeeName: 'Dimas Prasetyo', projectId: 'p1', projectName: 'Brand Revamp Q2', date: '2026-05-18', hours: 3, reason: 'Revisi logo round 3 permintaan klien', status: 'approved' as const, approvedBy: 'Dewi Lestari' },
  { id: 'ot6', employeeId: 'u8', employeeName: 'Bagas Eko', projectId: 'p4', projectName: 'Performance Ads Q2', date: '2026-05-17', hours: 2, reason: 'A/B testing iklan baru', status: 'rejected' as const, approvedBy: 'Dewi Lestari' },
];

export const clientReports = [
  {
    id: 'cr1', projectId: 'p1', projectName: 'Brand Revamp Q2', clientName: 'PT Maju Bersama',
    period: 'Mei 2026', progressPercent: 65, status: 'on_track' as const,
    pmNote: 'Desain logo fase 2 sedang berjalan, estimasi selesai 30 Mei. Klien sudah approve konsep awal.',
    teamUpdates: [
      { subTeam: 'Brand', lead: 'Risa Amalia', update: 'Brand strategy dokumen sudah final dan disetujui klien.' },
      { subTeam: 'Design', lead: 'Dimas Prasetyo', update: 'Logo 3 konsep sudah diserahkan, menunggu feedback klien.' },
    ],
    nextMilestone: 'Presentasi desain final ke klien — 30 Mei 2026',
    lastUpdated: '2026-05-24',
  },
  {
    id: 'cr2', projectId: 'p2', projectName: 'Social Media Retainer Mei', clientName: 'Kopi Nusantara',
    period: 'Mei 2026', progressPercent: 80, status: 'on_track' as const,
    pmNote: 'Progress sesuai jadwal. 12 dari 15 konten feed sudah terpublish dengan rata-rata engagement 4.2%.',
    teamUpdates: [
      { subTeam: 'Sosmed/CC', lead: 'Risa Amalia', update: '12/15 post terpublish. 3 sisa dijadwalkan minggu ini.' },
      { subTeam: 'Design', lead: 'Dimas Prasetyo', update: 'Template sudah selesai, siap untuk bulan Juni.' },
    ],
    nextMilestone: 'Monthly report ke klien — 31 Mei 2026',
    lastUpdated: '2026-05-24',
  },
  {
    id: 'cr3', projectId: 'p3', projectName: 'Campaign Lebaran', clientName: 'Batik Wastra',
    period: 'Mei 2026', progressPercent: 95, status: 'at_risk' as const,
    pmNote: 'Kampanye sudah berakhir namun budget terlampaui 7%. Laporan akhir dan invoice sedang disusun.',
    teamUpdates: [
      { subTeam: 'Performance', lead: 'Bagas Eko', update: 'ROAS akhir 3.2x dari target 2.8x. Laporan ads sudah disiapkan.' },
      { subTeam: 'Sosmed/CC', lead: 'Risa Amalia', update: 'Semua konten Lebaran sudah terpublish. Total 48 post.' },
    ],
    nextMilestone: 'Laporan akhir kampanye ke klien — 27 Mei 2026',
    lastUpdated: '2026-05-24',
  },
  {
    id: 'cr4', projectId: 'p5', projectName: 'Video Production Series', clientName: 'PT Maju Bersama',
    period: 'Mei 2026', progressPercent: 40, status: 'delayed' as const,
    pmNote: 'Produksi episode 3 terlambat 5 hari akibat revisi naskah. Sedang negosiasi deadline baru dengan klien.',
    teamUpdates: [
      { subTeam: 'Produksi', lead: 'Bagas Eko', update: 'Ep. 1 & 2 sudah final. Ep. 3 masih proses editing.' },
      { subTeam: 'Design', lead: 'Dimas Prasetyo', update: 'Motion graphics ep. 3 sedang dikerjakan.' },
    ],
    nextMilestone: 'Delivery episode 3 — revisi deadline ke 5 Jun 2026',
    lastUpdated: '2026-05-24',
  },
];

// Team workload for PM view
export const teamWorkload = [
  { employeeId: 'u6', name: 'Risa Amalia', subTeam: 'Sosmed/CC', position: 'Content Creator Lead', activeProjects: 3, totalTasksThisWeek: 8, completedTasks: 5, pendingTasks: 3, hoursLogged: 32, hoursAvailable: 40, utilizationPercent: 80, currentFocus: 'Campaign Lebaran — konten akhir', avatarColor: 'var(--blue)' },
  { employeeId: 'u7', name: 'Dimas Prasetyo', subTeam: 'Design', position: 'Senior Designer', activeProjects: 3, totalTasksThisWeek: 6, completedTasks: 3, pendingTasks: 3, hoursLogged: 38, hoursAvailable: 40, utilizationPercent: 95, currentFocus: 'Brand Revamp Q2 — logo revision', avatarColor: 'var(--violet)' },
  { employeeId: 'u8', name: 'Bagas Eko', subTeam: 'Performance', position: 'Performance Marketer', activeProjects: 2, totalTasksThisWeek: 5, completedTasks: 4, pendingTasks: 1, hoursLogged: 36, hoursAvailable: 40, utilizationPercent: 90, currentFocus: 'Performance Ads Q2 — optimisasi', avatarColor: 'var(--green)' },
  { employeeId: 'u4', name: 'Dewi Lestari', subTeam: 'Brand', position: 'Project Manager', activeProjects: 5, totalTasksThisWeek: 10, completedTasks: 6, pendingTasks: 4, hoursLogged: 35, hoursAvailable: 40, utilizationPercent: 87, currentFocus: 'Koordinasi semua proyek aktif', avatarColor: 'var(--red)' },
];
