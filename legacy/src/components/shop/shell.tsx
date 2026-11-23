import { useEffect } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  ClipboardPlus,
  FileText,
  LayoutGrid,
  Menu,
  MessageSquare,
  Package,
  PackageCheck,
  Pin,
  PinOff,
  Plus,
  Receipt,
  Search,
  Settings,
  Store,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { toolLabel } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import type { ModalKind, ViewId } from "@/lib/shop/types";
import { Dashboard } from "@/components/shop/dashboard";
import { ShopDrawers } from "@/components/shop/drawers";
import { ShopModals } from "@/components/shop/forms";
import { useBench } from "@/components/shop/metrics";
import { CustomersPage, EstimatesPage, InvoicesPage, PartsPage } from "@/components/shop/records";
import { ExpensesPage, InquiriesPage, ReportsPage, SettingsPage, ShopPage } from "@/components/shop/ops";
import { IconButton } from "@/components/shop/ui";
import { IntakesPage, PickupPage, RepairsPage } from "@/components/shop/work";

const NAV: Array<{ id: ViewId; label: string; icon: LucideIcon; badge?: "low" }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "intakes", label: "Intakes", icon: ClipboardPlus },
  { id: "pickup", label: "Pickup", icon: PackageCheck },
  { id: "repairs", label: "Repairs", icon: Wrench },
  { id: "parts", label: "Parts", icon: Boxes, badge: "low" },
  { id: "customers", label: "Customers", icon: Users },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "estimates", label: "Estimates", icon: Receipt },
  { id: "shop", label: "Shop", icon: Store },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare },
  { id: "expenses", label: "Expenses", icon: Wallet },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const CREATE: Array<{ id: ModalKind; label: string }> = [
  { id: "intake", label: "Tool intake" },
  { id: "customer", label: "New customer" },
  { id: "estimate", label: "New estimate" },
  { id: "invoice", label: "New invoice" },
  { id: "part", label: "Add part" },
  { id: "expense", label: "Log expense" },
  { id: "inquiry", label: "New inquiry" },
];

