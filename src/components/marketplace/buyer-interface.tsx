"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, FileText, Star, Upload } from "lucide-react"

// Mock data for marketplace listings
const marketplaceListings = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    price: "0.05",
    expiryDays: 180,
    requiresPrescription: false,
    sellerRating: 4.8,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    price: "0",
    isDonation: true,
    expiryDays: 90,
    requiresPrescription: true,
    sellerRating: 4.5,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    price: "0.03",
    expiryDays: 365,
    requiresPrescription: false,
    sellerRating: 5.0,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "4",
    name: "Antibiotics 500mg",
    price: "0.08",
    expiryDays: 240,
    requiresPrescription: true,
    sellerRating: 4.7,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
]

export function BuyerInterface() {
  const [activeTab, setActiveTab] = useState("marketplace")

  return (
    <Tabs defaultValue="marketplace" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        <TabsTrigger value="purchase">Purchase</TabsTrigger>
        <TabsTrigger value="donation">Request Donation</TabsTrigger>
      </TabsList>
      <TabsContent value="marketplace">
        <MarketplaceBrowser />
      </TabsContent>
      <TabsContent value="purchase">
        <PurchaseMedicineForm />
      </TabsContent>
      <TabsContent value="donation">
        <DonationRequestForm />
      </TabsContent>
    </Tabs>
  )
}

function MarketplaceBrowser() {
  const [priceRange, setPriceRange] = useState([0, 10])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your medicine search</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="price-range">Price Range (ETH)</Label>
              <span className="text-sm text-muted-foreground">
                {priceRange[0]} - {priceRange[1]}
              </span>
            </div>
            <Slider id="price-range" defaultValue={[0, 10]} max={10} step={0.01} onValueChange={setPriceRange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select defaultValue="expiry">
                <SelectTrigger id="sort-by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="expiry">Expiry Date</SelectItem>
                  <SelectItem value="rating">Seller Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Select defaultValue="all">
                <SelectTrigger id="prescription">
                  <SelectValue placeholder="Prescription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Medicines</SelectItem>
                  <SelectItem value="required">Prescription Required</SelectItem>
                  <SelectItem value="not-required">No Prescription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {marketplaceListings.map((listing) => (
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
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm">{listing.sellerRating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {"isDonation" in listing ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Donation Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {listing.price} ETH
                      </Badge>
                    )}

                    {listing.requiresPrescription && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Prescription Required
                      </Badge>
                    )}

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Expires in {listing.expiryDays} days</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    {"isDonation" in listing ? <Button>Request Donation</Button> : <Button>Purchase</Button>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PurchaseMedicineForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Medicine</CardTitle>
        <CardDescription>Complete your purchase of selected medicine</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prescription-id">Prescription NFT ID (Optional)</Label>
          <Input id="prescription-id" placeholder="Enter your prescription NFT ID" />
          <p className="text-xs text-muted-foreground">Required for prescription medicines</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select>
            <SelectTrigger id="payment-method">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eth">Ethereum (ETH)</SelectItem>
              <SelectItem value="usdc">USDC</SelectItem>
              <SelectItem value="dai">DAI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="insurance">Insurance Information (Optional)</Label>
          <Input id="insurance" placeholder="Enter insurance policy number" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Delivery Address</Label>
          <Textarea id="address" placeholder="Enter your full delivery address" />
        </div>

        <div className="rounded-md bg-green-50 p-3 border border-green-200">
          <div className="flex items-start gap-2">
            <CreditCard className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">Secure Transaction</h4>
              <p className="text-sm text-green-700">
                Your payment will be held in escrow until you confirm receipt of the medicine.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Complete Purchase</Button>
      </CardFooter>
    </Card>
  )
}

function DonationRequestForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Medicine Donation</CardTitle>
        <CardDescription>Submit a request for donated medicine</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="medical-need">Medical Need Description</Label>
          <Textarea
            id="medical-need"
            placeholder="Describe your medical condition and why you need this medicine"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="income-verification">Income Verification</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="income-verification"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-neutralral-50 hover:neutraleutral-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-neutralral-500" />
                <p className="mb-2 text-sm text-neutralral-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-neutralral-500">PDF, JPG or PNG (MAX. 2MB)</p>
              </div>
              <Input id="income-verification" type="file" className="hidden" />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prescription-upload">Prescription Validation</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="prescription-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-neutralral-50 hover:neutraleutral-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-8 h-8 mb-2 text-neutralral-500" />
                <p className="mb-2 text-sm text-neutralral-500">
                  <span className="font-semibold">Upload prescription</span> or enter NFT ID
                </p>
                <p className="text-xs text-neutralral-500">PDF, JPG or PNG (MAX. 2MB)</p>
              </div>
              <Input id="prescription-upload" type="file" className="hidden" />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergency-contact">Emergency Contact</Label>
          <Input id="emergency-contact" placeholder="Name and phone number" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Submit Request</Button>
      </CardFooter>
    </Card>
  )
}
