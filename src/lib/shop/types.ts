export type ViewId =
  | "dashboard"
  | "intakes"
  | "pickup"
  | "repairs"
  | "parts"
  | "customers"
  | "invoices"
  | "estimates"
  | "shop"
  | "inquiries"
  | "expenses"
  | "reports"
  | "settings";

export type RepairStatus =
  | "in_queue"
  | "in_progress"
  | "waiting_parts"
  | "waiting_approval"
  | "ready"
  | "picked_up";

export type PayMethod = "card" | "cash" | "transfer";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: string;
};

export type PartUse = { partId: string; qty: number };

export type Repair = {
  id: string;
  number: number;
  customerId: string;
  brand: string;
  tool: string;
  model: string;
  serial: string;
  issue: string;
  status: RepairStatus;
  priority: "normal" | "rush";
  tech: string;
  intakeAt: string;
  completedAt: string | null;
  labor: number;
  notes: string;
  partsUsed: PartUse[];
};

export type Part = {
  id: string;
  sku: string;
  name: string;
  category: string;
  qty: number;
  min: number;
  cost: number;
  price: number;
  bin: string;
};

export type Line = {
  id: string;
  description: string;
  qty: number;
  price: number;
};

export type Estimate = {
  id: string;
  number: number;
  customerId: string;
  repairId: string | null;
  status: "draft" | "sent" | "accepted" | "declined";
  lines: Line[];
  note: string;
  createdAt: string;
};

export type Invoice = {
  id: string;
  number: number;
  customerId: string;
  repairId: string | null;
  status: "unpaid" | "paid" | "void";
  lines: Line[];
  taxRate: number;
  method: "" | PayMethod;
  createdAt: string;
  paidAt: string | null;
};

export type Expense = {
  id: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  note: string;
};

export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  channel: "phone" | "walk-in" | "web" | "email";
  message: string;
  status: "new" | "replied" | "closed";
  reply: string;
  createdAt: string;
};

export type Settings = {
  shopName: string;
  owner: string;
  initials: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  taxRate: number;
  paymentsConnected: boolean;
  bannerDismissed: boolean;
  techs: string[];
};

export type Seq = {
  repair: number;
  estimate: number;
  invoice: number;
  part: number;
};

export type ModalKind =
  | "intake"
  | "customer"
  | "estimate"
  | "invoice"
  | "part"
  | "expense"
  | "inquiry"
  | "payments"
  | "reset";

export type ModalCtx = {
  customerId?: string;
  repairId?: string;
};

export type DrawerState = {
  kind: "repair" | "customer" | "invoice" | "estimate";
  id: string;
} | null;

export type PopoverKind = "plus" | "bell" | null;

export type RepairsFilter = "all" | "open" | RepairStatus;
export type PartsFilter = "all" | "low";
