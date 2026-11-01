import { relations, sql } from "drizzle-orm"
import {
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core"

// Property names are snake_case on purpose: rows keep the same shape the app's types
// (lib/types.ts) and UI already use.

/** timestamptz read back as an ISO-8601 string (what the app has always received). */
const timestamptz = customType<{ data: string; driverData: string | Date }>({
  dataType: () => "timestamp with time zone",
  fromDriver: (value) => new Date(value).toISOString(),
  toDriver: (value) => value,
})

const money = (name: string) => numeric(name, { precision: 12, scale: 2, mode: "number" })
const createdAt = () => timestamptz("created_at").notNull().default(sql`now()`)
const updatedAt = () =>
  timestamptz("updated_at")
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date().toISOString())

/** Neon Auth user id (neon_auth."user".id). No FK: that schema is managed by Neon Auth. */
const userId = () => uuid("user_id").notNull()

/**
 * Neon Auth's user table. Read-only for the app (admin user list); Neon Auth owns and migrates
 * it, and drizzle.config.ts filters pushes to the public schema.
 */
export const authUsers = pgSchema("neon_auth").table("user", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified"),
  image: text("image"),
  role: text("role"),
  banned: boolean("banned"),
  createdAt: timestamptz("createdAt").notNull(),
  updatedAt: timestamptz("updatedAt").notNull(),
})

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  full_name: text("full_name"),
  company_name: text("company_name"),
  company_address: text("company_address"),
  gst_id: text("gst_id"),
  email: text("email"),
  phone: text("phone"),
  logo_url: text("logo_url"),
  upi_id: text("upi_id"),
  paypal_email: text("paypal_email"),
  bank_name: text("bank_name"),
  bank_account_name: text("bank_account_name"),
  bank_account_number: text("bank_account_number"),
  bank_routing_number: text("bank_routing_number"),
  bank_swift_code: text("bank_swift_code"),
  financial_year_start: integer("financial_year_start").notNull().default(4),
  default_currency: text("default_currency").notNull().default("INR"),
  created_at: createdAt(),
  updated_at: updatedAt(),
})

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: userId(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    gst_id: text("gst_id"),
    pan_number: text("pan_number"),
    company_name: text("company_name"),
    contact_person: text("contact_person"),
    auto_reminder: boolean("auto_reminder").notNull().default(false),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [index("clients_user_id_idx").on(t.user_id)],
)

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: userId(),
    client_id: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    type: text("type", { enum: ["invoice", "quotation"] }).notNull(),
    number: text("number").notNull(),
    issue_date: date("issue_date", { mode: "string" }).notNull().default(sql`current_date`),
    due_date: date("due_date", { mode: "string" }),
    valid_until: timestamptz("valid_until"),
    status: text("status", { enum: ["draft", "sent", "paid", "overdue", "cancelled"] }).notNull().default("draft"),
    currency: text("currency").notNull().default("INR"),
    subtotal: money("subtotal").notNull().default(0),
    tax_total: money("tax_total").notNull().default(0),
    discount_type: text("discount_type", { enum: ["percentage", "fixed"] }),
    discount_value: money("discount_value").notNull().default(0),
    grand_total: money("grand_total").notNull().default(0),
    include_tax: boolean("include_tax").notNull().default(true),
    notes: text("notes"),
    terms: text("terms"),
    payment_method: text("payment_method"),
    payment_methods: text("payment_methods").array().notNull().default(sql`'{}'::text[]`),
    payment_method_type: text("payment_method_type"),
    upi_id: text("upi_id"),
    paypal_email: text("paypal_email"),
    bank_name: text("bank_name"),
    bank_account_name: text("bank_account_name"),
    bank_account_number: text("bank_account_number"),
    bank_routing_number: text("bank_routing_number"),
    bank_swift_code: text("bank_swift_code"),
    client_name: text("client_name"),
    client_email: text("client_email"),
    client_address: text("client_address"),
    client_gst_id: text("client_gst_id"),
    share_token: uuid("share_token").notNull().defaultRandom().unique(),
    amount_paid: money("amount_paid").notNull().default(0),
    credit_total: money("credit_total").notNull().default(0),
    last_reminder_sent: timestamptz("last_reminder_sent"),
    reminder_count: integer("reminder_count").notNull().default(0),
    late_fee_type: text("late_fee_type", { enum: ["fixed", "percentage"] }),
    late_fee_value: money("late_fee_value"),
    parent_document_id: uuid("parent_document_id"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    index("documents_user_type_idx").on(t.user_id, t.type),
    index("documents_client_id_idx").on(t.client_id),
  ],
)

