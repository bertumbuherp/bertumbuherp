import { useFinanceStore } from '@/lib/store/financeStore';
import { CHART_OF_ACCOUNTS } from '@/lib/store/financeStore';

export default function EquityReport() {
  const journal = useFinanceStore(state => state.journal);

  const equityAccounts = CHART_OF_ACCOUNTS.filter(acc => acc.category === 'Equity');

  const balances = equityAccounts.map(acc => {
    const entries = journal.filter(j => j.accountCode === acc.code);
    const debit = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);
    const credit = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
    const net = acc.normalBalance === 'debit' ? debit - credit : credit - debit;
    return { ...acc, debit, credit, net };
  }).filter(acc => acc.debit || acc.credit);

  const totalEquity = balances.reduce((sum, a) => sum + a.net, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Laporan Modal (Equity)</h2>
      <table className="min-w-full table-auto border border-gray-200">
        <thead className="bg-emerald-50">
          <tr>
            <th className="px-3 py-2 text-left">Kode Akun</th>
            <th className="px-3 py-2 text-left">Nama Akun</th>
            <th className="px-3 py-2 text-right">Debit</th>
            <th className="px-3 py-2 text-right">Kredit</th>
            <th className="px-3 py-2 text-right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {balances.map(acc => (
            <tr key={acc.code} className="border-t">
              <td className="px-3 py-2">{acc.code}</td>
              <td className="px-3 py-2">{acc.name}</td>
              <td className="px-3 py-2 text-right">{acc.debit.toLocaleString()}</td>
              <td className="px-3 py-2 text-right">{acc.credit.toLocaleString()}</td>
              <td className="px-3 py-2 text-right">{acc.net.toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold bg-emerald-100">
            <td className="px-3 py-2" colSpan={4}>Total Modal</td>
            <td className="px-3 py-2 text-right">{totalEquity.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
