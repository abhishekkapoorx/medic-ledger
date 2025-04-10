"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Wallet } from "lucide-react"

// Mock data for fee history
const feeHistoryData = [
  { month: "Jan", fee: 2.5 },
  { month: "Feb", fee: 2.5 },
  { month: "Mar", fee: 3.0 },
  { month: "Apr", fee: 3.0 },
  { month: "May", fee: 3.5 },
  { month: "Jun", fee: 3.5 },
  { month: "Jul", fee: 3.5 },
  { month: "Aug", fee: 4.0 },
]

// Mock data for revenue analytics
const revenueData = [
  { month: "Jan", sales: 4200, donations: 1800 },
  { month: "Feb", sales: 3800, donations: 2200 },
  { month: "Mar", sales: 5100, donations: 1900 },
  { month: "Apr", sales: 4800, donations: 2400 },
  { month: "May", sales: 5600, donations: 2100 },
  { month: "Jun", sales: 6200, donations: 2800 },
]

export function AdminInterface() {
  const [activeTab, setActiveTab] = useState("fees")

  return (
    <Tabs defaultValue="fees" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="fees">Fee Management</TabsTrigger>
        <TabsTrigger value="contracts">Contract Management</TabsTrigger>
      </TabsList>
      <TabsContent value="fees">
        <FeeManagement />
      </TabsContent>
      <TabsContent value="contracts">
        <ContractManagement />
      </TabsContent>
    </Tabs>
  )
}

function FeeManagement() {
  const [feePercentage, setFeePercentage] = useState([3.5])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Fee Settings</CardTitle>
          <CardDescription>Adjust the platform fee percentage for all transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="fee-percentage">Fee Percentage</Label>
              <span className="text-lg font-medium">{feePercentage[0]}%</span>
            </div>
            <Slider id="fee-percentage" defaultValue={[3.5]} max={10} step={0.1} onValueChange={setFeePercentage} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>5%</span>
              <span>10%</span>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-medium mb-2">Fee History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feeHistoryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Fee"]} />
                  <Legend />
                  <Line type="monotone" dataKey="fee" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Update Fee Percentage</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>Platform revenue breakdown and analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" name="Sales Revenue" fill="#8884d8" />
                <Bar dataKey="donations" name="Donation Revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">Total Revenue</div>
              <div className="text-2xl font-bold">$24,600</div>
              <div className="text-xs text-muted-foreground">+12% from last month</div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">Fee Revenue</div>
              <div className="text-2xl font-bold">$861</div>
              <div className="text-xs text-muted-foreground">+8% from last month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ContractManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Management</CardTitle>
        <CardDescription>Update contract addresses for platform components</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-registry">User Registry Address</Label>
          <Input id="user-registry" placeholder="0x..." defaultValue="0x1234567890abcdef1234567890abcdef12345678" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicine-nft">Medicine NFT Contract Address</Label>
          <Input id="medicine-nft" placeholder="0x..." defaultValue="0xabcdef1234567890abcdef1234567890abcdef12" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prescription-nft">Prescription NFT Contract Address</Label>
          <Input id="prescription-nft" placeholder="0x..." defaultValue="0x7890abcdef1234567890abcdef1234567890abcd" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fee-wallet">Fee Wallet Address</Label>
          <Input id="fee-wallet" placeholder="0x..." defaultValue="0xdef1234567890abcdef1234567890abcdef123456" />
        </div>

        <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
          <div className="flex items-start gap-2">
            <Wallet className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Important Notice</h4>
              <p className="text-sm text-amber-700">
                Updating contract addresses will require all users to approve the new contracts. Please ensure you have
                communicated this change to your users.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full">Update Contract Addresses</Button>
        <Button variant="outline" className="w-full">
          Pause All Contracts
        </Button>
      </CardFooter>
    </Card>
  )
}
