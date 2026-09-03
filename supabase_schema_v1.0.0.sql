-- ====================================================================
-- 🚀 SUPABASE POSTGRESQL DATABASE SCHEMA MIGRATION SCRIPT (v1.0.0)
-- 🏢 PROYEK: BERTUMBUH AGENCY ERP - COMPLETE 27 TABLES & SUPABASE AUTH
-- ====================================================================
-- Eksekusi script SQL ini di Supabase SQL Editor untuk membuat
-- seluruh 27 tabel, foreign key constraints, RLS policies, & data seed.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 📁 KELOMPOK 1: USER PROFILES & AUTHENTICATION (SUPABASE AUTH LINK)
-- --------------------------------------------------------------------

-- 1.1 Tabel Profiles (Terintegrasi dengan Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{"team_member"}',
    department TEXT DEFAULT 'Brand',
    position TEXT DEFAULT 'Staff',
    monthly_salary NUMERIC(15,2) DEFAULT 0,
    standard_hours_per_month INT DEFAULT 160,
    cost_rate NUMERIC(15,2) DEFAULT 0,
    billable_rate NUMERIC(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 📁 KELOMPOK 2: AUDIT LOGS & SYSTEM MONITORING
-- --------------------------------------------------------------------

-- 2.1 Tabel Log Aktivitas (Audit Trail Pengawas)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    module VARCHAR(50) NOT NULL, -- 'AUTH', 'USER_MGMT', 'CRM', 'PM', 'FINANCE', 'HR', 'SYSTEM'
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT
);

-- 2.2 Tabel System Error Logs (Exception Monitor)
CREATE TABLE IF NOT EXISTS public.system_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    severity VARCHAR(20) NOT NULL DEFAULT 'info', -- 'critical', 'warning', 'info'
    module VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    component_route TEXT,
    status VARCHAR(20) DEFAULT 'unresolved' -- 'unresolved', 'investigating', 'resolved'
);

-- --------------------------------------------------------------------
-- 📁 KELOMPOK 3: CRM & SALES PIPELINE
-- --------------------------------------------------------------------

-- 3.1 Tabel Klien (Clients)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT DEFAULT 'org_bertumbuh',
    name TEXT NOT NULL,
    industry TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'prospect', 'inactive'
    contacts JSONB DEFAULT '[]'::jsonb,
    owned_by_ae TEXT,
    total_revenue NUMERIC(15,2) DEFAULT 0,
    active_projects INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Tabel Deals (Sales Pipeline)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT DEFAULT 'org_bertumbuh',
    client_name TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'lead', -- 'lead', 'kualifikasi', 'pitching', 'penawaran', 'negosiasi', 'won', 'lost'
    value NUMERIC(15,2) DEFAULT 0,
    probability INT DEFAULT 50,
    ae_id TEXT,
    ae_name TEXT,
    source TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Tabel Master Service Packages
CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(15,2) NOT NULL,
    deliverables TEXT[] DEFAULT '{}',
    color TEXT DEFAULT 'var(--blue)',
    status VARCHAR(20) DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Tabel Quotations (Penawaran Harga)
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    validity_days INT DEFAULT 30,
    line_items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(15,2) NOT NULL,
    tax NUMERIC(15,2) DEFAULT 0,
    total NUMERIC(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'approved', 'rejected'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Tabel Contracts (Kontrak Kerjasama)
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

-- 3.6 Tabel Pitching Schedules
CREATE TABLE IF NOT EXISTS public.pitching_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
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
-- 📁 KELOMPOK 4: PM & MANAJEMEN PROYEK
-- --------------------------------------------------------------------

-- 4.1 Tabel Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT DEFAULT 'org_bertumbuh',
    name TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    pm_id TEXT,
    pm_name TEXT DEFAULT 'Belum Ditugaskan',
    status VARCHAR(50) DEFAULT 'on_track', -- 'planning', 'on_track', 'at_risk', 'delayed', 'completed'
    billing_type VARCHAR(20) DEFAULT 'project', -- 'project', 'retainer'
    package_tier VARCHAR(20) DEFAULT 'TIER_B',
    package_services TEXT[] DEFAULT '{}',
    monthly_retainer_fee NUMERIC(15,2) DEFAULT 0,
    contract_value NUMERIC(15,2) DEFAULT 0,
    budget NUMERIC(15,2) DEFAULT 0,
    actual_cost NUMERIC(15,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    sub_teams TEXT[] DEFAULT '{}',
    members JSONB DEFAULT '[]'::jsonb,
    milestones JSONB DEFAULT '[]'::jsonb,
    reports JSONB DEFAULT '[]'::jsonb,
    activities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Tabel Tasks (Tugas Pelaksana)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assignee_id TEXT,
    assignee_name TEXT,
    sub_team VARCHAR(50),
    status VARCHAR(20) DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    estimated_hours INT DEFAULT 0,
    logged_hours INT DEFAULT 0,
    due_date DATE,
    evidence_link TEXT,
    phase VARCHAR(20) DEFAULT 'ongoing',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 Tabel Project Add-Ons (Scope Creep)
CREATE TABLE IF NOT EXISTS public.project_add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'TALENT_KOL', 'PRINTING', 'MEDIA_PLACEMENT', 'VENUE_RENTAL', 'OTHER'
    procurement_cost NUMERIC(15,2) DEFAULT 0,
    billing_price NUMERIC(15,2) DEFAULT 0,
    invoiced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 Tabel Team Meetings
CREATE TABLE IF NOT EXISTS public.team_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    meeting_date TIMESTAMPTZ NOT NULL,
    meeting_mode VARCHAR(20) DEFAULT 'online',
    location_or_link TEXT,
    notes TEXT,
    invitees TEXT[] DEFAULT '{}',
    google_calendar_event_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.5 Tabel Google Calendar Credentials
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
-- 📁 KELOMPOK 5: FINANCE & ACCOUNTING
-- --------------------------------------------------------------------

-- 5.1 Tabel Chart of Accounts (COA Master)
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    account_category VARCHAR(50) NOT NULL, -- 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'
    normal_balance VARCHAR(10) NOT NULL, -- 'debit', 'credit'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2 Tabel Journal Entries (Header Jurnal)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    account TEXT NOT NULL,
    account_code VARCHAR(20) NOT NULL,
    account_name TEXT NOT NULL,
    type VARCHAR(10) NOT NULL, -- 'debit', 'credit'
    amount NUMERIC(15,2) NOT NULL,
    reference_id TEXT,
    is_simulation BOOLEAN DEFAULT FALSE,
    is_voided BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3 Tabel Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    project_name TEXT NOT NULL,
    issue_date DATE,
    due_date DATE NOT NULL,
    total NUMERIC(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue'
    line_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.4 Tabel Reimbursements
CREATE TABLE IF NOT EXISTS public.reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    attachment_url TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.5 Tabel Vendors
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    bank_account TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 📁 KELOMPOK 6: HR & PEOPLE OPERATIONS
-- --------------------------------------------------------------------

-- 6.1 Tabel Employee Leaves (Cuti)
CREATE TABLE IF NOT EXISTS public.employee_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Tahunan', 'Sakit', 'Melahirkan', 'Penting'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INT NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved_pm', 'approved_hr', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.2 Tabel Employee Overtimes (Lembur)
CREATE TABLE IF NOT EXISTS public.employee_overtimes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    project_id TEXT,
    date TIMESTAMPTZ NOT NULL,
    duration_hours NUMERIC(4,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'declined', 'returned'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.3 Tabel Employee Attendances (Presensi)
CREATE TABLE IF NOT EXISTS public.employee_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    date DATE NOT NULL,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'present',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.4 Tabel Client Allocations (Matriks Alokasi Tim)
CREATE TABLE IF NOT EXISTS public.client_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    department TEXT NOT NULL,
    client_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    allocation_percent NUMERIC(5,2) NOT NULL,
    hours_per_week INT DEFAULT 0,
    role_in_project TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.5 Tabel Employee Workloads
CREATE TABLE IF NOT EXISTS public.employee_workloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    user_name TEXT NOT NULL,
    weekly_hours_allocated NUMERIC(5,2) DEFAULT 0,
    capacity_status VARCHAR(20) DEFAULT 'ideal',
    active_tasks_count INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.6 Tabel Ads Budget Records
CREATE TABLE IF NOT EXISTS public.ads_budget_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    budget_allocated NUMERIC(15,2) NOT NULL,
    budget_spent NUMERIC(15,2) DEFAULT 0,
    billing_sync_status VARCHAR(20) DEFAULT 'unbilled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.7 Tabel Weekly Divisional Reports
CREATE TABLE IF NOT EXISTS public.weekly_divisional_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INT NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    division_name VARCHAR(50) NOT NULL,
    accomplishments TEXT,
    blockers TEXT,
    next_week_plan TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.8 Tabel Employee Performance Metrics
CREATE TABLE IF NOT EXISTS public.employee_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    total_tasks INT DEFAULT 0,
    on_time_tasks INT DEFAULT 0,
    overdue_tasks INT DEFAULT 0,
    overdue_rate NUMERIC(5,2) DEFAULT 0,
    avg_delay_days NUMERIC(4,2) DEFAULT 0,
    discipline_rating NUMERIC(3,2) DEFAULT 5.00,
    hr_recommendation TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.9 Tabel Payroll Records (Penggajian)
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    department TEXT,
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

-- --------------------------------------------------------------------
-- 📁 KELOMPOK 7: KALENDER GLOBAL
-- --------------------------------------------------------------------

-- 7.1 Tabel Calendar Events
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    start_time VARCHAR(10),
    end_date DATE NOT NULL,
    end_time VARCHAR(10),
    assignee_id TEXT,
    assignee_name TEXT,
    category VARCHAR(50) DEFAULT 'general',
    color VARCHAR(50) DEFAULT 'var(--blue)',
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 🔒 ENABLE ROW LEVEL SECURITY (RLS) & OPEN POLICIES
-- ====================================================================

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
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow all access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

-- Script Migration Supabase v1.0.0 Selesai!
