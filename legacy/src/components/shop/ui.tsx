import * as Dialog from "@radix-ui/react-dialog";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/shop/format";
import type { RepairStatus } from "@/lib/shop/types";

const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm text-fg outline-none transition placeholder:text-faint focus:border-primary";

export function fieldClasses(extra?: string) {
  return cn(fieldClass, extra);
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-fg hover:bg-primary-hover",
        variant === "secondary" && "bg-surface-2 text-fg shadow-ring hover:bg-surface",
        variant === "ghost" && "h-11 bg-transparent text-muted hover:bg-surface hover:text-fg",
        variant === "danger" && "bg-danger/15 text-danger hover:bg-danger/25",
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-fg shadow-ring transition hover:bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-xs font-medium tracking-widest text-faint uppercase">{eyebrow}</div> : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function FilterChip({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-full px-3.5 text-sm font-medium transition",
        active ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-ring hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: RepairStatus }) {
  const tone =
    status === "ready" || status === "picked_up"
      ? "bg-success/15 text-success"
      : status === "in_progress"
        ? "bg-primary/15 text-primary"
        : status === "waiting_parts" || status === "waiting_approval"
          ? "bg-info/15 text-info"
          : "bg-surface-2 text-muted";
  return (
    <span className={cn("inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold", tone)}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/75" />
        <Dialog.Content className="fixed inset-x-4 top-16 z-50 mx-auto flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-surface shadow-ring focus:outline-none">
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div>
              <Dialog.Title className="text-xl font-semibold tracking-tight">{title}</Dialog.Title>
              {subtitle ? (
                <Dialog.Description className="mt-1 text-sm text-muted">{subtitle}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="grid size-11 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg" aria-label="Close">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="scroll-thin overflow-y-auto px-5 pt-4 pb-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface px-5 py-10 text-center shadow-ring">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl bg-surface p-4 shadow-ring sm:p-5", className)}>{children}</section>;
}
