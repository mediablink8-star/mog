import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BRANDS, repairLines, uid } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";
import type { Inquiry, Line } from "@/lib/shop/types";
import { Button, Field, fieldClasses, Modal } from "@/components/shop/ui";

const TITLES = {
  intake: "Tool intake",
  customer: "New customer",
  estimate: "New estimate",
  invoice: "New invoice",
  part: "Add part",
  expense: "Log expense",
  inquiry: "New inquiry",
  payments: "Set up payouts",
  reset: "Reset sample shop",
} as const;

export function ShopModals() {
  const modal = useShop((state) => state.modal);
  const close = useShop((state) => state.closeModal);
  if (!modal) return null;
  return (
    <Modal open title={TITLES[modal]} subtitle={modal === "payments" ? "Demo only — no bank is contacted." : undefined} onClose={close}>
      {modal === "intake" && <IntakeForm onDone={close} />}
      {modal === "customer" && <CustomerForm onDone={close} />}
      {modal === "estimate" && <EstimateForm onDone={close} />}
      {modal === "invoice" && <InvoiceForm onDone={close} />}
      {modal === "part" && <PartForm onDone={close} />}
      {modal === "expense" && <ExpenseForm onDone={close} />}
      {modal === "inquiry" && <InquiryForm onDone={close} />}
      {modal === "payments" && <PaymentsForm />}
      {modal === "reset" && <ResetForm />}
    </Modal>
  );
}

export function IntakeForm({ onDone }: { onDone?: () => void }) {
  const customers = useShop((state) => state.customers);
  const techs = useShop((state) => state.settings.techs);
  const ctx = useShop((state) => state.modalCtx);
  const intake = useShop((state) => state.intake);
  const openDrawer = useShop((state) => state.openDrawer);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState(ctx.customerId ?? customers[0]?.id ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState(BRANDS[0]);
  const [tool, setTool] = useState("");
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState<"normal" | "rush">("normal");
  const [tech, setTech] = useState(techs[0] ?? "");
  const [labor, setLabor] = useState("0");

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (mode === "new" && (!name.trim() || !phone.trim())) {
          toast.error("Name and phone are required for a new customer.");
          return;
        }
        if (mode === "existing" && !customerId) {
          toast.error("Pick a customer or add a new one.");
          return;
        }
        const id = intake({
          customerId,
          newCustomer: mode === "new" ? { name, phone, email } : null,
          brand,
          tool,
          model,
          serial,
          issue,
          priority,
          tech,
          labor: Number(labor) || 0,
        });
        const ticket = useShop.getState().repairs.find((repair) => repair.id === id);
        toast.success(`Ticket #${ticket?.number ?? ""} opened`);
        openDrawer({ kind: "repair", id });
        setTool("");
        setModel("");
        setSerial("");
        setIssue("");
        setLabor("0");
        setName("");
        setPhone("");
        setEmail("");
        setMode("existing");
        setPriority("normal");
        onDone?.();
      }}
    >
      <Field label="Customer">
        <select className={fieldClasses()} value={mode === "new" ? "new" : customerId} onChange={(event) => {
          if (event.target.value === "new") setMode("new");
          else {
            setMode("existing");
            setCustomerId(event.target.value);
          }
        }}>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
          <option value="new">New customer</option>
        </select>
      </Field>
      {mode === "new" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input className={fieldClasses()} value={name} onChange={(event) => setName(event.target.value)} required />
          </Field>
          <Field label="Phone">
            <input className={fieldClasses()} value={phone} onChange={(event) => setPhone(event.target.value)} required />
          </Field>
          <Field label="Email">
            <input className={fieldClasses("sm:col-span-2")} type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Brand">
          <select className={fieldClasses()} value={brand} onChange={(event) => setBrand(event.target.value)}>
            {BRANDS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Tool">
          <input className={fieldClasses()} placeholder="Hammer drill" value={tool} onChange={(event) => setTool(event.target.value)} required />
        </Field>
        <Field label="Model">
          <input className={fieldClasses()} placeholder="DCD996" value={model} onChange={(event) => setModel(event.target.value)} required />
        </Field>
        <Field label="Serial">
          <input className={fieldClasses()} value={serial} onChange={(event) => setSerial(event.target.value)} />
        </Field>
      </div>
      <Field label="Reported issue">
        <textarea className={fieldClasses("h-24 py-2")} value={issue} onChange={(event) => setIssue(event.target.value)} required />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Priority">
          <select className={fieldClasses()} value={priority} onChange={(event) => setPriority(event.target.value as "normal" | "rush")}>
            <option value="normal">Normal</option>
            <option value="rush">Rush</option>
          </select>
        </Field>
        <Field label="Technician">
          <select className={fieldClasses()} value={tech} onChange={(event) => setTech(event.target.value)}>
            {techs.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Labor quote">
          <input className={fieldClasses()} type="number" min="0" step="0.01" value={labor} onChange={(event) => setLabor(event.target.value)} />
        </Field>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <Button type="submit">Open ticket</Button>
      </div>
    </form>
  );
}

function CustomerForm({ onDone }: { onDone: () => void }) {
  const addCustomer = useShop((state) => state.addCustomer);
  const openDrawer = useShop((state) => state.openDrawer);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const id = addCustomer({ name, phone, email, notes });
        toast.success("Customer saved");
        openDrawer({ kind: "customer", id });
        onDone();
      }}
    >
      <Field label="Full name">
        <input className={fieldClasses()} value={name} onChange={(event) => setName(event.target.value)} required />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phone">
          <input className={fieldClasses()} value={phone} onChange={(event) => setPhone(event.target.value)} required />
        </Field>
        <Field label="Email">
          <input className={fieldClasses()} type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea className={fieldClasses("h-24 py-2")} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit">Save customer</Button>
      </div>
    </form>
  );
}

