// Demo data for the dashboard. Usage:
//   LOGIN_EMAIL=you@x.com LOGIN_PASSWORD=... node scripts/seed-demo.mjs seed   — insert demo clients + documents for the signed-in user
//   LOGIN_EMAIL=you@x.com LOGIN_PASSWORD=... node scripts/seed-demo.mjs clean — delete everything this script inserted
// Everything is tagged with MARKER and numbered DEMO-*, and nothing has an email,
// auto-reminder, late fee, or recurring schedule, so no emails or cron jobs can fire.
import { createRequire } from "module"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { join } from "path"

const WEB = fileURLToPath(new URL("..", import.meta.url))
const require = createRequire(join(WEB, "package.json"))
const { createClient } = require("@supabase/supabase-js")

const env = Object.fromEntries(
  readFileSync(join(WEB, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")]
    })
)

const MARKER = "[seed:dashboard-demo]"
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
  email: process.env.LOGIN_EMAIL,
  password: process.env.LOGIN_PASSWORD,
})
if (authError) throw authError
const userId = auth.user.id

async function clean() {
  const { data: docs, error } = await supabase.from("documents").select("id").eq("user_id", userId).like("notes", `%${MARKER}%`)
  if (error) throw error
  if (docs.length) {
    const ids = docs.map((d) => d.id)
    await supabase.from("line_items").delete().in("document_id", ids)
    const { error: delErr } = await supabase.from("documents").delete().in("id", ids)
    if (delErr) throw delErr
  }
  const { data: clients, error: cErr } = await supabase.from("clients").delete().eq("user_id", userId).or(`address.like.*${MARKER}*,email.like.*.example.com`).select("id")
  if (cErr) throw cErr
  console.log(`removed ${docs.length} documents and ${clients.length} clients`)
}

// Deterministic pseudo-random so re-seeding gives the same picture.
let seed = 42
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const round = (n) => Math.round(n * 100) / 100

const today = new Date()
today.setHours(0, 0, 0, 0)
const daysAgo = (n) => new Date(today.getTime() - n * 864e5)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

// Emails use example.com (RFC 2606: reserved, never delivered) and auto_reminder is off.
const CLIENTS = [
  { name: "Northwind Traders", company_name: "Northwind Traders LLP", contact_person: "Ananya Sharma", email: "ananya@northwind.example.com", phone: "+91 98201 45632", address: "402, Lotus Corporate Park, Goregaon East, Mumbai, Maharashtra 400063", gst_id: "27AAKFN4821M1Z6", pan_number: "AAKFN4821M" },
  { name: "Acme Industries Pvt Ltd", company_name: "Acme Industries Private Limited", contact_person: "Rohan Mehta", email: "accounts@acme.example.com", phone: "+91 99099 21874", address: "Plot 17, GIDC Estate, Vatva, Ahmedabad, Gujarat 382445", gst_id: "24AADCA7712K1Z3", pan_number: "AADCA7712K" },
  { name: "Globex Design Studio", company_name: "Globex Design Studio", contact_person: "Priya Nair", email: "priya@globex.example.com", phone: "+91 98450 66120", address: "3rd Floor, 12th Main, Indiranagar, Bengaluru, Karnataka 560038", gst_id: "29ABDFG3390Q1Z8", pan_number: "ABDFG3390Q" },
  { name: "Initech Software", company_name: "Initech Software Solutions Pvt Ltd", contact_person: "Vikram Iyer", email: "finance@initech.example.com", phone: "+91 90030 58471", address: "Tower B, Olympia Tech Park, Guindy, Chennai, Tamil Nadu 600032", gst_id: "33AAECI5527H1Z1", pan_number: "AAECI5527H" },
  { name: "Umbrella Health", company_name: "Umbrella Healthcare Pvt Ltd", contact_person: "Dr. Kavya Reddy", email: "billing@umbrella.example.com", phone: "+91 98490 33017", address: "8-2-293, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033", gst_id: "36AAGCU9104B1Z4", pan_number: "AAGCU9104B" },
  { name: "Stark Logistics", company_name: "Stark Logistics", contact_person: "Arjun Singh", email: "arjun@stark.example.com", phone: "+91 98110 72265", address: "Khasra 54, Mahipalpur Extension, New Delhi, Delhi 110037", gst_id: null, pan_number: "BKSPS6631L" },
  { name: "Wayne Retail Co.", company_name: "Wayne Retail Company", contact_person: "Meera Joshi", email: "meera@wayne.example.com", phone: "+91 97300 18842", address: "Shop 21, Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014", gst_id: "27AAJFW2085D1Z9", pan_number: "AAJFW2085D" },
  { name: "Hooli Labs (US)", company_name: "Hooli Labs Inc.", contact_person: "Gavin Brooks", email: "ap@hooli.example.com", phone: "+1 (650) 555-0142", address: "1401 N Shoreline Blvd, Mountain View, CA 94043, USA", gst_id: null, pan_number: null },
]

const ITEMS = [
  ["Website design", 25000, 90000],
  ["Brand identity package", 30000, 120000],
  ["Monthly retainer", 15000, 60000],
  ["SEO audit", 8000, 25000],
  ["Mobile app sprint", 60000, 180000],
  ["Consulting hours", 2000, 6000],
  ["Hosting & maintenance", 3000, 12000],
  ["Product photography", 10000, 40000],
]

