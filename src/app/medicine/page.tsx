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

export default function MedicineHome() {
  const { role } = useSelector((state: RootState) => state.user)
  const [defaultTab, setDefaultTab] = useState("manufacturer")

  console.log("Role from Redux:", role)
  console.log("Default Tab:", defaultTab)

  useEffect(() => {
    
    if (role) {
      switch(role.toLowerCase()) {
        case "2":
          setDefaultTab("manufacturer")
          break
        case "0":
          setDefaultTab("patient")
          break
        case "4":
          setDefaultTab("distributor")
          break
        case "5":
          setDefaultTab("donor")
          break
        default:
          setDefaultTab("manufacturer") // Default fallback
      }
    }
  }, [role])
  
  const showAllTabs = !role // Show all tabs if no role is set
  
  // Function to render the appropriate interface based on defaultTab
  const renderInterface = () => {
    switch(defaultTab) {
      case "manufacturer":
        return <ManufacturerInterface />
      case "patient":
        return <PatientInterface />
      case "distributor":
        return <DistributorInterface />
      case "donor":
        return <DonorInterface />
      default:
        return <ManufacturerInterface />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Medicine Tracking System</h1>
      
      {!showAllTabs && (
        <div className="flex gap-4 mb-8 justify-center">
          <Button 
            onClick={() => setDefaultTab("manufacturer")} 
            variant={defaultTab === "manufacturer" ? "default" : "outline"}
          >
            Manufacturer
          </Button>
          <Button 
            onClick={() => setDefaultTab("patient")} 
            variant={defaultTab === "patient" ? "default" : "outline"}
          >
            Patient
          </Button>
          <Button 
            onClick={() => setDefaultTab("distributor")} 
            variant={defaultTab === "distributor" ? "default" : "outline"}
          >
            Distributor/Retailer
          </Button>
          <Button 
            onClick={() => setDefaultTab("donor")} 
            variant={defaultTab === "donor" ? "default" : "outline"}
          >
            Donor
          </Button>
        </div>
      )}

      <div className="mt-4">
        {renderInterface()}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Universal Components</h2>
        <UniversalComponents />
      </div>
    </div>
  )
}
