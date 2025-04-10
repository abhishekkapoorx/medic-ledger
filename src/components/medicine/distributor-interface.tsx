
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Thermometer, Calendar } from "lucide-react"

// Mock data for demonstration
const mockInventory = [
  {
    tokenId: "1",
    name: "Paracetamol",
    batchNumber: "BATCH001",
    acquisitionDate: new Date("2023-02-01"),
    storageTemp: "15-25°C",
    optimalSellBy: new Date("2024-06-15"),
    expiryDate: new Date("2025-01-15"),
    previousOwners: ["0xManufacturer"],
  },
  {
    tokenId: "2",
    name: "Amoxicillin",
    batchNumber: "BATCH002",
    acquisitionDate: new Date("2023-03-10"),
    storageTemp: "2-8°C",
    optimalSellBy: new Date("2023-12-10"),
    expiryDate: new Date("2024-06-20"),
    previousOwners: ["0xManufacturer", "0xDistributor"],
  },
  {
    tokenId: "3",
    name: "Ibuprofen",
    batchNumber: "BATCH003",
    acquisitionDate: new Date("2023-04-05"),
    storageTemp: "15-25°C",
    optimalSellBy: new Date("2024-04-05"),
    expiryDate: new Date("2025-04-05"),
    previousOwners: ["0xManufacturer"],
  },
]

export default function DistributorInterface() {
  const [selectedMedicine, setSelectedMedicine] = useState("")
  const [buyerType, setBuyerType] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - would connect to blockchain in real implementation
    alert("Medicine sale initiated")
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="sell" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="sell">Sell Medicine</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
        </TabsList>

        <TabsContent value="sell">
          <Card>
            <CardHeader>
              <CardTitle>Sell Medicine</CardTitle>
              <CardDescription>Transfer ownership of medicine to a buyer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="selectMedicine">Select Medicine NFT</Label>
                  <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a medicine from your inventory" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInventory.map((medicine) => (
                        <SelectItem key={medicine.tokenId} value={medicine.tokenId}>
                          {medicine.name} (Batch: {medicine.batchNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input id="price" type="number" step="0.001" placeholder="0.00" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerType">Buyer Type</Label>
                  <Select value={buyerType} onValueChange={setBuyerType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select buyer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="retailer">Retailer</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulkDiscount">Bulk Discount (%)</Label>
                  <Input id="bulkDiscount" type="number" placeholder="0" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerAddress">Buyer Address</Label>
                  <Input id="buyerAddress" placeholder="0x..." />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Initiate Sale
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Manage your medicine inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Optimal Sell-by</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInventory.map((medicine) => {
                    const today = new Date()
                    const sellByStatus = medicine.optimalSellBy > today ? "success" : "warning"

                    return (
                      <TableRow key={medicine.tokenId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{medicine.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {medicine.tokenId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{medicine.batchNumber}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(medicine.acquisitionDate, "MMM d, yyyy")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Thermometer className="h-4 w-4 mr-1 text-blue-500" />
                            {medicine.storageTemp}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sellByStatus === "success" ? "outline" : "secondary"}>
                            {format(medicine.optimalSellBy, "MMM d, yyyy")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Sell
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
