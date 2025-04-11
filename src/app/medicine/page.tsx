'use client'
import ManufacturerInterface from "@/components/medicine/manufacturer-interface"
import PatientInterface from "@/components/medicine/patient-interface"
import DistributorInterface from "@/components/medicine/distributor-interface"
import DonorInterface from "@/components/medicine/donor-interface"
import UniversalComponents from "@/components/medicine/universal-components"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import useWallet from "@/hooks/useWallet"
import { Loader2 } from "lucide-react"

export default function MedicineHome() {
  const { role } = useSelector((state: RootState) => state.user)
  const { isConnected, connectWallet } = useWallet()
  const [loading, setLoading] = useState(true)
  const [userInterface, setUserInterface] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    setLoading(true)
    
    if (role) {
      switch(role.toLowerCase()) {
        case "2":
          setUserInterface(<ManufacturerInterface />)
          break
        case "0":
          setUserInterface(<PatientInterface />)
          break
        case "3":
        case "4":
          setUserInterface(<DistributorInterface />)
          break
        case "5":
          setUserInterface(<DonorInterface />)
          break
        default:
          // Default to manufacturer if role is not recognized
          setUserInterface(<PatientInterface />)
      }
    } else {
      // If no role is set, default to manufacturer interface
      setUserInterface(<ManufacturerInterface />)
    }
    
    setLoading(false)
  }, [role])

  // Render the connect wallet UI when not connected
  const renderWalletConnection = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 mb-6 border rounded-lg min-h-[300px]">
        <h2 className="text-xl mb-4">Connect your wallet to access Medicine Tracking System</h2>
        <Button onClick={connectWallet} className="w-full md:w-auto">
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Medicine Tracking System</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Loading interface...</p>
        </div>
      ) : !isConnected ? (
        renderWalletConnection()
      ) : (
        <div className="mt-4">
          {userInterface}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Universal Components</h2>
        <UniversalComponents />
      </div>
    </div>
  )
}
