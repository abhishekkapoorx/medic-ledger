"use client"

import { useEffect, useState } from "react"
import { MedicineDashboard } from "@/components/marketplace/medicine-dashboard"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import useWallet from "@/hooks/useWallet"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// User type for the marketplace
type UserType = "seller" | "buyer" | "admin"

export default function MarketplacePage() {
  const { role } = useSelector((state: RootState) => state.user)
  const { isConnected, connectWallet } = useWallet()
  const [userType, setUserType] = useState<UserType>("buyer")
  const [loading, setLoading] = useState(true)

  // Determine marketplace view based on user role
  useEffect(() => {
    setLoading(true)
    
    if (role) {
      switch(role.toLowerCase()) {
        case "2": // Manufacturer
          setUserType("seller")
          break
        case "0": // Patient
          setUserType("buyer")
          break
        case "4": // Distributor
          setUserType("seller") // Distributors are primarily sellers in marketplace
          break
        case "5": // Donor
          setUserType("seller") // Donors can list medicines to donate
          break
        default:
          setUserType("buyer") // Default to buyer view
      }
    } else {
      // If no role is set, default to buyer
      setUserType("buyer")
    }
    
    setLoading(false)
  }, [role])

  // Render the connect wallet UI when not connected
  const renderWalletConnection = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 mb-6 border rounded-lg min-h-[300px]">
        <h2 className="text-xl mb-4">Connect your wallet to access the Marketplace</h2>
        <Button onClick={connectWallet} className="w-full md:w-auto">
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4">
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Medicine Marketplace</h1>
          {!loading && isConnected && (
            <div className="py-1 px-3 bg-primary/10 text-primary rounded-md text-sm">
              Viewing as: <span className="font-semibold">{userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p>Loading marketplace...</p>
          </div>
        ) : !isConnected ? (
          renderWalletConnection()
        ) : (
          <MedicineDashboard userType={userType} />
        )}
      </div>
    </div>
  )
}
