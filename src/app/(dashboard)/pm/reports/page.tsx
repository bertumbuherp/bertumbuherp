'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { usePMStore } from '@/lib/store/pmStore';
import { FileText, MessageSquare, Download, Clock, History } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Mock DB for history
const mockHistory = [
  { id: 'h1', projectId: 'p1', clientName: 'PT Maju Bersama', date: '2026-05-15T10:00:00Z', format: 'WhatsApp' },
  { id: 'h2', projectId: 'p2', clientName: 'Kopi Nusantara', date: '2026-05-20T14:30:00Z', format: 'PDF' },
];

export default function ReportGeneratorPage() {
  const { projects, tasks } = usePMStore();
  const [tab, setTab] = useState<'create' | 'history'>('create');
  
  // Create Report State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [reportText, setReportText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyList, setHistoryList] = useState(mockHistory);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const generateReport = () => {
    if (!selectedProject) return;
    setIsGenerating(true);
    
    // Simulate thinking/generation delay
    setTimeout(() => {
      const pTasks = tasks.filter(t => t.projectId === selectedProject.id);
      const total = pTasks.length;
      const done = pTasks.filter(t => t.status === 'done').length;
      const progress = total === 0 ? 0 : Math.round((done / total) * 100);

      const todoList = pTasks.filter(t => t.status === 'todo').map(t => `- ${t.title}`).join('\n') || '- Tidak ada';
      const ongoingList = pTasks.filter(t => t.status === 'in_progress').map(t => `- ${t.title}`).join('\n') || '- Tidak ada';
      const doneList = pTasks.filter(t => t.status === 'done').map(t => `- ${t.title}`).join('\n') || '- Tidak ada';

      const text = `Halo tim ${selectedProject.clientName},\n\nBerikut adalah report progres pengerjaan proyek *${selectedProject.name}* minggu ini.\n\nSaat ini kita telah mencapai progres penyelesaian keseluruhan sebesar ${progress}% (${done} dari ${total} tugas selesai).\n\nBerikut rincian pengerjaan:\n\n*✅ Selesai (Done)*:\n${doneList}\n\n*⏳ Sedang Dikerjakan (On Going)*:\n${ongoingList}\n\n*📝 Akan Datang (To Do)*:\n${todoList}\n\nTerima kasih atas kerja samanya.`;
      
      setReportText(text);
      setIsGenerating(false);
    }, 800);
  };

  const handleSendWA = () => {
    if (!selectedProject) return;
    // Track in history
    setHistoryList([{ id: `h-${Date.now()}`, projectId: selectedProject.id, clientName: selectedProject.clientName, date: new Date().toISOString(), format: 'WhatsApp' }, ...historyList]);
    
    // Send to WhatsApp (simulation via URL)
    const encoded = encodeURIComponent(reportText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadPDF = () => {
    if (!selectedProject) return;
    const newHist = { id: `h-${Date.now()}`, projectId: selectedProject.id, clientName: selectedProject.clientName, date: new Date().toISOString(), format: 'PDF' };
    setHistoryList([newHist, ...historyList]);
    
    // Create printable document blob
    const element = document.createElement("a");
    const content = `=====================================================\nLAPORAN PROGRES PROYEK: ${selectedProject.name}\nKLIEN: ${selectedProject.clientName}\nTANGGAL CETAK: ${new Date().toLocaleDateString('id-ID')}\n=====================================================\n\n${reportText}\n\n=====================================================\nBERTUMBUH ERP - CREATIVE AGENCY SYSTEM\n=====================================================`;
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Laporan_Proyek_${selectedProject.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadTxt = (historyItem: any) => {
    const proj = projects.find(p => p.id === historyItem.projectId);
    const element = document.createElement("a");
    const content = `=====================================================\nLAPORAN RIWAYAT PROYEK: ${proj?.name || historyItem.clientName}\nKLIEN: ${historyItem.clientName}\nTANGGAL DIKELUARKAN: ${formatDate(historyItem.date)}\n=====================================================\n\n- Format Ekspor: ${historyItem.format}\n- Status: Archived in System Log\n\nTerima kasih atas kerja samanya.`;
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Report_Riwayat_${historyItem.clientName.replace(/\s+/g, '_')}_${historyItem.date.split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header title="Report Generator" subtitle="Otomatisasi pembuatan laporan proyek" />
      
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        
        {/* Tabs */}
        <div className="flex gap-1 p-1 w-fit rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <button onClick={() => setTab('create')} className="px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2" style={{ background: tab === 'create' ? 'var(--red)' : 'transparent', color: tab === 'create' ? 'white' : 'var(--text-muted)' }}>
            <FileText size={16}/> Create Report
          </button>
          <button onClick={() => setTab('history')} className="px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2" style={{ background: tab === 'history' ? 'var(--red)' : 'transparent', color: tab === 'history' ? 'white' : 'var(--text-muted)' }}>
            <History size={16}/> History Report
          </button>
        </div>

        {tab === 'create' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sidebar Setup */}
            <div className="card p-5 h-fit">
              <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Pilih Proyek Klien</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500 uppercase">Klien / Proyek Aktif</label>
                  <select value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); setReportText(''); }} className="input w-full px-3 py-2 text-sm">
                    <option value="" disabled>Pilih proyek...</option>
                    {projects.filter(p => p.status !== 'completed').map(p => (
                      <option key={p.id} value={p.id}>{p.clientName} - {p.name}</option>
                    ))}
                  </select>
                </div>
                
                <button onClick={generateReport} disabled={!selectedProjectId || isGenerating} className="btn-primary w-full py-2.5 flex justify-center items-center gap-2 shadow-sm">
                  {isGenerating ? 'Menganalisa Data...' : 'Generate Progres Report'}
                </button>
              </div>
            </div>

            {/* Preview & Actions */}
            <div className="md:col-span-2 space-y-5">
              {reportText ? (
                <>
                  <div className="card p-6 border-2 border-dashed fade-in" style={{ borderColor: 'var(--red-dim)' }}>
                    <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: 'var(--border-light)' }}>
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><FileText size={16} className="text-red-500"/> Preview Laporan</p>
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">Auto-generated</span>
                    </div>
                    <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg border">
                      {reportText}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={handleDownloadPDF} className="flex-1 btn-ghost border bg-white flex items-center justify-center gap-2 py-3 shadow-sm hover:shadow-md transition-all">
                      <Download size={18} className="text-gray-500"/>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Buat Report .PDF</p>
                        <p className="text-[10px] text-gray-500">Download format resmi</p>
                      </div>
                    </button>
                    <button onClick={handleSendWA} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 shadow-md hover:shadow-lg transition-all" style={{ background: '#25D366', borderColor: '#25D366' }}>
                      <MessageSquare size={18}/>
                      <div>
                        <p className="text-sm font-bold">Kirim ke WhatsApp PIC</p>
                        <p className="text-[10px] text-white/80">Kirim teks langsung</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="card p-10 flex flex-col items-center justify-center text-center h-full border-2 border-dashed" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileText size={24} className="text-gray-300"/>
                  </div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Belum ada report</p>
                  <p className="text-xs text-gray-400">Silakan pilih proyek di samping dan klik Generate untuk melihat preview laporan.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {tab === 'history' && (
          <div className="card p-0 overflow-hidden fade-in">
            <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>History Laporan (Disimpan format .txt)</h3>
              <p className="text-xs text-gray-500">Semua laporan otomatis direkam di sini untuk meringankan beban database.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
                    <th className="px-5 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Tanggal Dibuat</th>
                    <th className="px-5 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Klien / Proyek</th>
                    <th className="px-5 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Format Export</th>
                    <th className="px-5 py-3 text-xs font-semibold text-right" style={{ color: 'var(--text-muted)' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map(h => {
                    const proj = projects.find(p => p.id === h.projectId);
                    return (
                      <tr key={h.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-700">{formatDate(h.date)}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10}/> {new Date(h.date).toLocaleTimeString('id-ID')}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold" style={{ color: 'var(--red)' }}>{h.clientName}</p>
                          <p className="text-xs text-gray-500">{proj?.name || 'Unknown Project'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600 border">
                            {h.format}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => handleDownloadTxt(h)} className="btn-ghost text-xs px-3 py-1.5 border hover:bg-white text-gray-700 shadow-sm">
                            Unduh .txt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {historyList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">Belum ada history laporan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
