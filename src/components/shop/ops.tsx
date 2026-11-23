import { useMemo, useState } from "react";
import { isThisMonth, parseISO } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { invoiceTotals, longDate, money, shortDate } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import type { Inquiry } from "@/lib/shop/types";
import { useBench } from "@/components/shop/metrics";
import { Button, EmptyState, fieldClasses, FilterChip, PageHeader, Panel } from "@/components/shop/ui";

export function ShopPage() {
  const settings = useShop((state) => state.settings);
  const update = useShop((state) => state.updateSettings);
  const bench = useBench();
  const [form, setForm] = useState(settings);
  return (
    <div>
      <PageHeader eyebrow="House" title="Shop" subtitle="What customers see on the invoice and at the counter." />
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="grid gap-3 lg:col-span-3">
          <Field label="Shop name" value={form.shopName} onChange={(shopName) => setForm({ ...form, shopName })} />
          <Field label="Owner" value={form.owner} onChange={(owner) => setForm({ ...form, owner })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
            <Field label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          </div>
          <Field label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} />
          <Field label="Hours" value={form.hours} onChange={(hours) => setForm({ ...form, hours })} />
          <div className="flex justify-end">
            <Button
              onClick={() => {
                update({
                  shopName: form.shopName.trim() || settings.shopName,
                  owner: form.owner.trim() || settings.owner,
                  phone: form.phone.trim(),
                  email: form.email.trim(),
                  address: form.address.trim(),
                  hours: form.hours.trim(),
                });
                toast.success("Shop profile saved");
              }}
            >
              Save profile
            </Button>
          </div>
        </Panel>
        <div className="grid gap-3 lg:col-span-2">
          <Panel>
            <h2 className="font-semibold">{settings.shopName}</h2>
            <p className="mt-2 text-sm text-muted">{settings.address}</p>
            <p className="text-sm text-muted">{settings.phone}</p>
            <p className="text-sm text-muted">{settings.hours}</p>
          </Panel>
          <Panel>
            <h2 className="font-semibold">Right now</h2>
            <ul className="mt-3 grid gap-2 text-sm text-muted">
              <li>{bench.inShop} tools in the shop</li>
              <li>{bench.ready} waiting for pickup</li>
              <li>{bench.low} parts under minimum</li>
              <li>{money(bench.outstanding)} outstanding</li>
            </ul>
          </Panel>
          <Panel>
            <h2 className="font-semibold">Bench</h2>
            <ul className="mt-3 grid gap-1 text-sm text-muted">
              {settings.techs.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-muted">{label}</span>
      <input className={fieldClasses()} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function InquiriesPage() {
  const inquiries = useShop((state) => state.inquiries);
  const update = useShop((state) => state.updateInquiry);
  const openModal = useShop((state) => state.openModal);
  const [filter, setFilter] = useState<"all" | Inquiry["status"]>("all");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const rows = inquiries.filter((inquiry) => (filter === "all" ? true : inquiry.status === filter));
  return (
    <div>
      <PageHeader eyebrow="Front door" title="Inquiries" subtitle="Calls, walk-ins, and messages that are not tickets yet." action={<Button onClick={() => openModal("inquiry")}>Log inquiry</Button>} />
      <div className="mb-4 flex gap-2">
        {(["all", "new", "replied", "closed"] as const).map((item) => (
          <FilterChip key={item} active={filter === item} onClick={() => setFilter(item)}>
            {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
          </FilterChip>
        ))}
      </div>
      {rows.length === 0 ? <EmptyState title="Inbox clear" body="New questions from the counter or the web will land here." /> : (
        <div className="grid gap-3">
          {rows.map((inquiry) => (
            <Panel key={inquiry.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{inquiry.name}</h2>
                  <p className="text-sm text-muted capitalize">{inquiry.channel} · {inquiry.phone || "No phone"} · {shortDate(inquiry.createdAt)}</p>
                </div>
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold capitalize text-muted">{inquiry.status}</span>
              </div>
              <p className="mt-3 text-sm">{inquiry.message}</p>
              {inquiry.reply ? <p className="mt-2 text-sm text-muted">Reply: {inquiry.reply}</p> : null}
              {inquiry.status !== "closed" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    className={fieldClasses("min-w-48 flex-1")}
                    placeholder="Write a reply"
                    value={drafts[inquiry.id] ?? ""}
                    onChange={(event) => setDrafts({ ...drafts, [inquiry.id]: event.target.value })}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const reply = (drafts[inquiry.id] ?? "").trim();
                      if (!reply) {
                        toast.error("Write a reply first.");
                        return;
                      }
                      update(inquiry.id, { reply, status: "replied" });
                      toast.success("Reply saved");
                    }}
                  >
                    Save reply
                  </Button>
                  <Button variant="ghost" onClick={() => update(inquiry.id, { status: "closed" })}>Close</Button>
                </div>
              ) : null}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExpensesPage() {
  const expenses = useShop((state) => state.expenses);
  const openModal = useShop((state) => state.openModal);
  const month = expenses.filter((expense) => isThisMonth(parseISO(expense.date))).reduce((sum, expense) => sum + expense.amount, 0);
  const rows = expenses.slice().sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div>
      <PageHeader
        eyebrow="Money"
        title="Expenses"
        subtitle={`${money(month)} logged this month.`}
        action={<Button onClick={() => openModal("expense")}>Log expense</Button>}
      />
      <div className="grid gap-2">
        {rows.map((expense) => (
          <div key={expense.id} className="flex items-center gap-3 rounded-3xl bg-surface px-4 py-3 shadow-ring">
            <div className="min-w-0 flex-1">
              <div className="font-medium">{expense.vendor}</div>
              <div className="text-sm text-muted">
                {expense.category} · {longDate(`${expense.date}T12:00:00.000Z`)}
                {expense.note ? ` · ${expense.note}` : ""}
              </div>
            </div>
            <div className="font-semibold tabular-nums">{money(expense.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsPage() {
  const invoices = useShop((state) => state.invoices);
  const repairs = useShop((state) => state.repairs);
  const expenses = useShop((state) => state.expenses);
  const data = useMemo(() => buildReport(invoices, repairs, expenses), [expenses, invoices, repairs]);
  const tip = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-line)",
    borderRadius: 12,
    color: "var(--color-fg)",
  };
  return (
    <div>
      <PageHeader eyebrow="Books" title="Reports" subtitle="Collected revenue against what the bench has closed." />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Panel>
          <div className="text-sm text-muted">Collected</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{money(data.collected)}</div>
        </Panel>
        <Panel>
          <div className="text-sm text-muted">Outstanding</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{money(data.outstanding)}</div>
        </Panel>
        <Panel>
          <div className="text-sm text-muted">Expenses on file</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{money(data.spent)}</div>
        </Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <h2 className="mb-3 font-semibold">Revenue by month</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.months}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-faint)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-faint)" fontSize={12} tickLine={false} axisLine={false} width={48} />
                <Tooltip contentStyle={tip} cursor={{ fill: "rgb(255 255 255 / 0.04)" }} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">Open bench</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.status} dataKey="value" nameKey="label" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {data.status.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="grid gap-1 text-sm text-muted">
            {data.status.map((entry) => (
              <li key={entry.label} className="flex justify-between">
                <span>{entry.label}</span>
                <span className="text-fg">{entry.value}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function buildReport(
  invoices: ReturnType<typeof useShop.getState>["invoices"],
  repairs: ReturnType<typeof useShop.getState>["repairs"],
  expenses: ReturnType<typeof useShop.getState>["expenses"],
) {
  const paid = invoices.filter((invoice) => invoice.status === "paid" && invoice.paidAt);
  const months = ["2026-08", "2026-09", "2026-10", "2026-11"].map((key) => {
    const revenue = paid
      .filter((invoice) => invoice.paidAt!.slice(0, 7) === key)
      .reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0);
    const [year, month] = key.split("-");
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", { month: "short" });
    return { key, label, revenue: Math.round(revenue) };
  });
  const statusRows = [
    ["In queue", "in_queue", "var(--color-faint)"],
    ["In progress", "in_progress", "var(--color-primary)"],
    ["Waiting parts", "waiting_parts", "var(--color-info)"],
    ["Approval", "waiting_approval", "var(--color-promo)"],
    ["Ready", "ready", "var(--color-success)"],
  ] as const;
  const status = statusRows
    .map(([label, id, fill]) => ({ label, fill, value: repairs.filter((repair) => repair.status === id).length }))
    .filter((row) => row.value > 0);
  return {
    months,
    status,
    collected: paid.reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0),
    outstanding: invoices.filter((invoice) => invoice.status === "unpaid").reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0),
    spent: expenses.reduce((sum, expense) => sum + expense.amount, 0),
  };
}

export function SettingsPage() {
  const settings = useShop((state) => state.settings);
  const update = useShop((state) => state.updateSettings);
  const addTech = useShop((state) => state.addTech);
  const removeTech = useShop((state) => state.removeTech);
  const openModal = useShop((state) => state.openModal);
  const [tax, setTax] = useState(String(Math.round(settings.taxRate * 10000) / 100));
  const [tech, setTech] = useState("");
  return (
    <div>
      <PageHeader eyebrow="System" title="Settings" subtitle="Payouts, tax, and the people on the bench." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="grid gap-3">
          <h2 className="font-semibold">Payouts</h2>
          <p className="text-sm text-muted">
            {settings.paymentsConnected
              ? "Card is available as a payment method. This preview does not charge anyone."
              : "Payouts are off. Cash and transfer still work at the counter."}
          </p>
          <Button variant="secondary" onClick={() => openModal("payments")}>
            {settings.paymentsConnected ? "Manage payouts" : "Set up payouts"}
          </Button>
          {settings.bannerDismissed && !settings.paymentsConnected ? (
            <Button variant="ghost" onClick={() => update({ bannerDismissed: false })}>
              Show the payments banner again
            </Button>
          ) : null}
        </Panel>
        <Panel className="grid gap-3">
          <h2 className="font-semibold">Sales tax</h2>
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">Rate percent</span>
            <input className={fieldClasses()} type="number" min="0" max="30" step="0.01" value={tax} onChange={(event) => setTax(event.target.value)} />
          </label>
          <Button
            onClick={() => {
              const rate = Number(tax);
              if (!Number.isFinite(rate) || rate < 0 || rate > 30) {
                toast.error("Use a tax rate between 0 and 30.");
                return;
              }
              update({ taxRate: rate / 100 });
              toast.success("Tax rate saved");
            }}
          >
            Save tax
          </Button>
        </Panel>
        <Panel className="grid gap-3">
          <h2 className="font-semibold">Technicians</h2>
          <ul className="grid gap-2">
            {settings.techs.map((name) => (
              <li key={name} className="flex items-center justify-between gap-2 text-sm">
                <span>{name}</span>
                <button type="button" className="h-11 px-2 text-muted hover:text-danger" onClick={() => removeTech(name)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input className={fieldClasses()} placeholder="Add a name" value={tech} onChange={(event) => setTech(event.target.value)} />
            <Button
              variant="secondary"
              onClick={() => {
                addTech(tech);
                setTech("");
              }}
            >
              Add
            </Button>
          </div>
        </Panel>
        <Panel className="grid gap-3">
          <h2 className="font-semibold">Sample data</h2>
          <p className="text-sm text-muted">
            Summit Power Tool Repair is stored in this browser. Reset brings back the original tickets, customers, and stock.
          </p>
          <Button variant="danger" onClick={() => openModal("reset")}>
            Reset sample shop
          </Button>
        </Panel>
      </div>
    </div>
  );
}
