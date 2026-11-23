import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  dueForRepair,
  escapeHtml,
  invoiceTotals,
  longDate,
  money,
  PAY_LABEL,
  shortDate,
  toolLabel,
} from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import type { PayMethod } from "@/lib/shop/types";
import { STATUS_ORDER } from "@/components/shop/dashboard";
import { Button, fieldClasses, Panel, StatusPill } from "@/components/shop/ui";

export function ShopDrawers() {
  const drawer = useShop((state) => state.drawer);
  const close = useShop((state) => state.closeDrawer);
  if (!drawer) return null;
  return (
    <div className="fixed inset-0 z-40">
      <button type="button" className="absolute inset-0 bg-bg/70" aria-label="Close details" onClick={close} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-sidebar shadow-ring">
        <div className="flex justify-end px-3 pt-3">
          <button type="button" className="grid size-11 place-items-center rounded-full text-muted hover:bg-surface hover:text-fg" aria-label="Close" onClick={close}>
            <X className="size-5" />
          </button>
        </div>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 pb-8">
          {drawer.kind === "repair" && <RepairBody id={drawer.id} />}
          {drawer.kind === "customer" && <CustomerBody id={drawer.id} />}
          {drawer.kind === "invoice" && <InvoiceBody id={drawer.id} />}
          {drawer.kind === "estimate" && <EstimateBody id={drawer.id} />}
        </div>
      </aside>
    </div>
  );
}

