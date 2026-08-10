import { useFinanceStore } from '@/lib/store/financeStore';
import { CHART_OF_ACCOUNTS } from '@/lib/store/financeStore';

export default function ProfitLossReport() {
  const journal = useFinanceStore(state => state.journal);

  // Compute total revenue and total expense (including COGS)
  const revenueAccounts = CHART_OF_ACCOUNTS.filter(acc => acc.category === 'Revenue');
  const expenseAccounts = CHART_OF_ACCOUNTS.filter(acc => acc.category === 'Expense');

  const totalRevenue = revenueAccounts.reduce((sum, acc) => {
    const entries = journal.filter(j => j.accountCode === acc.code && j.type === 'credit');
    return sum + entries.reduce((s, e) => s + e.amount, 0);
  }, 0);

  const totalExpense = expenseAccounts.reduce((sum, acc) => {
    const entries = journal.filter(j => j.accountCode === acc.code && j.type === 'debit');
    return sum + entries.reduce((s, e) => s + e.amount, 0);
  }, 0);

  const netProfit = totalRevenue - totalExpense;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Laporan Laba Rugi (Profit & Loss)</h2>
      <table className="min-w-full table-auto border border-gray-200">
        <thead className="bg-emerald-50">
          <tr>
            <th className="px-3 py-2 text-left">Deskripsi</th>
            <th className="px-3 py-2 text-right">Jumlah (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-3 py-2">Total Pendapatan</td>
            <td className="px-3 py-2 text-right">{totalRevenue.toLocaleString()}</td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2">Total Beban</td>
            <td className="px-3 py-2 text-right">{totalExpense.toLocaleString()}</td>
          </tr>
          <tr className="font-bold bg-emerald-100 border-t">
            <td className="px-3 py-2">Laba Bersih</td>
            <td className="px-3 py-2 text-right text-emerald-800">{netProfit.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
