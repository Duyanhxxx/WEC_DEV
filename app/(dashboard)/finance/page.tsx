import FinanceClient from "./finance-client"
import { getUserRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function FinancePage() {
  const role = await getUserRole()
  // Finance is now open to all, but we might want to pass the role to the client for conditional rendering if needed
  
  return <FinanceClient />
}
