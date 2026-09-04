import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const supabaseDataService = {
  // ------------------------------------------------------------------
  // 1. EMPLOYEES / PROFILES
  // ------------------------------------------------------------------
  async getEmployees() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.warn('[Supabase] Failed to fetch profiles:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('[Supabase] getEmployees error:', e);
      return null;
    }
  },

  async upsertEmployee(employee: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('profiles').upsert(employee);
      if (error) console.warn('[Supabase] upsertEmployee error:', error.message);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // ------------------------------------------------------------------
  // 2. CLIENTS
  // ------------------------------------------------------------------
  async getClients() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) {
        console.warn('[Supabase] Failed to fetch clients:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertClient(client: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('clients').upsert(client);
      if (error) console.warn('[Supabase] upsertClient error:', error.message);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async deleteClient(id: string) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // ------------------------------------------------------------------
  // 3. DEALS
  // ------------------------------------------------------------------
  async getDeals() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('deals').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertDeal(deal: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('deals').upsert(deal);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async deleteDeal(id: string) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // ------------------------------------------------------------------
  // 4. SERVICE PACKAGES & QUOTATIONS
  // ------------------------------------------------------------------
  async getPackages() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('service_packages').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertPackage(pkg: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('service_packages').upsert(pkg);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async getQuotations() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('quotations').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertQuotation(quotation: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('quotations').upsert(quotation);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // ------------------------------------------------------------------
  // 5. PROJECTS & TASKS
  // ------------------------------------------------------------------
  async getProjects() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertProject(project: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('projects').upsert(project);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async deleteProject(id: string) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async getTasks() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertTask(task: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('tasks').upsert(task);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async deleteTask(id: string) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // ------------------------------------------------------------------
  // 6. FINANCE (Journal, Reimbursements)
  // ------------------------------------------------------------------
  async getJournalEntries() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('journal_entries').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertJournalEntry(entry: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('journal_entries').upsert(entry);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async getReimbursements() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('reimbursements').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertReimbursement(reimbursement: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('reimbursements').upsert(reimbursement);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // ------------------------------------------------------------------
  // 7. HR (Attendances, Leaves, Overtimes)
  // ------------------------------------------------------------------
  async getLeaves() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('employee_leaves').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertLeave(leave: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('employee_leaves').upsert(leave);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async getOvertimes() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('employee_overtimes').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertOvertime(overtime: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('employee_overtimes').upsert(overtime);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async getAttendances() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('employee_attendances').select('*');
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async upsertAttendance(attendance: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('employee_attendances').upsert(attendance);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // ------------------------------------------------------------------
  // 8. LOGS (Activity Logs)
  // ------------------------------------------------------------------
  async getActivityLogs() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async addActivityLog(log: any) {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('activity_logs').insert(log);
      return !error;
    } catch (e) {
      return false;
    }
  }
};
