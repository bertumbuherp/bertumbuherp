import Header from '@/components/layout/Header';
import { ClientListView } from '@/components/crm/ClientListView';

export default function CRMClientsPage() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Database Klien" subtitle="Master Data Klien & Kontak" />
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <ClientListView />
      </div>
    </div>
  );
}
