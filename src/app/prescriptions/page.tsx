import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DoctorInterface from "@/components/prescription/doctor-interface"
import PatientInterface from "@/components/prescription/patient-interface"
import PharmacistInterface from "@/components/prescription/pharmacist-interface"
import AdminInterface from "@/components/prescription/admin-interface"
import UniversalComponents from "@/components/prescription/universal-components"

export default function Home() {
  // In a real app, this would come from authentication or context
  // For demo purposes, we're using tabs to switch between user roles
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Prescription Management System</h1>

      <Tabs defaultValue="doctor" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="doctor">Doctor</TabsTrigger>
          <TabsTrigger value="patient">Patient</TabsTrigger>
          <TabsTrigger value="pharmacist">Pharmacist</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="doctor">
          <DoctorInterface />
        </TabsContent>

        <TabsContent value="patient">
          <PatientInterface />
        </TabsContent>

        <TabsContent value="pharmacist">
          <PharmacistInterface />
        </TabsContent>

        <TabsContent value="admin">
          <AdminInterface />
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Universal Components</h2>
        <UniversalComponents />
      </div>
    </div>
  )
}