function LineEditor({ lines, onChange }: { lines: Line[]; onChange: (lines: Line[]) => void }) {
  return (
    <div className="grid gap-2">
      {lines.map((line) => (
        <div key={line.id} className="grid grid-cols-12 gap-2">
          <input
            className={fieldClasses("col-span-6")}
            placeholder="Description"
            value={line.description}
            onChange={(event) => onChange(lines.map((item) => (item.id === line.id ? { ...item, description: event.target.value } : item)))}
          />
          <input
            className={fieldClasses("col-span-2")}
            type="number"
            min="1"
            aria-label="Quantity"
            value={line.qty}
            onChange={(event) => onChange(lines.map((item) => (item.id === line.id ? { ...item, qty: Number(event.target.value) || 1 } : item)))}
          />
          <input
            className={fieldClasses("col-span-3")}
            type="number"
            min="0"
            step="0.01"
            aria-label="Price"
            value={line.price}
            onChange={(event) => onChange(lines.map((item) => (item.id === line.id ? { ...item, price: Number(event.target.value) || 0 } : item)))}
          />
          <button
            type="button"
            className="col-span-1 text-sm text-muted hover:text-danger"
            aria-label="Remove line"
            onClick={() => onChange(lines.filter((item) => item.id !== line.id))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="h-11 text-left text-sm font-semibold text-primary"
        onClick={() => onChange([...lines, { id: uid("ln"), description: "", qty: 1, price: 0 }])}
      >
        Add line
      </button>
    </div>
  );
}

function cleanLines(lines: Line[]) {
  return lines
    .map((line) => ({ ...line, description: line.description.trim(), qty: Math.max(1, line.qty), price: Math.max(0, line.price) }))
    .filter((line) => line.description);
}

function EstimateForm({ onDone }: { onDone: () => void }) {
  const customers = useShop((state) => state.customers);
  const repairs = useShop((state) => state.repairs);
  const ctx = useShop((state) => state.modalCtx);
  const addEstimate = useShop((state) => state.addEstimate);
  const openDrawer = useShop((state) => state.openDrawer);
  const [customerId, setCustomerId] = useState(ctx.customerId ?? customers[0]?.id ?? "");
  const [repairId, setRepairId] = useState(ctx.repairId ?? "");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Line[]>([{ id: uid("ln"), description: "Labor", qty: 1, price: 0 }]);
  const options = repairs.filter((repair) => repair.customerId === customerId && repair.status !== "picked_up");
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const next = cleanLines(lines);
        if (!customerId || next.length === 0) {
          toast.error("Add a customer and at least one line.");
          return;
        }
        const id = addEstimate({ customerId, repairId: repairId || null, lines: next, note });
        toast.success("Estimate drafted");
        openDrawer({ kind: "estimate", id });
        onDone();
      }}
    >
      <Field label="Customer">
        <select
          className={fieldClasses()}
          value={customerId}
          onChange={(event) => {
            setCustomerId(event.target.value);
            setRepairId("");
          }}
        >
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ticket">
        <select className={fieldClasses()} value={repairId} onChange={(event) => setRepairId(event.target.value)}>
          <option value="">No ticket</option>
          {options.map((repair) => (
            <option key={repair.id} value={repair.id}>
              #{repair.number} · {repair.brand} {repair.model}
            </option>
          ))}
        </select>
      </Field>
      <LineEditor lines={lines} onChange={setLines} />
      <Field label="Note">
        <textarea className={fieldClasses("h-20 py-2")} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit">Save estimate</Button>
      </div>
    </form>
  );
}

function InvoiceForm({ onDone }: { onDone: () => void }) {
  const customers = useShop((state) => state.customers);
  const repairs = useShop((state) => state.repairs);
  const parts = useShop((state) => state.parts);
  const ctx = useShop((state) => state.modalCtx);
  const addInvoice = useShop((state) => state.addInvoice);
  const openDrawer = useShop((state) => state.openDrawer);
  const initialRepair = repairs.find((repair) => repair.id === ctx.repairId);
  const [customerId, setCustomerId] = useState(initialRepair?.customerId ?? ctx.customerId ?? customers[0]?.id ?? "");
  const [repairId, setRepairId] = useState(ctx.repairId ?? "");
  const [lines, setLines] = useState<Line[]>(() =>
    initialRepair ? repairLines(initialRepair, parts) : [{ id: uid("ln"), description: "Labor", qty: 1, price: 0 }],
  );
  const options = useMemo(
    () => repairs.filter((repair) => repair.customerId === customerId),
    [customerId, repairs],
  );
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const next = cleanLines(lines);
        if (!customerId || next.length === 0) {
          toast.error("Add a customer and at least one line.");
          return;
        }
        const id = addInvoice({ customerId, repairId: repairId || null, lines: next });
        toast.success("Invoice created");
        openDrawer({ kind: "invoice", id });
        onDone();
      }}
    >
      <Field label="Customer">
        <select className={fieldClasses()} value={customerId} onChange={(event) => { setCustomerId(event.target.value); setRepairId(""); }}>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ticket">
        <select
          className={fieldClasses()}
          value={repairId}
          onChange={(event) => {
            const nextId = event.target.value;
            setRepairId(nextId);
            const repair = repairs.find((item) => item.id === nextId);
            if (repair) setLines(repairLines(repair, parts));
          }}
        >
          <option value="">No ticket</option>
          {options.map((repair) => (
            <option key={repair.id} value={repair.id}>
              #{repair.number} · {repair.brand} {repair.model}
            </option>
          ))}
        </select>
      </Field>
      <LineEditor lines={lines} onChange={setLines} />
      <div className="flex justify-end">
        <Button type="submit">Create invoice</Button>
      </div>
    </form>
  );
}