function RepairBody({ id }: { id: string }) {
  const repair = useShop((state) => state.repairs.find((item) => item.id === id));
  const customer = useShop((state) => state.customers.find((item) => item.id === repair?.customerId));
  const parts = useShop((state) => state.parts);
  const invoices = useShop((state) => state.invoices);
  const taxRate = useShop((state) => state.settings.taxRate);
  const techs = useShop((state) => state.settings.techs);
  const setStatus = useShop((state) => state.setRepairStatus);
  const updateRepair = useShop((state) => state.updateRepair);
  const addPartUse = useShop((state) => state.addPartUse);
  const removePartUse = useShop((state) => state.removePartUse);
  const openModal = useShop((state) => state.openModal);
  const openDrawer = useShop((state) => state.openDrawer);
  const setView = useShop((state) => state.setView);
  const [partId, setPartId] = useState(parts.find((part) => part.qty > 0)?.id ?? "");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [labor, setLabor] = useState(repair ? String(repair.labor) : "0");

  if (!repair) return <p className="text-sm text-muted">This ticket is gone.</p>;
  const due = dueForRepair(repair, parts, invoices, taxRate);

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-sm font-semibold text-primary">Ticket #{repair.number}</div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{toolLabel(repair)}</h2>
        <p className="text-sm text-muted">{repair.tool}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill status={repair.status} />
          {repair.priority === "rush" ? <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">Rush</span> : null}
        </div>
      </div>
      <Panel>
        <button type="button" className="text-left" onClick={() => customer && openDrawer({ kind: "customer", id: customer.id })}>
          <div className="font-semibold">{customer?.name ?? "Unknown customer"}</div>
          <div className="text-sm text-muted">{customer?.phone}</div>
        </button>
        <p className="mt-3 text-sm">{repair.issue}</p>
        {repair.serial ? <p className="mt-2 text-xs text-faint">Serial {repair.serial}</p> : null}
        <p className="mt-2 text-xs text-faint">In {shortDate(repair.intakeAt)} · {repair.tech}</p>
      </Panel>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-muted">Status</span>
        <select
          className={fieldClasses()}
          value={repair.status}
          onChange={(event) => {
            setStatus(repair.id, event.target.value as typeof repair.status);
            toast.success("Status updated");
          }}
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-muted">Technician</span>
          <select className={fieldClasses()} value={repair.tech} onChange={(event) => updateRepair(repair.id, { tech: event.target.value })}>
            {[...new Set([...techs, repair.tech])].map((tech) => (
              <option key={tech}>{tech}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-muted">Labor</span>
          <input
            className={fieldClasses()}
            type="number"
            min="0"
            step="0.01"
            value={labor}
            onChange={(event) => setLabor(event.target.value)}
            onBlur={() => updateRepair(repair.id, { labor: Number(labor) || 0 })}
          />
        </label>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Parts on this ticket</h3>
        <div className="grid gap-2">
          {repair.partsUsed.length === 0 ? <p className="text-sm text-muted">No parts pulled yet.</p> : null}
          {repair.partsUsed.map((use) => {
            const part = parts.find((item) => item.id === use.partId);
            return (
              <div key={use.partId} className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{part?.name ?? "Part"}</div>
                  <div className="text-xs text-muted">
                    {use.qty} × {money(part?.price ?? 0)}
                  </div>
                </div>
                <button type="button" className="h-11 px-2 text-sm text-muted hover:text-danger" onClick={() => removePartUse(repair.id, use.partId)}>
                  Return
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-12 gap-2">
          <select className={fieldClasses("col-span-7")} value={partId} onChange={(event) => setPartId(event.target.value)}>
            {parts.filter((part) => part.qty > 0).map((part) => (
              <option key={part.id} value={part.id}>
                {part.name} · {part.qty}
              </option>
            ))}
          </select>
          <input className={fieldClasses("col-span-2")} type="number" min="1" value={qty} onChange={(event) => setQty(event.target.value)} aria-label="Quantity" />
          <Button
            className="col-span-3 px-2"
            onClick={() => {
              const error = addPartUse(repair.id, partId, Number(qty) || 1);
              if (error) toast.error(error);
              else toast.success("Part pulled from stock");
            }}
          >
            Add
          </Button>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Notes</h3>
        {repair.notes ? <p className="mb-2 text-sm whitespace-pre-wrap text-muted">{repair.notes}</p> : null}
        <div className="flex gap-2">
          <input className={fieldClasses()} placeholder="Add a bench note" value={note} onChange={(event) => setNote(event.target.value)} />
          <Button
            variant="secondary"
            onClick={() => {
              if (!note.trim()) return;
              const stamp = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
              const next = [repair.notes, `${stamp} — ${note.trim()}`].filter(Boolean).join("\n");
              updateRepair(repair.id, { notes: next });
              setNote("");
            }}
          >
            Add
          </Button>
        </div>
      </div>
      <Panel>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">{due.settled ? "Paid" : "Amount due"}</span>
          <span className="text-lg font-semibold">{money(due.total)}</span>
        </div>
      </Panel>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => openModal("estimate", { customerId: repair.customerId, repairId: repair.id })}>
          Estimate
        </Button>
        <Button variant="secondary" onClick={() => openModal("invoice", { customerId: repair.customerId, repairId: repair.id })}>
          Invoice
        </Button>
        {repair.status !== "picked_up" ? (
          <Button
            className="col-span-2"
            onClick={() => {
              if (repair.status !== "ready") setStatus(repair.id, "ready");
              setView("pickup");
            }}
          >
            {repair.status === "ready" ? "Go to pickup" : "Mark ready for pickup"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function CustomerBody({ id }: { id: string }) {
  const customer = useShop((state) => state.customers.find((item) => item.id === id));
  const repairs = useShop((state) => state.repairs.filter((item) => item.customerId === id));
  const invoices = useShop((state) => state.invoices.filter((item) => item.customerId === id && item.status !== "void"));
  const updateCustomer = useShop((state) => state.updateCustomer);
  const openDrawer = useShop((state) => state.openDrawer);
  const openModal = useShop((state) => state.openModal);
  const [notes, setNotes] = useState(customer?.notes ?? "");
  if (!customer) return <p className="text-sm text-muted">Customer not found.</p>;
  const due = invoices.filter((invoice) => invoice.status === "unpaid").reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0);
  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{customer.name}</h2>
        <a className="mt-1 block text-sm text-primary" href={`tel:${customer.phone}`}>{customer.phone}</a>
        {customer.email ? <a className="block text-sm text-muted" href={`mailto:${customer.email}`}>{customer.email}</a> : null}
        <p className="mt-2 text-xs text-faint">Since {longDate(customer.createdAt)} · balance {money(due)}</p>
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-muted">Notes</span>
        <textarea className={fieldClasses("h-24 py-2")} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      <Button
        variant="secondary"
        onClick={() => {
          updateCustomer(customer.id, { notes });
          toast.success("Notes saved");
        }}
      >
        Save notes
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => openModal("intake", { customerId: customer.id })}>New intake</Button>
        <Button variant="secondary" onClick={() => openModal("estimate", { customerId: customer.id })}>Estimate</Button>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Tickets</h3>
        <div className="grid gap-2">
          {repairs.map((repair) => (
            <button key={repair.id} type="button" className="rounded-2xl bg-surface px-3 py-3 text-left" onClick={() => openDrawer({ kind: "repair", id: repair.id })}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">#{repair.number} {toolLabel(repair)}</span>
                <StatusPill status={repair.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InvoiceBody({ id }: { id: string }) {
  const invoice = useShop((state) => state.invoices.find((item) => item.id === id));
  const customer = useShop((state) => state.customers.find((item) => item.id === invoice?.customerId));
  const settings = useShop((state) => state.settings);
  const markPaid = useShop((state) => state.markInvoicePaid);
  const voidInvoice = useShop((state) => state.voidInvoice);
  const [method, setMethod] = useState<PayMethod>(settings.paymentsConnected ? "card" : "cash");
  if (!invoice || !customer) return <p className="text-sm text-muted">Invoice not found.</p>;
  const totals = invoiceTotals(invoice);
  return (
    <div className="grid gap-4">
      <div>
        <div className="text-sm font-semibold text-primary">Invoice #{invoice.number}</div>
        <h2 className="mt-1 text-2xl font-semibold">{customer.name}</h2>
        <p className="text-sm text-muted capitalize">{invoice.status} · {shortDate(invoice.createdAt)}</p>
      </div>
      <Panel>
        <div className="grid gap-2">
          {invoice.lines.map((line) => (
            <div key={line.id} className="flex justify-between gap-3 text-sm">
              <span>{line.description} × {line.qty}</span>
              <span className="tabular-nums">{money(line.qty * line.price)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-1 border-t border-line pt-3 text-sm">
          <Row label="Subtotal" value={money(totals.subtotal)} />
          <Row label={`Tax ${(invoice.taxRate * 100).toFixed(2)}%`} value={money(totals.tax)} />
          <Row label="Total" value={money(totals.total)} strong />
        </div>
      </Panel>
      {invoice.status === "paid" ? (
        <p className="text-sm text-success">Paid {invoice.paidAt ? longDate(invoice.paidAt) : ""} by {invoice.method ? PAY_LABEL[invoice.method] : "—"}.</p>
      ) : null}
      {invoice.status === "unpaid" ? (
        <>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-muted">Payment method</span>
            <select className={fieldClasses()} value={method} onChange={(event) => setMethod(event.target.value as PayMethod)}>
              {settings.paymentsConnected ? <option value="card">Card</option> : null}
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>
          <Button
            onClick={() => {
              markPaid(invoice.id, method);
              toast.success("Invoice marked paid");
            }}
          >
            Mark paid
          </Button>
          <Button variant="danger" onClick={() => { voidInvoice(invoice.id); toast.success("Invoice voided"); }}>
            Void invoice
          </Button>
        </>
      ) : null}
      <Button
        variant="secondary"
        onClick={() => {
          const ok = printInvoiceDoc({
            shop: settings.shopName,
            address: settings.address,
            number: invoice.number,
            customer: customer.name,
            lines: invoice.lines.map((line) => `${escapeHtml(line.description)} × ${line.qty}|${money(line.qty * line.price)}`),
            subtotal: money(totals.subtotal),
            tax: money(totals.tax),
            total: money(totals.total),
            status: invoice.status,
          });
          if (!ok) toast.error("Allow pop-ups to print this invoice.");
        }}
      >
        Print
      </Button>
    </div>
  );
}

function EstimateBody({ id }: { id: string }) {
  const estimate = useShop((state) => state.estimates.find((item) => item.id === id));
  const customer = useShop((state) => state.customers.find((item) => item.id === estimate?.customerId));
  const taxRate = useShop((state) => state.settings.taxRate);
  const setStatus = useShop((state) => state.setEstimateStatus);
  if (!estimate || !customer) return <p className="text-sm text-muted">Estimate not found.</p>;
  const subtotal = estimate.lines.reduce((sum, line) => sum + line.qty * line.price, 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + tax;
  return (
    <div className="grid gap-4">
      <div>
        <div className="text-sm font-semibold text-primary">Estimate #{estimate.number}</div>
        <h2 className="mt-1 text-2xl font-semibold">{customer.name}</h2>
        <p className="text-sm capitalize text-muted">{estimate.status} · {shortDate(estimate.createdAt)}</p>
      </div>
      <Panel>
        {estimate.lines.map((line) => (
          <div key={line.id} className="flex justify-between gap-3 py-1 text-sm">
            <span>{line.description} × {line.qty}</span>
            <span>{money(line.qty * line.price)}</span>
          </div>
        ))}
        <div className="mt-3 border-t border-line pt-3 text-sm font-semibold">Total {money(total)}</div>
        {estimate.note ? <p className="mt-2 text-sm text-muted">{estimate.note}</p> : null}
      </Panel>
      {estimate.status === "draft" || estimate.status === "sent" ? (
        <div className="grid gap-2">
          {estimate.status === "draft" ? (
            <Button variant="secondary" onClick={() => { setStatus(estimate.id, "sent"); toast.success("Marked as sent"); }}>
              Mark sent
            </Button>
          ) : null}
          <Button onClick={() => { setStatus(estimate.id, "accepted"); toast.success("Estimate accepted"); }}>
            Accept
          </Button>
          <Button variant="danger" onClick={() => { setStatus(estimate.id, "declined"); toast.success("Estimate declined"); }}>
            Decline
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted">This estimate is {estimate.status}.</p>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "font-semibold" : "text-muted"}`}>
      <span>{label}</span>
      <span className="text-fg">{value}</span>
    </div>
  );
}

function printInvoiceDoc(doc: {
  shop: string;
  address: string;
  number: number;
  customer: string;
  lines: string[];
  subtotal: string;
  tax: string;
  total: string;
  status: string;
}) {
  const popup = window.open("", "bench-invoice", "width=720,height=900");
  if (!popup) return false;
  const rows = doc.lines
    .map((line) => {
      const [label, amount] = line.split("|");
      return `<tr><td>${label}</td><td class="right">${amount}</td></tr>`;
    })
    .join("");
  popup.document.write(`<!doctype html><html><head><title>Invoice ${doc.number}</title><style>
    body{font-family:Outfit,sans-serif;margin:40px;color:#1c1304}
    table{width:100%;border-collapse:collapse} td{padding:8px 0;border-bottom:1px solid #e7e0d4}
    .right{text-align:right} h1{margin-bottom:0}
  </style></head><body>
    <h1>${escapeHtml(doc.shop)}</h1>
    <p>${escapeHtml(doc.address)}</p>
    <h2>Invoice #${doc.number}</h2>
    <p>Bill to ${escapeHtml(doc.customer)} · ${escapeHtml(doc.status)}</p>
    <table>${rows}</table>
    <p class="right">Subtotal ${doc.subtotal}<br/>Tax ${doc.tax}<br/><strong>Total ${doc.total}</strong></p>
  </body></html>`);
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
}
