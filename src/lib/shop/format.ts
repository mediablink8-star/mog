import { format, isThisMonth, isThisWeek, isToday, parseISO } from "date-fns";
import type { Invoice, Line, Part, PayMethod, Repair, RepairStatus } from "@/lib/shop/types";

export const STATUS_LABEL: Record<RepairStatus, string> = {
  in_queue: "In queue",
  in_progress: "In progress",
  waiting_parts: "Waiting parts",
  waiting_approval: "Awaiting approval",
  ready: "Ready for pickup",
  picked_up: "Picked up",
};

export const OPEN_STATUSES: RepairStatus[] = [
  "in_queue",
  "in_progress",
  "waiting_parts",
  "waiting_approval",
];

export const BRANDS = ["DeWalt", "Milwaukee", "Makita", "Bosch", "Ryobi", "Hilti", "Festool", "Ridgid", "Other"];

export const PAY_LABEL: Record<PayMethod, string> = {
  card: "Card",
  cash: "Cash",
  transfer: "Transfer",
};

export function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function shortDate(iso: string) {
  return format(parseISO(iso), "MMM d");
}

export function longDate(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const value = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return value || "AR";
}

export function lineSum(lines: Line[]) {
  return Math.round(lines.reduce((sum, line) => sum + line.qty * line.price, 0) * 100) / 100;
}

export function taxed(subtotal: number, rate: number) {
  const tax = Math.round(subtotal * rate * 100) / 100;
  return { subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100 };
}

export function invoiceTotals(invoice: Invoice) {
  return taxed(lineSum(invoice.lines), invoice.taxRate);
}

export function repairLines(repair: Repair, parts: Part[]): Line[] {
  const lines: Line[] = [];
  if (repair.labor > 0) {
    lines.push({
      id: `labor_${repair.id}`,
      description: `Labor — ${repair.brand} ${repair.model}`,
      qty: 1,
      price: repair.labor,
    });
  }
  for (const use of repair.partsUsed) {
    const part = parts.find((item) => item.id === use.partId);
    if (!part) continue;
    lines.push({
      id: `use_${repair.id}_${part.id}`,
      description: part.name,
      qty: use.qty,
      price: part.price,
    });
  }
  return lines;
}

export function dueForRepair(repair: Repair, parts: Part[], invoices: Invoice[], taxRate: number) {
  const existing = invoices.find((invoice) => invoice.repairId === repair.id && invoice.status !== "void");
  if (existing) {
    if (existing.status === "paid") return { ...invoiceTotals(existing), settled: true, invoice: existing };
    return { ...invoiceTotals(existing), settled: false, invoice: existing };
  }
  const quote = taxed(lineSum(repairLines(repair, parts)), taxRate);
  return { ...quote, settled: false, invoice: null as Invoice | null };
}

export function isCompletedThisWeek(iso: string | null) {
  return Boolean(iso && isThisWeek(parseISO(iso), { weekStartsOn: 1 }));
}

export function isCompletedThisMonth(iso: string | null) {
  return Boolean(iso && isThisMonth(parseISO(iso)));
}

export function isCompletedToday(iso: string | null) {
  return Boolean(iso && isToday(parseISO(iso)));
}

export function escapeHtml(value: string) {
  return Array.from(value, (char) => {
    if (char === "\u0026") return "\u0026amp;";
    if (char === "\u003c") return "\u0026lt;";
    if (char === "\u003e") return "\u0026gt;";
    if (char === "\u0022") return "\u0026quot;";
    if (char === "\u0027") return "\u0026#39;";
    return char;
  }).join("");
}

export function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function toolLabel(repair: Pick<Repair, "brand" | "model">) {
  return `${repair.brand} ${repair.model}`.trim();
}
