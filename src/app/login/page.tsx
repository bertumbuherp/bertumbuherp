'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Lock, Mail, Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Signup State (Mock)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupOrg, setSignupOrg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await login({ email, password });
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    } else {
      setError(result.error || 'Login gagal. Coba lagi.');
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Fitur Sign Up sedang dalam tahap pengembangan. Silakan gunakan akun Demo.');
  };

  const features = [
    "Manajemen Proyek & Kanban Terintegrasi",
    "CRM, Sales Pipeline & Database Klien",
    "Human Resource, Cuti, & Database Karyawan",
    "Finance, Payroll Otomatis & Tagihan",
    "Multi-tenant & Role-Based Access Control"
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      {/* Left panel - Branding & Features */}
      <div className="hidden lg:flex flex-col w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        
        {/* Decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header Branding */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--red)' }}>
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Bertumbuh ERP</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Sistem operasi terpadu <br/>untuk agensi modern.
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-md">
              Otomatiskan alur kerja tim Anda mulai dari prospek klien pertama, hingga penggajian karyawan bulan ini.
            </p>

            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 border-t border-slate-700 pt-6">
            <p className="text-sm text-slate-400">© 2026 Bertumbuh Creative Agency.</p>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md fade-in">
          
          {/* Mobile Branding */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--red)' }}>
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Bertumbuh ERP</span>
          </div>

          {/* Tabs */}
          <div className="flex w-full mb-8 bg-gray-100 p-1 rounded-xl">
            <button 
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setActiveTab('login'); setError(''); }}
            >
              Masuk
            </button>
            <button 
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'signup' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setActiveTab('signup'); setError(''); }}
            >
              Daftar Baru
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              {activeTab === 'login' ? 'Selamat Datang Kembali!' : 'Mulai Bersama Kami'}
            </h2>
            <p className="text-sm text-gray-500">
              {activeTab === 'login' ? 'Silakan masukkan kredensial Anda untuk masuk ke sistem.' : 'Daftarkan agensi Anda untuk menikmati kemudahan operasional.'}
            </p>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Email Akun</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-red-500 transition-colors" placeholder="email@agensi.id" required />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Kata Sandi</label>
                  <button type="button" className="text-xs font-semibold text-red-600 hover:text-red-700">Lupa sandi?</button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-red-500 transition-colors" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><LogIn size={18} /><span>Masuk ke ERP</span></>}
              </button>

              {/* Demo Accounts Wrapper for fast testing */}
              <div className="pt-6 mt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-3 text-center uppercase tracking-wider">Akses Cepat Mode Demo</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button type="button" onClick={() => { setEmail('reza@bertumbuh.id'); setPassword('demo123'); }} className="text-[10px] bg-gray-100 text-gray-700 font-bold py-1.5 px-3 rounded-md hover:bg-gray-200">Owner</button>
                  <button type="button" onClick={() => { setEmail('dewi@bertumbuh.id'); setPassword('demo123'); }} className="text-[10px] bg-gray-100 text-gray-700 font-bold py-1.5 px-3 rounded-md hover:bg-gray-200">PM</button>
                  <button type="button" onClick={() => { setEmail('hadi@bertumbuh.id'); setPassword('demo123'); }} className="text-[10px] bg-gray-100 text-gray-700 font-bold py-1.5 px-3 rounded-md hover:bg-gray-200">Finance</button>
                  <button type="button" onClick={() => { setEmail('andi@bertumbuh.id'); setPassword('demo123'); }} className="text-[10px] bg-gray-100 text-gray-700 font-bold py-1.5 px-3 rounded-md hover:bg-gray-200">AE (CRM)</button>
                  <button type="button" onClick={() => { setEmail('siti@bertumbuh.id'); setPassword('demo123'); }} className="text-[10px] bg-gray-100 text-gray-700 font-bold py-1.5 px-3 rounded-md hover:bg-gray-200">HR</button>
                  <button type="button" onClick={() => { setEmail('risa@bertumbuh.id'); setPassword('demo123'); }} className="text-[10px] bg-blue-50 text-blue-700 font-bold py-1.5 px-3 rounded-md hover:bg-blue-100 border border-blue-200">Karyawan</button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nama Lengkap</label>
                <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-red-500 transition-colors" placeholder="Budi Santoso" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nama Organisasi / Agensi</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={signupOrg} onChange={e => setSignupOrg(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-red-500 transition-colors" placeholder="PT Kreatif Maju Bersama" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Email Pekerjaan</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-red-500 transition-colors" placeholder="budi@agensi.id" required />
                </div>
              </div>

              <button type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-6">
                Buat Akun Gratis
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
                Dengan mendaftar, Anda menyetujui <a href="#" className="text-red-600 hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-red-600 hover:underline">Kebijakan Privasi</a> kami.
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
