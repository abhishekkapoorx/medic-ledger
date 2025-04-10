"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for demonstration
const mockMintedMedicines = [
  {
    tokenId: "1",
    name: "Paracetamol",
    batchNumber: "BATCH001",
    manufactureDate: new Date("2023-01-15"),
    expiryDate: new Date("2025-01-15"),
    currentOwner: "0x1234...5678",
    ipfsLink: "ipfs://QmXyZ...",
    transferHistory: [{ from: "0x0000...0000", to: "0x1234...5678", date: new Date("2023-01-15") }],
  },
  {
    tokenId: "2",
    name: "Amoxicillin",
    batchNumber: "BATCH002",
    manufactureDate: new Date("2023-02-20"),
    expiryDate: new Date("2024-02-20"),
    currentOwner: "0x1234...5678",
    ipfsLink: "ipfs://QmABC...",
    transferHistory: [{ from: "0x0000...0000", to: "0x1234...5678", date: new Date("2023-02-20") }],
  },
]

export default function ManufacturerInterface() {
  const [date, setDate] = useState<Date>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - would connect to blockchain in real implementation
    alert("Medicine minting initiated")
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Mint New Medicine</CardTitle>
          <CardDescription>Create a new medicine NFT on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicineName">Medicine Name</Label>
              <Input id="medicineName" placeholder="Enter medicine name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input id="batchNumber" placeholder="Enter batch number" />
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="composition">Composition</Label>
              <Textarea id="composition" placeholder="Enter medicine composition" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storageConditions">Storage Conditions</Label>
              <Input id="storageConditions" placeholder="E.g., Store below 25°C" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipfsHash">IPFS Document</Label>
              <div className="flex items-center space-x-2">
                <Input id="ipfsHash" placeholder="IPFS Hash" />
                <Button type="button" size="icon" variant="outline">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Mint Medicine NFT
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Minted Medicines</CardTitle>
          <CardDescription>View all medicines you have created</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMintedMedicines.map((medicine) => (
                <TableRow key={medicine.tokenId}>
                  <TableCell>{medicine.tokenId}</TableCell>
                  <TableCell>{medicine.name}</TableCell>
                  <TableCell>{medicine.batchNumber}</TableCell>
                  <TableCell>{format(medicine.expiryDate, "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
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
