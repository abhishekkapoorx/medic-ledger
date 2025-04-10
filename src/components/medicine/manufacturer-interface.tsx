"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Upload, Loader2, DollarSign, Tag, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ethers } from "ethers"
import toast from "react-hot-toast"
import axios from "axios"

// Import contract ABIs
import MedicineTokenizerArtifact from "../../../sol_back/artifacts/contracts/MedicineNFT.sol/MedicineTokenizer.json"
import PharmacyMarketplaceArtifact from "../../../sol_back/artifacts/contracts/MarketPlace.sol/PharmacyMarketplace.json"

// Environment variables for contract addresses
const MEDICINE_NFT_ADDRESS = process.env.NEXT_PUBLIC_MEDICINE_NFT_ADDRESS || "0x43ca3D2C94be00692D207C6A1e60D8B325c6f12f";
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

// Pinata API keys from environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "970dfd5439f35fced039";
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "9396f7d6b63fd08a16f2c504de3186773af31a0a5e69ba877a073d65654a6fc1";
const PINATA_JWT = process.env.NEXT_PUBLIC_PINARA_JWT || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1NzA5NTgwNy02Yjc0LTRiYjQtOGFjZi0zYzdkMzIxZDYwY2MiLCJlbWFpbCI6IjA0cmFnaGF2c2luZ2xhMjhAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijk3MGRmZDU0MzlmMzVmY2VkMDM5Iiwic2NvcGVkS2V5U2VjcmV0IjoiOTM5NmY3ZDZiNjNmZDA4YTE2ZjJjNTA0ZGUzMTg2NzczYWYzMWEwYTVlNjliYTg3N2EwNzNkNjU2NTRhNmZjMSIsImV4cCI6MTc3NTgwNDM0MX0.x8EGGmm7M4TzTl7RYHwoU3rucroXpB2E8q4wz8CGC50";

// Define types for the medicine data
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
  isListed?: boolean;
  listingPrice?: string;
}

