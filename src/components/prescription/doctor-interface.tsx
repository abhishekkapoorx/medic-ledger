"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Upload, Check, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { toast } from "react-hot-toast"
import ConnectWalletButton from "@/components/ConnectWalletButton"

// Contract ABI and address
import PrescriptionNFTArtifact from "../../../sol_back/artifacts/contracts/PrescriptionNFT.sol/PrescriptionNFT.json"
import { uploadToPinata } from "@/lib/constants"
const PRESCRIPTION_NFT_ADDRESS = "YOUR_PRESCRIPTION_NFT_CONTRACT_ADDRESS" // Replace with actual deployed contract address

// Mock data for demonstration
const mockPatients = [
  { address: "0xabc1", name: "John Doe", age: 45 },
  { address: "0xabc2", name: "Jane Smith", age: 32 },
  { address: "0xabc3", name: "Robert Johnson", age: 58 },
  { address: "0xabc4", name: "Emily Davis", age: 27 },
]

export default function DoctorInterface() {
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [patientAddress, setPatientAddress] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "" }])
  const [openPatientSearch, setOpenPatientSearch] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [ipfsHash, setIpfsHash] = useState("")

  // Blockchain connection states
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [connectedAccount, setConnectedAccount] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [myPrescriptions, setMyPrescriptions] = useState<any[]>([])
  
  // Get wallet account from Redux
  const account = useSelector((state: RootState) => state.wallet.account)

  // Initialize provider on component mount
  useEffect(() => {
    if (window.ethereum) {
      const _provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.providers.ExternalProvider)
      setProvider(_provider)
      
      // Check if already connected
      if (account) {
        handleConnect(_provider)
      }
    }
  }, [account])

  // Connect wallet function
  const handleConnect = async (_provider?: ethers.BrowserProvider) => {
    if (!_provider && !provider) {
      toast.error("MetaMask not detected! Please install MetaMask.")
      return
    }
    
    try {
      const providerToUse = _provider || provider
      if (!providerToUse) return
      
      // Get signer
      const _signer = await providerToUse.getSigner()
      setSigner(_signer)
      
      // Get account
      const connectedAddress = await _signer.getAddress()
      setConnectedAccount(connectedAddress)
      setIsConnected(true)
      
      // Initialize contract
      const _contract = new ethers.Contract(
        PRESCRIPTION_NFT_ADDRESS,
        PrescriptionNFTArtifact.abi,
        _signer
      )
      setContract(_contract)
      
      // Fetch doctor's prescriptions
      fetchDoctorPrescriptions(_contract, connectedAddress)
      
      toast.success("Connected to PrescriptionNFT contract")
    } catch (error: any) {
      console.error("Connection failed:", error)
      toast.error(error.message || "Failed to connect to contract")
    }
  }
  
  // Fetch doctor's prescriptions
  const fetchDoctorPrescriptions = async (_contract: ethers.Contract, doctorAddress: string) => {
    try {
      setIsLoading(true)
      const tokenIds = await _contract.getDoctorPrescriptions(doctorAddress)
      
      const prescriptionsData = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const details = await _contract.getPrescriptionDetails(tokenId)
          return {
            id: tokenId.toString(),
            patientAddress: details.patient,
            doctorAddress: details.doctor,
            issueDate: new Date(Number(details.issueDate) * 1000),
            expiryDate: new Date(Number(details.expiryDate) * 1000),
            ipfsHash: details.ipfsHash,
            isFilled: details.isFilled,
            medicineTokens: details.medicineTokens,
            status: getStatus(Number(details.expiryDate)),
          }
        })
      )
      
      setMyPrescriptions(prescriptionsData)
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
      toast.error("Failed to fetch prescriptions")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Helper function to determine prescription status
  const getStatus = (expiryTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000)
    if (expiryTimestamp < now) return "Expired"
    if (expiryTimestamp - now < 7 * 24 * 60 * 60) return "Expiring Soon"
    return "Active"
  }
  
  // Upload file to IPFS (placeholder - implement actual IPFS upload)
  // const uploadToIPFS = async (file: File): Promise<string> => {
  //   // This is a placeholder - implement actual IPFS upload logic
  //   console.log("Uploading file to IPFS:", file.name)
  //   // Mock IPFS hash for demonstration
  //   return "QmXyZ123AbC456DeF789GhI"
  // }

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPrescriptionFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !contract || !signer) {
      toast.error("Please connect your wallet first")
      return
    }
    
    if (!patientAddress) {
      toast.error("Please enter a patient address")
      return
    }
    
    if (!expiryDate) {
      toast.error("Please set an expiry date")
      return
    }
    
    try {
      setIsLoading(true)
      
      // Prepare prescription data
      const prescriptionData = {
        patient: patientAddress,
        medications: medications,
        notes: (document.getElementById("notes") as HTMLTextAreaElement).value,
      }
      
      // Convert to JSON and generate IPFS hash if file is provided
      let hash = ""
      if (prescriptionFile) {
        hash = await uploadToPinata(prescriptionFile)
      } else {
        // If no file, create a JSON object and upload it
        const jsonBlob = new Blob([JSON.stringify(prescriptionData)], { type: 'application/json' })
        const jsonFile = new File([jsonBlob], "prescription.json", { type: 'application/json' })
        hash = await uploadToPinata(jsonFile)
      }
      
      setIpfsHash(hash)
      
      // Convert expiryDate string to timestamp
      const expiry = new Date(expiryDate)
      const expiryTimestamp = Math.floor(expiry.getTime() / 1000)
      
      // Create prescription on blockchain
      const tx = await contract.createPrescription(
        patientAddress,
        expiryTimestamp,
        hash
      )
      
      await tx.wait()
      
      toast.success("Prescription created successfully!")
      
      // Reset form
      setPatientAddress("")
      setExpiryDate("")
      setPrescriptionFile(null)
      setMedications([{ name: "", dosage: "", frequency: "" }])
      ;(document.getElementById("notes") as HTMLTextAreaElement).value = ""
      
      // Refresh prescriptions
      fetchDoctorPrescriptions(contract, connectedAccount)
    } catch (error: any) {
      console.error("Error creating prescription:", error)
      toast.error(error.message || "Failed to create prescription")
    } finally {
      setIsLoading(false)
    }
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

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="space-y-8">
      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>Connect your wallet to access the doctor interface</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ConnectWalletButton />
          </CardContent>
        </Card>
      ) : (
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
                  <Label htmlFor="patient-address">Patient Wallet Address</Label>
                  <Input 
                    id="patient-address" 
                    placeholder="0x..." 
                    value={patientAddress} 
                    onChange={(e) => setPatientAddress(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter the Ethereum address of the patient</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Set when this prescription will expire</p>
                </div>

                <div className="space-y-2">
                  <Label>Prescription Document</Label>
                  <div className="flex items-center space-x-2">
                    <Input type="file" onChange={handleFileChange} className="flex-1" />
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
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Prescription...
                    </>
                  ) : (
                    "Create Prescription"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Prescriptions</CardTitle>
              <CardDescription>View and manage prescriptions you've created</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : myPrescriptions.length > 0 ? (
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
                    {myPrescriptions.map((prescription) => {
                      const daysRemaining = getDaysRemaining(prescription.expiryDate)

                      return (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">{prescription.id}</TableCell>
                          <TableCell>
                            <div>
                              <div>{formatAddress(prescription.patientAddress)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{format(prescription.issueDate, "MMM d, yyyy")}</TableCell>
                          <TableCell>{daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}</TableCell>
                          <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                          <TableCell>
                            {prescription.isFilled ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200">
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
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No prescriptions found</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => fetchDoctorPrescriptions(contract!, connectedAccount)}
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  )
}
