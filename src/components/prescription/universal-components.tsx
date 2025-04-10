"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { FileText, CheckCircle, Clock, AlertTriangle, FileCheck, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock data for demonstration
const mockPrescriptionTimeline = [
  { type: "Created", date: new Date("2023-06-15"), actor: "Dr. Sarah Johnson", details: "Prescription created" },
  {
    type: "Fulfilled",
    date: new Date("2023-06-16"),
    actor: "MedPlus Pharmacy",
    details: "Prescription fulfilled by John Smith",
  },
  {
    type: "Transferred",
    date: new Date("2023-06-16"),
    actor: "System",
    details: "Medicine NFTs transferred to patient",
  },
]

export default function UniversalComponents() {
  const [validityResult, setValidityResult] = useState<null | { isValid: boolean; message: string }>(null)
  const [prescriptionId, setPrescriptionId] = useState("")

  const handleCheckValidity = () => {
    // Mock validity check - in a real app, this would call the blockchain
    setValidityResult({
      isValid: Math.random() > 0.3, // 70% chance of being valid for demo
      message: Math.random() > 0.3 ? "Prescription is valid and can be used" : "Prescription has expired",
    })
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Prescription Timeline</CardTitle>
          <CardDescription>Track the lifecycle of a prescription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 border-l-2 border-dashed border-muted-foreground/30 space-y-8">
            {mockPrescriptionTimeline.map((event, index) => (
              <div key={index} className="relative">
                <div
                  className={`absolute -left-[25px] w-10 h-10 rounded-full flex items-center justify-center ${
                    event.type === "Created"
                      ? "bg-green-100"
                      : event.type === "Fulfilled"
                        ? "bg-green-100"
                        : "bg-purple-100"
                  }`}
                >
                  {event.type === "Created" ? (
                    <FileText className="h-5 w-5 text-green-600" />
                  ) : event.type === "Fulfilled" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div className="pl-6">
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={`mr-2 ${
                        event.type === "Created"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : event.type === "Fulfilled"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {event.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{format(event.date, "MMM d, yyyy h:mm a")}</span>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium">{event.actor}</p>
                    <p className="text-sm text-muted-foreground">{event.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>IPFS Document Viewer</CardTitle>
            <CardDescription>View prescription documents</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center mb-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-center mb-4">Upload or enter IPFS hash to view prescription document</p>
            <div className="flex space-x-2 w-full">
              <Input placeholder="Enter IPFS hash" className="flex-1" />
              <Button>View</Button>
            </div>
            <div className="flex items-center mt-4 text-xs text-muted-foreground">
              <FileCheck className="h-3 w-3 mr-1" />
              Document signature verification available
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validity Checker</CardTitle>
            <CardDescription>Check if a prescription is valid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter prescription ID"
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCheckValidity}>
                <Search className="h-4 w-4 mr-2" /> Check
              </Button>
            </div>

            {validityResult && (
              <div
                className={`p-4 rounded-lg flex items-center ${
                  validityResult.isValid ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                {validityResult.isValid ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 mr-2" />
                )}
                <div>
                  <p className="font-medium">
                    {validityResult.isValid ? "Valid Prescription" : "Invalid Prescription"}
                  </p>
                  <p className="text-sm">{validityResult.message}</p>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-2 mt-4">
              <p>• Multi-chain verification supported</p>
              <p>• Counterfeit detection enabled</p>
              <p>• Real-time blockchain validation</p>
              <p className="text-[10px] mt-4">
                Legal Disclaimer: This verification is provided for informational purposes only and should be confirmed
                by a licensed healthcare professional.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
