'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Lock, Mail, Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal & Dialog states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [legalModalContent, setLegalModalContent] = useState<'terms' | 'privacy' | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await login({ email, password });
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    } else {
      setError(result.error || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmailInput) return;
    setForgotSubmitted(true);
  };

  const features = [
    "Manajemen Proyek & Kanban Operasional",
    "CRM Pipeline & Database Klien Bertumbuh",
    "Human Resource, Cuti, & Database Karyawan",
    "Finance, Payroll Otomatis & Tagihan Invoice",
    "Sistem Otorisasi Role-Based (RBAC) Internal"
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
              Portal Operasional Terpadu <br/>PT Bertumbuh Creative.
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-md">
              Sistem manajemen internal terintegrasi untuk mengelola proyek, CRM, SDM, dan keuangan agensi secara efisien.
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
            <p className="text-sm text-slate-400">© 2026 PT Bertumbuh Creative Agency. Internal System.</p>
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

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Selamat Datang Tim Bertumbuh!
            </h2>
            <p className="text-sm text-gray-500">
              Silakan masukkan email akun internal dan kata sandi Anda untuk mengakses portal.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Email Akun Internal</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-red-500 transition-colors" placeholder="nama@bertumbuh.id" required />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Kata Sandi</label>
                <button 
                  type="button" 
                  onClick={() => { setShowForgotModal(true); setForgotSubmitted(false); setForgotEmailInput(email); }} 
                  className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Lupa sandi?
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-red-500 transition-colors" placeholder="••••••••" required />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
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
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><LogIn size={18} /><span>Masuk ke Portal Internal</span></>}
            </button>
          </form>

        </div>
      </div>

      {/* Modal Reset Password (BUG-001) */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800">Pemulihan Kata Sandi</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            
            {forgotSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-800">
                <p className="font-bold text-sm">✅ Tautan Reset Terkirim!</p>
                <p>Instruksi pemulihan kata sandi telah dikirim ke <strong>{forgotEmailInput}</strong>. Silakan periksa kotak masuk atau folder spam email Anda.</p>
                <button onClick={() => setShowForgotModal(false)} className="w-full mt-3 btn-primary py-2 text-xs font-bold rounded-lg">Tutup</button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-gray-600">Masukkan email terdaftar Anda untuk menerima tautan pemulihan kata sandi akun ERP.</p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Terdaftar</label>
                  <input 
                    type="email" 
                    value={forgotEmailInput} 
                    onChange={e => setForgotEmailInput(e.target.value)} 
                    placeholder="email@agensi.id" 
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                    required 
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl">Batal</button>
                  <button type="submit" className="btn-primary px-5 py-2 text-xs font-bold rounded-xl shadow-md">Kirim Tautan Reset</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Legal Documents (BUG-002) */}
      {legalModalContent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 fade-in max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800">
                {legalModalContent === 'terms' ? 'Syarat & Ketentuan Layanan' : 'Kebijakan Privasi & Keamanan Data'}
              </h3>
              <button onClick={() => setLegalModalContent(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div className="overflow-y-auto text-xs space-y-3 text-gray-600 pr-1 flex-1">
              {legalModalContent === 'terms' ? (
                <>
                  <p className="font-bold text-gray-900">1. Ketentuan Penggunaan Sistem Bertumbuh ERP</p>
                  <p>Pengguna menyetujui untuk menggunakan sistem operasi ini hanya untuk keperluan manajemen operasional, proyek, CRM, dan akuntansi internal agensi yang sah.</p>
                  <p className="font-bold text-gray-900">2. Hak Akses &amp; Kerahasiaan Akun</p>
                  <p>Setiap akun pengguna terikat pada role-based access control (RBAC). Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi dan seluruh aktivitas yang terjadi di bawah akun bersangkutan.</p>
                  <p className="font-bold text-gray-900">3. Pembatasan Tanggung Jawab</p>
                  <p>Sistem disediakan dalam kondisi sandbox/production terkontrol. Bertumbuh ERP tidak bertanggung jawab atas kerugian operasional akibat kesalahan pengisian data manual pengguna.</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-gray-900">1. Perlindungan Data Organisasi</p>
                  <p>Seluruh data transaksi keuangan, invoice, daftar klien, dan rekaman gaji karyawan disimpan secara terenkripsi dengan prinsip isolasi multi-tenant yang ketat.</p>
                  <p className="font-bold text-gray-900">2. Penggunaan Data Operasional</p>
                  <p>Bertumbuh ERP tidak pernah menjual atau membagikan data operasional agensi Anda kepada pihak ketiga mana pun tanpa persetujuan tertulis resmi.</p>
                  <p className="font-bold text-gray-900">3. Keamanan Transaksi &amp; Audit Trail</p>
                  <p>Setiap penambahan, pengubahan, dan penghapusan entri jurnal akuntansi dan payroll dicatat secara otomatis dalam sistem audit log terpusat.</p>
                </>
              )}
            </div>
            <div className="pt-3 border-t flex justify-end">
              <button onClick={() => setLegalModalContent(null)} className="btn-primary px-5 py-2 text-xs font-bold rounded-xl">Mengerti &amp; Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
