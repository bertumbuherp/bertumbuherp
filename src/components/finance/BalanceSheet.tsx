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
  
  // Current Year Profit calculation from Revenue (4.x) minus Expense (5.x & 6.x) accounts
  const activeJournal = journal.filter(j => !j.isVoided);
  const totalRevenue = activeJournal
    .filter(j => j.accountCode.startsWith('4.'))
    .reduce((s, j) => s + (j.type === 'credit' ? j.amount : -j.amount), 0);
  const totalExpenses = activeJournal
    .filter(j => j.accountCode.startsWith('5.') || j.accountCode.startsWith('6.'))
    .reduce((s, j) => s + (j.type === 'debit' ? j.amount : -j.amount), 0);
  const currentNetProfit = totalRevenue - totalExpenses;

  const baseEquity = computeTotal(equity);
  const totalEquity = baseEquity + currentNetProfit;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const balanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Neraca (Posisi Keuangan)</h2>
      <table className="min-w-full table-auto border border-gray-200 text-sm">
        <thead className="bg-emerald-50">
          <tr>
            <th className="px-3 py-2 text-left">Kategori Akun</th>
            <th className="px-3 py-2 text-right">Jumlah (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-3 py-2 font-semibold">Total Aset</td>
            <td className="px-3 py-2 text-right font-bold text-emerald-700">{totalAssets.toLocaleString('id-ID')}</td>
          </tr>
          <tr className="border-t bg-gray-50/50">
            <td className="px-3 py-2 font-semibold">Total Kewajiban (Liabilities)</td>
            <td className="px-3 py-2 text-right font-semibold text-gray-800">{totalLiabilities.toLocaleString('id-ID')}</td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2">Modal &amp; Laba Ditahan</td>
            <td className="px-3 py-2 text-right text-gray-700">{baseEquity.toLocaleString('id-ID')}</td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2 text-emerald-700 font-semibold">+ Laba Tahun Berjalan (Net Profit)</td>
            <td className="px-3 py-2 text-right text-emerald-700 font-semibold">{currentNetProfit.toLocaleString('id-ID')}</td>
          </tr>
          <tr className="border-t bg-emerald-50 font-semibold">
            <td className="px-3 py-2">Total Ekuitas (Equity)</td>
            <td className="px-3 py-2 text-right text-emerald-800 font-bold">{totalEquity.toLocaleString('id-ID')}</td>
          </tr>
          <tr className="font-bold bg-emerald-100 border-t-2 border-emerald-300">
            <td className="px-3 py-2">Keseimbangan: Aset = Kewajiban + Ekuitas</td>
            <td className="px-3 py-2 text-right">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${balanced ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                {balanced ? '✓ Seimbang (Balanced)' : '✗ Tidak Seimbang'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
