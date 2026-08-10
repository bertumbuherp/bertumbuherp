'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFinanceStore, CHART_OF_ACCOUNTS } from '@/lib/store/financeStore';
import { createPortal } from 'react-dom';

interface Row {
  accountCode: string;
  accountName: string;
  type: 'debit' | 'credit';
  amount: number;
}

/* ── Searchable Account Combobox (Portal-based dropdown) ──── */
function AccountCombobox({
  value,
  displayValue,
  onChange,
}: {
  value: string;
  displayValue: string;
  onChange: (code: string, name: string) => void;
}) {
  const [query, setQuery] = useState(displayValue);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setQuery(displayValue);
  }, [displayValue]);

  // Recalculate position when open
  const updatePosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = CHART_OF_ACCOUNTS.filter((acc) => {
    const q = query.toLowerCase();
    return acc.code.toLowerCase().includes(q) || acc.name.toLowerCase().includes(q);
  });

  const handleSelect = (acc: (typeof CHART_OF_ACCOUNTS)[0]) => {
    const display = `${acc.code} — ${acc.name}`;
    setQuery(display);
    onChange(acc.code, acc.name);
    setOpen(false);
    setHighlightIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIdx >= 0 && highlightIdx < filtered.length) {
      e.preventDefault();
      handleSelect(filtered[highlightIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const categoryColor: Record<string, { bg: string; text: string }> = {
    Asset: { bg: '#dbeafe', text: '#1e40af' },
    Liability: { bg: '#fef3c7', text: '#92400e' },
    Equity: { bg: '#ede9fe', text: '#5b21b6' },
    Revenue: { bg: '#d1fae5', text: '#065f46' },
    Expense: { bg: '#fee2e2', text: '#991b1b' },
  };

  const dropdown = open && (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 9999,
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '10px',
        boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
        maxHeight: '220px',
        overflowY: 'auto',
      }}
    >
      {filtered.length === 0 ? (
        <div style={{ padding: '14px 16px', fontSize: '13px', color: '#9ca3af' }}>
          Tidak ditemukan akun &quot;{query}&quot;
        </div>
      ) : (
        filtered.map((acc, i) => {
          const colors = categoryColor[acc.category] || { bg: '#f3f4f6', text: '#374151' };
          return (
            <div
              key={acc.code}
              onClick={() => handleSelect(acc)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                borderBottom: '1px solid #f3f4f6',
                background: i === highlightIdx ? '#ecfdf5' : '#fff',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ecfdf5';
                setHighlightIdx(i);
              }}
              onMouseLeave={(e) => {
                if (i !== highlightIdx) e.currentTarget.style.background = '#fff';
              }}
            >
              <span>
                <strong style={{ color: '#059669', fontWeight: 600 }}>{acc.code}</strong>
                <span style={{ marginLeft: '10px', color: '#374151' }}>{acc.name}</span>
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  background: colors.bg,
                  color: colors.text,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {acc.category}
              </span>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        placeholder="Cari kode / nama akun…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlightIdx(-1);
        }}
        onFocus={() => {
          setOpen(true);
          updatePosition();
        }}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          fontSize: '14px',
          outline: 'none',
        }}
      />
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function TransactionInput() {
  const addJournalEntries = useFinanceStore((s) => s.addJournalEntries);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [rows, setRows] = useState<Row[]>([
    { accountCode: '1.1.1.1.2.0', accountName: 'Bank Mandiri - PT Bertumbuh', type: 'debit', amount: 0 },
    { accountCode: '4.1.0.0.0.0', accountName: 'Pendapatan Jasa', type: 'credit', amount: 0 },
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAccountSelect = (index: number, code: string, name: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], accountCode: code, accountName: name };
    setRows(newRows);
  };

  const handleRowChange = (index: number, field: keyof Row, value: Row[keyof Row]) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value } as Row;
    setRows(newRows);
  };

  const addJournalEntry = useFinanceStore((s) => s.addJournalEntry);

  const addRow = () =>
    setRows([...rows, { accountCode: '', accountName: '', type: 'debit', amount: 0 }]);
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  const totalDebit = rows.reduce(
    (sum, r) => (r.type === 'debit' ? sum + Number(r.amount) : sum),
    0
  );
  const totalCredit = rows.reduce(
    (sum, r) => (r.type === 'credit' ? sum + Number(r.amount) : sum),
    0
  );

  const isBalanced = totalDebit === totalCredit && totalDebit > 0 && !!description && !!date;

  const handleSaveClick = () => {
    if (!isBalanced) return;
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    rows.forEach((row) => {
      addJournalEntry({
        id: 'j_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        date,
        description: isSimulationMode ? `[SIMULASI] ${description}` : description,
        account: row.accountName,
        accountCode: row.accountCode,
        accountName: row.accountName,
        type: row.type,
        amount: Number(row.amount),
        isSimulation: isSimulationMode
      });
    });

    if (isSimulationMode) {
      setSuccessMsg(`🧪 Mode Simulasi Berhasil: Transaksi Debet ${totalDebit.toLocaleString('id-ID')} & Kredit ${totalCredit.toLocaleString('id-ID')} seimbang! (Disimpan sebagai Jurnal Simulasi)`);
    } else {
      setSuccessMsg(`✅ Jurnal Keuangan Berhasil Diposting Permanen! Debet ${totalDebit.toLocaleString('id-ID')} = Kredit ${totalCredit.toLocaleString('id-ID')}`);
    }

    setTimeout(() => setSuccessMsg(''), 5000);
    setDescription('');
    setRows([{ accountCode: '', accountName: '', type: 'debit', amount: 0 }]);
    setShowConfirm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
            Input Jurnal Ganda &amp; Mode Simulasi
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
            Pencatatan Debet-Kredit Akuntansi &amp; Simulasi Uji Dampak Laporan Keuangan
          </p>
        </div>

        {/* Item 4.4: Mode Simulasi Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isSimulationMode ? '#fef3c7' : '#f3f4f6', padding: '6px 14px', borderRadius: '12px', border: isSimulationMode ? '1px solid #f59e0b' : '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: isSimulationMode ? '#b45309' : '#374151' }}>
            🧪 Mode Simulasi Jurnal (Trial Run)
          </span>
          <button
            type="button"
            onClick={() => setIsSimulationMode(!isSimulationMode)}
            style={{
              width: '38px',
              height: '22px',
              borderRadius: '12px',
              background: isSimulationMode ? '#d97706' : '#9ca3af',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s'
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '2px',
                left: isSimulationMode ? '18px' : '2px',
                transition: 'left 0.2s'
              }}
            />
          </button>
        </div>
      </div>

      {/* Banner Simulation Notice */}
      {isSimulationMode && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '12px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️ <strong>MODE SIMULASI JURNAL AKTIF</strong> — Jurnal yang dimasukkan akan ditandai sebagai entri simulasi untuk melihat dampaknya ke Neraca &amp; Laba Rugi tanpa mengubah data riil final.</span>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', fontSize: '13px', color: '#166534', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Date & Description */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
            Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>
            Deskripsi
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Penjualan jasa bulan Mei"
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Journal Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 130px 180px 50px',
            gap: '12px',
            padding: '10px 14px',
            background: '#ecfdf5',
            borderRadius: '10px 10px 0 0',
            border: '1px solid #a7f3d0',
            borderBottom: 'none',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#065f46' }}>Akun</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#065f46' }}>Tipe</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#065f46' }}>Jumlah (Rp)</span>
          <span />
        </div>

        {/* Rows */}
        {rows.map((row, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 130px 180px 50px',
              gap: '12px',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderTop: idx === 0 ? '1px solid #e5e7eb' : 'none',
              background: '#fff',
              borderRadius: idx === rows.length - 1 ? '0 0 10px 10px' : undefined,
              alignItems: 'center',
            }}
          >
            <AccountCombobox
              value={row.accountCode}
              displayValue={
                row.accountCode ? `${row.accountCode} — ${row.accountName}` : ''
              }
              onChange={(code, name) => handleAccountSelect(idx, code, name)}
            />
            <select
              value={row.type}
              onChange={(e) => handleRowChange(idx, 'type', e.target.value as 'debit' | 'credit')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                background: '#fff',
              }}
            >
              <option value="debit">Debit</option>
              <option value="credit">Kredit</option>
            </select>
            <input
              type="number"
              min="0"
              value={row.amount}
              onChange={(e) => handleRowChange(idx, 'amount', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(idx)}
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        style={{
          alignSelf: 'flex-start',
          padding: '8px 20px',
          background: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        + Tambah Baris
      </button>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 0',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <div style={{ fontSize: '14px', color: '#374151' }}>
          <span style={{ fontWeight: 600 }}>Total Debit:</span> Rp{' '}
          {totalDebit.toLocaleString('id-ID')}
          <span style={{ marginLeft: '24px', fontWeight: 600 }}>Total Kredit:</span> Rp{' '}
          {totalCredit.toLocaleString('id-ID')}
        </div>
        <button
          onClick={handleSaveClick}
          disabled={!isBalanced}
          style={{
            padding: '10px 28px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isBalanced ? 'pointer' : 'not-allowed',
            background: isBalanced ? '#059669' : '#d1d5db',
            color: '#fff',
          }}
        >
          Simpan Jurnal
        </button>
      </div>

      {!isBalanced && (
        <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>
          ⚠ Pastikan total Debit = Kredit dan semua bidang terisi.
        </p>
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirm &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowConfirm(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                width: '100%',
                maxWidth: '560px',
                padding: '28px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                  }}
                >
                  ⚠️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                    Konfirmasi Jurnal
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    Periksa kembali data sebelum menyimpan
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div
                style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Tanggal</span>
                    <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{date}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Deskripsi</span>
                    <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{description}</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Detail Jurnal</span>
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {rows.map((row, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '13px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: row.type === 'debit' ? '#dbeafe' : '#fce7f3',
                              color: row.type === 'debit' ? '#1e40af' : '#9d174d',
                            }}
                          >
                            {row.type === 'debit' ? 'D' : 'K'}
                          </span>
                          <span style={{ color: '#374151' }}>{row.accountName}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>
                          Rp {Number(row.amount).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: '#1e40af' }}>Total Debit: Rp {totalDebit.toLocaleString('id-ID')}</span>
                  <span style={{ color: '#9d174d' }}>Total Kredit: Rp {totalCredit.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmSave}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#059669',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  ✓ Konfirmasi & Simpan
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
