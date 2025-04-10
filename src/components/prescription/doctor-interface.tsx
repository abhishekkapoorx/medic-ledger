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
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Upload, Check, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

// Mock data for demonstration
const mockPatients = [
  { address: "0xabc1", name: "John Doe", age: 45 },
  { address: "0xabc2", name: "Jane Smith", age: 32 },
  { address: "0xabc3", name: "Robert Johnson", age: 58 },
  { address: "0xabc4", name: "Emily Davis", age: 27 },
]

const mockActivePrescriptions = [
  {
    id: "RX001",
    patientName: "John Doe",
    patientAddress: "0xabc1",
    issueDate: new Date("2023-06-15"),
    expiryDate: new Date("2023-07-15"),
    status: "Active",
    emergencyContact: "+1 (555) 123-4567",
    linkedMedicines: ["MED001", "MED002"],
    fulfilled: false,
  },
  {
    id: "RX002",
    patientName: "Jane Smith",
    patientAddress: "0xabc2",
    issueDate: new Date("2023-06-10"),
    expiryDate: new Date("2023-06-25"),
    status: "Expiring Soon",
    emergencyContact: "+1 (555) 987-6543",
    linkedMedicines: ["MED003"],
    fulfilled: true,
  },
  {
    id: "RX003",
    patientName: "Robert Johnson",
    patientAddress: "0xabc3",
    issueDate: new Date("2023-05-20"),
    expiryDate: new Date("2023-06-20"),
    status: "Expired",
    emergencyContact: "+1 (555) 456-7890",
    linkedMedicines: ["MED004", "MED005", "MED006"],
    fulfilled: true,
  },
]

export default function DoctorInterface() {
  const [date, setDate] = useState<Date>()
  const [open, setOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "" }])
  const [openPatientSearch, setOpenPatientSearch] = useState(false)

  const handleAddMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "" }])
  }

  const handleRemoveMedication = (index: number) => {
    const newMedications = [...medications]
    newMedications.splice(index, 1)
    setMedications(newMedications)
  }

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const newMedications = [...medications]
    newMedications[index] = { ...newMedications[index], [field]: value }
    setMedications(newMedications)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - would connect to blockchain in real implementation
    alert("Prescription created successfully")
  }

  const getDaysRemaining = (expiryDate: Date) => {
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="mr-1 h-3 w-3" /> Active
          </Badge>
        )
      case "Expiring Soon":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" /> Expiring Soon
          </Badge>
        )
      case "Expired":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="mr-1 h-3 w-3" /> Expired
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="create">Create Prescription</TabsTrigger>
          <TabsTrigger value="active">Active Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Prescription</CardTitle>
              <CardDescription>Create a new prescription for a patient</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Popover open={openPatientSearch} onOpenChange={setOpenPatientSearch}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                        {selectedPatient
                          ? mockPatients.find((patient) => patient.address === selectedPatient)?.name
                          : "Select patient..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search patients..." />
                        <CommandList>
                          <CommandEmpty>No patient found.</CommandEmpty>
                          <CommandGroup>
                            {mockPatients.map((patient) => (
                              <CommandItem
                                key={patient.address}
                                value={patient.address}
                                onSelect={(currentValue) => {
                                  setSelectedPatient(currentValue === selectedPatient ? "" : currentValue)
                                  setOpenPatientSearch(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedPatient === patient.address ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {patient.name} ({patient.age})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Popover open={open} onOpenChange={setOpen}>
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
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => {
                          setDate(date)
                          setOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Prescription Document</Label>
                  <div className="flex items-center space-x-2">
                    <Input type="file" className="flex-1" />
                    <Button type="button" size="icon" variant="outline">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Upload prescription document (PDF or image)</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Medication List</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddMedication}>
                      <Plus className="h-4 w-4 mr-1" /> Add Medication
                    </Button>
                  </div>

                  {medications.map((medication, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Medication #{index + 1}</h4>
                        {medications.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMedication(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`med-name-${index}`}>Medicine Name</Label>
                          <Input
                            id={`med-name-${index}`}
                            value={medication.name}
                            onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                            placeholder="Medicine name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
                          <Input
                            id={`med-dosage-${index}`}
                            value={medication.dosage}
                            onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`med-frequency-${index}`}>Frequency</Label>
                          <Input
                            id={`med-frequency-${index}`}
                            value={medication.frequency}
                            onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" placeholder="Any additional instructions or notes" />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Create Prescription
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Prescriptions</CardTitle>
              <CardDescription>View and manage prescriptions you've created</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Days Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fulfilled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockActivePrescriptions.map((prescription) => {
                    const daysRemaining = getDaysRemaining(prescription.expiryDate)

                    return (
                      <TableRow key={prescription.id}>
                        <TableCell className="font-medium">{prescription.id}</TableCell>
                        <TableCell>
                          <div>
                            <div>{prescription.patientName}</div>
                            <div className="text-xs text-muted-foreground">{prescription.patientAddress}</div>
                          </div>
                        </TableCell>
                        <TableCell>{format(prescription.issueDate, "MMM d, yyyy")}</TableCell>
                        <TableCell>{daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}</TableCell>
                        <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                        <TableCell>
                          {prescription.fulfilled ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
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
