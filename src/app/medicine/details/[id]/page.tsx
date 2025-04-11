"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, ArrowLeft, FileText, History, Thermometer, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import useWallet from "@/hooks/useWallet"
import { ethers } from "ethers"

interface MedicineData {
  tokenId: string;
  name: string;
  batchNumber: string;
  manufactureDate: Date;
  expiryDate: Date;
  isExpired: boolean;
  manufacturer: string;
  currentOwner: string;
  composition: string;
  storageRequirements: string;
  ipfsDocumentLink: string;
}

interface OwnershipRecord {
  owner: string;
  timestamp: number;
}

interface TransferHistoryItem {
  from: string;
  to: string;
  date: Date;
  role: string;
}

export default function MedicineDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [medicine, setMedicine] = useState<MedicineData | null>(null)
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use the wallet hook instead of Redux selector
  const { contracts, isConnected } = useWallet()

  // Fetch medicine details from blockchain
  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!isConnected) {
          throw new Error("Wallet not connected. Please connect your wallet to view medicine details.")
        }
        
        if (!contracts.medicineContract) {
          throw new Error("Medicine contract not initialized. Please connect your wallet.")
        }
        
        const tokenId = params.id
        
        // Fetch medicine details
        const medicineDetails = await contracts.medicineContract.getMedicineDetails(tokenId)
        
        // Fetch ownership history
        const ownershipHistory: OwnershipRecord[] = await contracts.medicineContract.getOwnershipHistory(tokenId)
        
        // Process medicine details
        const now = new Date()
        const expiryDate = new Date(Number(medicineDetails.expiryDate) * 1000)
        const manufactureDate = new Date(Number(medicineDetails.manufactureDate) * 1000)
        
        setMedicine({
          tokenId,
          name: medicineDetails.name,
          batchNumber: medicineDetails.batchNumber,
          manufactureDate,
          expiryDate,
          isExpired: now > expiryDate,
          manufacturer: medicineDetails.manufacturer,
          currentOwner: medicineDetails.currentOwner,
          composition: medicineDetails.composition,
          storageRequirements: medicineDetails.storageConditions,
          ipfsDocumentLink: `ipfs://${medicineDetails.ipfsHash}`
        })
        
        // Process ownership history into transfer history
        if (ownershipHistory.length > 0) {
          const historyItems: TransferHistoryItem[] = []
          
          // For the first entry, we use manufacturer as "from"
          historyItems.push({
            from: "Manufacturer",
            to: ownershipHistory[0].owner,
            date: new Date(Number(ownershipHistory[0].timestamp) * 1000),
            role: "Manufacturer"
          })
          
          // Process subsequent transfers
          for (let i = 1; i < ownershipHistory.length; i++) {
            historyItems.push({
              from: ownershipHistory[i-1].owner,
              to: ownershipHistory[i].owner,
              date: new Date(Number(ownershipHistory[i].timestamp) * 1000),
              // Simplified role assignment - in production you'd query the user registry contract
              role: i === 1 ? "Distributor" : i === 2 ? "Retailer" : "Consumer"
            })
          }
          
          setTransferHistory(historyItems)
        }
      } catch (err: any) {
        console.error("Error fetching medicine details:", err)
        setError(err.message || "Failed to fetch medicine details")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchMedicineDetails()
    }
  }, [params.id, contracts.medicineContract, isConnected])

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Loading medicine details...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading Medicine</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No medicine found
  if (!medicine) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Medicine Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The medicine with ID {params.id} could not be found.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{medicine.name}</h1>
          <p className="text-muted-foreground">Token ID: {medicine.tokenId}</p>
        </div>

        {medicine.isExpired ? (
          <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Expired
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-3 py-1 text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Valid
          </Badge>
        )}
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Transfer History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medicine Information</CardTitle>
                <CardDescription>Basic details about this medicine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">Batch Number:</span>
                  <span>{medicine.batchNumber}</span>

                  <span className="font-medium">Manufacture Date:</span>
                  <span>{medicine.manufactureDate.toLocaleDateString()}</span>

                  <span className="font-medium">Expiry Date:</span>
                  <span>{medicine.expiryDate.toLocaleDateString()}</span>

                  <span className="font-medium">Manufacturer:</span>
                  <span className="font-mono text-xs break-all">{medicine.manufacturer}</span>

                  <span className="font-medium">Current Owner:</span>
                  <span className="font-mono text-xs break-all">{medicine.currentOwner}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
                <CardDescription>Composition and storage information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Composition:</span>
                    <p className="mt-1 text-sm">{medicine.composition}</p>
                  </div>

                  <div>
                    <span className="font-medium">Storage Requirements:</span>
                    <div className="flex items-center mt-1">
                      <Thermometer className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">{medicine.storageRequirements}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>Complete ownership chain of this medicine</CardDescription>
            </CardHeader>
            <CardContent>
              {transferHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No transfer history available</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-dashed border-muted-foreground/30 space-y-8">
                  {transferHistory.map((transfer, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[25px] w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <History className="h-5 w-5 text-primary" />
                      </div>
                      <div className="pl-6">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {transfer.role}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{transfer.date.toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 text-sm">
                          <div>
                            From: <span className="font-mono text-xs break-all">{transfer.from}</span>
                          </div>
                          <div>
                            To: <span className="font-mono text-xs break-all">{transfer.to}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Related documents and certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 border rounded-lg flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-center mb-4">Medicine Certificate</p>
                <Button variant="outline" className="flex items-center gap-2" 
                  onClick={() => window.open(`https://ipfs.io/ipfs/${medicine.ipfsDocumentLink.replace('ipfs://', '')}`, '_blank')}>
                  <FileText className="h-4 w-4" />
                  View on IPFS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
