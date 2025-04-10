"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays } from "date-fns"
import { QrCode, Clock, CheckCircle, AlertTriangle, Calendar, Pill, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Mock data for demonstration
const mockPrescriptionDetails = {
  id: "RX001",
  doctor: {
    name: "Dr. Sarah Johnson",
    specialty: "General Practitioner",
    address: "0xdoc1",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  issueDate: new Date("2023-06-15"),
  expiryDate: new Date("2023-07-15"),
  digitalSignature: "0x1a2b3c4d5e6f...",
  medications: [
    { name: "Amoxicillin", dosage: "500mg", frequency: "3 times daily", instructions: "Take with food" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "As needed", instructions: "Take for pain" },
  ],
  fulfillmentHistory: [{ date: new Date("2023-06-16"), pharmacy: "MedPlus Pharmacy", pharmacist: "John Smith" }],
}

const mockPrescriptionHistory = [
  {
    id: "RX001",
    doctor: "Dr. Sarah Johnson",
    issueDate: new Date("2023-06-15"),
    expiryDate: new Date("2023-07-15"),
    status: "Valid",
    medications: ["Amoxicillin", "Ibuprofen"],
    refillsRemaining: 2,
    insurance: { provider: "HealthPlus", coveragePercent: 80 },
  },
  {
    id: "RX002",
    doctor: "Dr. Michael Brown",
    issueDate: new Date("2023-05-10"),
    expiryDate: new Date("2023-06-10"),
    status: "Expired",
    medications: ["Lisinopril"],
    refillsRemaining: 0,
    insurance: { provider: "MediCare", coveragePercent: 90 },
  },
  {
    id: "RX003",
    doctor: "Dr. Emily Davis",
    issueDate: new Date("2023-06-01"),
    expiryDate: new Date("2023-07-01"),
    status: "Used",
    medications: ["Metformin", "Atorvastatin"],
    refillsRemaining: 3,
    insurance: { provider: "HealthPlus", coveragePercent: 75 },
  },
]

export default function PatientInterface() {
  const [activeTab, setActiveTab] = useState("current")

  const getDaysRemaining = (expiryDate: Date) => {
    return Math.max(0, differenceInDays(expiryDate, new Date()))
  }

  const getExpiryProgress = (issueDate: Date, expiryDate: Date) => {
    const totalDays = differenceInDays(expiryDate, issueDate)
    const elapsed = differenceInDays(new Date(), issueDate)
    return Math.min(100, Math.max(0, (elapsed / totalDays) * 100))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Valid":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Valid
          </Badge>
        )
      case "Expired":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="mr-1 h-3 w-3" /> Expired
          </Badge>
        )
      case "Used":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Used
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="current">Current Prescription</TabsTrigger>
          <TabsTrigger value="history">Prescription History</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Prescription Details</CardTitle>
                <CardDescription>View your current prescription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={mockPrescriptionDetails.doctor.avatar}
                      alt={mockPrescriptionDetails.doctor.name}
                    />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{mockPrescriptionDetails.doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{mockPrescriptionDetails.doctor.specialty}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mockPrescriptionDetails.doctor.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(mockPrescriptionDetails.issueDate, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(mockPrescriptionDetails.expiryDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Validity</p>
                    <p className="text-sm">{getDaysRemaining(mockPrescriptionDetails.expiryDate)} days remaining</p>
                  </div>
                  <Progress
                    value={getExpiryProgress(mockPrescriptionDetails.issueDate, mockPrescriptionDetails.expiryDate)}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Medications</h3>
                  <div className="space-y-4">
                    {mockPrescriptionDetails.medications.map((medication, index) => (
                      <div key={index} className="p-4 border rounded-md">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <Pill className="h-5 w-5 mr-2 text-primary" />
                            <h4 className="font-medium">{medication.name}</h4>
                          </div>
                          <Badge variant="outline">{medication.dosage}</Badge>
                        </div>
                        <div className="mt-2 text-sm">
                          <p>
                            <span className="font-medium">Frequency:</span> {medication.frequency}
                          </p>
                          <p>
                            <span className="font-medium">Instructions:</span> {medication.instructions}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Fulfillment History</h3>
                  {mockPrescriptionDetails.fulfillmentHistory.length > 0 ? (
                    <div className="space-y-2">
                      {mockPrescriptionDetails.fulfillmentHistory.map((fulfillment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{fulfillment.pharmacy}</p>
                            <p className="text-sm text-muted-foreground">Pharmacist: {fulfillment.pharmacist}</p>
                          </div>
                          <p className="text-sm">{format(fulfillment.date, "MMM d, yyyy")}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No fulfillment history yet</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Digital Signature</h3>
                  <p className="text-xs font-mono bg-muted p-2 rounded">{mockPrescriptionDetails.digitalSignature}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>Show this to your pharmacist</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="w-48 h-48 bg-white border flex items-center justify-center mb-4">
                  <QrCode className="w-40 h-40" />
                </div>
                <p className="text-sm text-center">Prescription ID: {mockPrescriptionDetails.id}</p>
                <Button variant="outline" className="mt-4 w-full">
                  Download QR Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-6">
            {mockPrescriptionHistory.map((prescription) => (
              <Card key={prescription.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Prescription #{prescription.id}</h3>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Issued by {prescription.doctor} on {format(prescription.issueDate, "MMM d, yyyy")}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {prescription.medications.map((med, idx) => (
                          <Badge key={idx} variant="secondary">
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-sm">
                        <span className="font-medium">Insurance:</span> {prescription.insurance.provider} (
                        {prescription.insurance.coveragePercent}% coverage)
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Refills:</span> {prescription.refillsRemaining} remaining
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={prescription.status !== "Valid" || prescription.refillsRemaining === 0}
                          className="flex items-center"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Request Refill
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
