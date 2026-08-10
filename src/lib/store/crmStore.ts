import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, Deal, DealStage, ServicePackage, Quotation } from '@/lib/types';
import { deals as initialDeals, clients as initialClients } from '@/lib/mock-data';
import { usePMStore } from '@/lib/store/pmStore';

const initialPackages: ServicePackage[] = [
  { id: 'pkg-1', name: 'Brand Identity & Digital Launch', description: 'Paket lengkap pembuatan identitas brand dari nol beserta peluncuran digital.', basePrice: 85000000, deliverables: ['Logo Design', 'Brand Guideline', 'Social Media Setup'], color: 'var(--red)', status: 'approved', requestedBy: 'System' },
  { id: 'pkg-2', name: 'Social Media Management 6 Bulan', description: 'Pengelolaan media sosial bulanan dengan kontrak 6 bulan.', basePrice: 72000000, deliverables: ['12 Feeds/month', '8 Reels/month', 'Community Management'], color: 'var(--blue)', status: 'approved', requestedBy: 'System' },
  { id: 'pkg-3', name: 'Rebranding Package', description: 'Penyegaran visual dan strategi brand yang sudah ada.', basePrice: 62000000, deliverables: ['Visual Revamp', 'Copywriting Voice', 'Marketing Collaterals'], color: 'var(--green)', status: 'approved', requestedBy: 'System' },
  { id: 'pkg-4', name: 'Performance Marketing Package', description: 'Strategi iklan digital berbayar untuk meningkatkan konversi.', basePrice: 48000000, deliverables: ['Meta Ads', 'Google Ads', 'Monthly Analytics Report'], color: 'var(--orange)', status: 'approved', requestedBy: 'System' },
];

const initialQuotations: Quotation[] = [
  {
    id: 'qto-1',
    organizationId: 'org-1',
    quotationNumber: 'QTO-2026-06-001',
    clientId: 'client-1',
    clientName: 'Raja Usus',
    dealId: 'deal-1',
    issueDate: new Date('2026-06-12T00:00:00.000Z').toISOString(),
    validityDays: 30,
    lineItems: [
      { id: 'item-1', description: 'Performance Marketing Package (Bulanan)', quantity: 1, unitPrice: 40000000, total: 40000000 },
      { id: 'item-2', description: 'Setup & Integrasi Tracking (One-time)', quantity: 1, unitPrice: 8000000, total: 8000000 }
    ],
    subtotal: 48000000,
    tax: 5280000,
    total: 53280000,
    status: 'sent',
    notes: 'Penawaran awal untuk campaign Q3.'
  },
  {
    id: 'qto-2',
    organizationId: 'org-1',
    quotationNumber: 'QTO-2026-06-002',
    clientId: 'client-2',
    clientName: 'Sambal Bakar',
    dealId: 'deal-2',
    issueDate: new Date('2026-06-13T00:00:00.000Z').toISOString(),
    validityDays: 14,
    lineItems: [
      { id: 'item-3', description: 'Social Media Management 6 Bulan', quantity: 1, unitPrice: 72000000, total: 72000000 }
    ],
    subtotal: 72000000,
    tax: 7920000,
    total: 79920000,
    status: 'draft',
    notes: 'Paket branding lengkap.'
  }
];

interface CrmStoreState {
  clients: Client[];
  deals: Deal[];
  packages: ServicePackage[];
  quotations: Quotation[];
  
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
      clients: initialClients,
      deals: initialDeals.map(d => ({
        ...d,
        // Make sure deals have createdAt or source if undefined
        source: d.source || 'Website',
      })),
      packages: initialPackages,
      quotations: initialQuotations,

      addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
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
