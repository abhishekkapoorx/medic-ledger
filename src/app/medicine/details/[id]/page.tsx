"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  History,
  Thermometer,
  Loader2,
  Download
} from "lucide-react"
import { useRouter } from "next/navigation"
import useWallet from "@/hooks/useWallet"
import { ethers } from "ethers"
import { useQRCode } from 'next-qrcode'
import MedicineTokenizerArtifact from "../../../../../sol_back/artifacts/contracts/MedicineNFT.sol/MedicineTokenizer.json"
import Link from "next/link"

interface MedicineData {
  tokenId: string
  name: string
  batchNumber: string
  manufactureDate: Date
  expiryDate: Date
  isExpired: boolean
  manufacturer: string
  currentOwner: string
  composition: string
  storageRequirements: string
  ipfsDocumentLink: string
}

interface TransferHistoryItem {
  from: string
  to: string
  date: Date
  role: string
}

export default function MedicineDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { Canvas } = useQRCode()
  const [medicine, setMedicine] = useState<MedicineData | null>(null)
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallbackContract, setUsingFallbackContract] = useState(false)

  const MEDICINE_NFT_ADDRESS =
    process.env.NEXT_PUBLIC_MEDICINE_NFT_ADDRESS ||
    "0x43ca3D2C94be00692D207C6A1e60D8B325c6f12f"

  // Use the wallet hook to get contract, provider, and signer
  const { contracts, isConnected, provider, signer } = useWallet()

  // Create a contract instance as a fallback if the wallet hook contract isn't available
  const createFallbackContract = async () => {
    try {
      console.log("Creating fallback contract instance...")
      if (!provider) {
        throw new Error("No provider available")
      }
      
      // Check if ABI contains required functions
      const abi = MedicineTokenizerArtifact.abi;
      console.log("ABI functions:", abi.filter(item => item.type === "function").map(f => f.name));
      
      // Use signer if available; otherwise use provider for read-only calls
      if (signer) {
        const contract = new ethers.Contract(
          MEDICINE_NFT_ADDRESS,
          abi,
          signer
        )
        setUsingFallbackContract(true)
        return contract
      }
      const contract = new ethers.Contract(
        MEDICINE_NFT_ADDRESS,
        abi,
        provider
      )
      setUsingFallbackContract(true)
      return contract
    } catch (err) {
      console.error("Failed to create fallback contract:", err)
      throw new Error("Could not create fallback contract")
    }
  }

  // Function to fetch medicine details from the blockchain using the token ID
  const fetchMedicineDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const tokenId = params.id;
      console.log("Fetching details for tokenId:", tokenId);

      // Prefer the contract from the wallet hook
      let contract = contracts?.medicineContract;
      if (!contract) {
        console.log("Main contract not available, using fallback");
        contract = await createFallbackContract();
      }
      if (!contract) {
        throw new Error("Could not initialize medicine contract. Please try refreshing the page.");
      }
      
      console.log("Contract address:", contract.target);
      
      // Use tokenId directly as a string, ethers will handle conversion
      const tokenIdStr = String(tokenId);
      console.log("Using tokenID as string:", tokenIdStr);
      
      // Try to call getMedicineDetails using a safer approach
      let medicineDetails;
      try {
        console.log("Looking for getMedicineDetails in contract object");
        
        // Try using different calling mechanisms - ethers.js v6 has different patterns
        try {
          // Just try to call it directly without type checking
          console.log("Attempting direct call...");
          const result = await contract.getMedicineDetails(tokenIdStr);
          console.log("Direct call succeeded!");
          medicineDetails = result;
        } catch (directError) {
          console.warn("Direct call failed, trying bracket notation:", directError);
          
          try {
            const result = await contract.callStatic.getMedicineDetails(tokenIdBN);

            console.log("Bracket notation call succeeded!");
            medicineDetails = result;
          } catch (bracketError) {
            console.warn("Bracket notation failed:", bracketError);
            console.log("All standard approaches failed. Checking contract methods available:");
            console.log(Object.getOwnPropertyNames(contract));
            
            // Last attempt - use low-level call
            throw new Error("Could not call getMedicineDetails through any method");
          }
        }
        
        console.log("Successfully called getMedicineDetails");
      } catch (e) {
        console.error("All methods failed when calling getMedicineDetails:", e);
        throw new Error("Failed to get medicine details. The contract might not have this method or there is an interface mismatch.");
      }
      
      console.log("Fetched medicine details:", medicineDetails);
      
      // Try to get history using similar approach
      let ownershipHistory = [];
      try {
        console.log("Attempting to get ownership history");
        
        try {
          // Direct call first
          const result = await contract.getOwnershipHistory(tokenIdStr);
          console.log("Direct history call succeeded!");
          ownershipHistory = result;
        } catch (directError) {
          console.warn("Direct history call failed, trying bracket notation:", directError);
          
          try {
            const result = await contract["getOwnershipHistory"](tokenIdStr);
            console.log("Bracket notation history call succeeded!");
            ownershipHistory = result;
          } catch (bracketError) {
            console.warn("All history call methods failed:", bracketError);
            console.log("Falling back to basic history from medicine details");
            // Create a simple history from the medicine details
            ownershipHistory = [
              {
                owner: medicineDetails.manufacturer,
                timestamp: medicineDetails.manufactureDate
              }
            ];
          }
        }
      } catch (historyError) {
        console.warn("History retrieval completely failed:", historyError);
        // Create a simple history from the medicine details as last resort
        ownershipHistory = [
          {
            owner: medicineDetails.manufacturer,
            timestamp: medicineDetails.manufactureDate
          }
        ];
      }
      
      // Process the medicine details
      const now = new Date();
      const expiryDate = new Date(Number(medicineDetails.expiryDate) * 1000);
      const manufactureDate = new Date(Number(medicineDetails.manufactureDate) * 1000);
      
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
      });
      
      // Process ownership history
      if (ownershipHistory && ownershipHistory.length > 0) {
        const historyItems = [];
        
        // First entry (manufacturer)
        historyItems.push({
          from: "Manufacturer",
          to: ownershipHistory[0].owner,
          date: new Date(Number(ownershipHistory[0].timestamp) * 1000),
          role: "Manufacturer"
        });
        
        // Subsequent transfers
        for (let i = 1; i < ownershipHistory.length; i++) {
          historyItems.push({
            from: ownershipHistory[i-1].owner,
            to: ownershipHistory[i].owner,
            date: new Date(Number(ownershipHistory[i].timestamp) * 1000),
            role: i === 1 ? "Distributor" : i === 2 ? "Retailer" : "Consumer"
          });
        }
        
        setTransferHistory(historyItems);
      }
    } catch (err: any) {
      console.error("Error fetching medicine details:", err);
      setError(err.message || "Failed to fetch medicine details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch details when the token ID changes
  useEffect(() => {
    if (params.id) {
      setMedicine(null)
      setTransferHistory([])
      setError(null)
      setLoading(true)
      const fetchTimer = setTimeout(() => {
        fetchMedicineDetails()
      }, 500)
      return () => clearTimeout(fetchTimer)
    }
  }, [params.id])

  // Retry fetching when wallet connection changes
  useEffect(() => {
    if (isConnected && params.id && (error || !medicine)) {
      fetchMedicineDetails()
    }
  }, [isConnected, signer, contracts?.medicineContract])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Loading medicine details...</p>
      </div>
    )
  }

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
            {usingFallbackContract && (
              <CardDescription className="text-red-600">
                Using fallback contract connection - this may indicate a configuration issue
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
            <div className="mt-4 space-x-3">
              <Button onClick={fetchMedicineDetails}>Retry</Button>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
            <div className="mt-6 p-4 bg-red-100 rounded text-sm">
              <p>
                <strong>Debug Information</strong>
              </p>
              <p>Contract Address: {MEDICINE_NFT_ADDRESS}</p>
              <p>Token ID: {params.id}</p>
              <p>Using Fallback: {usingFallbackContract ? "Yes" : "No"}</p>
              <p>Wallet Connected: {isConnected ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                      <Thermometer className="h-4 w-4 mr-2" />
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
                        <History className="h-5 w-5" />
                      </div>
                      <div className="pl-6">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {transfer.role}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {transfer.date.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2 text-sm">
                          <div>
                            From:{" "}
                            <span className="font-mono text-xs break-all">{transfer.from}</span>
                          </div>
                          <div>
                            To:{" "}
                            <span className="font-mono text-xs break-all">
                              <Link href={`/medicine/user-details/${transfer.to}`}>
                                {transfer.to}
                              </Link>
                            </span>
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
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <p className="text-center mb-4">Medicine Certificate</p>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() =>
                      window.open(
                        `https://ipfs.io/ipfs/${medicine.ipfsDocumentLink.replace("ipfs://", "")}`,
                        "_blank"
                      )
                    }
                  >
                    <FileText className="h-4 w-4" />
                    View on IPFS
                  </Button>
                </div>

                <div className="p-6 border rounded-lg flex flex-col items-center justify-center">
                  <div className="mb-4">
                    <Canvas
                      text={`https://localhost:3000/medicine/details/${medicine.tokenId}`}
                      options={{
                        level: 'M',
                        margin: 3,
                        scale: 4,
                        width: 200,
                      }}
                    />
                  </div>
                  <p className="text-center mb-4">Medicine Verification QR Code</p>
                  <p className="text-xs text-center text-muted-foreground mb-4">
                    Scan to verify this medicine's authenticity
                  </p>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                      // Create a canvas element and draw the QR code on it
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const qrImg = document.querySelector('.canvas-qrcode') as HTMLCanvasElement;
                      
                      if (qrImg && ctx) {
                        canvas.width = qrImg.width;
                        canvas.height = qrImg.height;
                        ctx.drawImage(qrImg, 0, 0);
                        
                        // Create a link element to trigger download
                        const link = document.createElement('a');
                        link.download = `medicine-${medicine.tokenId}-qr.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
