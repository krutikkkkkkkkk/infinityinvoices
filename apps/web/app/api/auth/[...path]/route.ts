import { auth } from "@/lib/auth/server"

export const { GET, POST, PUT, PATCH, DELETE } = auth.handler()
