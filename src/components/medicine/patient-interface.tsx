"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Clock, AlertTriangle, Loader2, History, Tag, ArrowRight } from "lucide-react"
import { ethers } from "ethers"
import toast from "react-hot-toast"
import useWallet from "@/hooks/useWallet"
import { formatAddress } from "@/utils/blockchain"

// Import contract ABIs
import MedicineTokenizerArtifact from "../../../sol_back/artifacts/contracts/MedicineNFT.sol/MedicineTokenizer.json"
import PharmacyMarketplaceArtifact from "../../../sol_back/artifacts/contracts/MarketPlace.sol/PharmacyMarketplace.json"

// Environment variables for contract addresses
const MEDICINE_NFT_ADDRESS = process.env.NEXT_PUBLIC_MEDICINE_NFT_ADDRESS || "0x43ca3D2C94be00692D207C6A1e60D8B325c6f12f";
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

// Define interfaces for medicine data
interface Medicine {
  tokenId: string;
  name: string;
  batchNumber: string;
  manufactureDate: Date;
  expiryDate: Date;
  composition: string;
  storageConditions: string;
  ipfsHash: string;
  manufacturer: string;
  currentOwner: string;
  daysUntilExpiry?: number;
  isVerified?: boolean;
  requiresPrescription?: boolean;
  transferHistory?: OwnershipRecord[];
}

interface VerifiedMedicine extends Medicine {
  isExpired: boolean;
  ownershipChain: OwnershipRecord[];
}

interface OwnershipRecord {
  owner: string;
  timestamp: Date;
  transactionHash?: string;
}

