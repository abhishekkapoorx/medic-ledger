"use client"

import { useState } from "react"
import { MedicineDashboard } from "@/components/marketplace/medicine-dashboard"

// In a real application, this would come from authentication
const userTypes = ["seller", "buyer", "admin"] as const
type UserType = (typeof userTypes)[number]

export default function Home() {
  // For demo purposes, we'll use a state to switch between user types
  const [userType, setUserType] = useState<UserType>("seller")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4">
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Medicine Marketplace</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">View as:</span>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <MedicineDashboard userType={userType} />
      </div>
    </div>
  )
}
