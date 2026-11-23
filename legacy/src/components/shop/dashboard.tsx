import type { ReactNode } from "react";
import { AlertTriangle, BadgeDollarSign, Box, Check, Clock, Package, TrendingUp, UserPlus, Wrench } from "lucide-react";
import { firstName, greeting, money, toolLabel } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import type { RepairStatus } from "@/lib/shop/types";
import { useBench } from "@/components/shop/metrics";
import { Button, Panel, StatusPill } from "@/components/shop/ui";

export function Dashboard() {
  const settings = useShop((state) => state.settings);
  const setView = useShop((state) => state.setView);
  const openModal = useShop((state) => state.openModal);
  const openDrawer = useShop((state) => state.openDrawer);
  const setRepairsFilter = useShop((state) => state.setRepairsFilter);
  const setPartsFilter = useShop((state) => state.setPartsFilter);
  const dismiss = useShop((state) => state.updateSettings);
  const bench = useBench();
  const showBanner = !settings.paymentsConnected && !settings.bannerDismissed;

  return (
    <div className="grid gap-4">
      <section className="hero-panel relative overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-medium tracking-widest text-faint uppercase">{greeting()}</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {firstName(settings.owner)}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
              Here's what's happening at {settings.shopName} today.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-0 sm:divide-x sm:divide-line">
            <HeroStat value={bench.inShop} label="In shop" tone="text-primary" />
            <HeroStat value={bench.ready} label="Ready for pickup" tone="text-success" />
            <HeroStat value={bench.week} label="Completed this week" tone="text-fg" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => openModal("intake")}>
            <Package className="size-4" />
            Tool intake
          </Button>
          <Button variant="secondary" onClick={() => openModal("customer")}>
            <UserPlus className="size-4" />
            New customer
          </Button>
          <Button variant="secondary" onClick={() => setView("pickup")}>
            <Box className="size-4" />
            Pickup
            {bench.ready > 0 ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs text-primary-fg">
                {bench.ready}
              </span>
            ) : null}
          </Button>
          <Button variant="secondary" onClick={() => openModal("estimate")}>
            <BadgeDollarSign className="size-4" />
            New estimate
          </Button>
        </div>
      </section>

      {showBanner ? (
        <section className="promo-banner flex flex-col gap-4 rounded-3xl p-4 text-fg sm:flex-row sm:items-center sm:p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-fg/15">
            <BadgeDollarSign className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">Accept online payments</h2>
            <p className="text-sm text-fg/80">
              Connect payouts so customers can pay invoices from their phone. Funds settle to your bank account.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openModal("payments")}
              className="inline-flex h-11 items-center rounded-full border border-fg/30 px-4 text-sm font-semibold text-fg hover:bg-fg/10"
            >
              Set up now
            </button>
            <button
              type="button"
              aria-label="Dismiss payments banner"
              onClick={() => dismiss({ bannerDismissed: true })}
              className="grid size-11 place-items-center rounded-full text-fg/80 hover:bg-fg/10"
            >
              ×
            </button>
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          icon={<Wrench className="size-5" />}
          tone="bg-primary/15 text-primary"
          value={bench.queue}
          label="In queue"
          onClick={() => {
            setRepairsFilter("in_queue");
            setView("repairs");
          }}
        />
        <Metric
          icon={<Clock className="size-5" />}
          tone="bg-info/15 text-info"
          value={bench.progress}
          label="In progress"
          onClick={() => {
            setRepairsFilter("in_progress");
            setView("repairs");
          }}
        />
        <Metric
          icon={<Box className="size-5" />}
          tone="bg-success/15 text-success"
          value={bench.ready}
          label="Ready for pickup"
          onClick={() => setView("pickup")}
        />
        <Metric
          icon={<AlertTriangle className="size-5" />}
          tone="bg-danger/15 text-danger"
          value={bench.low}
          label="Low stock alerts"
          danger
          onClick={() => {
            setPartsFilter("low");
            setView("parts");
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat icon={<TrendingUp className="size-4" />} tone="bg-info/15 text-info" value={bench.month} label="Completed this month" onClick={() => setView("reports")} />
        <MiniStat icon={<Check className="size-4" />} tone="bg-success/15 text-success" value={bench.week} label="Completed this week" onClick={() => setView("reports")} />
        <MiniStat icon={<Check className="size-4" />} tone="bg-primary/15 text-primary" value={bench.today} label="Completed today" onClick={() => setView("reports")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">On the bench</h2>
              <p className="text-sm text-muted">Open tickets, newest first.</p>
            </div>
            <button type="button" className="text-sm font-semibold text-primary" onClick={() => setView("repairs")}>
              View all
            </button>
          </div>
          <div className="grid gap-2">
            {bench.open.slice(0, 6).map((repair) => {
              const customer = bench.customerMap.get(repair.customerId);
              return (
                <button
                  key={repair.id}
                  type="button"
                  onClick={() => openDrawer({ kind: "repair", id: repair.id })}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">#{repair.number}</span>
                      <span className="truncate text-sm font-medium">{toolLabel(repair)}</span>
                    </div>
                    <div className="truncate text-sm text-muted">
                      {customer?.name ?? "Customer"} · {repair.issue}
                    </div>
                  </div>
                  <StatusPill status={repair.status} />
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Stock alerts</h2>
              <p className="text-sm text-muted">Parts at or under their minimum.</p>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-primary"
              onClick={() => {
                setPartsFilter("low");
                setView("parts");
              }}
            >
              Manage
            </button>
          </div>
          <div className="grid gap-2">
            {bench.lowParts.length === 0 ? (
              <p className="text-sm text-muted">All stock levels look good.</p>
            ) : (
              bench.lowParts.map((part) => (
                <div key={part.id} className="flex items-center gap-3 rounded-2xl bg-bg px-3 py-3">
                  <span className="grid size-10 place-items-center rounded-full bg-danger/15 text-danger">
                    <AlertTriangle className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{part.name}</div>
                    <div className="text-xs text-muted">
                      {part.category} · min {part.min}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-danger">{part.qty} left</div>
                </div>
              ))
            )}
          </div>
          <p className="mt-4 text-sm text-muted">
            Open invoices {money(bench.outstanding)} · {bench.newInquiries} new {bench.newInquiries === 1 ? "inquiry" : "inquiries"}
          </p>
        </Panel>
      </div>
    </div>
  );
}

function HeroStat({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className="px-1 sm:px-5">
      <div className={`text-3xl font-semibold tabular-nums sm:text-4xl ${tone}`}>{value}</div>
      <div className="mt-1 text-xs text-muted sm:text-sm">{label}</div>
    </div>
  );
}

function Metric({
  icon,
  tone,
  value,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode;
  tone: string;
  value: number;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl bg-surface p-4 text-left shadow-ring transition hover:bg-surface-2 sm:p-5 ${danger ? "ring-1 ring-danger/50" : ""}`}
    >
      <span className={`grid size-10 place-items-center rounded-full ${tone}`}>{icon}</span>
      <div className={`mt-5 text-3xl font-semibold tabular-nums ${danger ? "text-danger" : ""}`}>{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </button>
  );
}

function MiniStat({
  icon,
  tone,
  value,
  label,
  onClick,
}: {
  icon: ReactNode;
  tone: string;
  value: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-3xl bg-surface p-4 text-left shadow-ring transition hover:bg-surface-2"
    >
      <span className={`grid size-10 place-items-center rounded-full ${tone}`}>{icon}</span>
      <span>
        <span className="block text-2xl font-semibold tabular-nums leading-none">{value}</span>
        <span className="mt-1 block text-sm text-muted">{label}</span>
      </span>
    </button>
  );
}

export const STATUS_ORDER: RepairStatus[] = [
  "in_queue",
  "in_progress",
  "waiting_parts",
  "waiting_approval",
  "ready",
  "picked_up",
];