function lineItems(currency) {
  const scale = currency === "INR" ? 1 : currency === "USD" ? 1 / 80 : 1 / 90
  const n = 1 + Math.floor(rand() * 3)
  return Array.from({ length: n }, (_, i) => {
    const [name, min, max] = pick(ITEMS)
    const quantity = name === "Consulting hours" ? 4 + Math.floor(rand() * 20) : 1
    const rate = round((min + rand() * (max - min)) * scale)
    return { name, quantity, rate, sort_order: i }
  })
}

// Invoice plan: [daysAgoIssued, status, currency, includeTax, dueInDays]
function invoicePlan() {
  const plan = []
  // ~3-5 INR invoices per month for the last 12 months, mostly paid
  for (let m = 11; m >= 0; m--) {
    const perMonth = 3 + Math.floor(rand() * 3)
    for (let k = 0; k < perMonth; k++) {
      const age = m * 30 + Math.floor(rand() * 28) + 1
      plan.push([age, age > 75 ? (rand() < 0.08 ? "cancelled" : "paid") : "paid", "INR", rand() < 0.75, 15])
    }
  }
  // Recent unpaid INR invoices spread across every aging bucket
  plan.push([5, "sent", "INR", true, 30]) // not yet due
  plan.push([10, "sent", "INR", false, 30]) // not yet due
  plan.push([20, "sent", "INR", true, 15]) // ~5 days late
  plan.push([28, "sent", "INR", true, 15]) // ~13 days late
  plan.push([40, "sent", "INR", false, 15]) // ~25 days late
  plan.push([52, "sent", "INR", true, 15]) // ~37 days late
  plan.push([95, "sent", "INR", true, 15]) // ~80 days late
  plan.push([3, "draft", "INR", true, 30])
  plan.push([1, "draft", "INR", false, 30])
  // USD and EUR clients
  for (const age of [300, 240, 180, 120, 75, 45, 14]) plan.push([age, age > 40 ? "paid" : "sent", "USD", false, 30])
  plan.push([60, "sent", "USD", false, 30]) // USD overdue ~30 days
  for (const age of [200, 110, 35]) plan.push([age, age > 100 ? "paid" : "sent", "EUR", false, 30])
  return plan
}

async function seedAll() {
  await clean()

  const { data: clients, error: cErr } = await supabase
    .from("clients")
    .insert(CLIENTS.map((c) => ({ ...c, user_id: userId, auto_reminder: false })))
    .select("id, name, email, gst_id")
  if (cErr) throw cErr

  const docs = []
  const plan = invoicePlan().sort((a, b) => b[0] - a[0])
  plan.forEach(([age, status, currency, includeTax, dueIn], i) => {
    const issue = daysAgo(age)
    const client = currency === "INR" ? pick(clients.slice(0, 7)) : clients[7]
    docs.push({ type: "invoice", number: `DEMO-INV-${String(i + 1).padStart(3, "0")}`, issue, due: new Date(issue.getTime() + dueIn * 864e5), status, currency, includeTax, client })
  })
  ;[[2, "sent"], [9, "sent"], [21, "draft"], [33, "paid"], [70, "cancelled"], [6, "draft"]].forEach(([age, status], i) => {
    const issue = daysAgo(age)
    docs.push({ type: "quotation", number: `DEMO-QUO-${String(i + 1).padStart(3, "0")}`, issue, due: new Date(issue.getTime() + 30 * 864e5), status, currency: "INR", includeTax: true, client: pick(clients.slice(0, 7)) })
  })

  let inserted = 0
  for (const d of docs) {
    const items = lineItems(d.currency)
    const taxPct = d.includeTax ? 18 : 0
    const subtotal = round(items.reduce((s, it) => s + it.quantity * it.rate, 0))
    const taxTotal = round((subtotal * taxPct) / 100)
    const grandTotal = round(subtotal + taxTotal)
    const { data: doc, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        client_id: d.client.id,
        client_name: d.client.name,
        client_email: d.client.email,
        client_address: CLIENTS.find((c) => c.name === d.client.name).address,
        client_gst_id: d.client.gst_id,
        type: d.type,
        number: d.number,
        issue_date: iso(d.issue),
        due_date: iso(d.due),
        status: d.status,
        currency: d.currency,
        subtotal,
        tax_total: taxTotal,
        grand_total: grandTotal,
        include_tax: d.includeTax,
        amount_paid: d.status === "paid" ? grandTotal : 0,
        notes: `Demo data — safe to delete ${MARKER}`,
        created_at: new Date(d.issue.getTime() + 10 * 3600e3).toISOString(),
      })
      .select("id")
      .single()
    if (error) throw new Error(`${d.number}: ${error.message}`)
    const { error: liErr } = await supabase.from("line_items").insert(
      items.map((it) => ({
        document_id: doc.id,
        name: it.name,
        quantity: it.quantity,
        rate: it.rate,
        tax_percent: taxPct,
        line_total: round(it.quantity * it.rate),
        sort_order: it.sort_order,
      }))
    )
    if (liErr) throw new Error(`${d.number} line items: ${liErr.message}`)
    inserted++
  }
  const counts = docs.reduce((acc, d) => ((acc[`${d.type}/${d.currency}/${d.status}`] = (acc[`${d.type}/${d.currency}/${d.status}`] ?? 0) + 1), acc), {})
  console.log(`inserted ${clients.length} clients and ${inserted} documents`)
  console.log(counts)
}

const mode = process.argv[2]
if (mode === "seed") await seedAll()
else if (mode === "clean") await clean()
else console.log("usage: node seed-demo.mjs seed|clean")
await supabase.auth.signOut()
