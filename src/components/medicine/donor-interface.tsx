"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Heart } from "lucide-react"

// Mock data for demonstration
const mockOwnedMedicines = [
  {
    tokenId: "1",
    name: "Paracetamol",
    batchNumber: "BATCH001",
    expiryDate: new Date("2025-01-15"),
  },
  {
    tokenId: "2",
    name: "Amoxicillin",
    batchNumber: "BATCH002",
    expiryDate: new Date("2024-06-20"),
  },
]

const mockDonationHistory = [
  {
    id: "1",
    medicineName: "Paracetamol",
    recipient: "0xRecipient1",
    timestamp: new Date("2023-05-10"),
    status: "Used",
    thankYouNote: "Thank you for your donation! It helped me recover from my fever.",
  },
  {
    id: "2",
    medicineName: "Vitamin C",
    recipient: "0xRecipient2",
    timestamp: new Date("2023-06-15"),
    status: "Active",
    thankYouNote: null,
  },
]

export default function DonorInterface() {
  const [selectedMedicine, setSelectedMedicine] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - would connect to blockchain in real implementation
    alert("Medicine donation initiated")
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Donate Medicine</CardTitle>
          <CardDescription>Donate medicine to someone in need</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selectMedicine">Select Medicine NFT</Label>
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a medicine to donate" />
                </SelectTrigger>
                <SelectContent>
                  {mockOwnedMedicines.map((medicine) => (
                    <SelectItem key={medicine.tokenId} value={medicine.tokenId}>
                      {medicine.name} (Expires: {format(medicine.expiryDate, "MMM d, yyyy")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientAddress">Recipient Address</Label>
              <Input id="recipientAddress" placeholder="0x..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescriptionId">Prescription ID (Optional)</Label>
              <Input id="prescriptionId" placeholder="Enter prescription ID if applicable" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Donation Message (Optional)</Label>
              <Textarea id="message" placeholder="Add a personal message to the recipient" />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Donate Medicine
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>View your past medicine donations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Thank You Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDonationHistory.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{donation.medicineName}</TableCell>
                  <TableCell className="font-mono text-xs">{donation.recipient}</TableCell>
                  <TableCell>{format(donation.timestamp, "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        donation.status === "Used" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {donation.thankYouNote ? (
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-xs italic">{donation.thankYouNote}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No note yet</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
