import { useMemo, useState } from "react";
import { toast } from "sonner";
import { dueForRepair, money, shortDate, STATUS_LABEL, toolLabel } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import type { PayMethod, RepairsFilter } from "@/lib/shop/types";
import { IntakeForm } from "@/components/shop/forms";
import { useBench } from "@/components/shop/metrics";
import { Button, EmptyState, fieldClasses, FilterChip, PageHeader, Panel, StatusPill } from "@/components/shop/ui";
import { STATUS_ORDER } from "@/components/shop/dashboard";

export function IntakesPage() {
  const repairs = useShop((state) => state.repairs);
  const customers = useShop((state) => state.customers);
  const openDrawer = useShop((state) => state.openDrawer);
  const recent = useMemo(
    () => repairs.slice().sort((a, b) => b.intakeAt.localeCompare(a.intakeAt)).slice(0, 8),
    [repairs],
  );
  return (
    <div>
      <PageHeader eyebrow="Counter" title="Tool intake" subtitle="Check a tool in, attach it to a customer, and drop it on the bench." />
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <IntakeForm />
        </Panel>
        <div className="grid gap-2 lg:col-span-2">
          <h2 className="text-sm font-semibold text-muted">Recent intakes</h2>
          {recent.map((repair) => {
            const customer = customers.find((item) => item.id === repair.customerId);
            return (
              <button
                key={repair.id}
                type="button"
                onClick={() => openDrawer({ kind: "repair", id: repair.id })}
                className="rounded-2xl bg-surface px-4 py-3 text-left shadow-ring"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">#{repair.number}</span>
                  <StatusPill status={repair.status} />
                </div>
                <div className="mt-1 truncate text-sm">{toolLabel(repair)}</div>
                <div className="truncate text-sm text-muted">{customer?.name} · {shortDate(repair.intakeAt)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const FILTERS: Array<{ id: RepairsFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "in_queue", label: "Queue" },
  { id: "in_progress", label: "Progress" },
  { id: "waiting_parts", label: "Parts" },
  { id: "waiting_approval", label: "Approval" },
  { id: "ready", label: "Ready" },
  { id: "picked_up", label: "Closed" },
];

export function RepairsPage() {
  const repairs = useShop((state) => state.repairs);
  const customers = useShop((state) => state.customers);
  const filter = useShop((state) => state.repairsFilter);
  const setFilter = useShop((state) => state.setRepairsFilter);
  const openDrawer = useShop((state) => state.openDrawer);
  const openModal = useShop((state) => state.openModal);
  const setStatus = useShop((state) => state.setRepairStatus);
  const [q, setQ] = useState("");
  const rows = repairs
    .filter((repair) => {
      if (filter === "open") return repair.status !== "picked_up";
      if (filter !== "all") return repair.status === filter;
      return true;
    })
    .filter((repair) => {
      const customer = customers.find((item) => item.id === repair.customerId);
      const hay = `${repair.number} ${repair.brand} ${repair.model} ${repair.tool} ${repair.issue} ${customer?.name ?? ""} ${customer?.phone ?? ""}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    })
    .sort((a, b) => b.number - a.number);

  return (
    <div>
      <PageHeader
        eyebrow="Bench"
        title="Repairs"
        subtitle="Move work from the queue to the counter."
        action={<Button onClick={() => openModal("intake")}>Tool intake</Button>}
      />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <FilterChip key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>
            {item.label}
          </FilterChip>
        ))}
      </div>
      <input className={`${fieldClasses()} mb-4`} placeholder="Filter tickets" value={q} onChange={(event) => setQ(event.target.value)} />
      {rows.length === 0 ? (
        <EmptyState title="No tickets" body="Nothing matches this filter. Open a new intake or clear the search." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-3xl bg-surface shadow-ring md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs tracking-widest text-faint uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  <th className="px-4 py-3 font-medium">Tool</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Issue</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((repair) => {
                  const customer = customers.find((item) => item.id === repair.customerId);
                  return (
                    <tr key={repair.id} className="border-t border-line hover:bg-surface-2">
                      <td className="px-4 py-3">
                        <button type="button" className="font-semibold text-primary" onClick={() => openDrawer({ kind: "repair", id: repair.id })}>
                          #{repair.number}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{toolLabel(repair)}</div>
                        <div className="text-muted">{repair.tool}</div>
                      </td>
                      <td className="px-4 py-3">{customer?.name}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-muted">{repair.issue}</td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Status for ticket ${repair.number}`}
                          className="h-11 rounded-xl border border-line bg-bg px-2 text-sm"
                          value={repair.status}
                          onChange={(event) => {
                            setStatus(repair.id, event.target.value as typeof repair.status);
                            toast.success("Status updated");
                          }}
                        >
                          {STATUS_ORDER.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {rows.map((repair) => {
              const customer = customers.find((item) => item.id === repair.customerId);
              return (
                <button key={repair.id} type="button" className="rounded-3xl bg-surface p-4 text-left shadow-ring" onClick={() => openDrawer({ kind: "repair", id: repair.id })}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-primary">#{repair.number}</span>
                    <StatusPill status={repair.status} />
                  </div>
                  <div className="mt-2 font-medium">{toolLabel(repair)}</div>
                  <div className="text-sm text-muted">{customer?.name}</div>
                  <div className="mt-1 text-sm text-muted">{repair.issue}</div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function PickupPage() {
  const ready = useShop((state) => state.repairs.filter((repair) => repair.status === "ready"));
  const customers = useShop((state) => state.customers);
  const parts = useShop((state) => state.parts);
  const invoices = useShop((state) => state.invoices);
  const taxRate = useShop((state) => state.settings.taxRate);
  const payments = useShop((state) => state.settings.paymentsConnected);
  const release = useShop((state) => state.releaseRepair);
  const openDrawer = useShop((state) => state.openDrawer);
  const bench = useBench();

  return (
    <div>
      <PageHeader eyebrow="Counter" title="Pickup" subtitle={`${bench.ready} ${bench.ready === 1 ? "tool is" : "tools are"} waiting at the counter.`} />
      {ready.length === 0 ? (
        <EmptyState title="Nothing to release" body="When a ticket is marked ready, it shows up here for payment and pickup." />
      ) : (
        <div className="grid gap-3">
          {ready.map((repair) => {
            const customer = customers.find((item) => item.id === repair.customerId);
            const due = dueForRepair(repair, parts, invoices, taxRate);
            return (
              <PickupCard
                key={repair.id}
                title={`#${repair.number} · ${toolLabel(repair)}`}
                customer={customer?.name ?? "Customer"}
                phone={customer?.phone ?? ""}
                issue={repair.issue}
                amount={money(due.total)}
                settled={due.settled}
                payments={payments}
                onOpen={() => openDrawer({ kind: "repair", id: repair.id })}
                onRelease={(method) => {
                  const error = release(repair.id, method);
                  if (error) toast.error(error);
                  else toast.success(`${toolLabel(repair)} released`);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function PickupCard({
  title,
  customer,
  phone,
  issue,
  amount,
  settled,
  payments,
  onOpen,
  onRelease,
}: {
  title: string;
  customer: string;
  phone: string;
  issue: string;
  amount: string;
  settled: boolean;
  payments: boolean;
  onOpen: () => void;
  onRelease: (method: PayMethod) => void;
}) {
  const [method, setMethod] = useState<PayMethod>(payments ? "card" : "cash");
  const [open, setOpen] = useState(false);
  return (
    <Panel>
      <button type="button" className="text-left" onClick={onOpen}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted">{customer} · {phone}</p>
        <p className="mt-2 text-sm">{issue}</p>
      </button>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-faint uppercase tracking-widest">{settled ? "Already paid" : "Due now"}</div>
          <div className="text-2xl font-semibold tabular-nums">{amount}</div>
        </div>
        {open ? (
          <div className="flex flex-wrap items-center gap-2">
            <select className={fieldClasses("w-36")} value={method} onChange={(event) => setMethod(event.target.value as PayMethod)} aria-label="Payment method">
              {payments ? <option value="card">Card</option> : null}
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
            <Button onClick={() => onRelease(method)}>Release tool</Button>
          </div>
        ) : (
          <Button onClick={() => setOpen(true)}>{settled ? "Release tool" : "Collect and release"}</Button>
        )}
      </div>
    </Panel>
  );
}
