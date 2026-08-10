import { useFinanceStore } from '@/lib/store/financeStore';

export default function CashLedger() {
  const journal = useFinanceStore(state => state.journal);

  const cashEntries = journal.filter(entry =>
    entry.accountName.toLowerCase().includes('cash') ||
    entry.accountCode.toLowerCase().includes('cash')
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Buku Besar Cash</h2>
      {cashEntries.length === 0 ? (
        <p className="text-gray-600">Tidak ada transaksi cash.</p>
      ) : (
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-3 py-2 text-left">Tanggal</th>
              <th className="px-3 py-2 text-left">Deskripsi</th>
              <th className="px-3 py-2 text-left">Akun</th>
              <th className="px-3 py-2 text-left">Tipe</th>
              <th className="px-3 py-2 text-right">Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {cashEntries.map((e, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">{e.date}</td>
                <td className="px-3 py-2">{e.description}</td>
                <td className="px-3 py-2">{e.accountName}</td>
                <td className="px-3 py-2 capitalize">{e.type}</td>
                <td className="px-3 py-2 text-right">{Number(e.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
