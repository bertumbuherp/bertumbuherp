import { useFinanceStore } from '@/lib/store/financeStore';
import { CHART_OF_ACCOUNTS } from '@/lib/store/financeStore';

export default function BalanceSheet() {
  const journal = useFinanceStore(state => state.journal);

  // Simple balance sheet: assets = liabilities + equity
  const assets = CHART_OF_ACCOUNTS.filter(acc => acc.category === 'Asset');
  const liabilities = CHART_OF_ACCOUNTS.filter(acc => acc.category === 'Liability');
  const equity = CHART_OF_ACCOUNTS.filter(acc => acc.category === 'Equity');

  const computeTotal = (accounts: typeof assets) =>
    accounts.reduce((sum, acc) => {
      const entries = journal.filter(j => j.accountCode === acc.code);
      const debit = entries.filter(e => e.type === 'debit').reduce((s, e) => s + e.amount, 0);
      const credit = entries.filter(e => e.type === 'credit').reduce((s, e) => s + e.amount, 0);
      const net = acc.normalBalance === 'debit' ? debit - credit : credit - debit;
      return sum + net;
    }, 0);

  const totalAssets = computeTotal(assets);
  const totalLiabilities = computeTotal(liabilities);
  const totalEquity = computeTotal(equity);
  const balanced = totalAssets === totalLiabilities + totalEquity;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Neraca (Posisi Keuangan)</h2>
      <table className="min-w-full table-auto border border-gray-200">
        <thead className="bg-emerald-50">
          <tr>
            <th className="px-3 py-2 text-left">Kategori</th>
            <th className="px-3 py-2 text-right">Jumlah (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-3 py-2">Aset</td>
            <td className="px-3 py-2 text-right">{totalAssets.toLocaleString()}</td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2">Kewajiban</td>
            <td className="px-3 py-2 text-right">{totalLiabilities.toLocaleString()}</td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2">Ekuitas</td>
            <td className="px-3 py-2 text-right">{totalEquity.toLocaleString()}</td>
          </tr>
          <tr className="font-bold bg-emerald-100 border-t">
            <td className="px-3 py-2">Total Aset = Kewajiban + Ekuitas</td>
            <td className="px-3 py-2 text-right">{balanced ? 'Seimbang' : 'Tidak Seimbang'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
