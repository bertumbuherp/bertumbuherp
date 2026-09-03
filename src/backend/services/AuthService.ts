import { employees } from '../repositories/mockRepository';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const MOCK_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'owner@bertumbuh.id':   { password: 'demo123', userId: 'u1' },
  'admin@bertumbuh.id':   { password: 'demo123', userId: 'u2' },
  'ae@bertumbuh.id':      { password: 'demo123', userId: 'u3' },
  'pm@bertumbuh.id':      { password: 'demo123', userId: 'u4' },
  'finance@bertumbuh.id': { password: 'demo123', userId: 'u5' },
  'team@bertumbuh.id':    { password: 'demo123', userId: 'u6' },
  'hr@bertumbuh.id':      { password: 'demo123', userId: 'u9' },
};

export class AuthService {
  static async verifyCredentials(email: string, password?: string) {
    // If Supabase Cloud Backend is configured, authenticate via Supabase Auth
    if (isSupabaseConfigured() && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });

        if (!error && data.user) {
          // Fetch user profile from public.profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            return {
              success: true,
              user: {
                id: profile.id,
                organizationId: 'org_bertumbuh',
                name: profile.name,
                email: profile.email,
                department: profile.department || 'Brand',
                position: profile.position || 'Staff',
                roles: profile.roles || ['team_member'],
                monthlySalary: profile.monthly_salary || 0,
                standardHoursPerMonth: profile.standard_hours_per_month || 160,
                costRate: profile.cost_rate || 0,
                billableRate: profile.billable_rate || 0,
                joinDate: profile.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                isActive: profile.is_active ?? true,
              },
            };
          }
        }
      } catch (err) {
        console.warn('Supabase Auth warning, falling back to local credentials validation:', err);
      }
    }

    // Fallback to internal accounts verification
    await new Promise((r) => setTimeout(r, 600));

    const cred = MOCK_CREDENTIALS[email.toLowerCase()];
    if (!cred) {
      return { success: false, error: 'Email tidak ditemukan.' };
    }

    if (password && cred.password && password !== cred.password) {
      return { success: false, error: 'Kata sandi tidak sesuai.' };
    }

    const employee = employees.find((e: any) => e.id === cred.userId);
    if (!employee || !employee.isActive) {
      return { success: false, error: 'Akun tidak aktif.' };
    }

    return { success: true, user: employee };
  }
}
