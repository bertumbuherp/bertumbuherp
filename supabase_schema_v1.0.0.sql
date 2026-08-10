-- ====================================================================
-- 🚀 SUPABASE POSTGRESQL DATABASE SCHEMA MIGRATION SCRIPT (v1.0.0)
-- 🏢 PROYEK: BERTUMBUH AGENCY ERP - ALL 5 DIVISIONS
-- ====================================================================
-- Eksekusi script SQL ini di Supabase SQL Editor untuk memperbarui
-- struktur tabel, relasi foreign key, indeks, RLS policy, dan data master.
-- ====================================================================

-- --------------------------------------------------------------------
-- 📁 DIVISI 1: PROJECT MANAGER (PM) & PACKAGE TIER
-- --------------------------------------------------------------------

-- 1.1 Update/Create Table: projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress',
    package_tier VARCHAR(20) DEFAULT 'TIER_B', -- 'TIER_A', 'TIER_B', 'TIER_C', 'CUSTOM'
    package_services TEXT[] DEFAULT '{}', -- e.g. ARRAY['Social Media', 'Content Creation', 'Design']
    monthly_retainer_fee NUMERIC(15,2) DEFAULT 0,
    contract_start_date DATE,
    contract_end_date DATE,
    progress_percentage INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom baru terkonfigurasi jika tabel projects sudah ada sebelumnya:
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS package_tier VARCHAR(20) DEFAULT 'TIER_B';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS package_services TEXT[] DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS monthly_retainer_fee NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS contract_start_date DATE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS contract_end_date DATE;

-- 1.2 Table Baru: project_add_ons (Item 1.4)
CREATE TABLE IF NOT EXISTS public.project_add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'TALENT_KOL', 'PRINTING', 'MEDIA_PLACEMENT', 'VENUE_RENTAL', 'OTHER'
    name TEXT NOT NULL,
    vendor_name TEXT,
    cost_price NUMERIC(15,2) DEFAULT 0,
    billed_price NUMERIC(15,2) DEFAULT 0,
    margin_profit NUMERIC(15,2) GENERATED ALWAYS AS (billed_price - cost_price) STORED,
    status VARCHAR(20) DEFAULT 'unbilled', -- 'unbilled', 'invoiced', 'paid'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Table Baru: team_meetings (Item 1.5)
CREATE TABLE IF NOT EXISTS public.team_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'TEAM_BRANDING', 'TEAM_SOSMED', 'TEAM_PERFORMANCE', 'GENERAL_SYNC'
    meeting_date TIMESTAMPTZ NOT NULL,
    meeting_mode VARCHAR(20) DEFAULT 'online', -- 'online', 'offline'
    location_or_link TEXT,
    notes TEXT,
    invitees TEXT[] DEFAULT '{}',
    google_calendar_event_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Table Baru: google_calendar_credentials (Item 1.2)
CREATE TABLE IF NOT EXISTS public.google_calendar_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    connected_email TEXT NOT NULL,
    is_connected BOOLEAN DEFAULT TRUE,
    auto_sync_enabled BOOLEAN DEFAULT TRUE,
    access_token TEXT,
    refresh_token TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- --------------------------------------------------------------------
-- 📁 DIVISI 2: ACCOUNT EXECUTIVE (AE)
-- --------------------------------------------------------------------

