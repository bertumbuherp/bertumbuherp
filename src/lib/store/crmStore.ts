import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, Deal, DealStage, ServicePackage, Quotation } from '@/lib/types';
import { deals as initialDeals, clients as initialClients } from '@/lib/mock-data';
import { usePMStore } from '@/lib/store/pmStore';
import { supabaseDataService } from '@/lib/services/supabaseDataService';

const initialPackages: ServicePackage[] = [
  { id: 'pkg-1', name: 'Brand Identity & Digital Launch', description: 'Paket lengkap pembuatan identitas brand dari nol beserta peluncuran digital.', basePrice: 85000000, deliverables: ['Logo Design', 'Brand Guideline', 'Social Media Setup'], color: 'var(--red)', status: 'approved', requestedBy: 'System' },
  { id: 'pkg-2', name: 'Social Media Management 6 Bulan', description: 'Pengelolaan media sosial bulanan dengan kontrak 6 bulan.', basePrice: 72000000, deliverables: ['12 Feeds/month', '8 Reels/month', 'Community Management'], color: 'var(--blue)', status: 'approved', requestedBy: 'System' },
  { id: 'pkg-3', name: 'Rebranding Package', description: 'Penyegaran visual dan strategi brand yang sudah ada.', basePrice: 62000000, deliverables: ['Visual Revamp', 'Copywriting Voice', 'Marketing Collaterals'], color: 'var(--green)', status: 'approved', requestedBy: 'System' },
  { id: 'pkg-4', name: 'Performance Marketing Package', description: 'Strategi iklan digital berbayar untuk meningkatkan konversi.', basePrice: 48000000, deliverables: ['Meta Ads', 'Google Ads', 'Monthly Analytics Report'], color: 'var(--orange)', status: 'approved', requestedBy: 'System' },
];

const initialQuotations: Quotation[] = [];

interface CrmStoreState {
  clients: Client[];
  deals: Deal[];
  packages: ServicePackage[];
  quotations: Quotation[];
  fetchFromSupabase: () => Promise<void>;
  clearMockData: () => void;
  
  // Client Actions
  addClient: (client: Client) => void;
  updateClientStatus: (clientId: string, status: Client['status']) => void;
  
  // Deal Actions
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDealStage: (dealId: string, stage: DealStage) => void;
  updateDealValue: (dealId: string, value: number) => void;
  updateDealPitching: (dealId: string, pitchingData: Partial<Pick<Deal, 'pitchingDate' | 'pitchingLocation' | 'pitchingNotes' | 'stage'>>) => void;
  deleteDeal: (dealId: string) => void;

  // Package Actions
  addPackage: (pkg: Omit<ServicePackage, 'id' | 'status'>) => void;
  updatePackageStatus: (pkgId: string, status: ServicePackage['status']) => void;
  updatePackage: (pkgId: string, updates: Partial<ServicePackage>) => void;
  deletePackage: (pkgId: string) => void;

