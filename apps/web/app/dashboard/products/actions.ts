"use server"

import { and, asc, db, eq, products } from "@infinity/db"
import { requireUser } from "@/lib/auth/server"
import type { Product } from "@/lib/types"

export interface ProductInput {
  name: string
  description: string | null
  unit: string
  rate: number
  tax_rate: number
  hsn_code: string | null
}

function toRow(input: ProductInput) {
  return {
    name: input.name.trim(),
    description: input.description || null,
    unit: input.unit || "unit",
    rate: Number(input.rate) || 0,
    tax_rate: Number(input.tax_rate) || 0,
    hsn_code: input.hsn_code || null,
  }
}

export async function listProducts(): Promise<Product[]> {
  const user = await requireUser()
  return db.select().from(products).where(eq(products.user_id, user.id)).orderBy(asc(products.name))
}

/** Creates a product, or updates it when `productId` is given (only the user's own). */
export async function saveProduct(input: ProductInput, productId?: string) {
  const user = await requireUser()
  if (!input.name?.trim()) throw new Error("Product name is required")

  if (productId) {
    await db
      .update(products)
      .set(toRow(input))
      .where(and(eq(products.id, productId), eq(products.user_id, user.id)))
  } else {
    await db.insert(products).values({ ...toRow(input), user_id: user.id })
  }
}

export async function deleteProduct(productId: string) {
  const user = await requireUser()
  await db.delete(products).where(and(eq(products.id, productId), eq(products.user_id, user.id)))
}
