"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"

// Mock data for demonstration
const mockVerifiedMedicine = {
  name: "Paracetamol",
  manufacturer: "0xABCD...1234",
  batchNumber: "BATCH001",
  manufactureDate: new Date("2023-01-15"),
  expiryDate: new Date("2025-01-15"),
  isExpired: false,
  composition: "Paracetamol 500mg",
  storageRequirements: "Store below 25°C in a dry place",
  ownershipChain: [
    { owner: "0xManufacturer", date: new Date("2023-01-15") },
    { owner: "0xDistributor", date: new Date("2023-02-01") },
    { owner: "0xRetailer", date: new Date("2023-02-15") },
    { owner: "0xPatient", date: new Date("2023-03-01") },
  ],
}

const mockOwnedMedicines = [
  {
    id: "1",
    name: "Paracetamol",
    batchNumber: "BATCH001",
    expiryDate: new Date("2025-01-15"),
    isVerified: true,
    requiresPrescription: false,
    ipfsImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Amoxicillin",
    batchNumber: "BATCH002",
    expiryDate: new Date("2024-06-20"),
    isVerified: true,
    requiresPrescription: true,
    ipfsImage: "/placeholder.svg?height=100&width=100",
  },
]

export default function PatientInterface() {
  const [medicineAddress, setMedicineAddress] = useState("")
  const [showVerification, setShowVerification] = useState(false)

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setShowVerification(true)
  }

  const daysUntilExpiry = (date: Date) => {
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="verify" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="verify">Verify Medicine</TabsTrigger>
          <TabsTrigger value="owned">My Medicines</TabsTrigger>
        </TabsList>

        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Verification</CardTitle>
              <CardDescription>Verify the authenticity of your medicine</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter medicine token address or scan QR code"
                    value={medicineAddress}
                    onChange={(e) => setMedicineAddress(e.target.value)}
                  />
                  <Button type="submit">Verify</Button>
                </div>
              </form>

              {showVerification && (
                <div className="mt-6 border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{mockVerifiedMedicine.name}</h3>
                    {mockVerifiedMedicine.isExpired ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Expired
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Valid
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Manufacturer:</span>
                      <span>{mockVerifiedMedicine.manufacturer}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Batch Number:</span>
                      <span>{mockVerifiedMedicine.batchNumber}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Manufacture Date:</span>
                      <span>{mockVerifiedMedicine.manufactureDate.toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Expiry Date:</span>
                      <span>{mockVerifiedMedicine.expiryDate.toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Composition:</span>
                      <span>{mockVerifiedMedicine.composition}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Storage:</span>
                      <span>{mockVerifiedMedicine.storageRequirements}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Ownership Chain</h4>
                    <div className="space-y-2">
                      {mockVerifiedMedicine.ownershipChain.map((item, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                          <span>
                            {item.owner} • {item.date.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owned">
          <div className="grid md:grid-cols-2 gap-4">
            {mockOwnedMedicines.map((medicine) => (
              <Card key={medicine.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                      <img
                        src={medicine.ipfsImage || "/placeholder.svg"}
                        alt={medicine.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{medicine.name}</h3>
                        {medicine.isVerified && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Batch: {medicine.batchNumber}</p>
                      <div className="flex items-center mt-1 text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Expires in {daysUntilExpiry(medicine.expiryDate)} days</span>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <Button size="sm" variant="outline">
                          Transfer
                        </Button>
                        <Button size="sm" variant="outline">
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
