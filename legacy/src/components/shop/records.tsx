import { useState } from "react";
import { invoiceTotals, money, shortDate } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import type { Estimate, Invoice } from "@/lib/shop/types";
import { Button, EmptyState, fieldClasses, FilterChip, PageHeader } from "@/components/shop/ui";

export function PartsPage() {
  const parts = useShop((state) => state.parts);
  const filter = useShop((state) => state.partsFilter);
  const setFilter = useShop((state) => state.setPartsFilter);
  const adjust = useShop((state) => state.adjustPart);
  const openModal = useShop((state) => state.openModal);
  const [q, setQ] = useState("");
  const rows = parts
    .filter((part) => (filter === "low" ? part.qty <= part.min : true))
    .filter((part) => `${part.name} ${part.sku} ${part.category} ${part.bin}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => Number(b.qty <= b.min) - Number(a.qty <= a.min) || a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader
        eyebrow="Shelf"
        title="Parts"
        subtitle="On-hand counts, bins, and reorder points."
        action={<Button onClick={() => openModal("part")}>Add part</Button>}
      />
      <div className="mb-4 flex gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
        <FilterChip active={filter === "low"} onClick={() => setFilter("low")}>Low stock</FilterChip>
      </div>
      <input className={`${fieldClasses()} mb-4`} placeholder="Search parts" value={q} onChange={(event) => setQ(event.target.value)} />
      {rows.length === 0 ? (
        <EmptyState title="No parts" body="Nothing matches. Add a part or switch the filter." action={<Button onClick={() => openModal("part")}>Add part</Button>} />
      ) : (
        <div className="grid gap-2">
          {rows.map((part) => {
            const low = part.qty <= part.min;
            return (
              <div key={part.id} className={`flex flex-wrap items-center gap-3 rounded-3xl bg-surface px-4 py-3 shadow-ring ${low ? "ring-1 ring-danger/40" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{part.name}</div>
                  <div className="text-sm text-muted">
                    {part.sku} · {part.category} · bin {part.bin} · min {part.min}
                  </div>
                </div>
                <div className="text-sm text-muted">{money(part.price)}</div>
                <div className="flex items-center gap-2">
                  <button type="button" className="grid size-11 place-items-center rounded-full bg-surface-2 text-lg" aria-label={`Decrease ${part.name}`} onClick={() => adjust(part.id, -1)}>−</button>
                  <span className={`w-8 text-center text-lg font-semibold tabular-nums ${low ? "text-danger" : ""}`}>{part.qty}</span>
                  <button type="button" className="grid size-11 place-items-center rounded-full bg-surface-2 text-lg" aria-label={`Increase ${part.name}`} onClick={() => adjust(part.id, 1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CustomersPage() {
  const customers = useShop((state) => state.customers);
  const repairs = useShop((state) => state.repairs);
  const openDrawer = useShop((state) => state.openDrawer);
  const openModal = useShop((state) => state.openModal);
  const [q, setQ] = useState("");
  const rows = customers
    .filter((customer) => `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div>
      <PageHeader eyebrow="People" title="Customers" subtitle="Everyone who has dropped a tool at the counter." action={<Button onClick={() => openModal("customer")}>New customer</Button>} />
      <input className={`${fieldClasses()} mb-4`} placeholder="Search name, phone, or email" value={q} onChange={(event) => setQ(event.target.value)} />
      {rows.length === 0 ? (
        <EmptyState title="No customers" body="Try another search, or add someone new." />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {rows.map((customer) => {
            const open = repairs.filter((repair) => repair.customerId === customer.id && repair.status !== "picked_up").length;
            return (
              <button key={customer.id} type="button" className="rounded-3xl bg-surface p-4 text-left shadow-ring hover:bg-surface-2" onClick={() => openDrawer({ kind: "customer", id: customer.id })}>
                <div className="font-semibold">{customer.name}</div>
                <div className="text-sm text-muted">{customer.phone}</div>
                <div className="mt-2 text-sm text-muted">{open === 0 ? "No open tickets" : `${open} open ${open === 1 ? "ticket" : "tickets"}`}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InvoicesPage() {
  const invoices = useShop((state) => state.invoices);
  const customers = useShop((state) => state.customers);
  const openDrawer = useShop((state) => state.openDrawer);
  const openModal = useShop((state) => state.openModal);
  const [filter, setFilter] = useState<"all" | Invoice["status"]>("all");
  const rows = invoices
    .filter((invoice) => (filter === "all" ? true : invoice.status === filter))
    .slice()
    .sort((a, b) => b.number - a.number);
  return (
    <div>
      <PageHeader eyebrow="Money" title="Invoices" subtitle="What the shop has billed, collected, or voided." action={<Button onClick={() => openModal("invoice")}>New invoice</Button>} />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {(["all", "unpaid", "paid", "void"] as const).map((item) => (
          <FilterChip key={item} active={filter === item} onClick={() => setFilter(item)}>
            {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
          </FilterChip>
        ))}
      </div>
      {rows.length === 0 ? <EmptyState title="No invoices" body="Create one from a ticket or from here." /> : (
        <div className="grid gap-2">
          {rows.map((invoice) => {
            const customer = customers.find((item) => item.id === invoice.customerId);
            const total = invoiceTotals(invoice).total;
            return (
              <button key={invoice.id} type="button" className="flex items-center gap-3 rounded-3xl bg-surface px-4 py-3 text-left shadow-ring" onClick={() => openDrawer({ kind: "invoice", id: invoice.id })}>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">#{invoice.number} · {customer?.name}</div>
                  <div className="text-sm text-muted capitalize">{invoice.status} · {shortDate(invoice.createdAt)}</div>
                </div>
                <div className={`font-semibold tabular-nums ${invoice.status === "unpaid" ? "text-primary" : ""}`}>{money(total)}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EstimatesPage() {
  const estimates = useShop((state) => state.estimates);
  const customers = useShop((state) => state.customers);
  const openDrawer = useShop((state) => state.openDrawer);
  const openModal = useShop((state) => state.openModal);
  const [filter, setFilter] = useState<"all" | Estimate["status"]>("all");
  const rows = estimates.filter((estimate) => (filter === "all" ? true : estimate.status === filter)).slice().sort((a, b) => b.number - a.number);
  return (
    <div>
      <PageHeader eyebrow="Money" title="Estimates" subtitle="Quote the work, then accept it onto the bench." action={<Button onClick={() => openModal("estimate")}>New estimate</Button>} />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {(["all", "draft", "sent", "accepted", "declined"] as const).map((item) => (
          <FilterChip key={item} active={filter === item} onClick={() => setFilter(item)}>
            {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
          </FilterChip>
        ))}
      </div>
      {rows.length === 0 ? <EmptyState title="No estimates" body="Draft one for a customer before you start the repair." /> : (
        <div className="grid gap-2">
          {rows.map((estimate) => {
            const customer = customers.find((item) => item.id === estimate.customerId);
            const total = estimate.lines.reduce((sum, line) => sum + line.qty * line.price, 0);
            return (
              <button key={estimate.id} type="button" className="flex items-center gap-3 rounded-3xl bg-surface px-4 py-3 text-left shadow-ring" onClick={() => openDrawer({ kind: "estimate", id: estimate.id })}>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">#{estimate.number} · {customer?.name}</div>
                  <div className="text-sm capitalize text-muted">{estimate.status}</div>
                </div>
                <div className="font-semibold tabular-nums">{money(total)}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