export default function PatientInterface() {
  const [medicineAddress, setMedicineAddress] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [verifiedMedicine, setVerifiedMedicine] = useState<VerifiedMedicine | null>(null)
  const [ownedMedicines, setOwnedMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  
  // Use wallet hook
  const { account, contracts, isConnected } = useWallet()
  
  // State for medicine history
  const [selectedMedicineForHistory, setSelectedMedicineForHistory] = useState<Medicine | null>(null)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)

  // Load owned medicines when connected
  useEffect(() => {
    if (isConnected && contracts.medicineContract && account) {
      fetchOwnedMedicines();
    }
  }, [isConnected, contracts.medicineContract, account]);

  // Calculate days until expiry
  const daysUntilExpiry = (date: Date) => {
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Fetch medicine history
  const fetchMedicineHistory = async (tokenId: string) => {
    if (!contracts.medicineContract) return [];
    
    try {
      // Get ownership history directly from the contract's new function
      const ownershipRecords = await contracts.medicineContract.getOwnershipHistory(parseInt(tokenId));
      
      // Format ownership records
      const history: OwnershipRecord[] = [];
      
      // Convert contract data to our frontend format
      if (ownershipRecords && ownershipRecords.length > 0) {
        for (let i = 0; i < ownershipRecords.length; i++) {
          const record = ownershipRecords[i];
          history.push({
            owner: record.owner,
            timestamp: new Date(Number(record.timestamp) * 1000),
            transactionHash: i === 0 ? "Original Minting" : `Transfer #${i}`
          });
        }
      } else {
        // Fallback to fetching basic details if history isn't available
        const medicineDetails = await contracts.medicineContract.getMedicineDetails(parseInt(tokenId));
        
        // Add manufacturer as the first owner
        history.push({
          owner: medicineDetails.manufacturer,
          timestamp: new Date(Number(medicineDetails.manufactureDate) * 1000),
          transactionHash: "Original Minting"
        });
        
        // If current owner is different from manufacturer, add current owner
        if (medicineDetails.currentOwner.toLowerCase() !== medicineDetails.manufacturer.toLowerCase()) {
          history.push({
            owner: medicineDetails.currentOwner,
            timestamp: new Date(), // We don't know exact time, use current time as approximation
            transactionHash: "Current Owner"
          });
        }
      }
      
      return history;
    } catch (error) {
      console.error("Error fetching medicine history:", error);
      
      // Fallback to basic details if the new function fails
      try {
        const medicineDetails = await contracts.medicineContract.getMedicineDetails(parseInt(tokenId));
        const history: OwnershipRecord[] = [];
        
        history.push({
          owner: medicineDetails.manufacturer,
          timestamp: new Date(Number(medicineDetails.manufactureDate) * 1000),
          transactionHash: "Original Minting"
        });
        
        if (medicineDetails.currentOwner.toLowerCase() !== medicineDetails.manufacturer.toLowerCase()) {
          history.push({
            owner: medicineDetails.currentOwner,
            timestamp: new Date(),
            transactionHash: "Current Owner"
          });
        }
        
        return history;
      } catch (err) {
        console.error("Error in fallback history fetching:", err);
        return [];
      }
    }
  };

  // Handle showing medicine history
  const handleShowHistory = async (medicine: Medicine) => {
    // If we already have transfer history and it's not empty, use it
    if (medicine.transferHistory && medicine.transferHistory.length > 0) {
      setSelectedMedicineForHistory(medicine);
      setIsHistoryDialogOpen(true);
      return;
    }
    
    // Otherwise fetch the history
    const history = await fetchMedicineHistory(medicine.tokenId);
    
    // Update the medicine with transfer history
    const updatedMedicine = { ...medicine, transferHistory: history };
    
    // Update the selected medicine and the inventory
    setSelectedMedicineForHistory(updatedMedicine);
    setOwnedMedicines(prevMedicines => 
      prevMedicines.map(m => 
        m.tokenId === medicine.tokenId ? updatedMedicine : m
      )
    );
    
    setIsHistoryDialogOpen(true);
  };

  // Fetch patient's owned medicines
  const fetchOwnedMedicines = async () => {
    if (!contracts.medicineContract || !account) return;

    setIsLoading(true);
    try {
      const nextTokenId = await contracts.medicineContract.getNextTokenId?.() || 0;
      const medicines: Medicine[] = [];
      
      // Check the last 50 tokens (adjust the range as needed)
      const startId = Math.max(0, Number(nextTokenId) - 50);
      
      for (let i = startId; i < Number(nextTokenId); i++) {
        try {
          const owner = await contracts.medicineContract.ownerOf(i);
          
          // Only include medicines owned by the connected patient
          if (owner.toLowerCase() === account.toLowerCase()) {
            const details = await contracts.medicineContract.getMedicineDetails(i);
            
            const expiryDate = new Date(Number(details.expiryDate) * 1000);
            const daysLeft = daysUntilExpiry(expiryDate);
            
            const medicine: Medicine = {
              tokenId: i.toString(),
              name: details.name,
              batchNumber: details.batchNumber,
              manufactureDate: new Date(Number(details.manufactureDate) * 1000),
              expiryDate: expiryDate,
              composition: details.composition,
              storageConditions: details.storageConditions,
              ipfsHash: details.ipfsHash,
              manufacturer: details.manufacturer,
              currentOwner: details.currentOwner,
              daysUntilExpiry: daysLeft,
              isVerified: true, // All blockchain medicines are verified
              requiresPrescription: false // Could be determined from other contract data
            };
            
            medicines.push(medicine);
          }
        } catch (err) {
          // Token might not exist or other error - continue to next token
          continue;
        }
      }
      
      setOwnedMedicines(medicines);
      
    } catch (error: any) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to fetch owned medicines: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Verify medicine by token ID
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contracts.medicineContract || !medicineAddress) {
      toast.error("Please connect your wallet and enter a medicine token ID");
      return;
    }
    
    setIsVerifying(true);
    setShowVerification(false);
    
    try {
      // Check if input is a valid token ID
      const tokenId = parseInt(medicineAddress);
      if (isNaN(tokenId)) {
        throw new Error("Please enter a valid medicine token ID");
      }
      
      // Check if token exists
      const owner = await contracts.medicineContract.ownerOf(tokenId);
      if (!owner) {
        throw new Error("Medicine not found");
      }
      
      // Get medicine details
      const details = await contracts.medicineContract.getMedicineDetails(tokenId);
      const history = await fetchMedicineHistory(tokenId.toString());
      
      const expiryDate = new Date(Number(details.expiryDate) * 1000);
      const isExpired = expiryDate < new Date();
      
      const verifiedMed: VerifiedMedicine = {
        tokenId: tokenId.toString(),
        name: details.name,
        batchNumber: details.batchNumber,
        manufactureDate: new Date(Number(details.manufactureDate) * 1000),
        expiryDate: expiryDate,
        composition: details.composition,
        storageConditions: details.storageConditions,
        ipfsHash: details.ipfsHash,
        manufacturer: details.manufacturer,
        currentOwner: details.currentOwner,
        isExpired: isExpired,
        ownershipChain: history
      };
      
      setVerifiedMedicine(verifiedMed);
      setShowVerification(true);
      
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error(error.reason || error.message || "Failed to verify medicine");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <span className="font-medium">Connected Account: </span>
          <span className="text-sm bg-neutral-100 dark:bg-neutral-800 p-2 rounded">{formatAddress(account || "")}</span>
        </div>
        <div className="space-x-2">
          <Button onClick={fetchOwnedMedicines} variant="outline" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="verify" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="verify">Verify Medicine</TabsTrigger>
          <TabsTrigger value="owned">My Medicines</TabsTrigger>
        </TabsList>

        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Verification</CardTitle>
              <CardDescription>Verify the authenticity of your medicine</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter medicine token ID"
                    value={medicineAddress}
                    onChange={(e) => setMedicineAddress(e.target.value)}
                  />
                  <Button type="submit" disabled={isVerifying || !medicineAddress}>
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
              </form>

              {showVerification && verifiedMedicine && (
                <div className="mt-6 border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{verifiedMedicine.name}</h3>
                    {verifiedMedicine.isExpired ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Expired
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Valid
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Manufacturer:</span>
                      <span>{formatAddress(verifiedMedicine.manufacturer)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Current Owner:</span>
                      <span>{formatAddress(verifiedMedicine.currentOwner)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Batch Number:</span>
                      <span>{verifiedMedicine.batchNumber}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Manufacture Date:</span>
                      <span>{verifiedMedicine.manufactureDate.toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Expiry Date:</span>
                      <span>{verifiedMedicine.expiryDate.toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Composition:</span>
                      <span>{verifiedMedicine.composition}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Storage:</span>
                      <span>{verifiedMedicine.storageConditions}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Ownership Chain</h4>
                    <div className="space-y-2">
                      {verifiedMedicine.ownershipChain.map((item, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-primary'} mr-2`}></div>
                          <span>
                            {formatAddress(item.owner)} • {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owned">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ownedMedicines.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {ownedMedicines.map((medicine) => (
                <Card key={medicine.tokenId}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-neutral-100 rounded flex items-center justify-center">
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${medicine.ipfsHash}` || "/placeholder.svg"}
                          alt={medicine.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{medicine.name}</h3>
                          {medicine.isVerified && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Batch: {medicine.batchNumber}</p>
                        <div className="flex items-center mt-1 text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {medicine.daysUntilExpiry && medicine.daysUntilExpiry > 0
                              ? `Expires in ${medicine.daysUntilExpiry} days`
                              : "Expired"}
                          </span>
                        </div>
                        <div className="mt-2 flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShowHistory(medicine)}
                          >
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${medicine.ipfsHash}`, '_blank')}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p>You don't own any medicines yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Medicine History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Medicine Transfer History</DialogTitle>
            <DialogDescription>
              {selectedMedicineForHistory ? (
                `${selectedMedicineForHistory.name} (Batch: ${selectedMedicineForHistory.batchNumber})`
              ) : 'Loading...'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            {selectedMedicineForHistory?.transferHistory?.length ? (
              <div className="space-y-4 py-4">
                {selectedMedicineForHistory.transferHistory.map((record, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                        ${index === 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {index === 0 ? (
                          <Tag className="h-5 w-5" />
                        ) : (
                          <ArrowRight className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">
                          {index === 0 ? 'Original Manufacturer' : `Transfer #${index}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.timestamp.toLocaleDateString()} {record.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-5 pl-5 border-l border-dashed">
                      <div className="rounded-md border p-3 bg-muted/50">
                        <p className="text-xs font-medium mb-1">Owner</p>
                        <p className="text-sm break-all">{record.owner}</p>
                        
                        {record.transactionHash && record.transactionHash !== "Original Minting" && (
                          <>
                            <p className="text-xs font-medium mt-2 mb-1">Transaction</p>
                            <p className="text-sm break-all">{record.transactionHash}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p>No transfer history available for this medicine.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
