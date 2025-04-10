"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AlertTriangle, Shield, Activity, Users, FileText } from "lucide-react"

// Mock data for demonstration
const mockPrescriptionStats = [
  { name: "Jan", total: 45, expired: 5 },
  { name: "Feb", total: 52, expired: 7 },
  { name: "Mar", total: 61, expired: 8 },
  { name: "Apr", total: 48, expired: 6 },
  { name: "May", total: 55, expired: 9 },
  { name: "Jun", total: 67, expired: 10 },
]

const mockTopMedicines = [
  { name: "Amoxicillin", count: 124 },
  { name: "Ibuprofen", count: 98 },
  { name: "Metformin", count: 87 },
  { name: "Atorvastatin", count: 76 },
  { name: "Lisinopril", count: 65 },
]

const mockDoctorActivity = [
  { name: "Dr. Sarah Johnson", prescriptions: 45, specialty: "General Practitioner" },
  { name: "Dr. Michael Brown", prescriptions: 38, specialty: "Cardiologist" },
  { name: "Dr. Emily Davis", prescriptions: 32, specialty: "Neurologist" },
  { name: "Dr. Robert Wilson", prescriptions: 29, specialty: "Pediatrician" },
]

const mockFraudAlerts = [
  {
    id: "ALERT001",
    type: "Multiple Fulfillments",
    description: "Prescription RX045 was attempted to be fulfilled multiple times",
    severity: "High",
    date: new Date("2023-06-18"),
  },
  {
    id: "ALERT002",
    type: "Unusual Pattern",
    description: "Unusual prescription pattern detected for Dr. James Wilson",
    severity: "Medium",
    date: new Date("2023-06-15"),
  },
]

export default function AdminInterface() {
  const [registryAddress, setRegistryAddress] = useState("")
  const [complianceSettings, setComplianceSettings] = useState({
    requireDoctorVerification: true,
    enforceExpiryDates: true,
    allowEmergencyOverrides: false,
    trackAllTransactions: true,
  })

  const handleComplianceChange = (setting: string, checked: boolean) => {
    setComplianceSettings((prev) => ({
      ...prev,
      [setting]: checked,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - would connect to blockchain in real implementation
    alert("System configuration updated")
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="config">System Configuration</TabsTrigger>
          <TabsTrigger value="audit">Audit Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Manage system settings and registry</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="registryAddress">Registry Address</Label>
                  <Input
                    id="registryAddress"
                    value={registryAddress}
                    onChange={(e) => setRegistryAddress(e.target.value)}
                    placeholder="Enter new registry address (0x...)"
                  />
                  <p className="text-xs text-muted-foreground">
                    The registry contract address that manages user roles and permissions
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Compliance Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="doctorVerification">Require Doctor Verification</Label>
                        <p className="text-xs text-muted-foreground">
                          Doctors must verify their identity before creating prescriptions
                        </p>
                      </div>
                      <Switch
                        id="doctorVerification"
                        checked={complianceSettings.requireDoctorVerification}
                        onCheckedChange={(checked) => handleComplianceChange("requireDoctorVerification", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enforceExpiry">Enforce Expiry Dates</Label>
                        <p className="text-xs text-muted-foreground">Prevent fulfillment of expired prescriptions</p>
                      </div>
                      <Switch
                        id="enforceExpiry"
                        checked={complianceSettings.enforceExpiryDates}
                        onCheckedChange={(checked) => handleComplianceChange("enforceExpiryDates", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emergencyOverrides">Allow Emergency Overrides</Label>
                        <p className="text-xs text-muted-foreground">
                          Permit emergency fulfillment in special circumstances
                        </p>
                      </div>
                      <Switch
                        id="emergencyOverrides"
                        checked={complianceSettings.allowEmergencyOverrides}
                        onCheckedChange={(checked) => handleComplianceChange("allowEmergencyOverrides", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="trackTransactions">Track All Transactions</Label>
                        <p className="text-xs text-muted-foreground">
                          Record all prescription-related transactions on the blockchain
                        </p>
                      </div>
                      <Switch
                        id="trackTransactions"
                        checked={complianceSettings.trackAllTransactions}
                        onCheckedChange={(checked) => handleComplianceChange("trackAllTransactions", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyNotice">Emergency Recall Notice</Label>
                  <Textarea
                    id="emergencyNotice"
                    placeholder="Enter emergency recall notice if needed"
                    className="min-h-[100px]"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Update Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Statistics</CardTitle>
                <CardDescription>Overview of prescription activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-primary mb-2" />
                      <p className="text-2xl font-bold">328</p>
                      <p className="text-sm text-muted-foreground">Total Prescriptions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                      <p className="text-2xl font-bold">45</p>
                      <p className="text-sm text-muted-foreground">Expired</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 text-green-500 mb-2" />
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Active Doctors</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <Activity className="h-8 w-8 text-green-500 mb-2" />
                      <p className="text-2xl font-bold">87%</p>
                      <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      total: {
                        label: "Total",
                        color: "hsl(var(--chart-1))",
                      },
                      expired: {
                        label: "Expired",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockPrescriptionStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expired" fill="var(--color-expired)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Prescribed Medicines</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTopMedicines.map((medicine) => (
                        <TableRow key={medicine.name}>
                          <TableCell>{medicine.name}</TableCell>
                          <TableCell className="text-right">{medicine.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Doctor Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead className="text-right">Prescriptions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDoctorActivity.map((doctor) => (
                        <TableRow key={doctor.name}>
                          <TableCell>{doctor.name}</TableCell>
                          <TableCell>{doctor.specialty}</TableCell>
                          <TableCell className="text-right">{doctor.prescriptions}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fraud Alerts</CardTitle>
                <CardDescription>Potential suspicious activities</CardDescription>
              </CardHeader>
              <CardContent>
                {mockFraudAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {mockFraudAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border rounded-md ${
                          alert.severity === "High" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-2 text-red-500" />
                              <h4 className="font-medium">{alert.type}</h4>
                            </div>
                            <p className="text-sm mt-1">{alert.description}</p>
                          </div>
                          <Badge
                            variant={alert.severity === "High" ? "destructive" : "outline"}
                            className={
                              alert.severity !== "High" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""
                            }
                          >
                            {alert.severity} Priority
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Detected on {alert.date.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No fraud alerts detected</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
