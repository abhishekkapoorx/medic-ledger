"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Thermometer, Calendar, Loader2, History, Tag, ArrowRight } from "lucide-react"
import { ethers } from "ethers"
import toast from "react-hot-toast"

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
  acquisitionDate?: Date;
  expiryDate: Date;
  composition: string;
  storageConditions: string;
  ipfsHash: string;
  manufacturer: string;
  currentOwner: string;
  storageTemp?: string;
  optimalSellBy?: Date;
  transferHistory?: OwnershipRecord[];
}

interface OwnershipRecord {
  owner: string;
  timestamp: Date;
  transactionHash?: string;
}

export default function DistributorInterface() {
  const [selectedMedicine, setSelectedMedicine] = useState("")
  const [buyerType, setBuyerType] = useState("")
  const [buyerAddress, setBuyerAddress] = useState("")
  const [price, setPrice] = useState("")
  const [bulkDiscount, setBulkDiscount] = useState("")
  const [inventory, setInventory] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  
  // Blockchain connection states
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [medicineContract, setMedicineContract] = useState<ethers.Contract | null>(null)
  const [marketplaceContract, setMarketplaceContract] = useState<ethers.Contract | null>(null)
  const [connectedAccount, setConnectedAccount] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  
  // State for medicine history
  const [selectedMedicineForHistory, setSelectedMedicineForHistory] = useState<Medicine | null>(null)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)

  // Initialize provider on component mount
  useEffect(() => {
    if (window.ethereum) {
      const _provider = new ethers.BrowserProvider(window.ethereum as any);
      setProvider(_provider);

      // Set up event listener for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          handleConnect();
        } else {
          setIsConnected(false);
          setConnectedAccount("");
        }
      });

      // Check if already connected
      _provider.listAccounts().then(accounts => {
        if (accounts.length > 0) {
          handleConnect();
        }
      }).catch(err => console.error("Failed to check accounts:", err));
    }
  }, []);

  // Load inventory when connected
  useEffect(() => {
    if (isConnected && medicineContract && connectedAccount) {
      fetchInventory();
    }
  }, [isConnected, medicineContract, connectedAccount]);

  // Connect wallet function
  const handleConnect = async () => {
    if (!provider) {
      toast.error("MetaMask not detected! Please install MetaMask.");
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const _signer = await provider.getSigner();
      setSigner(_signer);
      setConnectedAccount(accounts[0]);
      setIsConnected(true);

      // Initialize medicine contract
      const _medicineContract = new ethers.Contract(
        MEDICINE_NFT_ADDRESS,
        MedicineTokenizerArtifact.abi,
        _signer
      );
      setMedicineContract(_medicineContract);
      
      // Initialize marketplace contract
      const _marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        PharmacyMarketplaceArtifact.abi,
        _signer
      );
      setMarketplaceContract(_marketplaceContract);

      toast.success("Wallet connected successfully!");

    } catch (error: any) {
      console.error("Connection failed:", error);
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  // Fetch medicine history
  const fetchMedicineHistory = async (tokenId: string) => {
    if (!medicineContract || !provider) return [];
    
    try {
      // Get ownership history directly from the contract's new function
      const ownershipRecords = await medicineContract.getOwnershipHistory(parseInt(tokenId));
      
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
        const medicineDetails = await medicineContract.getMedicineDetails(parseInt(tokenId));
        
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
        const medicineDetails = await medicineContract.getMedicineDetails(parseInt(tokenId));
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
    setInventory(prevInventory => 
      prevInventory.map(m => 
        m.tokenId === medicine.tokenId ? updatedMedicine : m
      )
    );
    
    setIsHistoryDialogOpen(true);
  };

  // Fetch distributor's inventory
  const fetchInventory = async () => {
    if (!medicineContract || !connectedAccount) return;

    setIsLoading(true);
    try {
      const nextTokenId = await medicineContract.getNextTokenId?.() || 0;
      const medicines: Medicine[] = [];
      
      // Check the last 50 tokens (adjust the range as needed)
      const startId = Math.max(0, Number(nextTokenId) - 50);
      
      for (let i = startId; i < Number(nextTokenId); i++) {
        try {
          const owner = await medicineContract.ownerOf(i);
          
          // Only include medicines owned by the connected distributor
          if (owner.toLowerCase() === connectedAccount.toLowerCase()) {
            const details = await medicineContract.getMedicineDetails(i);
            
            // Get the ownership history to determine acquisition date
            const history = await fetchMedicineHistory(i.toString());
            
            // Find the acquisition date (when it was transferred to this distributor)
            let acquisitionDate = new Date();
            if (history.length > 1) {
              // The most recent transfer to this distributor
              const transferToDistributor = history.findLast(
                (record) => record.owner.toLowerCase() === connectedAccount.toLowerCase()
              );
              
              if (transferToDistributor) {
                acquisitionDate = transferToDistributor.timestamp;
              }
            }
            
            // Calculate optimal sell-by date (1 year from manufacture or 6 months before expiry, whichever is earlier)
            const manufactureDate = new Date(Number(details.manufactureDate) * 1000);
            const expiryDate = new Date(Number(details.expiryDate) * 1000);
            
            const oneYearFromManufacture = new Date(manufactureDate);
            oneYearFromManufacture.setFullYear(oneYearFromManufacture.getFullYear() + 1);
            
            const sixMonthsBeforeExpiry = new Date(expiryDate);
            sixMonthsBeforeExpiry.setMonth(sixMonthsBeforeExpiry.getMonth() - 6);
            
            const optimalSellBy = oneYearFromManufacture < sixMonthsBeforeExpiry
              ? oneYearFromManufacture
              : sixMonthsBeforeExpiry;
            
            const medicine: Medicine = {
              tokenId: i.toString(),
              name: details.name,
              batchNumber: details.batchNumber,
              manufactureDate: new Date(Number(details.manufactureDate) * 1000),
              acquisitionDate: acquisitionDate,
              expiryDate: new Date(Number(details.expiryDate) * 1000),
              composition: details.composition,
              storageConditions: details.storageConditions,
              storageTemp: details.storageConditions, // Using the storage conditions for display
              optimalSellBy: optimalSellBy,
              ipfsHash: details.ipfsHash,
              manufacturer: details.manufacturer,
              currentOwner: details.currentOwner,
              transferHistory: history
            };
            
            medicines.push(medicine);
          }
        } catch (err) {
          // Token might not exist or other error - continue to next token
          continue;
        }
      }
      
      setInventory(medicines);
      
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Transfer medicine to another entity
  const handleTransferMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicineContract || !signer || !selectedMedicine) {
      toast.error("Please connect wallet and select a medicine");
      return;
    }
    
    // Validate recipient address
    if (!buyerAddress || !ethers.isAddress(buyerAddress)) {
      toast.error("Please enter a valid recipient address");
      return;
    }
    
    setIsTransferring(true);
    try {
      // Call safeTransferFrom to transfer the medicine NFT
      const tokenId = selectedMedicine;
      
      toast.loading("Transferring medicine NFT...");
      const tx = await medicineContract["safeTransferFrom(address,address,uint256)"](
        connectedAccount,
        buyerAddress,
        tokenId
      );
      
      const receipt = await tx.wait();
      toast.dismiss();
      
      if (receipt.status === 1) {
        toast.success(`Medicine #${tokenId} transferred to ${buyerAddress}`);
        
        // Update inventory to reflect the transfer
        setInventory(prevInventory => 
          prevInventory.filter(medicine => medicine.tokenId !== tokenId)
        );
        
        // Reset form
        setSelectedMedicine("");
        setBuyerAddress("");
        setBuyerType("");
        setPrice("");
        setBulkDiscount("");
      } else {
        throw new Error("Transfer failed");
      }
      
    } catch (error: any) {
      console.error("Transfer failed:", error);
      toast.error(error.reason || error.message || "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8">
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center p-8 mb-6 border rounded-lg">
          <h2 className="text-xl mb-4">Connect your wallet to access Distributor features</h2>
          <Button onClick={handleConnect} className="w-full md:w-auto">
            Connect Wallet
          </Button>
        </div>
      ) : (
        <div className="mb-6 flex justify-between items-center">
          <div>
            <span className="font-medium">Connected Account: </span>
            <span className="text-sm bg-neutral-100 dark:bg-neutral-800 p-2 rounded">{formatAddress(connectedAccount)}</span>
          </div>
          <div className="space-x-2">
            <Button onClick={fetchInventory} variant="outline" disabled={isLoading}>
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
      )}
      
      <Tabs defaultValue="inventory" className="w-full">
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
              <form onSubmit={handleTransferMedicine} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="selectMedicine">Select Medicine NFT</Label>
                  <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a medicine from your inventory" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((medicine) => (
                        <SelectItem key={medicine.tokenId} value={medicine.tokenId}>
                          {medicine.name} (Batch: {medicine.batchNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.001" 
                    placeholder="0.00" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
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
                  <Input 
                    id="bulkDiscount" 
                    type="number" 
                    placeholder="0" 
                    value={bulkDiscount}
                    onChange={(e) => setBulkDiscount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerAddress">Buyer Address</Label>
                  <Input 
                    id="buyerAddress" 
                    placeholder="0x..." 
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!selectedMedicine || !buyerAddress || isTransferring}
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    'Initiate Sale'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Manage your medicine inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : inventory.length > 0 ? (
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
                    {inventory.map((medicine) => {
                      const today = new Date()
                      const sellByStatus = medicine.optimalSellBy && medicine.optimalSellBy > today ? "success" : "warning"

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
                                {medicine.acquisitionDate 
                                  ? format(medicine.acquisitionDate, "MMM d, yyyy")
                                  : format(medicine.manufactureDate, "MMM d, yyyy") }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1 text-green-500" />
                              {medicine.storageTemp || medicine.storageConditions}
                            </div>
                          </TableCell>
                          <TableCell>
                            {medicine.optimalSellBy && (
                              <Badge variant={sellByStatus === "success" ? "outline" : "secondary"}>
                                {format(medicine.optimalSellBy, "MMM d, yyyy")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${medicine.ipfsHash}`, '_blank')}
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShowHistory(medicine)}
                              >
                                <History className="h-4 w-4 mr-1" />
                                History
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedMedicine(medicine.tokenId);
                                  // Switch to sell tab
                                  const tabsState = document.querySelector('[data-state="active"]');
                                  if (tabsState) {
                                    const sellTab = document.querySelector('[value="sell"]') as HTMLElement;
                                    if (sellTab) sellTab.click();
                                  }
                                }}
                              >
                                Sell
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <p>No medicines found in your inventory.</p>
                </div>
              )}
            </CardContent>
          </Card>
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
                          {format(record.timestamp, "MMM d, yyyy h:mm a")}
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
