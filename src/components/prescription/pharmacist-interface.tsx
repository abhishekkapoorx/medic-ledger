"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Scan, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for demonstration
const mockMedicineNFTs = [
  { id: "MED001", name: "Amoxicillin 500mg", batch: "B12345", expiry: new Date("2024-06-15") },
  { id: "MED002", name: "Ibuprofen 400mg", batch: "B23456", expiry: new Date("2024-08-20") },
  { id: "MED003", name: "Metformin 850mg", batch: "B34567", expiry: new Date("2024-05-10") },
  { id: "MED004", name: "Atorvastatin 20mg", batch: "B45678", expiry: new Date("2024-07-25") },
]

const mockPatientAllergies = ["Penicillin", "Sulfa drugs"]

const mockDrugInteractions = [
  { drug1: "Amoxicillin", drug2: "Allopurinol", severity: "Moderate", description: "May increase risk of rash" },
]

const mockInsuranceCoverage = {
  provider: "HealthPlus",
  coveragePercent: 80,
  requiresPreAuth: false,
  copay: "$10",
}

export default function PharmacistInterface() {
  const [prescriptionId, setPrescriptionId] = useState("")
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([])
  const [validationResult, setValidationResult] = useState<null | {
    isValid: boolean
    message: string
    details?: string
  }>(null)

  const handleScan = () => {
    // Mock scan result - in a real app, this would use a QR scanner
    setPrescriptionId("RX001")
  }

  const handleValidate = () => {
    // Mock validation - in a real app, this would call the blockchain
    setValidationResult({
      isValid: true,
      message: "Prescription is valid and can be fulfilled",
      details: "Issued by Dr. Sarah Johnson on June 15, 2023. Expires on July 15, 2023.",
    })
  }

  const handleMedicineToggle = (medicineId: string) => {
    setSelectedMedicines((prev) =>
      prev.includes(medicineId) ? prev.filter((id) => id !== medicineId) : [...prev, medicineId],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - would connect to blockchain in real implementation
    alert("Prescription fulfilled successfully")
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="fulfill" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="fulfill">Fulfill Prescription</TabsTrigger>
          <TabsTrigger value="validate">Validation Panel</TabsTrigger>
        </TabsList>

        <TabsContent value="fulfill">
          <Card>
            <CardHeader>
              <CardTitle>Fulfill Prescription</CardTitle>
              <CardDescription>Process a patient's prescription</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prescriptionId">Prescription ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="prescriptionId"
                      value={prescriptionId}
                      onChange={(e) => setPrescriptionId(e.target.value)}
                      placeholder="Enter prescription ID or scan QR code"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={handleScan}>
                      <Scan className="h-4 w-4 mr-2" /> Scan
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Medicine NFTs Used</Label>
                  <div className="border rounded-md p-4 space-y-2">
                    {mockMedicineNFTs.map((medicine) => (
                      <div key={medicine.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={medicine.id}
                          checked={selectedMedicines.includes(medicine.id)}
                          onCheckedChange={() => handleMedicineToggle(medicine.id)}
                        />
                        <Label htmlFor={medicine.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{medicine.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Batch: {medicine.batch} | Expires: {format(medicine.expiry, "MMM d, yyyy")}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientVerification">Patient Verification</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">ID Check</SelectItem>
                      <SelectItem value="biometric">Biometric Verification</SelectItem>
                      <SelectItem value="otp">OTP Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pharmacyNotes">Pharmacy Notes</Label>
                  <Textarea id="pharmacyNotes" placeholder="Add any notes about this fulfillment" />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Fulfill Prescription
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="validate">
          <Card>
            <CardHeader>
              <CardTitle>Validation Panel</CardTitle>
              <CardDescription>Verify prescription validity and check for issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex space-x-2">
                <Input
                  value={prescriptionId}
                  onChange={(e) => setPrescriptionId(e.target.value)}
                  placeholder="Enter prescription ID to validate"
                  className="flex-1"
                />
                <Button onClick={handleValidate}>Validate</Button>
              </div>

              {validationResult && (
                <Alert
                  variant={validationResult.isValid ? "default" : "destructive"}
                  className={validationResult.isValid ? "bg-green-50 text-green-800 border-green-200" : ""}
                >
                  {validationResult.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>{validationResult.isValid ? "Valid Prescription" : "Invalid Prescription"}</AlertTitle>
                  <AlertDescription>
                    {validationResult.message}
                    {validationResult.details && <p className="mt-2 text-sm">{validationResult.details}</p>}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Patient Allergies</h3>
                  {mockPatientAllergies.length > 0 ? (
                    <div className="space-y-2">
                      {mockPatientAllergies.map((allergy, index) => (
                        <Alert key={index} variant="destructive" className="py-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="text-sm">{allergy}</AlertTitle>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No known allergies</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Drug Interactions</h3>
                  {mockDrugInteractions.length > 0 ? (
                    <div className="space-y-2">
                      {mockDrugInteractions.map((interaction, index) => (
                        <Alert
                          key={index}
                          variant="destructive"
                          color="warning"
                          className="py-2 bg-yellow-50 text-yellow-800 border-yellow-200"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="text-sm">
                            {interaction.drug1} + {interaction.drug2}
                          </AlertTitle>
                          <AlertDescription className="text-xs">
                            {interaction.severity} severity: {interaction.description}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No drug interactions detected</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Insurance Coverage</h3>
                <div className="p-4 border rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Provider:</span> {mockInsuranceCoverage.provider}
                    </div>
                    <div>
                      <span className="font-medium">Coverage:</span> {mockInsuranceCoverage.coveragePercent}%
                    </div>
                    <div>
                      <span className="font-medium">Pre-authorization:</span>{" "}
                      {mockInsuranceCoverage.requiresPreAuth ? "Required" : "Not Required"}
                    </div>
                    <div>
                      <span className="font-medium">Copay:</span> {mockInsuranceCoverage.copay}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Dosage Calculator</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Patient Weight (kg)</Label>
                    <Input id="weight" type="number" placeholder="Enter weight" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Patient Age</Label>
                    <Input id="age" type="number" placeholder="Enter age" />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Calculate Recommended Dosage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