function PartForm({ onDone }: { onDone: () => void }) {
  const addPart = useShop((state) => state.addPart);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Wear parts");
  const [qty, setQty] = useState("1");
  const [min, setMin] = useState("2");
  const [cost, setCost] = useState("0");
  const [price, setPrice] = useState("0");
  const [bin, setBin] = useState("");
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        addPart({
          name,
          sku,
          category,
          qty: Number(qty) || 0,
          min: Number(min) || 0,
          cost: Number(cost) || 0,
          price: Number(price) || 0,
          bin,
        });
        toast.success("Part added");
        onDone();
      }}
    >
      <Field label="Name">
        <input className={fieldClasses()} value={name} onChange={(event) => setName(event.target.value)} required />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="SKU">
          <input className={fieldClasses()} placeholder="Auto if blank" value={sku} onChange={(event) => setSku(event.target.value)} />
        </Field>
        <Field label="Category">
          <input className={fieldClasses()} value={category} onChange={(event) => setCategory(event.target.value)} />
        </Field>
        <Field label="On hand">
          <input className={fieldClasses()} type="number" min="0" value={qty} onChange={(event) => setQty(event.target.value)} />
        </Field>
        <Field label="Minimum">
          <input className={fieldClasses()} type="number" min="0" value={min} onChange={(event) => setMin(event.target.value)} />
        </Field>
        <Field label="Cost">
          <input className={fieldClasses()} type="number" min="0" step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} />
        </Field>
        <Field label="Price">
          <input className={fieldClasses()} type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} />
        </Field>
      </div>
      <Field label="Bin">
        <input className={fieldClasses()} value={bin} onChange={(event) => setBin(event.target.value)} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit">Save part</Button>
      </div>
    </form>
  );
}

