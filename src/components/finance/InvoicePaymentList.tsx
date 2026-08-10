'use client';
import React, { useState } from 'react';
import { useFinanceStore, Invoice } from '@/lib/store/financeStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, Printer, CheckCircle, XCircle, Sparkles, Building2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export function InvoicePaymentList() {
  const { invoices, updateInvoiceStatus } = useFinanceStore();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'retainer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'addon_kol': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ads_spend': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'retainer': return 'Retainer Bulanan';
      case 'addon_kol': return 'Add-on KOL Talent';
      case 'ads_spend': return 'Reimbursement Ads Spend';
      default: return 'Jasa / Layanan';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Invoice Payment &amp; PDF Generator</h2>
          <p className="text-xs text-gray-500">Penagihan Klien (Retainer + Add-on KOL Talent + Ads Spend) &amp; Cetak PDF</p>
        </div>
      </div>

      <div className="space-y-4">
        {invoices.map(inv => (
          <div key={inv.id} className="card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-gray-900">{inv.invoiceNumber}</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                  inv.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 
                  inv.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {inv.status === 'paid' ? '✓ Lunas' : inv.status === 'sent' ? '⏳ Terkirim' : inv.status}
                </span>
              </div>

              <p className="text-xs font-semibold text-gray-800">
                {inv.clientName} — <span className="text-gray-500">{inv.projectName}</span>
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {inv.lineItems && inv.lineItems.length > 0 ? (
                  inv.lineItems.map((li) => (
                    <span key={li.id} className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getTypeBadge(li.type)}`}>
                      {getTypeName(li.type)}: {li.description}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
                    Retainer Bulanan &amp; Services
                  </span>
                )}
              </div>
            </div>

            <div className="text-right space-y-2 shrink-0">
              <span className="text-xl font-black text-emerald-700 block">{formatCurrency(inv.total)}</span>
              <div className="flex items-center justify-end gap-2">
                {/* Item 4.3: Open PDF Generator Modal */}
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 font-bold shadow"
                >
                  <FileText size={13} /> Invoice PDF
                </button>

                {inv.status !== 'paid' && (
                  <button
                    onClick={() => updateInvoiceStatus(inv.id, 'paid')}
                    className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-bold border border-emerald-300"
                  >
                    Tandai Lunas
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {invoices.length === 0 && (
          <div className="card p-8 text-center text-gray-400 text-xs">
            Belum ada invoice terbit.
          </div>
        )}
      </div>

      {/* Item 4.3: INVOICE PDF GENERATOR MODAL */}
      {selectedInvoice && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 no-print">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-emerald-600" /> Invoice PDF Generator (Retainer + Add-on + Ads)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1 font-bold"
                >
                  <Printer size={14} /> Cetak / Export PDF
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document */}
            <div className="border border-gray-200 rounded-xl p-6 space-y-6 bg-white">
              <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-emerald-800 tracking-tight">INVOICE</h1>
                  <p className="text-xs font-mono font-bold text-gray-600">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">PT Bertumbuh Digital Indonesia</p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold block text-gray-900">KEPADA YTH:</span>
                  <span className="font-black text-emerald-700 text-sm">{selectedInvoice.clientName}</span>
                  <p className="text-gray-500 mt-1">Jatuh Tempo: {selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Deskripsi Layanan / Add-on</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Total (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 ? (
                      selectedInvoice.lineItems.map(item => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-semibold text-gray-600">{getTypeName(item.type)}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-900">{item.description}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">{formatCurrency(item.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-gray-600">Retainer Bulanan</td>
                        <td className="py-2.5 px-3 font-medium text-gray-900">{selectedInvoice.projectName}</td>
                        <td className="py-2.5 px-3 text-center font-bold">1</td>
                        <td className="py-2.5 px-3 text-right">{formatCurrency(selectedInvoice.total)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">{formatCurrency(selectedInvoice.total)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>PPN (0% Agency):</span>
                    <span className="font-semibold">Rp 0</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-emerald-800 pt-2 border-t border-gray-200">
                    <span>TOTAL PENAGIHAN:</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Transfer Info */}
              <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-1 border border-gray-200">
                <p className="font-bold text-gray-900 uppercase">TRANSFER PEMBAYARAN KEBANK REKENING RESMI:</p>
                <p className="text-gray-700">Bank Mandiri — <strong>1710074092001</strong> (a.n. PT Bertumbuh Digital Indonesia)</p>
                <p className="text-[10px] text-gray-400">Harap cantumkan Nomor Invoice pada berita acara transfer.</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-center text-xs">
                <div>
                  <p className="text-gray-400 text-[10px]">Hormat Kami,</p>
                  <div className="h-10 flex items-center justify-center font-semibold text-gray-300 italic">Signed Digitally</div>
                  <p className="font-bold text-gray-800">PT Bertumbuh Digital Indonesia</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px]">Diterima oleh Klien</p>
                  <div className="h-10 flex items-center justify-center font-semibold text-gray-300 italic">Signed Digitally</div>
                  <p className="font-bold text-gray-800">{selectedInvoice.clientName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

