'use client';
import React, { useState, useEffect } from 'react';
import { useCrmStore } from '@/lib/store/crmStore';
import { formatCurrency } from '@/lib/utils';
import { Printer, FileText, CheckCircle, HelpCircle } from 'lucide-react';

export function KontrakView() {
  const clients = useCrmStore(s => s.clients);
  const packages = useCrmStore(s => s.packages);
  const quotations = useCrmStore(s => s.quotations);

  const [contractTemplateType, setContractTemplateType] = useState<'RETAINER' | 'PROJECT' | 'NDA'>('RETAINER');
  const [clientId, setClientId] = useState('');
  const [contractNumber, setContractNumber] = useState(`KNT-2026-07-${Math.floor(100 + Math.random() * 900)}`);
  const [firstPartyName, setFirstPartyName] = useState('Anda (Account Executive)');
  const [firstPartyRole, setFirstPartyRole] = useState('AE Representative');
  
  const [secondPartyName, setSecondPartyName] = useState('Nama Direktur Klien');
  const [secondPartyRole, setSecondPartyRole] = useState('Direktur Utama');
  
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [contractValue, setContractValue] = useState(0);
  
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  
  const [paymentPreset, setPaymentPreset] = useState('50-50');
  const [paymentTerms, setPaymentTerms] = useState(
    'Pembayaran dilakukan dalam 2 (dua) termin:\n1. Termin I: Down Payment (DP) sebesar 50% dari nilai kontrak dibayarkan setelah penandatanganan perjanjian ini.\n2. Termin II: Pelunasan sebesar 50% dibayarkan selambat-lambatnya 7 (tujuh) hari setelah seluruh pekerjaan selesai.'
  );
  const [includeMaterai, setIncludeMaterai] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Set default client on mount
  useEffect(() => {
    if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
      setSecondPartyName(`Direktur ${clients[0].name}`);
    }
  }, [clients, clientId]);

  // Auto-fill client details on change
  const handleClientChange = (cId: string) => {
    setClientId(cId);
    const selected = clients.find(c => c.id === cId);
    if (selected) {
      setSecondPartyName(`Direktur ${selected.name}`);
      // Auto pull quotation if available
      const clientQto = quotations.find(q => q.clientId === cId);
      if (clientQto) {
        handleSelectQuotation(clientQto.id);
      }
    }
  };

  const handleApplyTemplate = (type: 'RETAINER' | 'PROJECT' | 'NDA') => {
    setContractTemplateType(type);
    if (type === 'RETAINER') {
      setPaymentPreset('retainer');
      setScopeOfWork('SURAT PERJANJIAN RETAINER AGENCY\n\nLingkup Layanan Bulanan:\n- Social Media Content Management (12 Feed + 4 Reels/Bulan)\n- Graphic Design & Visual Assets Branding\n- Performance Marketing & Monthly Analytics Reporting\n- Dedicated Project Manager & Creative Sync');
      setContractValue(15000000);
    } else if (type === 'PROJECT') {
      setPaymentPreset('50-50');
      setScopeOfWork('SURAT PERJANJIAN PROJECT KAMPANYE\n\nDeliverables Utama:\n- Rebranding & Brand Guideline Creation\n- Production Video Commercial Campaign (1 Utama + 3 Cutdown)\n- Landing Page Web Development & Launching Setup');
      setContractValue(35000000);
    } else if (type === 'NDA') {
      setPaymentPreset('custom');
      setPaymentTerms('Perjanjian ini bersifat Non-Disclosure Agreement (NDA). Tidak ada transaksi biaya penawaran jasa dalam dokumen ini.');
      setScopeOfWork('NON-DISCLOSURE AGREEMENT (NDA)\n\nCakupan Rahasia:\n- Seluruh strategi bisnis, data analitik, materi kampanye, dan informasi keuangan agensi maupun klien dilarang disebarluaskan ke pihak ketiga.');
      setContractValue(0);
    }
  };

  // Adjust payment terms text when preset changes
  useEffect(() => {
    if (paymentPreset === '50-50') {
      setPaymentTerms(
        'Pembayaran dilakukan dalam 2 (dua) termin:\n1. Termin I: Down Payment (DP) sebesar 50% dari nilai kontrak (Rp ' + (contractValue * 0.5).toLocaleString('id-ID') + ') dibayarkan setelah penandatanganan perjanjian ini.\n2. Termin II: Pelunasan sebesar 50% (Rp ' + (contractValue * 0.5).toLocaleString('id-ID') + ') dibayarkan setelah pekerjaan diselesaikan.'
      );
    } else if (paymentPreset === 'retainer') {
      setPaymentTerms(
        'Pembayaran bersifat Bulanan (Retainer):\nBiaya dibayarkan setiap bulan sebesar Rp ' + (contractValue / 6).toLocaleString('id-ID') + ' (asumsi kontrak 6 bulan) selambat-lambatnya tanggal 5 setiap bulannya selama durasi kontrak berlangsung.'
      );
    } else if (paymentPreset === '30-40-30') {
      setPaymentTerms(
        'Pembayaran dilakukan dalam 3 (tiga) termin:\n1. Termin I (DP): 30% (Rp ' + (contractValue * 0.3).toLocaleString('id-ID') + ') setelah tanda tangan kontrak.\n2. Termin II (Progress): 40% (Rp ' + (contractValue * 0.4).toLocaleString('id-ID') + ') setelah deliverables utama disetujui.\n3. Termin III (Pelunasan): 30% (Rp ' + (contractValue * 0.3).toLocaleString('id-ID') + ') setelah penutupan projek.'
      );
    }
  }, [paymentPreset, contractValue]);

  // Handle selecting package preset to prefill scope and price
  const handleSelectPackage = (pkgId: string) => {
    if (!pkgId) return;
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;

    setScopeOfWork(
      `Paket: ${pkg.name}\n\nDeliverables:\n` + 
      pkg.deliverables.map(d => `- ${d}`).join('\n') + 
      `\n\nDeskripsi: ${pkg.description}`
    );
    setContractValue(pkg.basePrice);
  };

  // Handle selecting quotation preset to prefill scope and price
  const handleSelectQuotation = (qtoId: string) => {
    if (!qtoId) return;
    const qto = quotations.find(q => q.id === qtoId);
    if (!qto) return;

    setScopeOfWork(
      `Sesuai Quotation ${qto.quotationNumber}:\n\n` + 
      qto.lineItems.map(item => `- ${item.description} (Qty: ${item.quantity})`).join('\n')
    );
    setContractValue(qto.total);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedClient = clients.find(c => c.id === clientId);

  // Helper date text
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayFormatted = today.toLocaleDateString('id-ID', dateOptions);

  return (
    <div className="p-6">
      {/* Printer style override for authentic A4 legal PDF output */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 18mm 15mm 18mm;
          }
          html, body {
            background: white !important;
            color: #000000 !important;
            font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          /* Hide UI navigation, sidebar, header, buttons, and form builder */
          .no-print, aside, nav, header, button {
            display: none !important;
          }

          /* Unset Next.js layout & outer grid bounds so document takes 100% A4 width */
          #__next, main, .p-6, .grid.grid-cols-1 {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          /* Force printable canvas container to fill full A4 page width */
          .print-legal-document {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }

          .contract-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11pt !important;
            line-height: 1.6 !important;
          }

          /* Preserve inner grids for Pihak I & II details and Signatures */
          .print-legal-document .grid-cols-2 {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 2rem !important;
          }

          .print-legal-document .grid-cols-12 {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            gap: 0.25rem !important;
          }

          /* Page break avoidance rules */
          .article-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 1.25rem !important;
          }

          .signature-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 2rem !important;
          }
        }
      `}} />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Generator Template Kontrak Legal (Auto PDF)</h2>
          <p className="text-sm text-gray-500 mt-1">Pembuatan dokumen perjanjian kerjasama legal resmi (Retainer, Proyek Kampanye, & NDA)</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setToast('Mencetak dokumen A4 Kontrak Legal...');
              setTimeout(() => {
                setToast(null);
                handlePrint();
              }, 400);
            }}
            className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm font-bold shadow-md cursor-pointer"
          >
            <Printer size={16} /> Unduh & Cetak PDF Kontrak ↗
          </button>
        </div>
      </div>

      {toast && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 shadow-md fade-in no-print">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CONTRACT FORM BUILDER (LEFT - 5 COLS) */}
        <div className="lg:col-span-5 card p-5 space-y-4 no-print border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 border-b pb-2 uppercase tracking-wide">Builder Data Kontrak Legal</h3>

          {/* Template Preset Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih Template Kontrak Standar:</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyTemplate('RETAINER')}
                className={`p-2 rounded-lg border text-center transition-all text-xs cursor-pointer ${
                  contractTemplateType === 'RETAINER'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Retainer Bulanan
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('PROJECT')}
                className={`p-2 rounded-lg border text-center transition-all text-xs cursor-pointer ${
                  contractTemplateType === 'PROJECT'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Proyek Kampanye
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('NDA')}
                className={`p-2 rounded-lg border text-center transition-all text-xs cursor-pointer ${
                  contractTemplateType === 'NDA'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Perjanjian NDA
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Pilih Klien</label>
            <select 
              value={clientId}
              onChange={e => handleClientChange(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50 font-semibold"
            >
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Tarik Scope dari Paket</label>
              <select 
                onChange={e => {
                  handleSelectPackage(e.target.value);
                  e.target.value = '';
                }}
                className="w-full border rounded-lg p-2 text-xs bg-white text-gray-600"
              >
                <option value="">-- Pilih Paket --</option>
                {packages.filter(p => p.status === 'approved').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Tarik Scope dari Quotation</label>
              <select 
                onChange={e => {
                  handleSelectQuotation(e.target.value);
                  e.target.value = '';
                }}
                className="w-full border rounded-lg p-2 text-xs bg-white text-gray-600"
              >
                <option value="">-- Pilih Quotation --</option>
                {quotations.map(q => (
                  <option key={q.id} value={q.id}>{q.quotationNumber} ({q.clientName})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Materai Toggle */}
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900">Materai Rp 10.000 Digital</span>
            <button
              type="button"
              onClick={() => setIncludeMaterai(!includeMaterai)}
              className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                includeMaterai
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {includeMaterai ? 'ON (Sertakan)' : 'OFF'}
            </button>
          </div>

          <div className="border-t pt-3 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase">Pihak I (Bertumbuh Representative)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Nama AE" 
                className="border rounded p-2 text-xs bg-gray-50 font-medium" 
                value={firstPartyName} 
                onChange={e => setFirstPartyName(e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="Jabatan" 
                className="border rounded p-2 text-xs bg-gray-50 font-medium" 
                value={firstPartyRole} 
                onChange={e => setFirstPartyRole(e.target.value)} 
              />
            </div>
          </div>

          <div className="border-t pt-3 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase">Pihak II (Klien Representative)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Nama Direktur Klien" 
                className="border rounded p-2 text-xs bg-gray-50 font-medium" 
                value={secondPartyName} 
                onChange={e => setSecondPartyName(e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="Jabatan" 
                className="border rounded p-2 text-xs bg-gray-50 font-medium" 
                value={secondPartyRole} 
                onChange={e => setSecondPartyRole(e.target.value)} 
              />
            </div>
          </div>

          <div className="border-t pt-3 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase">Lingkup Kerja &amp; Nilai Kontrak</h4>
            <div>
              <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Scope of Work</label>
              <textarea 
                rows={4} 
                className="w-full border rounded p-2 text-xs bg-gray-50 focus:outline-none font-medium"
                value={scopeOfWork}
                onChange={e => setScopeOfWork(e.target.value)}
                placeholder="Tulis detil layanan, deliverables utama..."
              ></textarea>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Total Nilai Kontrak (Rp)</label>
              <input 
                type="number" 
                className="w-full border rounded p-2 text-xs bg-gray-50 font-bold text-gray-900" 
                value={contractValue} 
                onChange={e => setContractValue(Number(e.target.value))} 
              />
            </div>
          </div>

          <div className="border-t pt-3 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase">Durasi &amp; Pembayaran</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-gray-400 font-semibold uppercase">Mulai</label>
                <input 
                  type="date" 
                  className="w-full border rounded p-1.5 text-xs bg-gray-50" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-400 font-semibold uppercase">Selesai</label>
                <input 
                  type="date" 
                  className="w-full border rounded p-1.5 text-xs bg-gray-50" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Preset Termin Pembayaran</label>
              <select 
                value={paymentPreset}
                onChange={e => setPaymentPreset(e.target.value)}
                className="w-full border rounded p-2 text-xs bg-white font-medium text-gray-700"
              >
                <option value="50-50">Termin 50% DP, 50% Pelunasan</option>
                <option value="retainer">Bulanan Retainer (6 Bulan)</option>
                <option value="30-40-30">Termin 30% DP, 40% Progress, 30% Akhir</option>
                <option value="custom">Ubah Manual (Custom)</option>
              </select>
            </div>
            {paymentPreset === 'custom' && (
              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Custom Pembayaran</label>
                <textarea 
                  rows={3} 
                  className="w-full border rounded p-2 text-xs bg-gray-50 font-medium"
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* LIVE CONTRACT TEMPLATE CANVAS (RIGHT - 7 COLS) */}
        <div className="lg:col-span-7 card p-8 bg-white shadow-lg print-legal-document print:p-0 print:m-0 print:border-none print:shadow-none">
          
          <div className="contract-container max-w-[720px] print:max-w-none print:w-full print:p-0 print:m-0 mx-auto text-xs text-gray-900 leading-relaxed font-serif space-y-6">
            
            {/* Title & Official Header */}
            <div className="text-center border-b-2 border-gray-900 pb-4 space-y-1">
              <h2 className="text-sm font-bold tracking-wider uppercase">SURAT PERJANJIAN KERJASAMA</h2>
              <h3 className="text-xs font-semibold tracking-wide uppercase text-gray-700">PEMBERIAN LAYANAN DIGITAL MARKETING AGENCY</h3>
              <p className="font-sans text-[10px] text-gray-500 font-semibold uppercase pt-1">No. Kontrak: {contractNumber}</p>
            </div>

            {/* Intro */}
            <p className="text-justify">
              Pada hari ini, <strong>{todayFormatted}</strong>, kami yang bertanda tangan di bawah ini secara sadar sepakat mengadakan Perjanjian Kerjasama Bisnis:
            </p>

            {/* Parties */}
            <div className="space-y-4 font-sans text-xs bg-gray-50/60 p-4 rounded-xl border border-gray-200">
              {/* First Party */}
              <div>
                <p className="font-bold text-xs font-serif text-gray-900 mb-1">PIHAK PERTAMA (Penyedia Jasa):</p>
                <div className="grid grid-cols-12 gap-1 pl-2">
                  <span className="col-span-3 text-gray-600">Nama</span>
                  <span className="col-span-9">: <strong>{firstPartyName}</strong></span>
                  <span className="col-span-3 text-gray-600">Jabatan</span>
                  <span className="col-span-9">: {firstPartyRole}</span>
                  <span className="col-span-3 text-gray-600">Perusahaan</span>
                  <span className="col-span-9">: <strong>Bertumbuh Agency</strong></span>
                  <span className="col-span-3 text-gray-600">Alamat</span>
                  <span className="col-span-9">: Jl. Teknologi No. 88, Jakarta Selatan</span>
                </div>
              </div>

              {/* Second Party */}
              <div>
                <p className="font-bold text-xs font-serif text-gray-900 mb-1">PIHAK KEDUA (Klien Penerima Jasa):</p>
                <div className="grid grid-cols-12 gap-1 pl-2">
                  <span className="col-span-3 text-gray-600">Nama</span>
                  <span className="col-span-9">: <strong>{secondPartyName}</strong></span>
                  <span className="col-span-3 text-gray-600">Jabatan</span>
                  <span className="col-span-9">: {secondPartyRole}</span>
                  <span className="col-span-3 text-gray-600">Klien / Brand</span>
                  <span className="col-span-9">: <strong>{selectedClient?.name || 'Nama Perusahaan Klien'}</strong></span>
                  <span className="col-span-3 text-gray-600">Bidang Usaha</span>
                  <span className="col-span-9">: {selectedClient?.industry || 'Layanan / Bisnis'}</span>
                </div>
              </div>
            </div>

            <p className="text-justify">
              Kedua belah pihak sepakat mengikatkan diri dalam Perjanjian Kerjasama ini dengan ketentuan pasal-pasal sebagai berikut:
            </p>

            {/* Articles */}
            <div className="space-y-5">
              
              {/* Pasal 1 */}
              <div className="article-block space-y-1">
                <h4 className="font-bold uppercase text-xs text-gray-900 tracking-wide">PASAL 1: LINGKUP PEKERJAAN &amp; DELIVERABLES</h4>
                <p className="pl-3 text-justify">
                  PIHAK PERTAMA berkewajiban memberikan jasa layanan profesional kepada PIHAK KEDUA yang rincian lingkup pekerjaannya (Scope of Work) disepakati sebagai berikut:
                </p>
                <div className="mt-2 pl-3 py-2 border-l-2 border-gray-400 bg-gray-50/50 font-serif text-xs whitespace-pre-wrap leading-relaxed">
                  {scopeOfWork || 'Scope of Work belum ditambahkan.'}
                </div>
              </div>

              {/* Pasal 2 */}
              <div className="article-block space-y-1">
                <h4 className="font-bold uppercase text-xs text-gray-900 tracking-wide">PASAL 2: NILAI KONTRAK &amp; KETENTUAN PEMBAYARAN</h4>
                <p className="pl-3 text-justify">
                  Nilai total kontrak kerjasama ini adalah sebesar <strong>{formatCurrency(contractValue)}</strong> (termasuk PPN 11%). Mekanisme pembayaran disepakati sesuai dengan termin berikut:
                </p>
                <div className="mt-2 pl-3 py-2 border-l-2 border-gray-400 bg-gray-50/50 font-serif text-xs whitespace-pre-wrap leading-relaxed">
                  {paymentTerms}
                </div>
              </div>

              {/* Pasal 3 */}
              <div className="article-block space-y-1">
                <h4 className="font-bold uppercase text-xs text-gray-900 tracking-wide">PASAL 3: JANGKA WAKTU PERJANJIAN</h4>
                <p className="pl-3 text-justify">
                  Kerjasama ini berlaku efektif sejak tanggal <strong>{startDate ? new Date(startDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}</strong> sampai dengan tanggal <strong>{endDate ? new Date(endDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}</strong>. Perpanjangan jangka waktu kerjasama dapat didiskusikan selambat-lambatnya 14 (empat belas) hari kalender sebelum kontrak berakhir.
                </p>
              </div>

              {/* Pasal 4 */}
              <div className="article-block space-y-1">
                <h4 className="font-bold uppercase text-xs text-gray-900 tracking-wide">PASAL 4: HAK KEKAYAAN INTELEKTUAL &amp; KERAHASIAAN</h4>
                <p className="pl-3 text-justify">
                  1. Seluruh hasil karya digital yang diciptakan untuk PIHAK KEDUA sepenuhnya menjadi hak milik intelektual PIHAK KEDUA setelah seluruh kewajiban pembayaran diselesaikan.<br />
                  2. Kedua belah pihak berkewajiban menjaga kerahasiaan data internal masing-masing dan dilarang membocorkannya kepada pihak ketiga tanpa izin tertulis.
                </p>
              </div>

            </div>

            {/* Closing & Signatures Block */}
            <div className="signature-block pt-4 space-y-6">
              <p className="text-justify">
                Demikian Perjanjian Kerjasama ini dibuat dalam 2 (dua) rangkap bermaterai cukup yang masing-masing memiliki kekuatan hukum yang sama, ditandatangani oleh kedua belah pihak secara sadar tanpa ada unsur paksaan.
              </p>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-6 text-center font-sans text-xs gap-8">
                <div className="space-y-12">
                  <div>
                    <p className="font-bold text-gray-900">PIHAK PERTAMA,</p>
                    <p className="text-gray-500 font-medium">Bertumbuh Agency</p>
                  </div>

                  {includeMaterai && (
                    <div className="mx-auto w-28 h-16 border-2 border-dashed border-purple-400 bg-purple-50/50 rounded-lg flex flex-col items-center justify-center text-[9px] text-purple-800 font-bold tracking-tight">
                      <span>MATERAI</span>
                      <span>TEMPEL</span>
                      <span className="text-[8px] font-normal text-purple-600">Rp 10.000</span>
                    </div>
                  )}

                  <div className="space-y-0.5 pt-2">
                    <p className="underline font-bold text-gray-900">{firstPartyName}</p>
                    <p className="text-gray-500 text-[10px] font-medium">{firstPartyRole}</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <div>
                    <p className="font-bold text-gray-900">PIHAK KEDUA,</p>
                    <p className="text-gray-500 font-medium">{selectedClient?.name || 'Nama Perusahaan Klien'}</p>
                  </div>

                  {includeMaterai && (
                    <div className="mx-auto w-28 h-16 border-2 border-dashed border-purple-400 bg-purple-50/50 rounded-lg flex flex-col items-center justify-center text-[9px] text-purple-800 font-bold tracking-tight">
                      <span>MATERAI</span>
                      <span>TEMPEL</span>
                      <span className="text-[8px] font-normal text-purple-600">Rp 10.000</span>
                    </div>
                  )}

                  <div className="space-y-0.5 pt-2">
                    <p className="underline font-bold text-gray-900">{secondPartyName}</p>
                    <p className="text-gray-500 text-[10px] font-medium">{secondPartyRole}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
