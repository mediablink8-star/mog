import { useMemo } from "react";
import {
  invoiceTotals,
  isCompletedThisMonth,
  isCompletedThisWeek,
  isCompletedToday,
  OPEN_STATUSES,
} from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import type { RepairStatus } from "@/lib/shop/types";

export function useBench() {
  const repairs = useShop((state) => state.repairs);
  const parts = useShop((state) => state.parts);
  const customers = useShop((state) => state.customers);
  const invoices = useShop((state) => state.invoices);
  const inquiries = useShop((state) => state.inquiries);
  const expenses = useShop((state) => state.expenses);

  return useMemo(() => {
    const count = (status: RepairStatus) => repairs.filter((repair) => repair.status === status).length;
    const lowParts = parts.filter((part) => part.qty <= part.min);
    const open = repairs
      .filter((repair) => repair.status !== "picked_up")
      .slice()
      .sort((a, b) => b.intakeAt.localeCompare(a.intakeAt));
    const outstanding = invoices
      .filter((invoice) => invoice.status === "unpaid")
      .reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0);
    return {
      inShop: repairs.filter((repair) => OPEN_STATUSES.includes(repair.status)).length,
      ready: count("ready"),
      queue: count("in_queue"),
      progress: count("in_progress"),
      low: lowParts.length,
      week: repairs.filter((repair) => isCompletedThisWeek(repair.completedAt)).length,
      month: repairs.filter((repair) => isCompletedThisMonth(repair.completedAt)).length,
      today: repairs.filter((repair) => isCompletedToday(repair.completedAt)).length,
      lowParts,
      open,
      outstanding,
      newInquiries: inquiries.filter((inquiry) => inquiry.status === "new").length,
      customerMap: new Map(customers.map((customer) => [customer.id, customer])),
      customers,
      repairs,
      parts,
      invoices,
      inquiries,
      expenses,
    };
  }, [customers, expenses, inquiries, invoices, parts, repairs]);
}