-- 2.1 Table Baru: quotations (Item 2.1 & 2.3)
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID,
    client_name TEXT NOT NULL,
    package_tier VARCHAR(20) DEFAULT 'TIER_B',
    total_nominal NUMERIC(15,2) NOT NULL,
    valid_until DATE,
    scope_items JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Table Baru: contracts (Item 2.2)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_address TEXT,
    client_pic TEXT,
    retainer_fee NUMERIC(15,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    terms_and_conditions TEXT,
    digital_signature_url TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'draft', 'active', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Table Baru: pitching_schedules (Item 2.4)
CREATE TABLE IF NOT EXISTS public.pitching_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_name TEXT NOT NULL,
    pitch_date TIMESTAMPTZ NOT NULL,
    meeting_mode VARCHAR(20) DEFAULT 'online', -- 'online', 'offline'
    meeting_link TEXT,
    invitees TEXT[] DEFAULT '{}',
    outcome VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'won', 'lost', 'rescheduled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- --------------------------------------------------------------------
-- 📁 DIVISI 3: TEAM PELAKSANA (DESIGN, PRODUCTION, PERFORMANCE)
-- --------------------------------------------------------------------

-- 3.1 Table Baru: employee_workloads (Item 3.1)
CREATE TABLE IF NOT EXISTS public.employee_workloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    user_name TEXT NOT NULL,
    weekly_hours_allocated NUMERIC(5,2) DEFAULT 0, -- Threshold max 40 hours/week
    capacity_status VARCHAR(20) DEFAULT 'ideal', -- 'ideal', 'overloaded', 'available'
    active_tasks_count INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Table Baru: ads_budget_records (Item 3.2)
CREATE TABLE IF NOT EXISTS public.ads_budget_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'META_ADS', 'GOOGLE_ADS', 'TIKTOK_ADS', 'SHOPEE_ADS'
    budget_allocated NUMERIC(15,2) NOT NULL,
    budget_spent NUMERIC(15,2) DEFAULT 0,
    billing_sync_status VARCHAR(20) DEFAULT 'unbilled', -- 'unbilled', 'synced_to_finance', 'billed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Table Baru: weekly_divisional_reports (Item 3.3)
CREATE TABLE IF NOT EXISTS public.weekly_divisional_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INT NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    division_name VARCHAR(50) NOT NULL, -- 'Design', 'Social Media', 'Video Production', 'Performance'
    accomplishments TEXT,
    blockers TEXT,
    next_week_plan TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- --------------------------------------------------------------------
-- 📁 DIVISI 4: FINANCE & ACCOUNTING
-- --------------------------------------------------------------------

-- 4.1 Table Baru: chart_of_accounts (COA Master) (Item 4.5)
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    account_category VARCHAR(50) NOT NULL, -- 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'
    normal_balance VARCHAR(10) NOT NULL, -- 'Debet', 'Kredit'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Table Baru: journal_entries (Jurnal & Buku Besar) (Item 4.4, 4.7, 4.8)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT, -- Invoice ID, Reimburs ID, Payroll ID
    is_simulation BOOLEAN DEFAULT FALSE, -- Mode Simulasi (Trial Run)
    status VARCHAR(20) DEFAULT 'posted', -- 'posted', 'void'
    voided_at TIMESTAMPTZ,
    void_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 Table Baru: journal_lines (Detail Debet/Kredit per Akun) (Item 4.7)
CREATE TABLE IF NOT EXISTS public.journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_code VARCHAR(20) REFERENCES public.chart_of_accounts(account_code) ON UPDATE CASCADE,
    account_name TEXT NOT NULL,
    debit NUMERIC(15,2) DEFAULT 0,
    credit NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 Table Baru: invoices (Item 4.3 & 4.10)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    retainer_amount NUMERIC(15,2) DEFAULT 0,
    kol_add_on_amount NUMERIC(15,2) DEFAULT 0,
    ads_spend_reimburse_amount NUMERIC(15,2) DEFAULT 0,
    subtotal NUMERIC(15,2) NOT NULL,
    tax_amount NUMERIC(15,2) DEFAULT 0,
    grand_total NUMERIC(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'paid', 'overdue', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.5 Table Baru: reimbursements (Item 4.6)
CREATE TABLE IF NOT EXISTS public.reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claimant_name TEXT NOT NULL,
    category TEXT NOT NULL,
    nominal NUMERIC(15,2) NOT NULL,
    receipt_photo_url TEXT, -- Attachment Foto Nota
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- --------------------------------------------------------------------
-- 📁 DIVISI 5: HR & PEOPLE OPERATIONS
-- --------------------------------------------------------------------

-- 5.1 Table Baru: client_allocations (Item 5.1)
CREATE TABLE IF NOT EXISTS public.client_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    department TEXT NOT NULL,
    client_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    allocation_percent NUMERIC(5,2) NOT NULL, -- e.g. 40.00%
    hours_per_week INT DEFAULT 0,
    role_in_project TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2 Table Baru: employee_leaves (Item 5.2)
CREATE TABLE IF NOT EXISTS public.employee_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- 'Tahunan', 'Sakit', 'Melahirkan', 'Penting'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INT NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved_pm', 'approved_hr', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3 Table Baru: employee_performance_metrics (Item 5.3)
CREATE TABLE IF NOT EXISTS public.employee_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    total_tasks INT DEFAULT 0,
    on_time_tasks INT DEFAULT 0,
    overdue_tasks INT DEFAULT 0,
    overdue_rate NUMERIC(5,2) DEFAULT 0, -- e.g. 5.80%
    avg_delay_days NUMERIC(4,2) DEFAULT 0,
    discipline_rating NUMERIC(3,2) DEFAULT 5.00, -- 1.00 - 5.00
    hr_recommendation TEXT, -- 'Bonus & Apresiasi', 'Kinerja Baik', 'Perlu Monitoring'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.4 Table Baru: payroll_records (Item 4.1 & 4.2)
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    base_salary NUMERIC(15,2) NOT NULL,
    allowance NUMERIC(15,2) DEFAULT 0,
    overtime_pay NUMERIC(15,2) DEFAULT 0,
    deductions NUMERIC(15,2) DEFAULT 0,
    net_pay NUMERIC(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ====================================================================
-- 📦 SEED DATA MASTER COA (CHART OF ACCOUNTS)
-- ====================================================================
INSERT INTO public.chart_of_accounts (account_code, account_name, account_category, normal_balance)
VALUES 
    ('1010', 'Kas Utama & Bank Mandiri', 'Asset', 'Debet'),
    ('1020', 'Piutang Usaha Retainer Klien', 'Asset', 'Debet'),
    ('1030', 'Piutang Reimbursement Ads Spend', 'Asset', 'Debet'),
    ('1040', 'Uang Muka Operasional & Vendor', 'Asset', 'Debet'),
    ('2010', 'Hutang Gaji & Payroll Karyawan', 'Liability', 'Kredit'),
    ('2020', 'Hutang Fee Talent & KOL', 'Liability', 'Kredit'),
    ('2030', 'Hutang Pajak PPh 21 / PPh 23', 'Liability', 'Kredit'),
    ('3010', 'Modal Disetor Pemegang Saham', 'Equity', 'Kredit'),
    ('3020', 'Laba Ditahan (Retained Earnings)', 'Equity', 'Kredit'),
    ('4010', 'Pendapatan Retainer Agency', 'Revenue', 'Kredit'),
    ('4020', 'Pendapatan Add-on KOL Talent & Production', 'Revenue', 'Kredit'),
    ('5010', 'Beban Gaji & Tunjangan Karyawan', 'Expense', 'Debet'),
    ('5020', 'Beban Lembur & Overtime', 'Expense', 'Debet'),
    ('5030', 'Beban Media Placement & Ads Spend', 'Expense', 'Debet'),
    ('5040', 'Beban Operasional Kantor & Utilities', 'Expense', 'Debet')
ON CONFLICT (account_code) DO NOTHING;


-- ====================================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
-- ====================================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitching_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_workloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_budget_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_divisional_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated/app users full access to ERP tables
DO $$ 
DECLARE 
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow all access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

-- Script Selesai!