export const lineItems = pgTable(
  "line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    document_id: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    quantity: numeric("quantity", { precision: 10, scale: 2, mode: "number" }).notNull().default(1),
    rate: money("rate").notNull().default(0),
    tax_percent: numeric("tax_percent", { precision: 5, scale: 2, mode: "number" }).notNull().default(0),
    line_total: money("line_total").notNull().default(0),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: createdAt(),
  },
  (t) => [index("line_items_document_id_idx").on(t.document_id)],
)

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: userId(),
    name: text("name").notNull(),
    description: text("description"),
    unit: text("unit").notNull().default("unit"),
    rate: money("rate").notNull().default(0),
    tax_rate: numeric("tax_rate", { precision: 5, scale: 2, mode: "number" }).notNull().default(0),
    hsn_code: text("hsn_code"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [index("products_user_id_idx").on(t.user_id)],
)

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: userId().unique(),
    plan: text("plan").notNull().default("free"),
    status: text("status").notNull().default("active"),
    billing_interval: text("billing_interval", { enum: ["month", "year"] }),
    dodo_customer_id: text("dodo_customer_id"),
    dodo_subscription_id: text("dodo_subscription_id"),
    current_period_start: timestamptz("current_period_start"),
    current_period_end: timestamptz("current_period_end"),
    cancel_at_period_end: boolean("cancel_at_period_end").notNull().default(false),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [
    index("subscriptions_dodo_customer_id_idx").on(t.dodo_customer_id),
    index("subscriptions_dodo_subscription_id_idx").on(t.dodo_subscription_id),
  ],
)

export const usageTracking = pgTable(
  "usage_tracking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: userId(),
    month_year: text("month_year").notNull(),
    invoices_created: integer("invoices_created").notNull().default(0),
    quotations_created: integer("quotations_created").notNull().default(0),
    emails_sent: integer("emails_sent").notNull().default(0),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [unique("usage_tracking_user_month_key").on(t.user_id, t.month_year)],
)

export const paymentRecords = pgTable(
  "payment_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: userId(),
    document_id: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    amount: money("amount").notNull(),
    paid_at: timestamptz("paid_at").notNull().default(sql`now()`),
    method: text("method"),
    reference: text("reference"),
    notes: text("notes"),
    created_at: createdAt(),
  },
  (t) => [index("payment_records_document_id_idx").on(t.document_id)],
)

export const creditNotes = pgTable(
  "credit_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: userId(),
    document_id: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    number: text("number").notNull(),
    amount: money("amount").notNull(),
    reason: text("reason").notNull(),
    issued_at: timestamptz("issued_at").notNull().default(sql`now()`),
    created_at: createdAt(),
  },
  (t) => [
    index("credit_notes_document_id_idx").on(t.document_id),
    index("credit_notes_user_id_idx").on(t.user_id),
  ],
)

export const invoicePresets = pgTable(
  "invoice_presets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: userId(),
    name: text("name").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [unique("invoice_presets_user_name_key").on(t.user_id, t.name)],
)

export const recurringSchedules = pgTable(
  "recurring_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: userId(),
    source_document_id: uuid("source_document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    frequency: text("frequency").notNull(),
    next_run_at: timestamptz("next_run_at").notNull(),
    last_run_at: timestamptz("last_run_at"),
    ends_at: timestamptz("ends_at"),
    active: boolean("active").notNull().default(true),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => [index("recurring_schedules_due_idx").on(t.active, t.next_run_at)],
)

/** One late fee per invoice: the unique key makes the daily cron idempotent. */
export const lateFeeApplications = pgTable("late_fee_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: userId(),
  document_id: uuid("document_id")
    .notNull()
    .unique()
    .references(() => documents.id, { onDelete: "cascade" }),
  fee_type: text("fee_type").notNull(),
  fee_value: money("fee_value").notNull(),
  amount: money("amount").notNull(),
  created_at: createdAt(),
})

export const superAdmins = pgTable("super_admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: userId().unique(),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "super_admin"] }).notNull().default("admin"),
  created_at: createdAt(),
  updated_at: updatedAt(),
})

export const clientsRelations = relations(clients, ({ many }) => ({
  documents: many(documents),
}))

export const documentsRelations = relations(documents, ({ one, many }) => ({
  client: one(clients, { fields: [documents.client_id], references: [clients.id] }),
  line_items: many(lineItems),
  payment_records: many(paymentRecords),
  credit_notes: many(creditNotes),
}))

export const lineItemsRelations = relations(lineItems, ({ one }) => ({
  document: one(documents, { fields: [lineItems.document_id], references: [documents.id] }),
}))

export const paymentRecordsRelations = relations(paymentRecords, ({ one }) => ({
  document: one(documents, { fields: [paymentRecords.document_id], references: [documents.id] }),
}))

export const creditNotesRelations = relations(creditNotes, ({ one }) => ({
  document: one(documents, { fields: [creditNotes.document_id], references: [documents.id] }),
}))

export const recurringSchedulesRelations = relations(recurringSchedules, ({ one }) => ({
  source: one(documents, { fields: [recurringSchedules.source_document_id], references: [documents.id] }),
}))
