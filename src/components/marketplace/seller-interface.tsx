"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Edit, Eye, Trash } from "lucide-react"

// Mock data for active listings
const mockListings = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    price: "0.05",
    isDonation: false,
    expiryDays: 180,
    viewCount: 24,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    price: "0",
    isDonation: true,
    expiryDays: 90,
    viewCount: 42,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    price: "0.03",
    isDonation: false,
    expiryDays: 365,
    viewCount: 18,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
]

// Mock data for medicine NFTs owned by the seller
const ownedMedicineNFTs = [
  { id: "nft1", name: "Paracetamol 500mg", expiryDate: "2025-06-30" },
  { id: "nft2", name: "Amoxicillin 250mg", expiryDate: "2024-12-15" },
  { id: "nft3", name: "Ibuprofen 400mg", expiryDate: "2026-01-10" },
  { id: "nft4", name: "Aspirin 100mg", expiryDate: "2025-08-22" },
]

export function SellerInterface() {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list">List Medicine</TabsTrigger>
        <TabsTrigger value="active">Active Listings</TabsTrigger>
      </TabsList>
      <TabsContent value="list">
        <ListMedicineForm />
      </TabsContent>
      <TabsContent value="active">
        <ActiveListings />
      </TabsContent>
    </Tabs>
  )
}

function ListMedicineForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>List Medicine</CardTitle>
        <CardDescription>Create a new listing for your medicine NFT</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="medicine-nft">Select Medicine NFT</Label>
          <Select>
            <SelectTrigger id="medicine-nft">
              <SelectValue placeholder="Select a medicine NFT" />
            </SelectTrigger>
            <SelectContent>
              {ownedMedicineNFTs.map((nft) => (
                <SelectItem key={nft.id} value={nft.id}>
                  {nft.name} (Expires: {new Date(nft.expiryDate).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing-type">Listing Type</Label>
          <RadioGroup defaultValue="sale" className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sale" id="sale" />
              <Label htmlFor="sale">For Sale</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="donation" id="donation" />
              <Label htmlFor="donation">Donation</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (ETH)</Label>
          <Input id="price" type="number" step="0.001" min="0" placeholder="0.00" />
          <p className="text-xs text-muted-foreground">Enter 0 for donations</p>
        </div>

        <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Expiry Date Warning</h4>
              <p className="text-sm text-amber-700">
                This medicine will expire in approximately 180 days. Buyers will be notified of this expiry date.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox id="terms" />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I verify this medicine is authentic
            </Label>
            <p className="text-xs text-muted-foreground">
              By checking this box, you confirm that the medicine is genuine and matches the NFT description.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create Listing</Button>
      </CardFooter>
    </Card>
  )
}

function ActiveListings() {
  return (
    <div className="space-y-4">
      {mockListings.map((listing) => (
        <Card key={listing.id}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-shrink-0">
                <img
                  src={listing.imageUrl || "/placeholder.svg"}
                  alt={listing.name}
                  className="w-24 h-24 rounded-md object-cover border"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{listing.name}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {listing.isDonation ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Donation
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {listing.price} ETH
                    </Badge>
                  )}

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Expires in {listing.expiryDays} days</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{listing.viewCount} views</span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-1">Buyer Offers</h4>
                  {listing.isDonation ? (
                    <p className="text-sm text-muted-foreground">3 donation requests received</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No offers yet</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