export function AppShell() {
  const view = useShop((state) => state.view);
  const mobileNav = useShop((state) => state.mobileNav);
  const popover = useShop((state) => state.popover);
  const setPopover = useShop((state) => state.setPopover);

  useEffect(() => {
    void useShop.persist.rehydrate();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("shop-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-fg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="scroll-thin min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6">
            {view === "dashboard" && <Dashboard />}
            {view === "intakes" && <IntakesPage />}
            {view === "pickup" && <PickupPage />}
            {view === "repairs" && <RepairsPage />}
            {view === "parts" && <PartsPage />}
            {view === "customers" && <CustomersPage />}
            {view === "invoices" && <InvoicesPage />}
            {view === "estimates" && <EstimatesPage />}
            {view === "shop" && <ShopPage />}
            {view === "inquiries" && <InquiriesPage />}
            {view === "expenses" && <ExpensesPage />}
            {view === "reports" && <ReportsPage />}
            {view === "settings" && <SettingsPage />}
          </div>
        </main>
      </div>
      {mobileNav ? (
        <button type="button" className="fixed inset-0 z-20 bg-bg/70 md:hidden" aria-label="Close menu" onClick={() => useShop.getState().setMobileNav(false)} />
      ) : null}
      {popover ? (
        <button type="button" className="fixed inset-0 z-20" aria-label="Dismiss menu" onClick={() => setPopover(null)} />
      ) : null}
      <ShopModals />
      <ShopDrawers />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

function Mark() {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-fg shadow-nav">
      <Package className="size-5" />
    </span>
  );
}

function Sidebar() {
  const view = useShop((state) => state.view);
  const pinned = useShop((state) => state.sidebarPinned);
  const mobileNav = useShop((state) => state.mobileNav);
  const setView = useShop((state) => state.setView);
  const setPinned = useShop((state) => state.setSidebarPinned);
  const bench = useBench();
  const labels = mobileNav || pinned;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex-col border-r border-line bg-sidebar md:static md:flex",
        mobileNav ? "flex w-60" : "hidden",
        pinned ? "md:w-60" : "md:w-16",
      )}
    >
      <div className={cn("flex items-center gap-3 px-4 py-5", !labels && "justify-center px-2")}>
        <Mark />
        {labels ? (
          <div className="min-w-0">
            <div className="text-base leading-none font-semibold tracking-wide">BENCH</div>
            <div className="mt-1 text-xs font-medium tracking-widest text-primary">REPAIRSHOP OS</div>
          </div>
        ) : null}
      </div>
      <nav className="scroll-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2">
        {NAV.map((item) => {
          const active = view === item.id;
          const count = item.badge === "low" ? bench.low : 0;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => setView(item.id)}
              className={cn(
                "relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                active ? "bg-primary text-primary-fg shadow-nav" : "text-muted hover:bg-surface hover:text-fg",
                !labels && "justify-center px-0",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {labels ? <span className="truncate">{item.label}</span> : null}
              {labels && count > 0 ? (
                <span className={cn("ml-auto grid min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold", active ? "bg-primary-fg/15" : "bg-primary text-primary-fg")}>
                  {count}
                </span>
              ) : null}
              {labels && active ? <span className={cn("text-primary-fg", count > 0 ? "" : "ml-auto")}>›</span> : null}
              {!labels && count > 0 ? <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" /> : null}
            </button>
          );
        })}
      </nav>
      <div className="grid gap-1 border-t border-line p-2">
        <button
          type="button"
          title="Settings"
          onClick={() => setView("settings")}
          className={cn(
            "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium",
            view === "settings" ? "bg-primary text-primary-fg" : "text-muted hover:bg-surface hover:text-fg",
            !labels && "justify-center px-0",
          )}
        >
          <Settings className="size-5" />
          {labels ? <span className="flex-1 text-left">Settings</span> : null}
          {labels ? <span>›</span> : null}
        </button>
        <button
          type="button"
          className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-faint hover:bg-surface hover:text-fg", !labels && "justify-center px-0")}
          onClick={() => setPinned(!pinned)}
        >
          {pinned ? <PinOff className="size-5" /> : <Pin className="size-5" />}
          {labels ? <span>{pinned ? "Unpin sidebar" : "Pin sidebar"}</span> : null}
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  const settings = useShop((state) => state.settings);
  const query = useShop((state) => state.query);
  const setQuery = useShop((state) => state.setQuery);
  const popover = useShop((state) => state.popover);
  const setPopover = useShop((state) => state.setPopover);
  const openModal = useShop((state) => state.openModal);
  const setMobile = useShop((state) => state.setMobileNav);
  const setView = useShop((state) => state.setView);
  const setPartsFilter = useShop((state) => state.setPartsFilter);
  const openDrawer = useShop((state) => state.openDrawer);
  const bench = useBench();
  const notices = [
    ...bench.lowParts.map((part) => ({
      id: part.id,
      title: part.name,
      detail: `${part.qty} left · minimum ${part.min}`,
      go: () => {
        setPartsFilter("low");
        setView("parts");
      },
    })),
    ...bench.inquiries
      .filter((inquiry) => inquiry.status === "new")
      .map((inquiry) => ({
        id: inquiry.id,
        title: inquiry.name,
        detail: inquiry.message,
        go: () => setView("inquiries"),
      })),
  ];
  const hits = searchHits(query);

  return (
    <header className="relative z-30 flex h-16 items-center gap-2 border-b border-line px-3 md:gap-3 md:px-5">
      <IconButton className="md:hidden" aria-label="Open menu" onClick={() => setMobile(true)}>
        <Menu className="size-5" />
      </IconButton>
      <div className="hidden min-w-0 truncate text-sm font-semibold lg:block">{settings.shopName}</div>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
        <input
          id="shop-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search customers, repairs, parts..."
          className="h-11 w-full rounded-full border border-line bg-surface pr-16 pl-10 text-sm outline-none placeholder:text-faint focus:border-primary"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-line px-1.5 py-0.5 text-xs text-faint md:inline">
          Ctrl K
        </kbd>
        {query.trim() ? (
          <div className="absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-2xl bg-surface shadow-ring">
            {hits.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted">No matches.</p>
            ) : (
              hits.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  className="flex w-full flex-col px-4 py-3 text-left hover:bg-surface-2"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery("");
                    hit.go();
                  }}
                >
                  <span className="text-sm font-medium">{hit.title}</span>
                  <span className="truncate text-xs text-muted">{hit.detail}</span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
      <div className="relative">
        <IconButton className="bg-primary text-primary-fg hover:bg-primary-hover" aria-label="Create" onClick={() => setPopover(popover === "plus" ? null : "plus")}>
          <Plus className="size-5" />
        </IconButton>
        {popover === "plus" ? (
          <div className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl bg-surface p-1 shadow-ring">
            {CREATE.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex h-11 w-full items-center rounded-xl px-3 text-left text-sm hover:bg-surface-2"
                onClick={() => openModal(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative">
        <IconButton aria-label="Alerts" onClick={() => setPopover(popover === "bell" ? null : "bell")}>
          <Bell className="size-5" />
          {notices.length > 0 ? (
            <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-fg">
              {notices.length}
            </span>
          ) : null}
        </IconButton>
        {popover === "bell" ? (
          <div className="absolute right-0 z-40 mt-2 w-80 max-w-[80vw] overflow-hidden rounded-2xl bg-surface p-1 shadow-ring">
            {notices.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">No alerts.</p>
            ) : (
              notices.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  className="flex w-full flex-col rounded-xl px-3 py-3 text-left hover:bg-surface-2"
                  onClick={notice.go}
                >
                  <span className="text-sm font-medium">{notice.title}</span>
                  <span className="line-clamp-2 text-xs text-muted">{notice.detail}</span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
      <span className="hidden size-11 place-items-center rounded-full bg-surface-2 text-sm font-semibold sm:grid" title={settings.owner}>
        {settings.initials}
      </span>
    </header>
  );
}

function searchHits(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const { customers, repairs, parts, openDrawer, setView } = useShop.getState();
  const hits: Array<{ id: string; title: string; detail: string; go: () => void }> = [];
  for (const repair of repairs) {
    if (repair.status === "picked_up") continue;
    const customer = customers.find((item) => item.id === repair.customerId);
    const hay = `${repair.number} ${repair.brand} ${repair.model} ${repair.tool} ${repair.issue} ${customer?.name ?? ""} ${customer?.phone ?? ""}`.toLowerCase();
    if (!hay.includes(q)) continue;
    hits.push({
      id: repair.id,
      title: `#${repair.number} ${toolLabel(repair)}`,
      detail: customer?.name ?? "Repair",
      go: () => {
        setView("repairs");
        openDrawer({ kind: "repair", id: repair.id });
      },
    });
  }
  for (const customer of customers) {
    const hay = `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase();
    if (!hay.includes(q)) continue;
    hits.push({
      id: customer.id,
      title: customer.name,
      detail: customer.phone,
      go: () => {
        setView("customers");
        openDrawer({ kind: "customer", id: customer.id });
      },
    });
  }
  for (const part of parts) {
    const hay = `${part.name} ${part.sku} ${part.category}`.toLowerCase();
    if (!hay.includes(q)) continue;
    hits.push({
      id: part.id,
      title: part.name,
      detail: `${part.sku} · ${part.qty} on hand`,
      go: () => setView("parts"),
    });
  }
  return hits.slice(0, 8);
}
