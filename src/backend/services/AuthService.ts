import { employees } from '../repositories/mockRepository';

const MOCK_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'reza@bertumbuh.id':  { password: 'demo123', userId: 'u1' },
  'laila@bertumbuh.id': { password: 'demo123', userId: 'u2' },
  'andi@bertumbuh.id':  { password: 'demo123', userId: 'u3' },
  'dewi@bertumbuh.id':  { password: 'demo123', userId: 'u4' },
  'hadi@bertumbuh.id':  { password: 'demo123', userId: 'u5' },
  'risa@bertumbuh.id':  { password: 'demo123', userId: 'u6' },
  'dimas@bertumbuh.id': { password: 'demo123', userId: 'u7' },
  'bagas@bertumbuh.id': { password: 'demo123', userId: 'u8' },
  'siti@bertumbuh.id':  { password: 'demo123', userId: 'u9' },
};

export class AuthService {
  static async verifyCredentials(email: string, password?: string) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 700));

    const cred = MOCK_CREDENTIALS[email.toLowerCase()];
    if (!cred) {
      return { success: false, error: 'Email tidak ditemukan.' };
    }
    
    // In mock mode, allow any password in demo mode for ease of use
    // In prod: verify against hashed password in DB
    
    const employee = employees.find((e: any) => e.id === cred.userId);
    if (!employee || !employee.isActive) {
      return { success: false, error: 'Akun tidak aktif.' };
    }

    return { success: true, user: employee };
  }
}
