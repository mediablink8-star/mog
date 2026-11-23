import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { C as Check, D as Bell, E as Box, O as BadgeDollarSign, S as ClipboardPlus, T as Boxes, _ as MessageSquare, a as UserPlus, b as FileText, c as Store, d as Receipt, f as Plus, g as PackageCheck, h as Package, i as Users, l as Settings, m as PinOff, n as Wrench, o as TriangleAlert, p as Pin, r as Wallet, s as TrendingUp, t as X, u as Search, v as Menu, w as ChartColumn, x as Clock, y as LayoutGrid } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as format, i as isThisMonth, n as isToday, r as isThisWeek, t as parseISO } from "../_libs/date-fns.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { a as CartesianGrid, c as Cell, i as XAxis, l as ResponsiveContainer, n as BarChart, o as Bar, r as YAxis, s as Pie, t as PieChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B70Uuxzp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var STATUS_LABEL = {
	in_queue: "In queue",
	in_progress: "In progress",
	waiting_parts: "Waiting parts",
	waiting_approval: "Awaiting approval",
	ready: "Ready for pickup",
	picked_up: "Picked up"
};
var OPEN_STATUSES = [
	"in_queue",
	"in_progress",
	"waiting_parts",
	"waiting_approval"
];
var BRANDS = [
	"DeWalt",
	"Milwaukee",
	"Makita",
	"Bosch",
	"Ryobi",
	"Hilti",
	"Festool",
	"Ridgid",
	"Other"
];
var PAY_LABEL = {
	card: "Card",
	cash: "Cash",
	transfer: "Transfer"
};
function money(n) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(n);
}
function shortDate(iso) {
	return format(parseISO(iso), "MMM d");
}
function longDate(iso) {
	return format(parseISO(iso), "MMM d, yyyy");
}
function greeting(date = /* @__PURE__ */ new Date()) {
	const h = date.getHours();
	if (h < 12) return "Good morning";
	if (h < 17) return "Good afternoon";
	return "Good evening";
}
function firstName(name) {
	return name.trim().split(/\s+/)[0] || name;
}
function initialsOf(name) {
	return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AR";
}
function lineSum(lines) {
	return Math.round(lines.reduce((sum, line) => sum + line.qty * line.price, 0) * 100) / 100;
}
function taxed(subtotal, rate) {
	const tax = Math.round(subtotal * rate * 100) / 100;
	return {
		subtotal,
		tax,
		total: Math.round((subtotal + tax) * 100) / 100
	};
}
function invoiceTotals(invoice) {
	return taxed(lineSum(invoice.lines), invoice.taxRate);
}
function repairLines(repair, parts) {
	const lines = [];
	if (repair.labor > 0) lines.push({
		id: `labor_${repair.id}`,
		description: `Labor — ${repair.brand} ${repair.model}`,
		qty: 1,
		price: repair.labor
	});
	for (const use of repair.partsUsed) {
		const part = parts.find((item) => item.id === use.partId);
		if (!part) continue;
		lines.push({
			id: `use_${repair.id}_${part.id}`,
			description: part.name,
			qty: use.qty,
			price: part.price
		});
	}
	return lines;
}
function dueForRepair(repair, parts, invoices, taxRate) {
	const existing = invoices.find((invoice) => invoice.repairId === repair.id && invoice.status !== "void");
	if (existing) {
		if (existing.status === "paid") return {
			...invoiceTotals(existing),
			settled: true,
			invoice: existing
		};
		return {
			...invoiceTotals(existing),
			settled: false,
			invoice: existing
		};
	}
	return {
		...taxed(lineSum(repairLines(repair, parts)), taxRate),
		settled: false,
		invoice: null
	};
}
function isCompletedThisWeek(iso) {
	return Boolean(iso && isThisWeek(parseISO(iso), { weekStartsOn: 1 }));
}
function isCompletedThisMonth(iso) {
	return Boolean(iso && isThisMonth(parseISO(iso)));
}
function isCompletedToday(iso) {
	return Boolean(iso && isToday(parseISO(iso)));
}
function escapeHtml(value) {
	return Array.from(value, (char) => {
		if (char === "&") return "&amp;";
		if (char === "<") return "&lt;";
		if (char === ">") return "&gt;";
		if (char === "\"") return "&quot;";
		if (char === "'") return "&#39;";
		return char;
	}).join("");
}
function uid(prefix) {
	return `${prefix}_${crypto.randomUUID()}`;
}
function toolLabel(repair) {
	return `${repair.brand} ${repair.model}`.trim();
}
var TAX = .08;
var HISTORY = [
	[
		"rh1",
		2361,
		"c1",
		"DeWalt",
		"Impact driver",
		"DCF887",
		"Worn anvil",
		"Alex Rivera",
		85,
		"2026-08-06"
	],
	[
		"rh2",
		2366,
		"c4",
		"Milwaukee",
		"Hackzall",
		"2719-20",
		"Blade clamp slipping",
		"Sam Ortiz",
		65,
		"2026-08-18"
	],
	[
		"rh3",
		2370,
		"c6",
		"Makita",
		"Circular saw",
		"HS7600",
		"Dull arbor",
		"Priya Shah",
		90,
		"2026-08-27"
	],
	[
		"rh4",
		2374,
		"c2",
		"Bosch",
		"Rotary hammer",
		"GBH18V-26",
		"Mode selector stuck",
		"Alex Rivera",
		140,
		"2026-09-03"
	],
	[
		"rh5",
		2378,
		"c7",
		"Ridgid",
		"Impact wrench",
		"R86912",
		"No torque",
		"Sam Ortiz",
		110,
		"2026-09-09"
	],
	[
		"rh6",
		2381,
		"c5",
		"DeWalt",
		"Sander",
		"DWE6423",
		"Pad won't hold",
		"Priya Shah",
		55,
		"2026-09-16"
	],
	[
		"rh7",
		2384,
		"c8",
		"Milwaukee",
		"Packout radio",
		"2950-20",
		"No audio",
		"Alex Rivera",
		70,
		"2026-09-24"
	],
	[
		"rh8",
		2388,
		"c9",
		"Festool",
		"Sander",
		"ETS 125",
		"Dust port cracked",
		"Priya Shah",
		160,
		"2026-10-02"
	],
	[
		"rh9",
		2391,
		"c3",
		"Ryobi",
		"Blower",
		"P2108",
		"Weak airflow",
		"Sam Ortiz",
		45,
		"2026-10-08"
	],
	[
		"rh10",
		2394,
		"c10",
		"Hilti",
		"Angle grinder",
		"AG 4S-A22",
		"Spindle play",
		"Alex Rivera",
		130,
		"2026-10-15"
	],
	[
		"rh11",
		2396,
		"c1",
		"Makita",
		"Drill",
		"XPH12",
		"Chuck wobble",
		"Priya Shah",
		80,
		"2026-10-22"
	],
	[
		"rh12",
		2399,
		"c4",
		"DeWalt",
		"Table saw",
		"DWE7491",
		"Riving knife misaligned",
		"Sam Ortiz",
		175,
		"2026-10-29"
	]
];
var METHODS = [
	"card",
	"cash",
	"transfer"
];
function seedData() {
	const customers = [
		[
			"c1",
			"James Holt",
			"(303) 555-0101",
			"james.holt@email.example",
			"Framing crew. Often rushes saws.",
			"2026-04-02T15:00:00.000Z"
		],
		[
			"c2",
			"Dana Whitfield",
			"(303) 555-0102",
			"dana.whitfield@email.example",
			"Owns a concrete outfit on Brighton Blvd.",
			"2026-05-11T15:00:00.000Z"
		],
		[
			"c3",
			"Ruth Adler",
			"(303) 555-0103",
			"ruth.adler@email.example",
			"Prefers a text when the vac is ready.",
			"2026-05-19T15:00:00.000Z"
		],
		[
			"c4",
			"Luis Ortega",
			"(303) 555-0104",
			"luis.ortega@email.example",
			"Fleet of DeWalt drills. Net 7 is fine.",
			"2026-06-02T15:00:00.000Z"
		],
		[
			"c5",
			"Elena Voss",
			"(303) 555-0105",
			"elena.voss@email.example",
			"Cabinet shop. Asks for written estimates.",
			"2026-06-18T15:00:00.000Z"
		],
		[
			"c6",
			"Chris Bale",
			"(303) 555-0106",
			"chris.bale@email.example",
			"Weekend remodeler.",
			"2026-07-01T15:00:00.000Z"
		],
		[
			"c7",
			"Marcus Chen",
			"(303) 555-0107",
			"marcus.chen@email.example",
			"Electrical contractor.",
			"2026-07-14T15:00:00.000Z"
		],
		[
			"c8",
			"Owen Blake",
			"(303) 555-0108",
			"owen.blake@email.example",
			"Will pick up after 4.",
			"2026-08-03T15:00:00.000Z"
		],
		[
			"c9",
			"Harper Quinn",
			"(303) 555-0109",
			"harper.quinn@email.example",
			"Finish carpenter. Festool only.",
			"2026-08-20T15:00:00.000Z"
		],
		[
			"c10",
			"Nina Alvarez",
			"(303) 555-0110",
			"nina.alvarez@email.example",
			"Site supervisor at Summit Ridge.",
			"2026-09-09T15:00:00.000Z"
		]
	].map(([id, name, phone, email, notes, createdAt]) => ({
		id,
		name,
		phone,
		email,
		notes,
		createdAt
	}));
	const parts = [
		{
			id: "p1",
			sku: "BR-014",
			name: "Carbon brush set",
			category: "Wear parts",
			qty: 1,
			min: 4,
			cost: 8,
			price: 22,
			bin: "A-12"
		},
		{
			id: "p2",
			sku: "BR-088",
			name: "M18 XC 5.0 battery",
			category: "Power",
			qty: 2,
			min: 4,
			cost: 79,
			price: 149,
			bin: "C-02"
		},
		{
			id: "p3",
			sku: "BR-203",
			name: "7-1/4\" carbide blade",
			category: "Blades",
			qty: 2,
			min: 6,
			cost: 14,
			price: 29,
			bin: "B-04"
		},
		{
			id: "p4",
			sku: "BR-090",
			name: "DeWalt DCB205 battery",
			category: "Power",
			qty: 8,
			min: 3,
			cost: 69,
			price: 129,
			bin: "C-03"
		},
		{
			id: "p5",
			sku: "BR-311",
			name: "Bosch jigsaw trigger",
			category: "Switches",
			qty: 5,
			min: 2,
			cost: 18,
			price: 42,
			bin: "A-20"
		},
		{
			id: "p6",
			sku: "BR-441",
			name: "Festool dust port",
			category: "Body",
			qty: 3,
			min: 2,
			cost: 16,
			price: 36,
			bin: "D-01"
		},
		{
			id: "p7",
			sku: "BR-118",
			name: "Impact chuck assembly",
			category: "Drive",
			qty: 4,
			min: 2,
			cost: 22,
			price: 48,
			bin: "A-08"
		},
		{
			id: "p8",
			sku: "BR-502",
			name: "14/3 power cord",
			category: "Electrical",
			qty: 6,
			min: 2,
			cost: 11,
			price: 28,
			bin: "E-06"
		},
		{
			id: "p9",
			sku: "BR-017",
			name: "Gear grease tube",
			category: "Consumable",
			qty: 9,
			min: 3,
			cost: 4,
			price: 9,
			bin: "E-01"
		},
		{
			id: "p10",
			sku: "BR-700",
			name: "Safety glasses",
			category: "Shop",
			qty: 20,
			min: 6,
			cost: 3,
			price: 8,
			bin: "F-02"
		},
		{
			id: "p11",
			sku: "BR-091",
			name: "M18 charger",
			category: "Power",
			qty: 4,
			min: 2,
			cost: 29,
			price: 59,
			bin: "C-04"
		},
		{
			id: "p12",
			sku: "BR-220",
			name: "Grinder guard",
			category: "Safety",
			qty: 3,
			min: 2,
			cost: 12,
			price: 27,
			bin: "A-15"
		}
	];
	const active = [
		repair({
			id: "r1",
			number: 2408,
			customerId: "c1",
			brand: "Milwaukee",
			tool: "Circular saw",
			model: "2730-20",
			serial: "MWL-440218",
			issue: "Blade guard sticks open and the shoe is bent.",
			status: "in_queue",
			priority: "normal",
			tech: "Sam Ortiz",
			intakeAt: "2026-11-23T09:10:00.000Z",
			labor: 90,
			notes: "Needs it before Friday's framing job."
		}),
		repair({
			id: "r2",
			number: 2407,
			customerId: "c2",
			brand: "Hilti",
			tool: "Rotary hammer",
			model: "TE 6-A22",
			serial: "HLT-88211",
			issue: "Power cuts out under load.",
			status: "in_queue",
			priority: "rush",
			tech: "Priya Shah",
			intakeAt: "2026-11-23T08:40:00.000Z",
			labor: 125,
			notes: "Rush — jobsite is down."
		}),
		repair({
			id: "r3",
			number: 2406,
			customerId: "c3",
			brand: "Ridgid",
			tool: "Shop vac",
			model: "WD4070",
			serial: "RDG-19002",
			issue: "Weak suction after a drywall job.",
			status: "in_queue",
			priority: "normal",
			tech: "Sam Ortiz",
			intakeAt: "2026-11-22T16:20:00.000Z",
			labor: 55,
			notes: "Filter was packed. Check the hose cuff too."
		}),
		repair({
			id: "r4",
			number: 2405,
			customerId: "c4",
			brand: "DeWalt",
			tool: "Hammer drill",
			model: "DCD996",
			serial: "DWT-55190",
			issue: "Won't hold a charge past ten minutes.",
			status: "in_progress",
			priority: "rush",
			tech: "Alex Rivera",
			intakeAt: "2026-11-21T15:00:00.000Z",
			labor: 95,
			notes: "Battery test running. Cells look uneven."
		}),
		repair({
			id: "r5",
			number: 2404,
			customerId: "c5",
			brand: "Makita",
			tool: "Angle grinder",
			model: "GA5030",
			serial: "MKT-22014",
			issue: "Sparking at the brushes and a burning smell.",
			status: "in_progress",
			priority: "normal",
			tech: "Priya Shah",
			intakeAt: "2026-11-21T11:30:00.000Z",
			labor: 70,
			notes: "Brushes replaced. Commutator needs a light dress.",
			partsUsed: [{
				partId: "p1",
				qty: 1
			}]
		}),
		repair({
			id: "r6",
			number: 2403,
			customerId: "c6",
			brand: "Ryobi",
			tool: "Miter saw",
			model: "TSS702",
			serial: "RYB-77301",
			issue: "Laser won't track the blade.",
			status: "in_progress",
			priority: "normal",
			tech: "Sam Ortiz",
			intakeAt: "2026-11-20T18:00:00.000Z",
			labor: 80,
			notes: "Alignment started. Waiting on a clear bench."
		}),
		repair({
			id: "r7",
			number: 2402,
			customerId: "c7",
			brand: "DeWalt",
			tool: "Impact driver",
			model: "DCF887",
			serial: "DWT-10933",
			issue: "Chuck slips under load.",
			status: "in_progress",
			priority: "normal",
			tech: "Alex Rivera",
			intakeAt: "2026-11-20T14:15:00.000Z",
			labor: 85,
			notes: "Anvil is mushroomed. Quote a chuck if it worsens."
		}),
		repair({
			id: "r8",
			number: 2401,
			customerId: "c8",
			brand: "Bosch",
			tool: "Jigsaw",
			model: "JS470E",
			serial: "BSH-33018",
			issue: "Dead trigger. No spin at all.",
			status: "ready",
			priority: "normal",
			tech: "Priya Shah",
			intakeAt: "2026-11-19T17:40:00.000Z",
			labor: 65,
			notes: "New trigger fitted and tested on a scrap of oak.",
			partsUsed: [{
				partId: "p5",
				qty: 1
			}]
		}),
		repair({
			id: "r9",
			number: 2400,
			customerId: "c9",
			brand: "Festool",
			tool: "Track saw",
			model: "TS 55",
			serial: "FES-88120",
			issue: "Cracked dust port. Customer wants it sealed.",
			status: "ready",
			priority: "normal",
			tech: "Alex Rivera",
			intakeAt: "2026-11-18T15:05:00.000Z",
			labor: 140,
			notes: "Port bonded and a new fitting installed. Invoice is open.",
			partsUsed: [{
				partId: "p6",
				qty: 1
			}]
		}),
		repair({
			id: "r10",
			number: 2398,
			customerId: "c5",
			brand: "Milwaukee",
			tool: "Charger",
			model: "48-59-1802",
			serial: "MWL-10021",
			issue: "No output. LED stays dark.",
			status: "ready",
			priority: "normal",
			tech: "Sam Ortiz",
			intakeAt: "2026-11-18T13:20:00.000Z",
			labor: 45,
			notes: "Board reflowed. Charges an M18 pack again."
		})
	];
	const historyRepairs = HISTORY.map((row) => {
		const [id, number, customerId, brand, tool, model, issue, tech, labor, done] = row;
		return repair({
			id,
			number,
			customerId,
			brand,
			tool,
			model,
			serial: "",
			issue,
			status: "picked_up",
			priority: "normal",
			tech,
			intakeAt: `${done}T15:00:00.000Z`,
			completedAt: `${done}T21:00:00.000Z`,
			labor,
			notes: "Closed and released to the customer."
		});
	});
	const historyInvoices = HISTORY.map((row, index) => {
		const [id, , customerId, brand, , model, , , labor, done] = row;
		return {
			id: `inv_h${index + 1}`,
			number: 860 + index,
			customerId,
			repairId: id,
			status: "paid",
			lines: [{
				id: `ln_h${index + 1}`,
				description: `Labor — ${brand} ${model}`,
				qty: 1,
				price: labor
			}],
			taxRate: TAX,
			method: METHODS[index % METHODS.length],
			createdAt: `${done}T18:00:00.000Z`,
			paidAt: `${done}T21:00:00.000Z`
		};
	});
	const openInvoice = {
		id: "inv_open",
		number: 889,
		customerId: "c9",
		repairId: "r9",
		status: "unpaid",
		lines: [{
			id: "ln_open_1",
			description: "Labor — Festool TS 55",
			qty: 1,
			price: 140
		}, {
			id: "ln_open_2",
			description: "Festool dust port",
			qty: 1,
			price: 36
		}],
		taxRate: TAX,
		method: "",
		createdAt: "2026-11-20T18:00:00.000Z",
		paidAt: null
	};
	const estimates = [
		{
			id: "e1",
			number: 318,
			customerId: "c4",
			repairId: "r4",
			status: "draft",
			lines: [{
				id: "ln_e1",
				description: "Labor — DeWalt DCD996 battery diagnosis",
				qty: 1,
				price: 95
			}],
			note: "Hold until the cell test finishes.",
			createdAt: "2026-11-21T19:00:00.000Z"
		},
		{
			id: "e2",
			number: 319,
			customerId: "c5",
			repairId: "r5",
			status: "sent",
			lines: [{
				id: "ln_e2a",
				description: "Labor — Makita GA5030",
				qty: 1,
				price: 70
			}, {
				id: "ln_e2b",
				description: "Carbon brush set",
				qty: 1,
				price: 22
			}],
			note: "Texted this morning. Waiting on a yes.",
			createdAt: "2026-11-22T15:30:00.000Z"
		},
		{
			id: "e3",
			number: 317,
			customerId: "c9",
			repairId: "r9",
			status: "accepted",
			lines: [{
				id: "ln_e3a",
				description: "Labor — Festool TS 55",
				qty: 1,
				price: 140
			}, {
				id: "ln_e3b",
				description: "Festool dust port",
				qty: 1,
				price: 36
			}],
			note: "Accepted at the counter.",
			createdAt: "2026-11-18T16:00:00.000Z"
		}
	];
	const expenses = [
		{
			id: "x1",
			category: "Rent",
			vendor: "Summit Ridge LLC",
			amount: 2800,
			date: "2026-08-01",
			note: "August bench rent"
		},
		{
			id: "x2",
			category: "Parts",
			vendor: "Front Range Tool Supply",
			amount: 640,
			date: "2026-08-12",
			note: "Brushes, cords, blades"
		},
		{
			id: "x3",
			category: "Utilities",
			vendor: "Xcel Energy",
			amount: 210,
			date: "2026-08-18",
			note: ""
		},
		{
			id: "x4",
			category: "Rent",
			vendor: "Summit Ridge LLC",
			amount: 2800,
			date: "2026-09-01",
			note: "September bench rent"
		},
		{
			id: "x5",
			category: "Parts",
			vendor: "Front Range Tool Supply",
			amount: 720,
			date: "2026-09-14",
			note: "M18 packs"
		},
		{
			id: "x6",
			category: "Insurance",
			vendor: "Peak Trade Insurance",
			amount: 180,
			date: "2026-09-20",
			note: "Shop policy"
		},
		{
			id: "x7",
			category: "Rent",
			vendor: "Summit Ridge LLC",
			amount: 2800,
			date: "2026-10-01",
			note: "October bench rent"
		},
		{
			id: "x8",
			category: "Utilities",
			vendor: "Xcel Energy",
			amount: 198,
			date: "2026-10-16",
			note: ""
		},
		{
			id: "x9",
			category: "Parts",
			vendor: "Front Range Tool Supply",
			amount: 510,
			date: "2026-10-21",
			note: "Festool fittings"
		},
		{
			id: "x10",
			category: "Marketing",
			vendor: "Neighborhood flyer",
			amount: 85,
			date: "2026-11-02",
			note: "Counter cards"
		}
	];
	const inquiries = [
		{
			id: "iq1",
			name: "Caleb Brooks",
			phone: "(303) 555-0144",
			channel: "web",
			message: "Do you service Festool track saws, or only the big-box brands?",
			status: "new",
			reply: "",
			createdAt: "2026-11-23T08:05:00.000Z"
		},
		{
			id: "iq2",
			name: "Sofia Marin",
			phone: "(303) 555-0160",
			channel: "phone",
			message: "Milwaukee saw died mid-cut. Can I drop it off tomorrow morning?",
			status: "new",
			reply: "",
			createdAt: "2026-11-22T20:15:00.000Z"
		},
		{
			id: "iq3",
			name: "Owen Blake",
			phone: "(303) 555-0108",
			channel: "email",
			message: "Any update on the jigsaw trigger?",
			status: "replied",
			reply: "It's ready at the counter. Open until 6.",
			createdAt: "2026-11-20T13:00:00.000Z"
		}
	];
	const settings = {
		shopName: "Summit Power Tool Repair",
		owner: "Alex Rivera",
		initials: "AR",
		phone: "(303) 555-0140",
		email: "bench@summitpowertool.example",
		address: "1840 Summit Ridge Rd, Denver, CO 80211",
		hours: "Mon–Fri 8:00–6:00 · Sat 9:00–2:00",
		taxRate: TAX,
		paymentsConnected: false,
		bannerDismissed: false,
		techs: [
			"Alex Rivera",
			"Sam Ortiz",
			"Priya Shah"
		]
	};
	const seq = {
		repair: 2411,
		estimate: 320,
		invoice: 890,
		part: 120
	};
	return {
		customers,
		repairs: [...active, ...historyRepairs],
		parts,
		estimates,
		invoices: [openInvoice, ...historyInvoices],
		expenses,
		inquiries,
		settings,
		seq
	};
}
function repair(partial) {
	return {
		completedAt: null,
		partsUsed: [],
		...partial
	};
}
function freshUi() {
	return {
		view: "dashboard",
		sidebarPinned: true,
		mobileNav: false,
		query: "",
		popover: null,
		modal: null,
		modalCtx: {},
		drawer: null,
		repairsFilter: "open",
		partsFilter: "all"
	};
}
function memoryStorage() {
	return {
		getItem: () => null,
		setItem: () => void 0,
		removeItem: () => void 0
	};
}
var useShop = create()(persist((set, get) => ({
	...seedData(),
	...freshUi(),
	setView: (view) => set({
		view,
		mobileNav: false,
		popover: null
	}),
	setSidebarPinned: (sidebarPinned) => set({ sidebarPinned }),
	setMobileNav: (mobileNav) => set({
		mobileNav,
		popover: null
	}),
	setQuery: (query) => set({
		query,
		popover: null
	}),
	setPopover: (popover) => set({ popover }),
	setRepairsFilter: (repairsFilter) => set({ repairsFilter }),
	setPartsFilter: (partsFilter) => set({ partsFilter }),
	openModal: (modal, modalCtx = {}) => set({
		modal,
		modalCtx,
		popover: null
	}),
	closeModal: () => set({
		modal: null,
		modalCtx: {}
	}),
	openDrawer: (drawer) => set({
		drawer,
		popover: null
	}),
	closeDrawer: () => set({ drawer: null }),
	intake: (input) => {
		const state = get();
		let customerId = input.customerId;
		let customers = state.customers;
		if (input.newCustomer) {
			customerId = uid("c");
			customers = [{
				id: customerId,
				name: input.newCustomer.name.trim(),
				phone: input.newCustomer.phone.trim(),
				email: input.newCustomer.email.trim(),
				notes: "",
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, ...customers];
		}
		const number = state.seq.repair;
		const id = uid("r");
		const ticket = {
			id,
			number,
			customerId,
			brand: input.brand.trim(),
			tool: input.tool.trim(),
			model: input.model.trim(),
			serial: input.serial.trim(),
			issue: input.issue.trim(),
			status: "in_queue",
			priority: input.priority,
			tech: input.tech,
			intakeAt: (/* @__PURE__ */ new Date()).toISOString(),
			completedAt: null,
			labor: input.labor,
			notes: "",
			partsUsed: []
		};
		set({
			customers,
			repairs: [ticket, ...state.repairs],
			seq: {
				...state.seq,
				repair: number + 1
			}
		});
		return id;
	},
	addCustomer: (input) => {
		const id = uid("c");
		set({ customers: [{
			id,
			name: input.name.trim(),
			phone: input.phone.trim(),
			email: input.email.trim(),
			notes: input.notes.trim(),
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		}, ...get().customers] });
		return id;
	},
	updateCustomer: (id, patch) => set({ customers: get().customers.map((customer) => customer.id === id ? {
		...customer,
		...patch
	} : customer) }),
	updateRepair: (id, patch) => set({ repairs: get().repairs.map((repair) => repair.id === id ? {
		...repair,
		...patch
	} : repair) }),
	setRepairStatus: (id, status) => set({ repairs: get().repairs.map((repair) => {
		if (repair.id !== id) return repair;
		return {
			...repair,
			status,
			completedAt: status === "picked_up" ? repair.completedAt ?? (/* @__PURE__ */ new Date()).toISOString() : null
		};
	}) }),
	addPartUse: (repairId, partId, qty) => {
		const state = get();
		const part = state.parts.find((item) => item.id === partId);
		const repair = state.repairs.find((item) => item.id === repairId);
		if (!part || !repair) return "That part is no longer on the shelf.";
		if (qty < 1) return "Quantity has to be at least 1.";
		if (part.qty < qty) return `Only ${part.qty} ${part.name} on hand.`;
		const existing = repair.partsUsed.find((use) => use.partId === partId);
		set({
			parts: state.parts.map((item) => item.id === partId ? {
				...item,
				qty: item.qty - qty
			} : item),
			repairs: state.repairs.map((item) => {
				if (item.id !== repairId) return item;
				const partsUsed = existing ? item.partsUsed.map((use) => use.partId === partId ? {
					...use,
					qty: use.qty + qty
				} : use) : [...item.partsUsed, {
					partId,
					qty
				}];
				return {
					...item,
					partsUsed
				};
			})
		});
		return null;
	},
	removePartUse: (repairId, partId) => {
		const state = get();
		const repair = state.repairs.find((item) => item.id === repairId);
		const use = repair?.partsUsed.find((item) => item.partId === partId);
		if (!repair || !use) return;
		set({
			parts: state.parts.map((part) => part.id === partId ? {
				...part,
				qty: part.qty + use.qty
			} : part),
			repairs: state.repairs.map((item) => item.id === repairId ? {
				...item,
				partsUsed: item.partsUsed.filter((row) => row.partId !== partId)
			} : item)
		});
	},
	adjustPart: (id, delta) => set({ parts: get().parts.map((part) => part.id === id ? {
		...part,
		qty: Math.max(0, part.qty + delta)
	} : part) }),
	addPart: (input) => {
		const state = get();
		const number = state.seq.part;
		const id = uid("p");
		set({
			parts: [{
				id,
				sku: input.sku?.trim() || `BR-${number}`,
				name: input.name.trim(),
				category: input.category.trim() || "General",
				qty: Math.max(0, input.qty),
				min: Math.max(0, input.min),
				cost: Math.max(0, input.cost),
				price: Math.max(0, input.price),
				bin: input.bin.trim() || "—"
			}, ...state.parts],
			seq: {
				...state.seq,
				part: number + 1
			}
		});
		return id;
	},
	addEstimate: (input) => {
		const state = get();
		const number = state.seq.estimate;
		const id = uid("e");
		set({
			estimates: [{
				id,
				number,
				customerId: input.customerId,
				repairId: input.repairId,
				status: "draft",
				lines: input.lines,
				note: input.note.trim(),
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, ...state.estimates],
			seq: {
				...state.seq,
				estimate: number + 1
			}
		});
		return id;
	},
	setEstimateStatus: (id, status) => {
		const state = get();
		const estimate = state.estimates.find((item) => item.id === id);
		if (!estimate) return;
		let repairs = state.repairs;
		if (status === "accepted" && estimate.repairId) repairs = repairs.map((repair) => repair.id === estimate.repairId && (repair.status === "in_queue" || repair.status === "waiting_approval") ? {
			...repair,
			status: "in_progress"
		} : repair);
		if (status === "sent" && estimate.repairId) repairs = repairs.map((repair) => repair.id === estimate.repairId && repair.status === "in_queue" ? {
			...repair,
			status: "waiting_approval"
		} : repair);
		set({
			repairs,
			estimates: state.estimates.map((item) => item.id === id ? {
				...item,
				status
			} : item)
		});
	},
	addInvoice: (input) => {
		const state = get();
		const existing = input.repairId ? state.invoices.find((invoice) => invoice.repairId === input.repairId && invoice.status !== "void") : void 0;
		if (existing) return existing.id;
		const number = state.seq.invoice;
		const id = uid("inv");
		set({
			invoices: [{
				id,
				number,
				customerId: input.customerId,
				repairId: input.repairId,
				status: "unpaid",
				lines: input.lines,
				taxRate: state.settings.taxRate,
				method: "",
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				paidAt: null
			}, ...state.invoices],
			seq: {
				...state.seq,
				invoice: number + 1
			}
		});
		return id;
	},
	markInvoicePaid: (id, method) => set({ invoices: get().invoices.map((invoice) => invoice.id === id && invoice.status === "unpaid" ? {
		...invoice,
		status: "paid",
		method,
		paidAt: (/* @__PURE__ */ new Date()).toISOString()
	} : invoice) }),
	voidInvoice: (id) => set({ invoices: get().invoices.map((invoice) => invoice.id === id && invoice.status === "unpaid" ? {
		...invoice,
		status: "void"
	} : invoice) }),
	releaseRepair: (id, method) => {
		const state = get();
		const repair = state.repairs.find((item) => item.id === id);
		if (!repair) return "Ticket not found.";
		if (repair.status === "picked_up") return "Already released.";
		let invoices = state.invoices;
		let seq = state.seq;
		const existing = invoices.find((invoice) => invoice.repairId === id && invoice.status !== "void");
		if (existing && existing.status === "unpaid") invoices = invoices.map((invoice) => invoice.id === existing.id ? {
			...invoice,
			status: "paid",
			method,
			paidAt: (/* @__PURE__ */ new Date()).toISOString()
		} : invoice);
		else if (!existing) {
			const lines = repairLines(repair, state.parts);
			if (lines.length > 0) {
				const number = seq.invoice;
				seq = {
					...seq,
					invoice: number + 1
				};
				invoices = [{
					id: uid("inv"),
					number,
					customerId: repair.customerId,
					repairId: id,
					status: "paid",
					lines,
					taxRate: state.settings.taxRate,
					method,
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					paidAt: (/* @__PURE__ */ new Date()).toISOString()
				}, ...invoices];
			}
		}
		set({
			seq,
			invoices,
			repairs: state.repairs.map((item) => item.id === id ? {
				...item,
				status: "picked_up",
				completedAt: (/* @__PURE__ */ new Date()).toISOString()
			} : item)
		});
		return null;
	},
	addExpense: (input) => set({ expenses: [{
		id: uid("x"),
		category: input.category,
		vendor: input.vendor.trim(),
		amount: input.amount,
		date: input.date,
		note: input.note.trim()
	}, ...get().expenses] }),
	addInquiry: (input) => set({ inquiries: [{
		id: uid("iq"),
		name: input.name.trim(),
		phone: input.phone.trim(),
		channel: input.channel,
		message: input.message.trim(),
		status: "new",
		reply: "",
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	}, ...get().inquiries] }),
	updateInquiry: (id, patch) => set({ inquiries: get().inquiries.map((inquiry) => inquiry.id === id ? {
		...inquiry,
		...patch
	} : inquiry) }),
	updateSettings: (patch) => {
		const next = {
			...get().settings,
			...patch
		};
		if (patch.owner) next.initials = initialsOf(patch.owner);
		set({ settings: next });
	},
	addTech: (name) => {
		const clean = name.trim();
		if (!clean) return;
		const techs = get().settings.techs;
		if (techs.some((tech) => tech.toLowerCase() === clean.toLowerCase())) return;
		set({ settings: {
			...get().settings,
			techs: [...techs, clean]
		} });
	},
	removeTech: (name) => set({ settings: {
		...get().settings,
		techs: get().settings.techs.filter((tech) => tech !== name)
	} }),
	resetDemo: () => set({
		...seedData(),
		...freshUi()
	})
}), {
	name: "bench-repairshop-os-v1",
	skipHydration: true,
	storage: createJSONStorage(() => typeof window === "undefined" ? memoryStorage() : localStorage),
	partialize: (state) => ({
		customers: state.customers,
		repairs: state.repairs,
		parts: state.parts,
		estimates: state.estimates,
		invoices: state.invoices,
		expenses: state.expenses,
		inquiries: state.inquiries,
		settings: state.settings,
		seq: state.seq,
		view: state.view,
		sidebarPinned: state.sidebarPinned
	})
}));
function useBench() {
	const repairs = useShop((state) => state.repairs);
	const parts = useShop((state) => state.parts);
	const customers = useShop((state) => state.customers);
	const invoices = useShop((state) => state.invoices);
	const inquiries = useShop((state) => state.inquiries);
	const expenses = useShop((state) => state.expenses);
	return (0, import_react.useMemo)(() => {
		const count = (status) => repairs.filter((repair) => repair.status === status).length;
		const lowParts = parts.filter((part) => part.qty <= part.min);
		const open = repairs.filter((repair) => repair.status !== "picked_up").slice().sort((a, b) => b.intakeAt.localeCompare(a.intakeAt));
		const outstanding = invoices.filter((invoice) => invoice.status === "unpaid").reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0);
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
			expenses
		};
	}, [
		customers,
		expenses,
		inquiries,
		invoices,
		parts,
		repairs
	]);
}
var fieldClass = "h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm text-fg outline-none transition placeholder:text-faint focus:border-primary";
function fieldClasses(extra) {
	return cn(fieldClass, extra);
}
function Button({ variant = "primary", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50", variant === "primary" && "bg-primary text-primary-fg hover:bg-primary-hover", variant === "secondary" && "bg-surface-2 text-fg shadow-ring hover:bg-surface", variant === "ghost" && "h-11 bg-transparent text-muted hover:bg-surface hover:text-fg", variant === "danger" && "bg-danger/15 text-danger hover:bg-danger/25", className),
		...props
	});
}
function IconButton({ className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("relative grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-fg shadow-ring transition hover:bg-surface", className),
		...props
	});
}
function Field$1({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-muted",
			children: label
		}), children]
	});
}
function PageHeader({ eyebrow, title, subtitle, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-5 flex flex-wrap items-end justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-1 text-xs font-medium tracking-widest text-faint uppercase",
					children: eyebrow
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: title
				}),
				subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: subtitle
				}) : null
			]
		}), action]
	});
}
function FilterChip({ active, children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-11 rounded-full px-3.5 text-sm font-medium transition", active ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-ring hover:text-fg"),
		children
	});
}
function StatusPill({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold", status === "ready" || status === "picked_up" ? "bg-success/15 text-success" : status === "in_progress" ? "bg-primary/15 text-primary" : status === "waiting_parts" || status === "waiting_approval" ? "bg-info/15 text-info" : "bg-surface-2 text-muted"),
		children: STATUS_LABEL[status]
	});
}
function Modal({ open, title, subtitle, onClose, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => !next && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "fixed inset-x-4 top-16 z-50 mx-auto flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-surface shadow-ring focus:outline-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 px-5 pt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-xl font-semibold tracking-tight",
					children: title
				}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "mt-1 text-sm text-muted",
					children: subtitle
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "sr-only",
					children: title
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: "grid size-11 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scroll-thin overflow-y-auto px-5 pt-4 pb-5",
				children
			})]
		})] })
	});
}
function EmptyState({ title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl bg-surface px-5 py-10 text-center shadow-ring",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-1 max-w-sm text-sm text-muted",
				children: body
			}),
			action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-center",
				children: action
			}) : null
		]
	});
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-3xl bg-surface p-4 shadow-ring sm:p-5", className),
		children
	});
}
function Dashboard() {
	const settings = useShop((state) => state.settings);
	const setView = useShop((state) => state.setView);
	const openModal = useShop((state) => state.openModal);
	const openDrawer = useShop((state) => state.openDrawer);
	const setRepairsFilter = useShop((state) => state.setRepairsFilter);
	const setPartsFilter = useShop((state) => state.setPartsFilter);
	const dismiss = useShop((state) => state.updateSettings);
	const bench = useBench();
	const showBanner = !settings.paymentsConnected && !settings.bannerDismissed;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "hero-panel relative overflow-hidden rounded-3xl p-5 sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-medium tracking-widest text-faint uppercase",
								children: greeting()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-2 text-3xl font-semibold tracking-tight sm:text-4xl",
								children: ["Welcome back, ", firstName(settings.owner)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 max-w-xl text-sm text-muted sm:text-base",
								children: [
									"Here's what's happening at ",
									settings.shopName,
									" today."
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2 sm:gap-0 sm:divide-x sm:divide-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
								value: bench.inShop,
								label: "In shop",
								tone: "text-primary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
								value: bench.ready,
								label: "Ready for pickup",
								tone: "text-success"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
								value: bench.week,
								label: "Completed this week",
								tone: "text-fg"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => openModal("intake"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-4" }), "Tool intake"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => openModal("customer"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), "New customer"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => setView("pickup"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-4" }),
								"Pickup",
								bench.ready > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs text-primary-fg",
									children: bench.ready
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => openModal("estimate"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeDollarSign, { className: "size-4" }), "New estimate"]
						})
					]
				})]
			}),
			showBanner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "promo-banner flex flex-col gap-4 rounded-3xl p-4 text-fg sm:flex-row sm:items-center sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-fg/15",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeDollarSign, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold",
							children: "Accept online payments"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-fg/80",
							children: "Connect payouts so customers can pay invoices from their phone. Funds settle to your bank account."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => openModal("payments"),
							className: "inline-flex h-11 items-center rounded-full border border-fg/30 px-4 text-sm font-semibold text-fg hover:bg-fg/10",
							children: "Set up now"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Dismiss payments banner",
							onClick: () => dismiss({ bannerDismissed: true }),
							className: "grid size-11 place-items-center rounded-full text-fg/80 hover:bg-fg/10",
							children: "×"
						})]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "size-5" }),
						tone: "bg-primary/15 text-primary",
						value: bench.queue,
						label: "In queue",
						onClick: () => {
							setRepairsFilter("in_queue");
							setView("repairs");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-5" }),
						tone: "bg-info/15 text-info",
						value: bench.progress,
						label: "In progress",
						onClick: () => {
							setRepairsFilter("in_progress");
							setView("repairs");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-5" }),
						tone: "bg-success/15 text-success",
						value: bench.ready,
						label: "Ready for pickup",
						onClick: () => setView("pickup")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5" }),
						tone: "bg-danger/15 text-danger",
						value: bench.low,
						label: "Low stock alerts",
						danger: true,
						onClick: () => {
							setPartsFilter("low");
							setView("parts");
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" }),
						tone: "bg-info/15 text-info",
						value: bench.month,
						label: "Completed this month",
						onClick: () => setView("reports")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }),
						tone: "bg-success/15 text-success",
						value: bench.week,
						label: "Completed this week",
						onClick: () => setView("reports")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }),
						tone: "bg-primary/15 text-primary",
						value: bench.today,
						label: "Completed today",
						onClick: () => setView("reports")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: "On the bench"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Open tickets, newest first."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm font-semibold text-primary",
							onClick: () => setView("repairs"),
							children: "View all"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2",
						children: bench.open.slice(0, 6).map((repair) => {
							const customer = bench.customerMap.get(repair.customerId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => openDrawer({
									kind: "repair",
									id: repair.id
								}),
								className: "flex items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-surface-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm font-semibold text-primary",
											children: ["#", repair.number]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-sm font-medium",
											children: toolLabel(repair)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "truncate text-sm text-muted",
										children: [
											customer?.name ?? "Customer",
											" · ",
											repair.issue
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: repair.status })]
							}, repair.id);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "Stock alerts"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Parts at or under their minimum."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-sm font-semibold text-primary",
								onClick: () => {
									setPartsFilter("low");
									setView("parts");
								},
								children: "Manage"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2",
							children: bench.lowParts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "All stock levels look good."
							}) : bench.lowParts.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 rounded-2xl bg-bg px-3 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-10 place-items-center rounded-full bg-danger/15 text-danger",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-sm font-medium",
											children: part.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted",
											children: [
												part.category,
												" · min ",
												part.min
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-semibold text-danger",
										children: [part.qty, " left"]
									})
								]
							}, part.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-sm text-muted",
							children: [
								"Open invoices ",
								money(bench.outstanding),
								" · ",
								bench.newInquiries,
								" new ",
								bench.newInquiries === 1 ? "inquiry" : "inquiries"
							]
						})
					]
				})]
			})
		]
	});
}
function HeroStat({ value, label, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-1 sm:px-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `text-3xl font-semibold tabular-nums sm:text-4xl ${tone}`,
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-xs text-muted sm:text-sm",
			children: label
		})]
	});
}
function Metric({ icon, tone, value, label, onClick, danger }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: `rounded-3xl bg-surface p-4 text-left shadow-ring transition hover:bg-surface-2 sm:p-5 ${danger ? "ring-1 ring-danger/50" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `grid size-10 place-items-center rounded-full ${tone}`,
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mt-5 text-3xl font-semibold tabular-nums ${danger ? "text-danger" : ""}`,
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-sm text-muted",
				children: label
			})
		]
	});
}
function MiniStat({ icon, tone, value, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex items-center gap-3 rounded-3xl bg-surface p-4 text-left shadow-ring transition hover:bg-surface-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `grid size-10 place-items-center rounded-full ${tone}`,
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-2xl font-semibold tabular-nums leading-none",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-1 block text-sm text-muted",
			children: label
		})] })]
	});
}
var STATUS_ORDER = [
	"in_queue",
	"in_progress",
	"waiting_parts",
	"waiting_approval",
	"ready",
	"picked_up"
];
function ShopDrawers() {
	const drawer = useShop((state) => state.drawer);
	const close = useShop((state) => state.closeDrawer);
	if (!drawer) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-bg/70",
			"aria-label": "Close details",
			onClick: close
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-sidebar shadow-ring",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end px-3 pt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "grid size-11 place-items-center rounded-full text-muted hover:bg-surface hover:text-fg",
					"aria-label": "Close",
					onClick: close,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "scroll-thin min-h-0 flex-1 overflow-y-auto px-5 pb-8",
				children: [
					drawer.kind === "repair" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RepairBody, { id: drawer.id }),
					drawer.kind === "customer" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerBody, { id: drawer.id }),
					drawer.kind === "invoice" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceBody, { id: drawer.id }),
					drawer.kind === "estimate" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EstimateBody, { id: drawer.id })
				]
			})]
		})]
	});
}
function RepairBody({ id }) {
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
	const [partId, setPartId] = (0, import_react.useState)(parts.find((part) => part.qty > 0)?.id ?? "");
	const [qty, setQty] = (0, import_react.useState)("1");
	const [note, setNote] = (0, import_react.useState)("");
	const [labor, setLabor] = (0, import_react.useState)(repair ? String(repair.labor) : "0");
	if (!repair) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "This ticket is gone."
	});
	const due = dueForRepair(repair, parts, invoices, taxRate);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm font-semibold text-primary",
					children: ["Ticket #", repair.number]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-semibold tracking-tight",
					children: toolLabel(repair)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: repair.tool
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: repair.status }), repair.priority === "rush" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary",
						children: "Rush"
					}) : null]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "text-left",
					onClick: () => customer && openDrawer({
						kind: "customer",
						id: customer.id
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold",
						children: customer?.name ?? "Unknown customer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted",
						children: customer?.phone
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm",
					children: repair.issue
				}),
				repair.serial ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-faint",
					children: ["Serial ", repair.serial]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-faint",
					children: [
						"In ",
						shortDate(repair.intakeAt),
						" · ",
						repair.tech
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1.5 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-muted",
					children: "Status"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: fieldClasses(),
					value: repair.status,
					onChange: (event) => {
						setStatus(repair.id, event.target.value);
						toast.success("Status updated");
					},
					children: STATUS_ORDER.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: status,
						children: status.replaceAll("_", " ")
					}, status))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1.5 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-muted",
						children: "Technician"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: fieldClasses(),
						value: repair.tech,
						onChange: (event) => updateRepair(repair.id, { tech: event.target.value }),
						children: [.../* @__PURE__ */ new Set([...techs, repair.tech])].map((tech) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: tech }, tech))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1.5 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-muted",
						children: "Labor"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: fieldClasses(),
						type: "number",
						min: "0",
						step: "0.01",
						value: labor,
						onChange: (event) => setLabor(event.target.value),
						onBlur: () => updateRepair(repair.id, { labor: Number(labor) || 0 })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-sm font-semibold",
					children: "Parts on this ticket"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [repair.partsUsed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No parts pulled yet."
					}) : null, repair.partsUsed.map((use) => {
						const part = parts.find((item) => item.id === use.partId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-2xl bg-surface px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-medium",
									children: part?.name ?? "Part"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted",
									children: [
										use.qty,
										" × ",
										money(part?.price ?? 0)
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 px-2 text-sm text-muted hover:text-danger",
								onClick: () => removePartUse(repair.id, use.partId),
								children: "Return"
							})]
						}, use.partId);
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-12 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: fieldClasses("col-span-7"),
							value: partId,
							onChange: (event) => setPartId(event.target.value),
							children: parts.filter((part) => part.qty > 0).map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: part.id,
								children: [
									part.name,
									" · ",
									part.qty
								]
							}, part.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses("col-span-2"),
							type: "number",
							min: "1",
							value: qty,
							onChange: (event) => setQty(event.target.value),
							"aria-label": "Quantity"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "col-span-3 px-2",
							onClick: () => {
								const error = addPartUse(repair.id, partId, Number(qty) || 1);
								if (error) toast.error(error);
								else toast.success("Part pulled from stock");
							},
							children: "Add"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-sm font-semibold",
					children: "Notes"
				}),
				repair.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm whitespace-pre-wrap text-muted",
					children: repair.notes
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: fieldClasses(),
						placeholder: "Add a bench note",
						value: note,
						onChange: (event) => setNote(event.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => {
							if (!note.trim()) return;
							const stamp = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
								month: "short",
								day: "numeric",
								hour: "numeric",
								minute: "2-digit"
							});
							const next = [repair.notes, `${stamp} — ${note.trim()}`].filter(Boolean).join("\n");
							updateRepair(repair.id, { notes: next });
							setNote("");
						},
						children: "Add"
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: due.settled ? "Paid" : "Amount due"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-lg font-semibold",
					children: money(due.total)
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => openModal("estimate", {
							customerId: repair.customerId,
							repairId: repair.id
						}),
						children: "Estimate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => openModal("invoice", {
							customerId: repair.customerId,
							repairId: repair.id
						}),
						children: "Invoice"
					}),
					repair.status !== "picked_up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "col-span-2",
						onClick: () => {
							if (repair.status !== "ready") setStatus(repair.id, "ready");
							setView("pickup");
						},
						children: repair.status === "ready" ? "Go to pickup" : "Mark ready for pickup"
					}) : null
				]
			})
		]
	});
}
function CustomerBody({ id }) {
	const customer = useShop((state) => state.customers.find((item) => item.id === id));
	const repairs = useShop((state) => state.repairs.filter((item) => item.customerId === id));
	const invoices = useShop((state) => state.invoices.filter((item) => item.customerId === id && item.status !== "void"));
	const updateCustomer = useShop((state) => state.updateCustomer);
	const openDrawer = useShop((state) => state.openDrawer);
	const openModal = useShop((state) => state.openModal);
	const [notes, setNotes] = (0, import_react.useState)(customer?.notes ?? "");
	if (!customer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Customer not found."
	});
	const due = invoices.filter((invoice) => invoice.status === "unpaid").reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold tracking-tight",
					children: customer.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "mt-1 block text-sm text-primary",
					href: `tel:${customer.phone}`,
					children: customer.phone
				}),
				customer.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "block text-sm text-muted",
					href: `mailto:${customer.email}`,
					children: customer.email
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-faint",
					children: [
						"Since ",
						longDate(customer.createdAt),
						" · balance ",
						money(due)
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1.5 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-muted",
					children: "Notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: fieldClasses("h-24 py-2"),
					value: notes,
					onChange: (event) => setNotes(event.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => {
					updateCustomer(customer.id, { notes });
					toast.success("Notes saved");
				},
				children: "Save notes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => openModal("intake", { customerId: customer.id }),
					children: "New intake"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => openModal("estimate", { customerId: customer.id }),
					children: "Estimate"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-semibold",
				children: "Tickets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: repairs.map((repair) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-2xl bg-surface px-3 py-3 text-left",
					onClick: () => openDrawer({
						kind: "repair",
						id: repair.id
					}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-medium",
							children: [
								"#",
								repair.number,
								" ",
								toolLabel(repair)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: repair.status })]
					})
				}, repair.id))
			})] })
		]
	});
}
function InvoiceBody({ id }) {
	const invoice = useShop((state) => state.invoices.find((item) => item.id === id));
	const customer = useShop((state) => state.customers.find((item) => item.id === invoice?.customerId));
	const settings = useShop((state) => state.settings);
	const markPaid = useShop((state) => state.markInvoicePaid);
	const voidInvoice = useShop((state) => state.voidInvoice);
	const [method, setMethod] = (0, import_react.useState)(settings.paymentsConnected ? "card" : "cash");
	if (!invoice || !customer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Invoice not found."
	});
	const totals = invoiceTotals(invoice);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm font-semibold text-primary",
					children: ["Invoice #", invoice.number]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-semibold",
					children: customer.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted capitalize",
					children: [
						invoice.status,
						" · ",
						shortDate(invoice.createdAt)
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: invoice.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						line.description,
						" × ",
						line.qty
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: money(line.qty * line.price)
					})]
				}, line.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-1 border-t border-line pt-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Subtotal",
						value: money(totals.subtotal)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: `Tax ${(invoice.taxRate * 100).toFixed(2)}%`,
						value: money(totals.tax)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Total",
						value: money(totals.total),
						strong: true
					})
				]
			})] }),
			invoice.status === "paid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-success",
				children: [
					"Paid ",
					invoice.paidAt ? longDate(invoice.paidAt) : "",
					" by ",
					invoice.method ? PAY_LABEL[invoice.method] : "—",
					"."
				]
			}) : null,
			invoice.status === "unpaid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1.5 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-muted",
						children: "Payment method"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: fieldClasses(),
						value: method,
						onChange: (event) => setMethod(event.target.value),
						children: [
							settings.paymentsConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "card",
								children: "Card"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "cash",
								children: "Cash"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "transfer",
								children: "Transfer"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						markPaid(invoice.id, method);
						toast.success("Invoice marked paid");
					},
					children: "Mark paid"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "danger",
					onClick: () => {
						voidInvoice(invoice.id);
						toast.success("Invoice voided");
					},
					children: "Void invoice"
				})
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => {
					if (!printInvoiceDoc({
						shop: settings.shopName,
						address: settings.address,
						number: invoice.number,
						customer: customer.name,
						lines: invoice.lines.map((line) => `${escapeHtml(line.description)} × ${line.qty}|${money(line.qty * line.price)}`),
						subtotal: money(totals.subtotal),
						tax: money(totals.tax),
						total: money(totals.total),
						status: invoice.status
					})) toast.error("Allow pop-ups to print this invoice.");
				},
				children: "Print"
			})
		]
	});
}
function EstimateBody({ id }) {
	const estimate = useShop((state) => state.estimates.find((item) => item.id === id));
	const customer = useShop((state) => state.customers.find((item) => item.id === estimate?.customerId));
	const taxRate = useShop((state) => state.settings.taxRate);
	const setStatus = useShop((state) => state.setEstimateStatus);
	if (!estimate || !customer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Estimate not found."
	});
	const subtotal = estimate.lines.reduce((sum, line) => sum + line.qty * line.price, 0);
	const total = subtotal + Math.round(subtotal * taxRate * 100) / 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm font-semibold text-primary",
					children: ["Estimate #", estimate.number]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-semibold",
					children: customer.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm capitalize text-muted",
					children: [
						estimate.status,
						" · ",
						shortDate(estimate.createdAt)
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				estimate.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3 py-1 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						line.description,
						" × ",
						line.qty
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(line.qty * line.price) })]
				}, line.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 border-t border-line pt-3 text-sm font-semibold",
					children: ["Total ", money(total)]
				}),
				estimate.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: estimate.note
				}) : null
			] }),
			estimate.status === "draft" || estimate.status === "sent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [
					estimate.status === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => {
							setStatus(estimate.id, "sent");
							toast.success("Marked as sent");
						},
						children: "Mark sent"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							setStatus(estimate.id, "accepted");
							toast.success("Estimate accepted");
						},
						children: "Accept"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						onClick: () => {
							setStatus(estimate.id, "declined");
							toast.success("Estimate declined");
						},
						children: "Decline"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"This estimate is ",
					estimate.status,
					"."
				]
			})
		]
	});
}
function Row({ label, value, strong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex justify-between ${strong ? "font-semibold" : "text-muted"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-fg",
			children: value
		})]
	});
}
function printInvoiceDoc(doc) {
	const popup = window.open("", "bench-invoice", "width=720,height=900");
	if (!popup) return false;
	const rows = doc.lines.map((line) => {
		const [label, amount] = line.split("|");
		return `<tr><td>${label}</td><td class="right">${amount}</td></tr>`;
	}).join("");
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
var TITLES = {
	intake: "Tool intake",
	customer: "New customer",
	estimate: "New estimate",
	invoice: "New invoice",
	part: "Add part",
	expense: "Log expense",
	inquiry: "New inquiry",
	payments: "Set up payouts",
	reset: "Reset sample shop"
};
function ShopModals() {
	const modal = useShop((state) => state.modal);
	const close = useShop((state) => state.closeModal);
	if (!modal) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		open: true,
		title: TITLES[modal],
		subtitle: modal === "payments" ? "Demo only — no bank is contacted." : void 0,
		onClose: close,
		children: [
			modal === "intake" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntakeForm, { onDone: close }),
			modal === "customer" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerForm, { onDone: close }),
			modal === "estimate" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EstimateForm, { onDone: close }),
			modal === "invoice" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceForm, { onDone: close }),
			modal === "part" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartForm, { onDone: close }),
			modal === "expense" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseForm, { onDone: close }),
			modal === "inquiry" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InquiryForm, { onDone: close }),
			modal === "payments" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentsForm, {}),
			modal === "reset" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetForm, {})
		]
	});
}
function IntakeForm({ onDone }) {
	const customers = useShop((state) => state.customers);
	const techs = useShop((state) => state.settings.techs);
	const ctx = useShop((state) => state.modalCtx);
	const intake = useShop((state) => state.intake);
	const openDrawer = useShop((state) => state.openDrawer);
	const [mode, setMode] = (0, import_react.useState)("existing");
	const [customerId, setCustomerId] = (0, import_react.useState)(ctx.customerId ?? customers[0]?.id ?? "");
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [brand, setBrand] = (0, import_react.useState)(BRANDS[0]);
	const [tool, setTool] = (0, import_react.useState)("");
	const [model, setModel] = (0, import_react.useState)("");
	const [serial, setSerial] = (0, import_react.useState)("");
	const [issue, setIssue] = (0, import_react.useState)("");
	const [priority, setPriority] = (0, import_react.useState)("normal");
	const [tech, setTech] = (0, import_react.useState)(techs[0] ?? "");
	const [labor, setLabor] = (0, import_react.useState)("0");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3",
		onSubmit: (event) => {
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
				newCustomer: mode === "new" ? {
					name,
					phone,
					email
				} : null,
				brand,
				tool,
				model,
				serial,
				issue,
				priority,
				tech,
				labor: Number(labor) || 0
			});
			const ticket = useShop.getState().repairs.find((repair) => repair.id === id);
			toast.success(`Ticket #${ticket?.number ?? ""} opened`);
			openDrawer({
				kind: "repair",
				id
			});
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
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Customer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: fieldClasses(),
					value: mode === "new" ? "new" : customerId,
					onChange: (event) => {
						if (event.target.value === "new") setMode("new");
						else {
							setMode("existing");
							setCustomerId(event.target.value);
						}
					},
					children: [customers.map((customer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: customer.id,
						children: customer.name
					}, customer.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "new",
						children: "New customer"
					})]
				})
			}),
			mode === "new" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							value: name,
							onChange: (event) => setName(event.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Phone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							value: phone,
							onChange: (event) => setPhone(event.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses("sm:col-span-2"),
							type: "email",
							value: email,
							onChange: (event) => setEmail(event.target.value)
						})
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Brand",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: fieldClasses(),
							value: brand,
							onChange: (event) => setBrand(event.target.value),
							children: BRANDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Tool",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							placeholder: "Hammer drill",
							value: tool,
							onChange: (event) => setTool(event.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Model",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							placeholder: "DCD996",
							value: model,
							onChange: (event) => setModel(event.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Serial",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							value: serial,
							onChange: (event) => setSerial(event.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Reported issue",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: fieldClasses("h-24 py-2"),
					value: issue,
					onChange: (event) => setIssue(event.target.value),
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Priority",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: fieldClasses(),
							value: priority,
							onChange: (event) => setPriority(event.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "normal",
								children: "Normal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "rush",
								children: "Rush"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Technician",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: fieldClasses(),
							value: tech,
							onChange: (event) => setTech(event.target.value),
							children: techs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Labor quote",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							type: "number",
							min: "0",
							step: "0.01",
							value: labor,
							onChange: (event) => setLabor(event.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex justify-end gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Open ticket"
				})
			})
		]
	});
}
function CustomerForm({ onDone }) {
	const addCustomer = useShop((state) => state.addCustomer);
	const openDrawer = useShop((state) => state.openDrawer);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			const id = addCustomer({
				name,
				phone,
				email,
				notes
			});
			toast.success("Customer saved");
			openDrawer({
				kind: "customer",
				id
			});
			onDone();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Full name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClasses(),
					value: name,
					onChange: (event) => setName(event.target.value),
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
					label: "Phone",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: fieldClasses(),
						value: phone,
						onChange: (event) => setPhone(event.target.value),
						required: true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
					label: "Email",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: fieldClasses(),
						type: "email",
						value: email,
						onChange: (event) => setEmail(event.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Notes",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: fieldClasses("h-24 py-2"),
					value: notes,
					onChange: (event) => setNotes(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Save customer"
				})
			})
		]
	});
}
function LineEditor({ lines, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-12 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClasses("col-span-6"),
					placeholder: "Description",
					value: line.description,
					onChange: (event) => onChange(lines.map((item) => item.id === line.id ? {
						...item,
						description: event.target.value
					} : item))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClasses("col-span-2"),
					type: "number",
					min: "1",
					"aria-label": "Quantity",
					value: line.qty,
					onChange: (event) => onChange(lines.map((item) => item.id === line.id ? {
						...item,
						qty: Number(event.target.value) || 1
					} : item))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClasses("col-span-3"),
					type: "number",
					min: "0",
					step: "0.01",
					"aria-label": "Price",
					value: line.price,
					onChange: (event) => onChange(lines.map((item) => item.id === line.id ? {
						...item,
						price: Number(event.target.value) || 0
					} : item))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "col-span-1 text-sm text-muted hover:text-danger",
					"aria-label": "Remove line",
					onClick: () => onChange(lines.filter((item) => item.id !== line.id)),
					children: "×"
				})
			]
		}, line.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "h-11 text-left text-sm font-semibold text-primary",
			onClick: () => onChange([...lines, {
				id: uid("ln"),
				description: "",
				qty: 1,
				price: 0
			}]),
			children: "Add line"
		})]
	});
}
function cleanLines(lines) {
	return lines.map((line) => ({
		...line,
		description: line.description.trim(),
		qty: Math.max(1, line.qty),
		price: Math.max(0, line.price)
	})).filter((line) => line.description);
}
function EstimateForm({ onDone }) {
	const customers = useShop((state) => state.customers);
	const repairs = useShop((state) => state.repairs);
	const ctx = useShop((state) => state.modalCtx);
	const addEstimate = useShop((state) => state.addEstimate);
	const openDrawer = useShop((state) => state.openDrawer);
	const [customerId, setCustomerId] = (0, import_react.useState)(ctx.customerId ?? customers[0]?.id ?? "");
	const [repairId, setRepairId] = (0, import_react.useState)(ctx.repairId ?? "");
	const [note, setNote] = (0, import_react.useState)("");
	const [lines, setLines] = (0, import_react.useState)([{
		id: uid("ln"),
		description: "Labor",
		qty: 1,
		price: 0
	}]);
	const options = repairs.filter((repair) => repair.customerId === customerId && repair.status !== "picked_up");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			const next = cleanLines(lines);
			if (!customerId || next.length === 0) {
				toast.error("Add a customer and at least one line.");
				return;
			}
			const id = addEstimate({
				customerId,
				repairId: repairId || null,
				lines: next,
				note
			});
			toast.success("Estimate drafted");
			openDrawer({
				kind: "estimate",
				id
			});
			onDone();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Customer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: fieldClasses(),
					value: customerId,
					onChange: (event) => {
						setCustomerId(event.target.value);
						setRepairId("");
					},
					children: customers.map((customer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: customer.id,
						children: customer.name
					}, customer.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Ticket",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: fieldClasses(),
					value: repairId,
					onChange: (event) => setRepairId(event.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "No ticket"
					}), options.map((repair) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: repair.id,
						children: [
							"#",
							repair.number,
							" · ",
							repair.brand,
							" ",
							repair.model
						]
					}, repair.id))]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineEditor, {
				lines,
				onChange: setLines
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Note",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: fieldClasses("h-20 py-2"),
					value: note,
					onChange: (event) => setNote(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Save estimate"
				})
			})
		]
	});
}
function InvoiceForm({ onDone }) {
	const customers = useShop((state) => state.customers);
	const repairs = useShop((state) => state.repairs);
	const parts = useShop((state) => state.parts);
	const ctx = useShop((state) => state.modalCtx);
	const addInvoice = useShop((state) => state.addInvoice);
	const openDrawer = useShop((state) => state.openDrawer);
	const initialRepair = repairs.find((repair) => repair.id === ctx.repairId);
	const [customerId, setCustomerId] = (0, import_react.useState)(initialRepair?.customerId ?? ctx.customerId ?? customers[0]?.id ?? "");
	const [repairId, setRepairId] = (0, import_react.useState)(ctx.repairId ?? "");
	const [lines, setLines] = (0, import_react.useState)(() => initialRepair ? repairLines(initialRepair, parts) : [{
		id: uid("ln"),
		description: "Labor",
		qty: 1,
		price: 0
	}]);
	const options = (0, import_react.useMemo)(() => repairs.filter((repair) => repair.customerId === customerId), [customerId, repairs]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			const next = cleanLines(lines);
			if (!customerId || next.length === 0) {
				toast.error("Add a customer and at least one line.");
				return;
			}
			const id = addInvoice({
				customerId,
				repairId: repairId || null,
				lines: next
			});
			toast.success("Invoice created");
			openDrawer({
				kind: "invoice",
				id
			});
			onDone();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Customer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: fieldClasses(),
					value: customerId,
					onChange: (event) => {
						setCustomerId(event.target.value);
						setRepairId("");
					},
					children: customers.map((customer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: customer.id,
						children: customer.name
					}, customer.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Ticket",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: fieldClasses(),
					value: repairId,
					onChange: (event) => {
						const nextId = event.target.value;
						setRepairId(nextId);
						const repair = repairs.find((item) => item.id === nextId);
						if (repair) setLines(repairLines(repair, parts));
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "No ticket"
					}), options.map((repair) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: repair.id,
						children: [
							"#",
							repair.number,
							" · ",
							repair.brand,
							" ",
							repair.model
						]
					}, repair.id))]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineEditor, {
				lines,
				onChange: setLines
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Create invoice"
				})
			})
		]
	});
}
function PartForm({ onDone }) {
	const addPart = useShop((state) => state.addPart);
	const [name, setName] = (0, import_react.useState)("");
	const [sku, setSku] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("Wear parts");
	const [qty, setQty] = (0, import_react.useState)("1");
	const [min, setMin] = (0, import_react.useState)("2");
	const [cost, setCost] = (0, import_react.useState)("0");
	const [price, setPrice] = (0, import_react.useState)("0");
	const [bin, setBin] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			addPart({
				name,
				sku,
				category,
				qty: Number(qty) || 0,
				min: Number(min) || 0,
				cost: Number(cost) || 0,
				price: Number(price) || 0,
				bin
			});
			toast.success("Part added");
			onDone();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClasses(),
					value: name,
					onChange: (event) => setName(event.target.value),
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "SKU",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							placeholder: "Auto if blank",
							value: sku,
							onChange: (event) => setSku(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Category",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							value: category,
							onChange: (event) => setCategory(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "On hand",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							type: "number",
							min: "0",
							value: qty,
							onChange: (event) => setQty(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Minimum",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							type: "number",
							min: "0",
							value: min,
							onChange: (event) => setMin(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Cost",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							type: "number",
							min: "0",
							step: "0.01",
							value: cost,
							onChange: (event) => setCost(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
						label: "Price",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							type: "number",
							min: "0",
							step: "0.01",
							value: price,
							onChange: (event) => setPrice(event.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Bin",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClasses(),
					value: bin,
					onChange: (event) => setBin(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Save part"
				})
			})
		]
	});
}
function ExpenseForm({ onDone }) {
	const addExpense = useShop((state) => state.addExpense);
	const [category, setCategory] = (0, import_react.useState)("Parts");
	const [vendor, setVendor] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [note, setNote] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			addExpense({
				category,
				vendor,
				amount: Number(amount) || 0,
				date,
				note
			});
			toast.success("Expense logged");
			onDone();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
					label: "Category",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: fieldClasses(),
						value: category,
						onChange: (event) => setCategory(event.target.value),
						children: [
							"Rent",
							"Parts",
							"Tools",
							"Utilities",
							"Insurance",
							"Marketing",
							"Other"
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
					label: "Amount",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: fieldClasses(),
						type: "number",
						min: "0",
						step: "0.01",
						value: amount,
						onChange: (event) => setAmount(event.target.value),
						required: true
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Vendor",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClasses(),
					value: vendor,
					onChange: (event) => setVendor(event.target.value),
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Date",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClasses(),
					type: "date",
					value: date,
					onChange: (event) => setDate(event.target.value),
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Note",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClasses(),
					value: note,
					onChange: (event) => setNote(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Save expense"
				})
			})
		]
	});
}
function InquiryForm({ onDone }) {
	const addInquiry = useShop((state) => state.addInquiry);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [channel, setChannel] = (0, import_react.useState)("phone");
	const [message, setMessage] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3",
		onSubmit: (event) => {
			event.preventDefault();
			addInquiry({
				name,
				phone,
				channel,
				message
			});
			toast.success("Inquiry logged");
			onDone();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: fieldClasses(),
						value: name,
						onChange: (event) => setName(event.target.value),
						required: true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
					label: "Phone",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: fieldClasses(),
						value: phone,
						onChange: (event) => setPhone(event.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Channel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: fieldClasses(),
					value: channel,
					onChange: (event) => setChannel(event.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "phone",
							children: "Phone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "walk-in",
							children: "Walk-in"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "web",
							children: "Web"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "email",
							children: "Email"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "Message",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: fieldClasses("h-24 py-2"),
					value: message,
					onChange: (event) => setMessage(event.target.value),
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Save inquiry"
				})
			})
		]
	});
}
function PaymentsForm() {
	const connected = useShop((state) => state.settings.paymentsConnected);
	const update = useShop((state) => state.updateSettings);
	const close = useShop((state) => state.closeModal);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Turning payouts on is a local switch for this shop. Nothing is sent to a bank, and card numbers are never collected. Paid invoices can then be marked as card, cash, or transfer."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-end gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: close,
				children: "Not now"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => {
					update({
						paymentsConnected: !connected,
						bannerDismissed: true
					});
					toast.success(connected ? "Payouts disconnected" : "Payouts marked connected");
					close();
				},
				children: connected ? "Disconnect" : "Connect payouts"
			})]
		})]
	});
}
function ResetForm() {
	const reset = useShop((state) => state.resetDemo);
	const close = useShop((state) => state.closeModal);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "This replaces every ticket, customer, part, and invoice in this browser with the Summit sample shop. It cannot be undone."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-end gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: close,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "danger",
				onClick: () => {
					reset();
					toast.success("Sample shop restored");
				},
				children: "Reset sample data"
			})]
		})]
	});
}
function PartsPage() {
	const parts = useShop((state) => state.parts);
	const filter = useShop((state) => state.partsFilter);
	const setFilter = useShop((state) => state.setPartsFilter);
	const adjust = useShop((state) => state.adjustPart);
	const openModal = useShop((state) => state.openModal);
	const [q, setQ] = (0, import_react.useState)("");
	const rows = parts.filter((part) => filter === "low" ? part.qty <= part.min : true).filter((part) => `${part.name} ${part.sku} ${part.category} ${part.bin}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => Number(b.qty <= b.min) - Number(a.qty <= a.min) || a.name.localeCompare(b.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Shelf",
			title: "Parts",
			subtitle: "On-hand counts, bins, and reorder points.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => openModal("part"),
				children: "Add part"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
				active: filter === "all",
				onClick: () => setFilter("all"),
				children: "All"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
				active: filter === "low",
				onClick: () => setFilter("low"),
				children: "Low stock"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: `${fieldClasses()} mb-4`,
			placeholder: "Search parts",
			value: q,
			onChange: (event) => setQ(event.target.value)
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No parts",
			body: "Nothing matches. Add a part or switch the filter.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => openModal("part"),
				children: "Add part"
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2",
			children: rows.map((part) => {
				const low = part.qty <= part.min;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex flex-wrap items-center gap-3 rounded-3xl bg-surface px-4 py-3 shadow-ring ${low ? "ring-1 ring-danger/40" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: part.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm text-muted",
								children: [
									part.sku,
									" · ",
									part.category,
									" · bin ",
									part.bin,
									" · min ",
									part.min
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted",
							children: money(part.price)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-11 place-items-center rounded-full bg-surface-2 text-lg",
									"aria-label": `Decrease ${part.name}`,
									onClick: () => adjust(part.id, -1),
									children: "−"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `w-8 text-center text-lg font-semibold tabular-nums ${low ? "text-danger" : ""}`,
									children: part.qty
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-11 place-items-center rounded-full bg-surface-2 text-lg",
									"aria-label": `Increase ${part.name}`,
									onClick: () => adjust(part.id, 1),
									children: "+"
								})
							]
						})
					]
				}, part.id);
			})
		})
	] });
}
function CustomersPage() {
	const customers = useShop((state) => state.customers);
	const repairs = useShop((state) => state.repairs);
	const openDrawer = useShop((state) => state.openDrawer);
	const openModal = useShop((state) => state.openModal);
	const [q, setQ] = (0, import_react.useState)("");
	const rows = customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "People",
			title: "Customers",
			subtitle: "Everyone who has dropped a tool at the counter.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => openModal("customer"),
				children: "New customer"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: `${fieldClasses()} mb-4`,
			placeholder: "Search name, phone, or email",
			value: q,
			onChange: (event) => setQ(event.target.value)
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No customers",
			body: "Try another search, or add someone new."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: rows.map((customer) => {
				const open = repairs.filter((repair) => repair.customerId === customer.id && repair.status !== "picked_up").length;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "rounded-3xl bg-surface p-4 text-left shadow-ring hover:bg-surface-2",
					onClick: () => openDrawer({
						kind: "customer",
						id: customer.id
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold",
							children: customer.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted",
							children: customer.phone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 text-sm text-muted",
							children: open === 0 ? "No open tickets" : `${open} open ${open === 1 ? "ticket" : "tickets"}`
						})
					]
				}, customer.id);
			})
		})
	] });
}
function InvoicesPage() {
	const invoices = useShop((state) => state.invoices);
	const customers = useShop((state) => state.customers);
	const openDrawer = useShop((state) => state.openDrawer);
	const openModal = useShop((state) => state.openModal);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const rows = invoices.filter((invoice) => filter === "all" ? true : invoice.status === filter).slice().sort((a, b) => b.number - a.number);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Money",
			title: "Invoices",
			subtitle: "What the shop has billed, collected, or voided.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => openModal("invoice"),
				children: "New invoice"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex gap-2 overflow-x-auto",
			children: [
				"all",
				"unpaid",
				"paid",
				"void"
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
				active: filter === item,
				onClick: () => setFilter(item),
				children: item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)
			}, item))
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No invoices",
			body: "Create one from a ticket or from here."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2",
			children: rows.map((invoice) => {
				const customer = customers.find((item) => item.id === invoice.customerId);
				const total = invoiceTotals(invoice).total;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex items-center gap-3 rounded-3xl bg-surface px-4 py-3 text-left shadow-ring",
					onClick: () => openDrawer({
						kind: "invoice",
						id: invoice.id
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-semibold",
							children: [
								"#",
								invoice.number,
								" · ",
								customer?.name
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm text-muted capitalize",
							children: [
								invoice.status,
								" · ",
								shortDate(invoice.createdAt)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `font-semibold tabular-nums ${invoice.status === "unpaid" ? "text-primary" : ""}`,
						children: money(total)
					})]
				}, invoice.id);
			})
		})
	] });
}
function EstimatesPage() {
	const estimates = useShop((state) => state.estimates);
	const customers = useShop((state) => state.customers);
	const openDrawer = useShop((state) => state.openDrawer);
	const openModal = useShop((state) => state.openModal);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const rows = estimates.filter((estimate) => filter === "all" ? true : estimate.status === filter).slice().sort((a, b) => b.number - a.number);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Money",
			title: "Estimates",
			subtitle: "Quote the work, then accept it onto the bench.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => openModal("estimate"),
				children: "New estimate"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex gap-2 overflow-x-auto",
			children: [
				"all",
				"draft",
				"sent",
				"accepted",
				"declined"
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
				active: filter === item,
				onClick: () => setFilter(item),
				children: item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)
			}, item))
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No estimates",
			body: "Draft one for a customer before you start the repair."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2",
			children: rows.map((estimate) => {
				const customer = customers.find((item) => item.id === estimate.customerId);
				const total = estimate.lines.reduce((sum, line) => sum + line.qty * line.price, 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex items-center gap-3 rounded-3xl bg-surface px-4 py-3 text-left shadow-ring",
					onClick: () => openDrawer({
						kind: "estimate",
						id: estimate.id
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-semibold",
							children: [
								"#",
								estimate.number,
								" · ",
								customer?.name
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm capitalize text-muted",
							children: estimate.status
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold tabular-nums",
						children: money(total)
					})]
				}, estimate.id);
			})
		})
	] });
}
function ShopPage() {
	const settings = useShop((state) => state.settings);
	const update = useShop((state) => state.updateSettings);
	const bench = useBench();
	const [form, setForm] = (0, import_react.useState)(settings);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "House",
		title: "Shop",
		subtitle: "What customers see on the invoice and at the counter."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "grid gap-3 lg:col-span-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Shop name",
					value: form.shopName,
					onChange: (shopName) => setForm({
						...form,
						shopName
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Owner",
					value: form.owner,
					onChange: (owner) => setForm({
						...form,
						owner
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone",
						value: form.phone,
						onChange: (phone) => setForm({
							...form,
							phone
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						value: form.email,
						onChange: (email) => setForm({
							...form,
							email
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Address",
					value: form.address,
					onChange: (address) => setForm({
						...form,
						address
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Hours",
					value: form.hours,
					onChange: (hours) => setForm({
						...form,
						hours
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							update({
								shopName: form.shopName.trim() || settings.shopName,
								owner: form.owner.trim() || settings.owner,
								phone: form.phone.trim(),
								email: form.email.trim(),
								address: form.address.trim(),
								hours: form.hours.trim()
							});
							toast.success("Shop profile saved");
						},
						children: "Save profile"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 lg:col-span-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: settings.shopName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: settings.address
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: settings.phone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: settings.hours
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Right now"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 grid gap-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [bench.inShop, " tools in the shop"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [bench.ready, " waiting for pickup"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [bench.low, " parts under minimum"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [money(bench.outstanding), " outstanding"] })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Bench"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-1 text-sm text-muted",
					children: settings.techs.map((tech) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: tech }, tech))
				})] })
			]
		})]
	})] });
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: fieldClasses(),
			value,
			onChange: (event) => onChange(event.target.value)
		})]
	});
}
function InquiriesPage() {
	const inquiries = useShop((state) => state.inquiries);
	const update = useShop((state) => state.updateInquiry);
	const openModal = useShop((state) => state.openModal);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [drafts, setDrafts] = (0, import_react.useState)({});
	const rows = inquiries.filter((inquiry) => filter === "all" ? true : inquiry.status === filter);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Front door",
			title: "Inquiries",
			subtitle: "Calls, walk-ins, and messages that are not tickets yet.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => openModal("inquiry"),
				children: "Log inquiry"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex gap-2",
			children: [
				"all",
				"new",
				"replied",
				"closed"
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
				active: filter === item,
				onClick: () => setFilter(item),
				children: item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)
			}, item))
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Inbox clear",
			body: "New questions from the counter or the web will land here."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3",
			children: rows.map((inquiry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: inquiry.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted capitalize",
						children: [
							inquiry.channel,
							" · ",
							inquiry.phone || "No phone",
							" · ",
							shortDate(inquiry.createdAt)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold capitalize text-muted",
						children: inquiry.status
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm",
					children: inquiry.message
				}),
				inquiry.reply ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: ["Reply: ", inquiry.reply]
				}) : null,
				inquiry.status !== "closed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses("min-w-48 flex-1"),
							placeholder: "Write a reply",
							value: drafts[inquiry.id] ?? "",
							onChange: (event) => setDrafts({
								...drafts,
								[inquiry.id]: event.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => {
								const reply = (drafts[inquiry.id] ?? "").trim();
								if (!reply) {
									toast.error("Write a reply first.");
									return;
								}
								update(inquiry.id, {
									reply,
									status: "replied"
								});
								toast.success("Reply saved");
							},
							children: "Save reply"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => update(inquiry.id, { status: "closed" }),
							children: "Close"
						})
					]
				}) : null
			] }, inquiry.id))
		})
	] });
}
function ExpensesPage() {
	const expenses = useShop((state) => state.expenses);
	const openModal = useShop((state) => state.openModal);
	const month = expenses.filter((expense) => isThisMonth(parseISO(expense.date))).reduce((sum, expense) => sum + expense.amount, 0);
	const rows = expenses.slice().sort((a, b) => b.date.localeCompare(a.date));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Money",
		title: "Expenses",
		subtitle: `${money(month)} logged this month.`,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => openModal("expense"),
			children: "Log expense"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-2",
		children: rows.map((expense) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 rounded-3xl bg-surface px-4 py-3 shadow-ring",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: expense.vendor
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm text-muted",
					children: [
						expense.category,
						" · ",
						longDate(`${expense.date}T12:00:00.000Z`),
						expense.note ? ` · ${expense.note}` : ""
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-semibold tabular-nums",
				children: money(expense.amount)
			})]
		}, expense.id))
	})] });
}
function ReportsPage() {
	const invoices = useShop((state) => state.invoices);
	const repairs = useShop((state) => state.repairs);
	const expenses = useShop((state) => state.expenses);
	const data = (0, import_react.useMemo)(() => buildReport(invoices, repairs, expenses), [
		expenses,
		invoices,
		repairs
	]);
	const tip = {
		background: "var(--color-surface)",
		border: "1px solid var(--color-line)",
		borderRadius: 12,
		color: "var(--color-fg)"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Books",
			title: "Reports",
			subtitle: "Collected revenue against what the bench has closed."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted",
					children: "Collected"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-2xl font-semibold tabular-nums",
					children: money(data.collected)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted",
					children: "Outstanding"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-2xl font-semibold tabular-nums",
					children: money(data.outstanding)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted",
					children: "Expenses on file"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-2xl font-semibold tabular-nums",
					children: money(data.spent)
				})] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "lg:col-span-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-semibold",
					children: "Revenue by month"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: data.months,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-line)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "var(--color-faint)",
									fontSize: 12,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "var(--color-faint)",
									fontSize: 12,
									tickLine: false,
									axisLine: false,
									width: 48
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: tip,
									cursor: { fill: "rgb(255 255 255 / 0.04)" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "revenue",
									fill: "var(--color-primary)",
									radius: [
										8,
										8,
										0,
										0
									]
								})
							]
						})
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "lg:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-semibold",
						children: "Open bench"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: data.status,
								dataKey: "value",
								nameKey: "label",
								innerRadius: 48,
								outerRadius: 80,
								paddingAngle: 2,
								children: data.status.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: entry.fill }, entry.label))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: tip })] })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-1 text-sm text-muted",
						children: data.status.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: entry.value
							})]
						}, entry.label))
					})
				]
			})]
		})
	] });
}
function buildReport(invoices, repairs, expenses) {
	const paid = invoices.filter((invoice) => invoice.status === "paid" && invoice.paidAt);
	return {
		months: [
			"2026-08",
			"2026-09",
			"2026-10",
			"2026-11"
		].map((key) => {
			const revenue = paid.filter((invoice) => invoice.paidAt.slice(0, 7) === key).reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0);
			const [year, month] = key.split("-");
			return {
				key,
				label: new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", { month: "short" }),
				revenue: Math.round(revenue)
			};
		}),
		status: [
			[
				"In queue",
				"in_queue",
				"var(--color-faint)"
			],
			[
				"In progress",
				"in_progress",
				"var(--color-primary)"
			],
			[
				"Waiting parts",
				"waiting_parts",
				"var(--color-info)"
			],
			[
				"Approval",
				"waiting_approval",
				"var(--color-promo)"
			],
			[
				"Ready",
				"ready",
				"var(--color-success)"
			]
		].map(([label, id, fill]) => ({
			label,
			fill,
			value: repairs.filter((repair) => repair.status === id).length
		})).filter((row) => row.value > 0),
		collected: paid.reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0),
		outstanding: invoices.filter((invoice) => invoice.status === "unpaid").reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0),
		spent: expenses.reduce((sum, expense) => sum + expense.amount, 0)
	};
}
function SettingsPage() {
	const settings = useShop((state) => state.settings);
	const update = useShop((state) => state.updateSettings);
	const addTech = useShop((state) => state.addTech);
	const removeTech = useShop((state) => state.removeTech);
	const openModal = useShop((state) => state.openModal);
	const [tax, setTax] = (0, import_react.useState)(String(Math.round(settings.taxRate * 1e4) / 100));
	const [tech, setTech] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "System",
		title: "Settings",
		subtitle: "Payouts, tax, and the people on the bench."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Payouts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: settings.paymentsConnected ? "Card is available as a payment method. This preview does not charge anyone." : "Payouts are off. Cash and transfer still work at the counter."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => openModal("payments"),
						children: settings.paymentsConnected ? "Manage payouts" : "Set up payouts"
					}),
					settings.bannerDismissed && !settings.paymentsConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => update({ bannerDismissed: false }),
						children: "Show the payments banner again"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Sales tax"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Rate percent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							type: "number",
							min: "0",
							max: "30",
							step: "0.01",
							value: tax,
							onChange: (event) => setTax(event.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							const rate = Number(tax);
							if (!Number.isFinite(rate) || rate < 0 || rate > 30) {
								toast.error("Use a tax rate between 0 and 30.");
								return;
							}
							update({ taxRate: rate / 100 });
							toast.success("Tax rate saved");
						},
						children: "Save tax"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Technicians"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-2",
						children: settings.techs.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 px-2 text-muted hover:text-danger",
								onClick: () => removeTech(name),
								children: "Remove"
							})]
						}, name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: fieldClasses(),
							placeholder: "Add a name",
							value: tech,
							onChange: (event) => setTech(event.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => {
								addTech(tech);
								setTech("");
							},
							children: "Add"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Sample data"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Summit Power Tool Repair is stored in this browser. Reset brings back the original tickets, customers, and stock."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						onClick: () => openModal("reset"),
						children: "Reset sample shop"
					})
				]
			})
		]
	})] });
}
function IntakesPage() {
	const repairs = useShop((state) => state.repairs);
	const customers = useShop((state) => state.customers);
	const openDrawer = useShop((state) => state.openDrawer);
	const recent = (0, import_react.useMemo)(() => repairs.slice().sort((a, b) => b.intakeAt.localeCompare(a.intakeAt)).slice(0, 8), [repairs]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Counter",
		title: "Tool intake",
		subtitle: "Check a tool in, attach it to a customer, and drop it on the bench."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			className: "lg:col-span-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntakeForm, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2 lg:col-span-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold text-muted",
				children: "Recent intakes"
			}), recent.map((repair) => {
				const customer = customers.find((item) => item.id === repair.customerId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => openDrawer({
						kind: "repair",
						id: repair.id
					}),
					className: "rounded-2xl bg-surface px-4 py-3 text-left shadow-ring",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold",
								children: ["#", repair.number]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: repair.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 truncate text-sm",
							children: toolLabel(repair)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "truncate text-sm text-muted",
							children: [
								customer?.name,
								" · ",
								shortDate(repair.intakeAt)
							]
						})
					]
				}, repair.id);
			})]
		})]
	})] });
}
var FILTERS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "open",
		label: "Open"
	},
	{
		id: "in_queue",
		label: "Queue"
	},
	{
		id: "in_progress",
		label: "Progress"
	},
	{
		id: "waiting_parts",
		label: "Parts"
	},
	{
		id: "waiting_approval",
		label: "Approval"
	},
	{
		id: "ready",
		label: "Ready"
	},
	{
		id: "picked_up",
		label: "Closed"
	}
];
function RepairsPage() {
	const repairs = useShop((state) => state.repairs);
	const customers = useShop((state) => state.customers);
	const filter = useShop((state) => state.repairsFilter);
	const setFilter = useShop((state) => state.setRepairsFilter);
	const openDrawer = useShop((state) => state.openDrawer);
	const openModal = useShop((state) => state.openModal);
	const setStatus = useShop((state) => state.setRepairStatus);
	const [q, setQ] = (0, import_react.useState)("");
	const rows = repairs.filter((repair) => {
		if (filter === "open") return repair.status !== "picked_up";
		if (filter !== "all") return repair.status === filter;
		return true;
	}).filter((repair) => {
		const customer = customers.find((item) => item.id === repair.customerId);
		return `${repair.number} ${repair.brand} ${repair.model} ${repair.tool} ${repair.issue} ${customer?.name ?? ""} ${customer?.phone ?? ""}`.toLowerCase().includes(q.trim().toLowerCase());
	}).sort((a, b) => b.number - a.number);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Bench",
			title: "Repairs",
			subtitle: "Move work from the queue to the counter.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => openModal("intake"),
				children: "Tool intake"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex gap-2 overflow-x-auto pb-1",
			children: FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
				active: filter === item.id,
				onClick: () => setFilter(item.id),
				children: item.label
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: `${fieldClasses()} mb-4`,
			placeholder: "Filter tickets",
			value: q,
			onChange: (event) => setQ(event.target.value)
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No tickets",
			body: "Nothing matches this filter. Open a new intake or clear the search."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden overflow-hidden rounded-3xl bg-surface shadow-ring md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs tracking-widest text-faint uppercase",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Ticket"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Tool"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Customer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Issue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Status"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((repair) => {
					const customer = customers.find((item) => item.id === repair.customerId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line hover:bg-surface-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "font-semibold text-primary",
									onClick: () => openDrawer({
										kind: "repair",
										id: repair.id
									}),
									children: ["#", repair.number]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: toolLabel(repair)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted",
									children: repair.tool
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: customer?.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "max-w-xs truncate px-4 py-3 text-muted",
								children: repair.issue
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									"aria-label": `Status for ticket ${repair.number}`,
									className: "h-11 rounded-xl border border-line bg-bg px-2 text-sm",
									value: repair.status,
									onChange: (event) => {
										setStatus(repair.id, event.target.value);
										toast.success("Status updated");
									},
									children: STATUS_ORDER.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: status,
										children: STATUS_LABEL[status]
									}, status))
								})
							})
						]
					}, repair.id);
				}) })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:hidden",
			children: rows.map((repair) => {
				const customer = customers.find((item) => item.id === repair.customerId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "rounded-3xl bg-surface p-4 text-left shadow-ring",
					onClick: () => openDrawer({
						kind: "repair",
						id: repair.id
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold text-primary",
								children: ["#", repair.number]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: repair.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 font-medium",
							children: toolLabel(repair)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted",
							children: customer?.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-sm text-muted",
							children: repair.issue
						})
					]
				}, repair.id);
			})
		})] })
	] });
}
function PickupPage() {
	const ready = useShop((state) => state.repairs.filter((repair) => repair.status === "ready"));
	const customers = useShop((state) => state.customers);
	const parts = useShop((state) => state.parts);
	const invoices = useShop((state) => state.invoices);
	const taxRate = useShop((state) => state.settings.taxRate);
	const payments = useShop((state) => state.settings.paymentsConnected);
	const release = useShop((state) => state.releaseRepair);
	const openDrawer = useShop((state) => state.openDrawer);
	const bench = useBench();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Counter",
		title: "Pickup",
		subtitle: `${bench.ready} ${bench.ready === 1 ? "tool is" : "tools are"} waiting at the counter.`
	}), ready.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Nothing to release",
		body: "When a ticket is marked ready, it shows up here for payment and pickup."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3",
		children: ready.map((repair) => {
			const customer = customers.find((item) => item.id === repair.customerId);
			const due = dueForRepair(repair, parts, invoices, taxRate);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PickupCard, {
				title: `#${repair.number} · ${toolLabel(repair)}`,
				customer: customer?.name ?? "Customer",
				phone: customer?.phone ?? "",
				issue: repair.issue,
				amount: money(due.total),
				settled: due.settled,
				payments,
				onOpen: () => openDrawer({
					kind: "repair",
					id: repair.id
				}),
				onRelease: (method) => {
					const error = release(repair.id, method);
					if (error) toast.error(error);
					else toast.success(`${toolLabel(repair)} released`);
				}
			}, repair.id);
		})
	})] });
}
function PickupCard({ title, customer, phone, issue, amount, settled, payments, onOpen, onRelease }) {
	const [method, setMethod] = (0, import_react.useState)(payments ? "card" : "cash");
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "text-left",
		onClick: onOpen,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					customer,
					" · ",
					phone
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm",
				children: issue
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 flex flex-wrap items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-faint uppercase tracking-widest",
			children: settled ? "Already paid" : "Due now"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xl font-semibold tabular-nums",
			children: amount
		})] }), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: fieldClasses("w-36"),
				value: method,
				onChange: (event) => setMethod(event.target.value),
				"aria-label": "Payment method",
				children: [
					payments ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "card",
						children: "Card"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "cash",
						children: "Cash"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "transfer",
						children: "Transfer"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => onRelease(method),
				children: "Release tool"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => setOpen(true),
			children: settled ? "Release tool" : "Collect and release"
		})]
	})] });
}
var NAV = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: LayoutGrid
	},
	{
		id: "intakes",
		label: "Intakes",
		icon: ClipboardPlus
	},
	{
		id: "pickup",
		label: "Pickup",
		icon: PackageCheck
	},
	{
		id: "repairs",
		label: "Repairs",
		icon: Wrench
	},
	{
		id: "parts",
		label: "Parts",
		icon: Boxes,
		badge: "low"
	},
	{
		id: "customers",
		label: "Customers",
		icon: Users
	},
	{
		id: "invoices",
		label: "Invoices",
		icon: FileText
	},
	{
		id: "estimates",
		label: "Estimates",
		icon: Receipt
	},
	{
		id: "shop",
		label: "Shop",
		icon: Store
	},
	{
		id: "inquiries",
		label: "Inquiries",
		icon: MessageSquare
	},
	{
		id: "expenses",
		label: "Expenses",
		icon: Wallet
	},
	{
		id: "reports",
		label: "Reports",
		icon: ChartColumn
	}
];
var CREATE = [
	{
		id: "intake",
		label: "Tool intake"
	},
	{
		id: "customer",
		label: "New customer"
	},
	{
		id: "estimate",
		label: "New estimate"
	},
	{
		id: "invoice",
		label: "New invoice"
	},
	{
		id: "part",
		label: "Add part"
	},
	{
		id: "expense",
		label: "Log expense"
	},
	{
		id: "inquiry",
		label: "New inquiry"
	}
];
function AppShell() {
	const view = useShop((state) => state.view);
	const mobileNav = useShop((state) => state.mobileNav);
	const popover = useShop((state) => state.popover);
	const setPopover = useShop((state) => state.setPopover);
	(0, import_react.useEffect)(() => {
		useShop.persist.rehydrate();
	}, []);
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				document.getElementById("shop-search")?.focus();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Topbar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "scroll-thin min-h-0 flex-1 overflow-y-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto w-full max-w-7xl px-4 py-5 md:px-6",
						children: [
							view === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}),
							view === "intakes" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntakesPage, {}),
							view === "pickup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PickupPage, {}),
							view === "repairs" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RepairsPage, {}),
							view === "parts" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartsPage, {}),
							view === "customers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomersPage, {}),
							view === "invoices" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoicesPage, {}),
							view === "estimates" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EstimatesPage, {}),
							view === "shop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopPage, {}),
							view === "inquiries" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InquiriesPage, {}),
							view === "expenses" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpensesPage, {}),
							view === "reports" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsPage, {}),
							view === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPage, {})
						]
					})
				})]
			}),
			mobileNav ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-20 bg-bg/70 md:hidden",
				"aria-label": "Close menu",
				onClick: () => useShop.getState().setMobileNav(false)
			}) : null,
			popover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-20",
				"aria-label": "Dismiss menu",
				onClick: () => setPopover(null)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopModals, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopDrawers, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "bottom-right"
			})
		]
	});
}
function Mark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-fg shadow-nav",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-5" })
	});
}
function Sidebar() {
	const view = useShop((state) => state.view);
	const pinned = useShop((state) => state.sidebarPinned);
	const mobileNav = useShop((state) => state.mobileNav);
	const setView = useShop((state) => state.setView);
	const setPinned = useShop((state) => state.setSidebarPinned);
	const bench = useBench();
	const labels = mobileNav || pinned;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: cn("fixed inset-y-0 left-0 z-30 flex-col border-r border-line bg-sidebar md:static md:flex", mobileNav ? "flex w-60" : "hidden", pinned ? "md:w-60" : "md:w-16"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex items-center gap-3 px-4 py-5", !labels && "justify-center px-2"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), labels ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-base leading-none font-semibold tracking-wide",
						children: "BENCH"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-xs font-medium tracking-widest text-primary",
						children: "REPAIRSHOP OS"
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "scroll-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2",
				children: NAV.map((item) => {
					const active = view === item.id;
					const count = item.badge === "low" ? bench.low : 0;
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: item.label,
						onClick: () => setView(item.id),
						className: cn("relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition", active ? "bg-primary text-primary-fg shadow-nav" : "text-muted hover:bg-surface hover:text-fg", !labels && "justify-center px-0"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 shrink-0" }),
							labels ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: item.label
							}) : null,
							labels && count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("ml-auto grid min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold", active ? "bg-primary-fg/15" : "bg-primary text-primary-fg"),
								children: count
							}) : null,
							labels && active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-primary-fg", count > 0 ? "" : "ml-auto"),
								children: "›"
							}) : null,
							!labels && count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" }) : null
						]
					}, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1 border-t border-line p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					title: "Settings",
					onClick: () => setView("settings"),
					className: cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium", view === "settings" ? "bg-primary text-primary-fg" : "text-muted hover:bg-surface hover:text-fg", !labels && "justify-center px-0"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" }),
						labels ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 text-left",
							children: "Settings"
						}) : null,
						labels ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "›" }) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-faint hover:bg-surface hover:text-fg", !labels && "justify-center px-0"),
					onClick: () => setPinned(!pinned),
					children: [pinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinOff, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-5" }), labels ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: pinned ? "Unpin sidebar" : "Pin sidebar" }) : null]
				})]
			})
		]
	});
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
	useShop((state) => state.openDrawer);
	const bench = useBench();
	const notices = [...bench.lowParts.map((part) => ({
		id: part.id,
		title: part.name,
		detail: `${part.qty} left · minimum ${part.min}`,
		go: () => {
			setPartsFilter("low");
			setView("parts");
		}
	})), ...bench.inquiries.filter((inquiry) => inquiry.status === "new").map((inquiry) => ({
		id: inquiry.id,
		title: inquiry.name,
		detail: inquiry.message,
		go: () => setView("inquiries")
	}))];
	const hits = searchHits(query);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "relative z-30 flex h-16 items-center gap-2 border-b border-line px-3 md:gap-3 md:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
				className: "md:hidden",
				"aria-label": "Open menu",
				onClick: () => setMobile(true),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden min-w-0 truncate text-sm font-semibold lg:block",
				children: settings.shopName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "shop-search",
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Search customers, repairs, parts...",
						className: "h-11 w-full rounded-full border border-line bg-surface pr-16 pl-10 text-sm outline-none placeholder:text-faint focus:border-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
						className: "pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-line px-1.5 py-0.5 text-xs text-faint md:inline",
						children: "Ctrl K"
					}),
					query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-2xl bg-surface shadow-ring",
						children: hits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-4 py-3 text-sm text-muted",
							children: "No matches."
						}) : hits.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full flex-col px-4 py-3 text-left hover:bg-surface-2",
							onMouseDown: (event) => event.preventDefault(),
							onClick: () => {
								setQuery("");
								hit.go();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: hit.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-xs text-muted",
								children: hit.detail
							})]
						}, hit.id))
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
					className: "bg-primary text-primary-fg hover:bg-primary-hover",
					"aria-label": "Create",
					onClick: () => setPopover(popover === "plus" ? null : "plus"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
				}), popover === "plus" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl bg-surface p-1 shadow-ring",
					children: CREATE.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex h-11 w-full items-center rounded-xl px-3 text-left text-sm hover:bg-surface-2",
						onClick: () => openModal(item.id),
						children: item.label
					}, item.id))
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(IconButton, {
					"aria-label": "Alerts",
					onClick: () => setPopover(popover === "bell" ? null : "bell"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }), notices.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-fg",
						children: notices.length
					}) : null]
				}), popover === "bell" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute right-0 z-40 mt-2 w-80 max-w-[80vw] overflow-hidden rounded-2xl bg-surface p-1 shadow-ring",
					children: notices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 py-4 text-sm text-muted",
						children: "No alerts."
					}) : notices.map((notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex w-full flex-col rounded-xl px-3 py-3 text-left hover:bg-surface-2",
						onClick: notice.go,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: notice.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "line-clamp-2 text-xs text-muted",
							children: notice.detail
						})]
					}, notice.id))
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden size-11 place-items-center rounded-full bg-surface-2 text-sm font-semibold sm:grid",
				title: settings.owner,
				children: settings.initials
			})
		]
	});
}
function searchHits(query) {
	const q = query.trim().toLowerCase();
	if (q.length < 1) return [];
	const { customers, repairs, parts, openDrawer, setView } = useShop.getState();
	const hits = [];
	for (const repair of repairs) {
		if (repair.status === "picked_up") continue;
		const customer = customers.find((item) => item.id === repair.customerId);
		if (!`${repair.number} ${repair.brand} ${repair.model} ${repair.tool} ${repair.issue} ${customer?.name ?? ""} ${customer?.phone ?? ""}`.toLowerCase().includes(q)) continue;
		hits.push({
			id: repair.id,
			title: `#${repair.number} ${toolLabel(repair)}`,
			detail: customer?.name ?? "Repair",
			go: () => {
				setView("repairs");
				openDrawer({
					kind: "repair",
					id: repair.id
				});
			}
		});
	}
	for (const customer of customers) {
		if (!`${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(q)) continue;
		hits.push({
			id: customer.id,
			title: customer.name,
			detail: customer.phone,
			go: () => {
				setView("customers");
				openDrawer({
					kind: "customer",
					id: customer.id
				});
			}
		});
	}
	for (const part of parts) {
		if (!`${part.name} ${part.sku} ${part.category}`.toLowerCase().includes(q)) continue;
		hits.push({
			id: part.id,
			title: part.name,
			detail: `${part.sku} · ${part.qty} on hand`,
			go: () => setView("parts")
		});
	}
	return hits.slice(0, 8);
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { Home as component };
