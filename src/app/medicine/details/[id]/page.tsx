"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, ArrowLeft, FileText, History, Thermometer } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for demonstration
const mockMedicineDetails = {
  tokenId: "123",
  name: "Paracetamol",
  batchNumber: "BATCH001",
  manufactureDate: new Date("2023-01-15"),
  expiryDate: new Date("2025-01-15"),
  isExpired: false,
  manufacturer: "PharmaCorp Inc.",
  manufacturerAddress: "0xABCD...1234",
  currentOwner: "0x1234...5678",
  composition: "Paracetamol 500mg",
  storageRequirements: "Store below 25°C in a dry place",
  ipfsDocumentLink: "ipfs://QmXyZ...",
  transferHistory: [
    { from: "0xManufacturer", to: "0xDistributor", date: new Date("2023-01-15"), role: "Manufacturer" },
    { from: "0xDistributor", to: "0xRetailer", date: new Date("2023-02-01"), role: "Distributor" },
    { from: "0xRetailer", to: "0xPatient", date: new Date("2023-03-01"), role: "Retailer" },
  ],
}

export default function MedicineDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [medicine, setMedicine] = useState(mockMedicineDetails)

  // In a real app, this would fetch the medicine details from the blockchain
  useEffect(() => {
    // Fetch medicine details using params.id
    console.log(`Fetching medicine with ID: ${params.id}`)
    // For demo, we're using mock data
  }, [params.id])

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{medicine.name}</h1>
          <p className="text-muted-foreground">Token ID: {medicine.tokenId}</p>
        </div>

        {medicine.isExpired ? (
          <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Expired
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-3 py-1 text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Valid
          </Badge>
        )}
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Transfer History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medicine Information</CardTitle>
                <CardDescription>Basic details about this medicine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">Batch Number:</span>
                  <span>{medicine.batchNumber}</span>

                  <span className="font-medium">Manufacture Date:</span>
                  <span>{medicine.manufactureDate.toLocaleDateString()}</span>

                  <span className="font-medium">Expiry Date:</span>
                  <span>{medicine.expiryDate.toLocaleDateString()}</span>

                  <span className="font-medium">Manufacturer:</span>
                  <span>{medicine.manufacturer}</span>

                  <span className="font-medium">Current Owner:</span>
                  <span className="font-mono">{medicine.currentOwner}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
                <CardDescription>Composition and storage information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Composition:</span>
                    <p className="mt-1 text-sm">{medicine.composition}</p>
                  </div>

                  <div>
                    <span className="font-medium">Storage Requirements:</span>
                    <div className="flex items-center mt-1">
                      <Thermometer className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">{medicine.storageRequirements}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>Complete ownership chain of this medicine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-dashed border-muted-foreground/30 space-y-8">
                {medicine.transferHistory.map((transfer, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[25px] w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                    <div className="pl-6">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {transfer.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{transfer.date.toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 text-sm">
                        <div>
                          From: <span className="font-mono">{transfer.from}</span>
                        </div>
                        <div>
                          To: <span className="font-mono">{transfer.to}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Related documents and certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 border rounded-lg flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-center mb-4">Medicine Certificate</p>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View on IPFS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