function ExpenseForm({ onDone }: { onDone: () => void }) {
  const addExpense = useShop((state) => state.addExpense);
  const [category, setCategory] = useState("Parts");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        addExpense({ category, vendor, amount: Number(amount) || 0, date, note });
        toast.success("Expense logged");
        onDone();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category">
          <select className={fieldClasses()} value={category} onChange={(event) => setCategory(event.target.value)}>
            {["Rent", "Parts", "Tools", "Utilities", "Insurance", "Marketing", "Other"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Amount">
          <input className={fieldClasses()} type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        </Field>
      </div>
      <Field label="Vendor">
        <input className={fieldClasses()} value={vendor} onChange={(event) => setVendor(event.target.value)} required />
      </Field>
      <Field label="Date">
        <input className={fieldClasses()} type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
      </Field>
      <Field label="Note">
        <input className={fieldClasses()} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit">Save expense</Button>
      </div>
    </form>
  );
}

function InquiryForm({ onDone }: { onDone: () => void }) {
  const addInquiry = useShop((state) => state.addInquiry);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<Inquiry["channel"]>("phone");
  const [message, setMessage] = useState("");
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        addInquiry({ name, phone, channel, message });
        toast.success("Inquiry logged");
        onDone();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input className={fieldClasses()} value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Phone">
          <input className={fieldClasses()} value={phone} onChange={(event) => setPhone(event.target.value)} />
        </Field>
      </div>
      <Field label="Channel">
        <select className={fieldClasses()} value={channel} onChange={(event) => setChannel(event.target.value as Inquiry["channel"])}>
          <option value="phone">Phone</option>
          <option value="walk-in">Walk-in</option>
          <option value="web">Web</option>
          <option value="email">Email</option>
        </select>
      </Field>
      <Field label="Message">
        <textarea className={fieldClasses("h-24 py-2")} value={message} onChange={(event) => setMessage(event.target.value)} required />
      </Field>
      <div className="flex justify-end">
        <Button type="submit">Save inquiry</Button>
      </div>
    </form>
  );
}

function PaymentsForm() {
  const connected = useShop((state) => state.settings.paymentsConnected);
  const update = useShop((state) => state.updateSettings);
  const close = useShop((state) => state.closeModal);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        Turning payouts on is a local switch for this shop. Nothing is sent to a bank, and card numbers are never collected.
        Paid invoices can then be marked as card, cash, or transfer.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={close}>
          Not now
        </Button>
        <Button
          onClick={() => {
            update({ paymentsConnected: !connected, bannerDismissed: true });
            toast.success(connected ? "Payouts disconnected" : "Payouts marked connected");
            close();
          }}
        >
          {connected ? "Disconnect" : "Connect payouts"}
        </Button>
      </div>
    </div>
  );
}

function ResetForm() {
  const reset = useShop((state) => state.resetDemo);
  const close = useShop((state) => state.closeModal);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        This replaces every ticket, customer, part, and invoice in this browser with the Summit sample shop. It cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            reset();
            toast.success("Sample shop restored");
          }}
        >
          Reset sample data
        </Button>
      </div>
    </div>
  );
}