export default function ManufacturerInterface() {
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [name, setName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [composition, setComposition] = useState("");
  const [storageConditions, setStorageConditions] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [mintedMedicines, setMintedMedicines] = useState<Medicine[]>([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // New state variables for listing functionality
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState("");
  const [isListing, setIsListing] = useState(false);
  const [activeTab, setActiveTab] = useState("mint"); // 'mint' or 'sell'
  
  // Blockchain connection states
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [medicineContract, setMedicineContract] = useState<ethers.Contract | null>(null);
  const [marketplaceContract, setMarketplaceContract] = useState<ethers.Contract | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  // Initialize provider on component mount
  useEffect(() => {
    if (window.ethereum) {
      const _provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.providers.ExternalProvider);
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

  // Load minted medicines when connected
  useEffect(() => {
    if (isConnected && medicineContract && connectedAccount) {
      fetchMintedMedicines();
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

  // Fetch medicines minted by the connected manufacturer
  const fetchMintedMedicines = async () => {
    if (!medicineContract || !connectedAccount) return;

    setIsLoadingMedicines(true);
    try {
      // We need to get the total supply and iterate through tokens to find ones minted by this manufacturer
      // This is an example approach - you might need to adjust based on your contract's capabilities
      
      // In a real implementation, you would query events or create a specialized view function
      // For this example, we'll simulate by checking the next token ID and iterating backwards
      
      const nextTokenId = await medicineContract.getNextTokenId?.() || 0;
      const medicines: Medicine[] = [];
      
      // Check the last 20 tokens (limit the loop for performance)
      const startId = Math.max(0, Number(nextTokenId) - 20);
      
      for (let i = startId; i < Number(nextTokenId); i++) {
        try {
          // Check if the token exists and belongs to the current user
          const owner = await medicineContract.ownerOf(i);
          
          if (owner.toLowerCase() === connectedAccount.toLowerCase()) {
            const details = await medicineContract.getMedicineDetails(i);
            
            // Format the medicine data
            const medicine: Medicine = {
              tokenId: i.toString(),
              name: details.name,
              batchNumber: details.batchNumber,
              manufactureDate: new Date(Number(details.manufactureDate) * 1000),
              expiryDate: new Date(Number(details.expiryDate) * 1000),
              composition: details.composition,
              storageConditions: details.storageConditions,
              ipfsHash: details.ipfsHash,
              manufacturer: details.manufacturer,
              currentOwner: details.currentOwner,
              isListed: false
            };
            
            // Check if this medicine is already listed in the marketplace
            if (marketplaceContract) {
              try {
                const listing = await marketplaceContract.listings(i);
                if (listing && listing.isActive) {
                  medicine.isListed = true;
                  medicine.listingPrice = ethers.formatEther(listing.price);
                }
              } catch (err) {
                // Token might not be listed - continue
              }
            }
            
            medicines.push(medicine);
          }
        } catch (err) {
          // Token might not exist or other error - continue to next token
          continue;
        }
      }
      
      setMintedMedicines(medicines);
      
    } catch (error: any) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to fetch minted medicines: " + (error.message || "Unknown error"));
    } finally {
      setIsLoadingMedicines(false);
    }
  };

  // Handle file selection for IPFS upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload file to IPFS using Pinata
  const uploadToIPFS = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Add medicine metadata
    const metadata = JSON.stringify({
      name: name,
      batchNumber: batchNumber,
      expiryDate: expiryDate?.getTime(),
      composition: composition,
      storageConditions: storageConditions,
      createdBy: connectedAccount,
      createdAt: new Date().toISOString()
    });
    formData.append('pinataMetadata', JSON.stringify({ name: `Medicine-${batchNumber}` }));
    formData.append('pinataContent', metadata);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            'Content-Type': `multipart/form-data;`,
            'Authorization': `Bearer ${PINATA_JWT}`
          }
        }
      );

      if (response.status === 200) {
        const hash = response.data.IpfsHash;
        setIpfsHash(hash);
        toast.success("File uploaded to IPFS successfully!");
      }
    } catch (error: any) {
      console.error("IPFS upload error:", error);
      toast.error(error.response?.data?.error || "Failed to upload to IPFS");
    } finally {
      setIsUploading(false);
    }
  };

  // Mint medicine NFT
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineContract || !signer || !expiryDate) {
      toast.error("Please connect wallet and fill all fields");
      return;
    }

    // Validate form inputs
    if (!name || !batchNumber || !ipfsHash || !composition || !storageConditions) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsMinting(true);
    try {
      // Convert expiryDate to Unix timestamp (seconds)
      const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);

      // Call the contract
      const tx = await medicineContract.mintMedicine(
        name,
        batchNumber,
        expiryTimestamp,
        composition,
        storageConditions,
        ipfsHash
      );

      toast.loading("Minting transaction submitted. Please wait for confirmation.");

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      console.log("Transaction receipt:", receipt);
      toast.dismiss();
      
      // Extract token ID from the event logs
      let tokenId: string | null = null;
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = medicineContract.interface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });

            console.log("Parsed log:", parsedLog);
            
            if (parsedLog && parsedLog.name === "MedicineMinted") {
              tokenId = parsedLog.args[0].toString();
              break;
            }
          } catch (e) {
            // Skip logs that can't be parsed
            continue;
          }
        }
      }

      toast.success("Medicine minted successfully!");

      // Refresh the medicines list
      fetchMintedMedicines();
      
      // Reset form
      setName("");
      setBatchNumber("");
      setExpiryDate(undefined);
      setComposition("");
      setStorageConditions("");
      setIpfsHash("");
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error("Minting failed:", error);
      toast.error(error.reason || error.message || "Transaction failed");
    } finally {
      setIsMinting(false);
    }
  };

  // List medicine in marketplace for distributors
  const handleListMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!marketplaceContract || !signer || !selectedMedicine) {
      toast.error("Please connect wallet and select a medicine");
      return;
    }
    
    // Validate price
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    
    setIsListing(true);
    try {
      // Convert price to wei
      const priceInWei = ethers.parseEther(listingPrice);
      const tokenId = selectedMedicine;
      
      // Check if medicine contract is approved for marketplace
      const isApproved = await medicineContract!.isApprovedForAll(
        connectedAccount,
        MARKETPLACE_ADDRESS
      );
      
      // If not approved, request approval first
      if (!isApproved) {
        toast.loading("Approving marketplace to transfer medicines...");
        const approveTx = await medicineContract!.setApprovalForAll(
          MARKETPLACE_ADDRESS,
          true
        );
        await approveTx.wait();
        toast.dismiss();
        toast.success("Marketplace approved successfully!");
      }
      
      // List the medicine
      toast.loading("Listing medicine on marketplace...");
      const tx = await marketplaceContract.listMedicine(tokenId, priceInWei);
      await tx.wait();
      toast.dismiss();
      
      toast.success(`Medicine #${tokenId} listed for ${listingPrice} ETH`);
      
      // Reset form and refresh medicines
      setSelectedMedicine(null);
      setListingPrice("");
      fetchMintedMedicines();
      
    } catch (error: any) {
      console.error("Listing failed:", error);
      toast.error(error.reason || error.message || "Transaction failed");
    } finally {
      setIsListing(false);
    }
  };

  // Cancel medicine listing
  const handleCancelListing = async (tokenId: string) => {
    if (!marketplaceContract) return;
    
    try {
      toast.loading("Cancelling listing...");
      const tx = await marketplaceContract.cancelListing(tokenId);
      await tx.wait();
      toast.dismiss();
      
      toast.success(`Listing for medicine #${tokenId} cancelled`);
      
      // Refresh medicines list
      fetchMintedMedicines();
      
    } catch (error: any) {
      console.error("Cancel listing failed:", error);
      toast.error(error.reason || error.message || "Transaction failed");
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manufacturer Dashboard</h1>
      
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center p-8 mb-6 border rounded-lg">
          <h2 className="text-xl mb-4">Connect your wallet to access Manufacturer features</h2>
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
            <Button onClick={fetchMintedMedicines} variant="outline" disabled={isLoadingMedicines}>
              {isLoadingMedicines ? (
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
      
      {isConnected && (
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <Button 
              onClick={() => setActiveTab("mint")} 
              variant={activeTab === "mint" ? "default" : "outline"}
            >
              Mint Medicines
            </Button>
            <Button 
              onClick={() => setActiveTab("sell")} 
              variant={activeTab === "sell" ? "default" : "outline"}
            >
              Sell to Distributors
            </Button>
          </div>
        </div>
      )}

      {isConnected && activeTab === "mint" && (
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Mint New Medicine</CardTitle>
              <CardDescription>Create a new medicine NFT on the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMint} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicineName">Medicine Name</Label>
                  <Input
                    id="medicineName"
                    placeholder="Enter medicine name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isConnected || isMinting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    placeholder="Enter batch number"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    disabled={!isConnected || isMinting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    className="w-full"
                    value={expiryDate ? expiryDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const selectedDate = new Date(e.target.value);
                        setExpiryDate(selectedDate);
                      } else {
                        setExpiryDate(undefined);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]} // Set min to today's date
                    disabled={!isConnected || isMinting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="composition">Composition</Label>
                  <Textarea
                    id="composition"
                    placeholder="Enter medicine composition"
                    value={composition}
                    onChange={(e) => setComposition(e.target.value)}
                    disabled={!isConnected || isMinting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storageConditions">Storage Conditions</Label>
                  <Input
                    id="storageConditions"
                    placeholder="E.g., Store below 25°C"
                    value={storageConditions}
                    onChange={(e) => setStorageConditions(e.target.value)}
                    disabled={!isConnected || isMinting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipfsDocument">Document Upload</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        id="ipfsDocument"
                        type="file"
                        onChange={handleFileChange}
                        disabled={!isConnected || isUploading || isMinting}
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={uploadToIPFS}
                        disabled={!selectedFile || isUploading || !isConnected || isMinting}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                    {ipfsHash && (
                      <div className="text-sm bg-neutral-100 dark:bg-neutral-800 p-2 rounded overflow-hidden">
                        <span className="font-semibold">IPFS Hash:</span> {ipfsHash}
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!isConnected || isMinting || !ipfsHash || !expiryDate}
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    'Mint Medicine NFT'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Minted Medicines</CardTitle>
              <CardDescription>View all medicines you have created</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMedicines ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : mintedMedicines.length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mintedMedicines.map((medicine) => (
                        <TableRow key={medicine.tokenId}>
                          <TableCell className="font-medium">{medicine.tokenId}</TableCell>
                          <TableCell>{medicine.name}</TableCell>
                          <TableCell>{medicine.batchNumber}</TableCell>
                          <TableCell>{format(medicine.expiryDate, "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${medicine.ipfsHash}`, '_blank')}
                            >
                              View
                            </Button>
                            {!medicine.isListed && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setSelectedMedicine(medicine.tokenId);
                                  setActiveTab("sell");
                                }}
                              >
                                List
                              </Button>
                            )}
                            {medicine.isListed && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelListing(medicine.tokenId)}
                              >
                                Cancel Listing
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <p>No medicines found. Start by minting your first medicine NFT.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {isConnected && activeTab === "sell" && (
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>List Medicine for Distributors</CardTitle>
              <CardDescription>Sell your medicines to distributors through the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleListMedicine} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicineSelect">Select Medicine</Label>
                  <Select
                    value={selectedMedicine || ""}
                    onValueChange={(value) => setSelectedMedicine(value)}
                    disabled={isListing || mintedMedicines.length === 0}
                  >
                    <SelectTrigger className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <SelectValue placeholder="-- Select Medicine --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {mintedMedicines
                          .filter(m => !m.isListed)
                          .map((medicine) => (
                            <SelectItem key={medicine.tokenId} value={medicine.tokenId}>
                              ID: {medicine.tokenId} - {medicine.name} (Batch: {medicine.batchNumber})
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      min="0.001"
                      className="pl-10"
                      placeholder="0.00"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      disabled={isListing}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!selectedMedicine || !listingPrice || isListing}
                >
                  {isListing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Listing...
                    </>
                  ) : (
                    'List for Sale'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Listed Medicines</CardTitle>
              <CardDescription>Manage your medicines listed for sale</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMedicines ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : mintedMedicines.filter(m => m.isListed).length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price (ETH)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mintedMedicines
                        .filter(m => m.isListed)
                        .map((medicine) => (
                          <TableRow key={medicine.tokenId}>
                            <TableCell className="font-medium">{medicine.tokenId}</TableCell>
                            <TableCell>{medicine.name}</TableCell>
                            <TableCell>{medicine.listingPrice}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelListing(medicine.tokenId)}
                              >
                                Cancel
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <p>No medicines listed for sale. List your first medicine.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