  // Quotation Actions
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (quotationId: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (quotationId: string) => void;
  convertQuotationToDealAndProject: (quotationId: string) => { dealId: string; projectId: string } | null;
}

export const useCrmStore = create<CrmStoreState>()(
  persist(
    (set, get) => ({
      clients: [],
      deals: [],
      packages: initialPackages,
      quotations: [],

      fetchFromSupabase: async () => {
        const [dbClients, dbDeals, dbPackages, dbQuotations] = await Promise.all([
          supabaseDataService.getClients(),
          supabaseDataService.getDeals(),
          supabaseDataService.getPackages(),
          supabaseDataService.getQuotations(),
        ]);

        if (dbClients && dbClients.length > 0) {
          const mappedClients: Client[] = dbClients.map((c: any) => ({
            id: c.id,
            organizationId: c.organization_id || 'org_bertumbuh',
            name: c.name,
            industry: c.industry || 'Umum',
            status: c.status || 'active',
            contacts: c.contacts || [],
            ownedByAe: c.owned_by_ae || 'ae@bertumbuh.id',
            totalRevenue: Number(c.total_revenue) || 0,
            activeProjects: c.active_projects || 0,
            createdAt: c.created_at || new Date().toISOString(),
          }));

          set({ clients: mappedClients });
        }

        if (dbDeals && dbDeals.length > 0) {
          const mappedDeals: Deal[] = dbDeals.map((d: any) => ({
            id: d.id,
            organizationId: d.organization_id || 'org_bertumbuh',
            clientName: d.client_name,
            clientId: d.client_id,
            title: d.title,
            stage: d.stage || 'lead',
            value: Number(d.value) || 0,
            probability: d.probability || 50,
            aeId: d.ae_id || 'u3',
            aeName: d.ae_name || 'Account Executive',
            source: d.source || 'Direct',
            createdAt: d.created_at || new Date().toISOString(),
            updatedAt: d.updated_at || new Date().toISOString(),
          }));
          set({ deals: mappedDeals });
        }

        if (dbPackages && dbPackages.length > 0) {
          const mappedPackages: ServicePackage[] = dbPackages.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            basePrice: Number(p.base_price) || 0,
            deliverables: p.deliverables || [],
            color: p.color || 'var(--blue)',
            status: p.status || 'approved',
            requestedBy: 'System',
          }));
          set({ packages: mappedPackages });
        }

        if (dbQuotations && dbQuotations.length > 0) {
          const mappedQuotations: Quotation[] = dbQuotations.map((q: any) => ({
            id: q.id,
            organizationId: 'org_bertumbuh',
            quotationNumber: q.quotation_number,
            clientId: q.client_id,
            clientName: q.client_name,
            dealId: q.deal_id,
            issueDate: q.issue_date || new Date().toISOString(),
            validityDays: q.validity_days || 30,
            lineItems: q.line_items || [],
            subtotal: Number(q.subtotal) || 0,
            tax: Number(q.tax) || 0,
            total: Number(q.total) || 0,
            status: q.status || 'draft',
            notes: q.notes || '',
          }));
          set({ quotations: mappedQuotations });
        }
      },

      clearMockData: () => {
        set({ clients: [], deals: [], packages: [], quotations: [] });
      },

      addClient: (client) => {
        set((state) => ({ clients: [client, ...state.clients] }));
        supabaseDataService.upsertClient({
          id: client.id.startsWith('c_') || client.id.startsWith('client-') ? undefined : client.id,
          name: client.name,
          industry: client.industry,
          status: client.status,
          contacts: client.contacts,
          owned_by_ae: client.ownedByAe,
          total_revenue: client.totalRevenue,
          active_projects: client.activeProjects,
        });
      },

      updateClientStatus: (clientId, status) => set((state) => ({
        clients: state.clients.map(c => c.id === clientId ? { ...c, status } : c)
      })),


      addDeal: (dealData) =>
        set((state) => {
          const newDeal: Deal = {
            ...dealData,
            id: `deal-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { deals: [newDeal, ...state.deals] };
        }),

      updateDealStage: (dealId, stage) => {
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? { ...deal, stage, updatedAt: new Date().toISOString() }
              : deal
          ),
        }));

        if (stage === 'won') {
          const deal = get().deals.find(d => d.id === dealId);
          if (deal) {
            usePMStore.getState().addProject({
              id: `proj-${Date.now()}`,
              organizationId: deal.organizationId,
              name: deal.title,
              clientId: deal.clientId || `c-${Date.now()}`,
              clientName: deal.clientName,
              pmId: '',
              pmName: 'Belum Ditugaskan',
              status: 'planning',
              billingType: 'project',
              contractValue: deal.value,
              budget: deal.value * 0.7, // Asumsi margin 30%
              actualCost: 0,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              members: [],
              addOns: [],
              milestones: [],
              subTeams: [],
              reports: [],
              activities: [],
              createdAt: new Date().toISOString()
            });
          }
        }
      },

      updateDealValue: (dealId, value) =>
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? { ...deal, value, updatedAt: new Date().toISOString() }
              : deal
          ),
        })),

      updateDealPitching: (dealId, pitchingData) => {
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === dealId
              ? { ...deal, ...pitchingData, updatedAt: new Date().toISOString() }
              : deal
          ),
        }));

        if (pitchingData.stage === 'won') {
          const deal = get().deals.find(d => d.id === dealId);
          if (deal) {
            usePMStore.getState().addProject({
              id: `proj-${Date.now()}`,
              organizationId: deal.organizationId,
              name: deal.title,
              clientId: deal.clientId || `c-${Date.now()}`,
              clientName: deal.clientName,
              pmId: '',
              pmName: 'Belum Ditugaskan',
              status: 'planning',
              billingType: 'project',
              contractValue: deal.value,
              budget: deal.value * 0.7,
              actualCost: 0,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              members: [],
              addOns: [],
              milestones: [],
              subTeams: [],
              reports: [],
              activities: [],
              createdAt: new Date().toISOString()
            });
          }
        }
      },

      deleteDeal: (dealId) =>
        set((state) => ({
          deals: state.deals.filter((d) => d.id !== dealId),
        })),

      addPackage: (pkgData) => 
        set((state) => {
          const newPkg: ServicePackage = {
            ...pkgData,
            id: `pkg-${Date.now()}`,
            status: 'pending' // Paket baru otomatis masuk draft/pending
          };
          return { packages: [newPkg, ...state.packages] };
        }),

      updatePackageStatus: (pkgId, status) =>
        set((state) => ({
          packages: state.packages.map(pkg => 
            pkg.id === pkgId ? { ...pkg, status } : pkg
          )
        })),

      updatePackage: (pkgId, updates) =>
        set((state) => ({
          packages: state.packages.map(pkg => 
            pkg.id === pkgId ? { ...pkg, ...updates } : pkg
          )
        })),

      deletePackage: (pkgId) =>
        set((state) => ({
          packages: state.packages.filter(pkg => pkg.id !== pkgId)
        })),

      addQuotation: (quotation) =>
        set((state) => ({
          quotations: [quotation, ...state.quotations]
        })),

      updateQuotation: (quotationId, updates) =>
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === quotationId ? { ...q, ...updates } : q
          )
        })),

      deleteQuotation: (quotationId) =>
        set((state) => ({
          quotations: state.quotations.filter((q) => q.id !== quotationId)
        })),

      convertQuotationToDealAndProject: (quotationId) => {
        const quotation = get().quotations.find(q => q.id === quotationId);
        if (!quotation) return null;

        // 1. Update quotation status to approved
        set((state) => ({
          quotations: state.quotations.map(q => q.id === quotationId ? { ...q, status: 'approved' } : q)
        }));

        // 2. Find or create Deal
        let targetDeal = get().deals.find(d => d.id === quotation.dealId || d.clientId === quotation.clientId);
        let dealId = targetDeal?.id || `deal-${Date.now()}`;

        if (targetDeal) {
          get().updateDealStage(targetDeal.id, 'won');
          get().updateDealValue(targetDeal.id, quotation.total);
        } else {
          get().addDeal({
            organizationId: quotation.organizationId || 'org-1',
            clientName: quotation.clientName,
            clientId: quotation.clientId,
            title: `Deal ${quotation.clientName} (${quotation.quotationNumber})`,
            stage: 'won',
            value: quotation.total,
            probability: 100,
            aeId: 'u1',
            aeName: 'Anda (Account Executive)',
            source: 'Quotation Conversion',
            notes: `Dikonversi dari Quotation ${quotation.quotationNumber}`
          });
        }

        // 3. Auto-onboard Project in PM Store
        const projectId = `proj-${Date.now()}`;
        usePMStore.getState().addProject({
          id: projectId,
          organizationId: quotation.organizationId || 'org-1',
          name: `Proyek ${quotation.clientName} (${quotation.quotationNumber})`,
          clientId: quotation.clientId,
          clientName: quotation.clientName,
          pmId: '',
          pmName: 'Belum Ditugaskan',
          status: 'planning',
          billingType: quotation.lineItems.some(i => i.category === 'Branding' || i.category === 'Sosmed/CC') ? 'retainer' : 'project',
          contractValue: quotation.total,
          budget: quotation.total * 0.7,
          actualCost: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + quotation.validityDays * 24 * 60 * 60 * 1000).toISOString(),
          members: [],
          addOns: [],
          milestones: [
            { id: `m1-${Date.now()}`, projectId: projectId, name: 'Kickoff Meeting & Brief Approval', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false },
            { id: `m2-${Date.now()}`, projectId: projectId, name: 'Penyerahan Deliverables Utama', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false }
          ],
          subTeams: ['Design'],
          reports: [],
          activities: [
            { id: `act-${Date.now()}`, projectId: projectId, timestamp: new Date().toISOString(), userName: 'Account Executive', action: 'Konversi Quotation ke Proyek', target: quotation.quotationNumber }
          ],
          createdAt: new Date().toISOString()
        });

        return { dealId, projectId };
      },
    }),
    {
      name: 'bertumbuh-crm-storage',
    }
  )
);
