import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { initialsOf, repairLines, uid } from "@/lib/shop/format";
import { seedData } from "@/lib/shop/seed";
import type {
  Customer,
  DrawerState,
  Estimate,
  Expense,
  Inquiry,
  Invoice,
  Line,
  ModalCtx,
  ModalKind,
  Part,
  PartsFilter,
  PayMethod,
  PopoverKind,
  Repair,
  RepairStatus,
  RepairsFilter,
  Settings,
  ViewId,
} from "@/lib/shop/types";

type IntakeInput = {
  customerId: string;
  newCustomer: { name: string; phone: string; email: string } | null;
  brand: string;
  tool: string;
  model: string;
  serial: string;
  issue: string;
  priority: "normal" | "rush";
  tech: string;
  labor: number;
};

type CustomerInput = { name: string; phone: string; email: string; notes: string };
type PartInput = Omit<Part, "id" | "sku"> & { sku?: string };
type EstimateInput = { customerId: string; repairId: string | null; lines: Line[]; note: string };
type InvoiceInput = { customerId: string; repairId: string | null; lines: Line[] };
type ExpenseInput = Omit<Expense, "id">;
type InquiryInput = { name: string; phone: string; channel: Inquiry["channel"]; message: string };

export type ShopState = ReturnType<typeof seedData> & {
  view: ViewId;
  sidebarPinned: boolean;
  mobileNav: boolean;
  query: string;
  popover: PopoverKind;
  modal: ModalKind | null;
  modalCtx: ModalCtx;
  drawer: DrawerState;
  repairsFilter: RepairsFilter;
  partsFilter: PartsFilter;
  setView: (view: ViewId) => void;
  setSidebarPinned: (pinned: boolean) => void;
  setMobileNav: (open: boolean) => void;
  setQuery: (query: string) => void;
  setPopover: (popover: PopoverKind) => void;
  setRepairsFilter: (filter: RepairsFilter) => void;
  setPartsFilter: (filter: PartsFilter) => void;
  openModal: (modal: ModalKind, ctx?: ModalCtx) => void;
  closeModal: () => void;
  openDrawer: (drawer: NonNullable<DrawerState>) => void;
  closeDrawer: () => void;
  intake: (input: IntakeInput) => string;
  addCustomer: (input: CustomerInput) => string;
  updateCustomer: (id: string, patch: Partial<CustomerInput>) => void;
  updateRepair: (id: string, patch: Partial<Pick<Repair, "tech" | "labor" | "priority" | "issue" | "notes" | "serial">>) => void;
  setRepairStatus: (id: string, status: RepairStatus) => void;
  addPartUse: (repairId: string, partId: string, qty: number) => string | null;
  removePartUse: (repairId: string, partId: string) => void;
  adjustPart: (id: string, delta: number) => void;
  addPart: (input: PartInput) => string;
  addEstimate: (input: EstimateInput) => string;
  setEstimateStatus: (id: string, status: Estimate["status"]) => void;
  addInvoice: (input: InvoiceInput) => string;
  markInvoicePaid: (id: string, method: PayMethod) => void;
  voidInvoice: (id: string) => void;
  releaseRepair: (id: string, method: PayMethod) => string | null;
  addExpense: (input: ExpenseInput) => void;
  addInquiry: (input: InquiryInput) => void;
  updateInquiry: (id: string, patch: Partial<Pick<Inquiry, "status" | "reply">>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addTech: (name: string) => void;
  removeTech: (name: string) => void;
  resetDemo: () => void;
};

function freshUi(): Pick<
  ShopState,
  "view" | "sidebarPinned" | "mobileNav" | "query" | "popover" | "modal" | "modalCtx" | "drawer" | "repairsFilter" | "partsFilter"
> {
  return {
    view: "dashboard",
    sidebarPinned: true,
    mobileNav: false,
    query: "",
    popover: null,
    modal: null,
    modalCtx: {},
    drawer: null,
    repairsFilter: "open",
    partsFilter: "all",
  };
}

function memoryStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
}

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      ...seedData(),
      ...freshUi(),

      setView: (view) => set({ view, mobileNav: false, popover: null }),
      setSidebarPinned: (sidebarPinned) => set({ sidebarPinned }),
      setMobileNav: (mobileNav) => set({ mobileNav, popover: null }),
      setQuery: (query) => set({ query, popover: null }),
      setPopover: (popover) => set({ popover }),
      setRepairsFilter: (repairsFilter) => set({ repairsFilter }),
      setPartsFilter: (partsFilter) => set({ partsFilter }),
      openModal: (modal, modalCtx = {}) => set({ modal, modalCtx, popover: null }),
      closeModal: () => set({ modal: null, modalCtx: {} }),
      openDrawer: (drawer) => set({ drawer, popover: null }),
      closeDrawer: () => set({ drawer: null }),

      intake: (input) => {
        const state = get();
        let customerId = input.customerId;
        let customers = state.customers;
        if (input.newCustomer) {
          customerId = uid("c");
          customers = [
            {
              id: customerId,
              name: input.newCustomer.name.trim(),
              phone: input.newCustomer.phone.trim(),
              email: input.newCustomer.email.trim(),
              notes: "",
              createdAt: new Date().toISOString(),
            },
            ...customers,
          ];
        }
        const number = state.seq.repair;
        const id = uid("r");
        const ticket: Repair = {
          id,
          number,
          customerId,
          brand: input.brand.trim(),
          tool: input.tool.trim(),
          model: input.model.trim(),
          serial: input.serial.trim(),
          issue: input.issue.trim(),
          status: "in_queue",
          priority: input.priority,
          tech: input.tech,
          intakeAt: new Date().toISOString(),
          completedAt: null,
          labor: input.labor,
          notes: "",
          partsUsed: [],
        };
        set({
          customers,
          repairs: [ticket, ...state.repairs],
          seq: { ...state.seq, repair: number + 1 },
        });
        return id;
      },

      addCustomer: (input) => {
        const id = uid("c");
        const customer: Customer = {
          id,
          name: input.name.trim(),
          phone: input.phone.trim(),
          email: input.email.trim(),
          notes: input.notes.trim(),
          createdAt: new Date().toISOString(),
        };
        set({ customers: [customer, ...get().customers] });
        return id;
      },

      updateCustomer: (id, patch) =>
        set({
          customers: get().customers.map((customer) => (customer.id === id ? { ...customer, ...patch } : customer)),
        }),

      updateRepair: (id, patch) =>
        set({
          repairs: get().repairs.map((repair) => (repair.id === id ? { ...repair, ...patch } : repair)),
        }),

      setRepairStatus: (id, status) =>
        set({
          repairs: get().repairs.map((repair) => {
            if (repair.id !== id) return repair;
            return {
              ...repair,
              status,
              completedAt: status === "picked_up" ? (repair.completedAt ?? new Date().toISOString()) : null,
            };
          }),
        }),

      addPartUse: (repairId, partId, qty) => {
        const state = get();
        const part = state.parts.find((item) => item.id === partId);
        const repair = state.repairs.find((item) => item.id === repairId);
        if (!part || !repair) return "That part is no longer on the shelf.";
        if (qty < 1) return "Quantity has to be at least 1.";
        if (part.qty < qty) return `Only ${part.qty} ${part.name} on hand.`;
        const existing = repair.partsUsed.find((use) => use.partId === partId);
        set({
          parts: state.parts.map((item) => (item.id === partId ? { ...item, qty: item.qty - qty } : item)),
          repairs: state.repairs.map((item) => {
            if (item.id !== repairId) return item;
            const partsUsed = existing
              ? item.partsUsed.map((use) => (use.partId === partId ? { ...use, qty: use.qty + qty } : use))
              : [...item.partsUsed, { partId, qty }];
            return { ...item, partsUsed };
          }),
        });
        return null;
      },

      removePartUse: (repairId, partId) => {
        const state = get();
        const repair = state.repairs.find((item) => item.id === repairId);
        const use = repair?.partsUsed.find((item) => item.partId === partId);
        if (!repair || !use) return;
        set({
          parts: state.parts.map((part) => (part.id === partId ? { ...part, qty: part.qty + use.qty } : part)),
          repairs: state.repairs.map((item) =>
            item.id === repairId ? { ...item, partsUsed: item.partsUsed.filter((row) => row.partId !== partId) } : item,
          ),
        });
      },

      adjustPart: (id, delta) =>
        set({
          parts: get().parts.map((part) =>
            part.id === id ? { ...part, qty: Math.max(0, part.qty + delta) } : part,
          ),
        }),

      addPart: (input) => {
        const state = get();
        const number = state.seq.part;
        const id = uid("p");
        const part: Part = {
          id,
          sku: input.sku?.trim() || `BR-${number}`,
          name: input.name.trim(),
          category: input.category.trim() || "General",
          qty: Math.max(0, input.qty),
          min: Math.max(0, input.min),
          cost: Math.max(0, input.cost),
          price: Math.max(0, input.price),
          bin: input.bin.trim() || "—",
        };
        set({ parts: [part, ...state.parts], seq: { ...state.seq, part: number + 1 } });
        return id;
      },

      addEstimate: (input) => {
        const state = get();
        const number = state.seq.estimate;
        const id = uid("e");
        const estimate: Estimate = {
          id,
          number,
          customerId: input.customerId,
          repairId: input.repairId,
          status: "draft",
          lines: input.lines,
          note: input.note.trim(),
          createdAt: new Date().toISOString(),
        };
        set({ estimates: [estimate, ...state.estimates], seq: { ...state.seq, estimate: number + 1 } });
        return id;
      },

      setEstimateStatus: (id, status) => {
        const state = get();
        const estimate = state.estimates.find((item) => item.id === id);
        if (!estimate) return;
        let repairs = state.repairs;
        if (status === "accepted" && estimate.repairId) {
          repairs = repairs.map((repair) =>
            repair.id === estimate.repairId && (repair.status === "in_queue" || repair.status === "waiting_approval")
              ? { ...repair, status: "in_progress" }
              : repair,
          );
        }
        if (status === "sent" && estimate.repairId) {
          repairs = repairs.map((repair) =>
            repair.id === estimate.repairId && repair.status === "in_queue"
              ? { ...repair, status: "waiting_approval" }
              : repair,
          );
        }
        set({
          repairs,
          estimates: state.estimates.map((item) => (item.id === id ? { ...item, status } : item)),
        });
      },

      addInvoice: (input) => {
        const state = get();
        const existing = input.repairId
          ? state.invoices.find((invoice) => invoice.repairId === input.repairId && invoice.status !== "void")
          : undefined;
        if (existing) return existing.id;
        const number = state.seq.invoice;
        const id = uid("inv");
        const invoice: Invoice = {
          id,
          number,
          customerId: input.customerId,
          repairId: input.repairId,
          status: "unpaid",
          lines: input.lines,
          taxRate: state.settings.taxRate,
          method: "",
          createdAt: new Date().toISOString(),
          paidAt: null,
        };
        set({ invoices: [invoice, ...state.invoices], seq: { ...state.seq, invoice: number + 1 } });
        return id;
      },

      markInvoicePaid: (id, method) =>
        set({
          invoices: get().invoices.map((invoice) =>
            invoice.id === id && invoice.status === "unpaid"
              ? { ...invoice, status: "paid", method, paidAt: new Date().toISOString() }
              : invoice,
          ),
        }),

      voidInvoice: (id) =>
        set({
          invoices: get().invoices.map((invoice) =>
            invoice.id === id && invoice.status === "unpaid" ? { ...invoice, status: "void" } : invoice,
          ),
        }),

      releaseRepair: (id, method) => {
        const state = get();
        const repair = state.repairs.find((item) => item.id === id);
        if (!repair) return "Ticket not found.";
        if (repair.status === "picked_up") return "Already released.";
        let invoices = state.invoices;
        let seq = state.seq;
        const existing = invoices.find((invoice) => invoice.repairId === id && invoice.status !== "void");
        if (existing && existing.status === "unpaid") {
          invoices = invoices.map((invoice) =>
            invoice.id === existing.id
              ? { ...invoice, status: "paid", method, paidAt: new Date().toISOString() }
              : invoice,
          );
        } else if (!existing) {
          const lines = repairLines(repair, state.parts);
          if (lines.length > 0) {
            const number = seq.invoice;
            seq = { ...seq, invoice: number + 1 };
            const invoice: Invoice = {
              id: uid("inv"),
              number,
              customerId: repair.customerId,
              repairId: id,
              status: "paid",
              lines,
              taxRate: state.settings.taxRate,
              method,
              createdAt: new Date().toISOString(),
              paidAt: new Date().toISOString(),
            };
            invoices = [invoice, ...invoices];
          }
        }
        set({
          seq,
          invoices,
          repairs: state.repairs.map((item) =>
            item.id === id ? { ...item, status: "picked_up", completedAt: new Date().toISOString() } : item,
          ),
        });
        return null;
      },

      addExpense: (input) =>
        set({
          expenses: [
            {
              id: uid("x"),
              category: input.category,
              vendor: input.vendor.trim(),
              amount: input.amount,
              date: input.date,
              note: input.note.trim(),
            },
            ...get().expenses,
          ],
        }),

      addInquiry: (input) =>
        set({
          inquiries: [
            {
              id: uid("iq"),
              name: input.name.trim(),
              phone: input.phone.trim(),
              channel: input.channel,
              message: input.message.trim(),
              status: "new",
              reply: "",
              createdAt: new Date().toISOString(),
            },
            ...get().inquiries,
          ],
        }),

      updateInquiry: (id, patch) =>
        set({
          inquiries: get().inquiries.map((inquiry) => (inquiry.id === id ? { ...inquiry, ...patch } : inquiry)),
        }),

      updateSettings: (patch) => {
        const next = { ...get().settings, ...patch };
        if (patch.owner) next.initials = initialsOf(patch.owner);
        set({ settings: next });
      },

      addTech: (name) => {
        const clean = name.trim();
        if (!clean) return;
        const techs = get().settings.techs;
        if (techs.some((tech) => tech.toLowerCase() === clean.toLowerCase())) return;
        set({ settings: { ...get().settings, techs: [...techs, clean] } });
      },

      removeTech: (name) =>
        set({
          settings: { ...get().settings, techs: get().settings.techs.filter((tech) => tech !== name) },
        }),

      resetDemo: () => set({ ...seedData(), ...freshUi() }),
    }),
    {
      name: "bench-repairshop-os-v1",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage() : localStorage)),
      partialize: (state) => ({
        customers: state.customers,
        repairs: state.repairs,
        parts: state.parts,
        estimates: state.estimates,
        invoices: state.invoices,
        expenses: state.expenses,
        inquiries: state.inquiries,
        settings: state.settings,
        seq: state.seq,
        view: state.view,
        sidebarPinned: state.sidebarPinned,
      }),
    },
  ),
);
