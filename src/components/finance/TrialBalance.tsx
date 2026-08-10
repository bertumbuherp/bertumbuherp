import { useFinanceStore } from '@/lib/store/financeStore';
import { CHART_OF_ACCOUNTS } from '@/lib/store/financeStore';

export default function TrialBalance() {
  const journal = useFinanceStore(state => state.journal);

  const balances = CHART_OF_ACCOUNTS.map(coa => {
    const entries = journal.filter(j => j.accountCode === coa.code);
    const debit = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);
    const credit = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
    const net = coa.normalBalance === 'debit' ? debit - credit : credit - debit;
    return { ...coa, debit, credit, net };
  }).filter(acc => acc.debit || acc.credit);

  const totalDebit = balances.reduce((sum, a) => sum + a.debit, 0);
  const totalCredit = balances.reduce((sum, a) => sum + a.credit, 0);
  const balanced = totalDebit === totalCredit;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Neraca Saldo</h2>
      <table className="min-w-full table-auto border border-gray-200">
        <thead className="bg-emerald-50">
          <tr>
            <th className="px-3 py-2 text-left">Kode Akun</th>
            <th className="px-3 py-2 text-left">Nama Akun</th>
            <th className="px-3 py-2 text-right">Debit</th>
            <th className="px-3 py-2 text-right">Kredit</th>
          </tr>
        </thead>
        <tbody>
          {balances.map(acc => (
            <tr key={acc.code} className="border-t">
              <td className="px-3 py-2">{acc.code}</td>
              <td className="px-3 py-2">{acc.name}</td>
              <td className="px-3 py-2 text-right">{acc.debit.toLocaleString()}</td>
              <td className="px-3 py-2 text-right">{acc.credit.toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold bg-emerald-100">
            <td className="px-3 py-2" colSpan={2}>Total</td>
            <td className="px-3 py-2 text-right">{totalDebit.toLocaleString()}</td>
            <td className="px-3 py-2 text-right">{totalCredit.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <p className={`mt-2 ${balanced ? 'text-green-600' : 'text-red-600'}`}>Status: {balanced ? 'Seimbang' : 'Tidak Seimbang'}</p>
    </div>
  );
}
