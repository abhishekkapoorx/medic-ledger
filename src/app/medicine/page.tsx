import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ManufacturerInterface from "@/components/medicine/manufacturer-interface"
import PatientInterface from "@/components/medicine/patient-interface"
import DistributorInterface from "@/components/medicine/distributor-interface"
import DonorInterface from "@/components/medicine/donor-interface"
import UniversalComponents from "@/components/medicine/universal-components"

export default function MedicineHome() {
  // In a real app, this would come from authentication or context
  // For demo purposes, we're using tabs to switch between user types
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Medicine Tracking System</h1>

      <Tabs defaultValue="manufacturer" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="manufacturer">Manufacturer</TabsTrigger>
          <TabsTrigger value="patient">Patient</TabsTrigger>
          <TabsTrigger value="distributor">Distributor/Retailer</TabsTrigger>
          <TabsTrigger value="donor">Donor</TabsTrigger>
        </TabsList>

        <TabsContent value="manufacturer">
          <ManufacturerInterface />
        </TabsContent>

        <TabsContent value="patient">
          <PatientInterface />
        </TabsContent>

        <TabsContent value="distributor">
          <DistributorInterface />
        </TabsContent>

        <TabsContent value="donor">
          <DonorInterface />
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Universal Components</h2>
        <UniversalComponents />
      </div>
    </div>
  )
}
