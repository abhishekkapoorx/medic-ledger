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
import { format } from "date-fns"
import { CalendarIcon, Upload, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ethers } from "ethers"
import toast from "react-hot-toast"
import axios from "axios"

// Import contract ABIs
import MedicineTokenizerArtifact from "../../../sol_back/artifacts/contracts/MedicineNFT.sol/MedicineTokenizer.json"

// Environment variables for contract addresses
const MEDICINE_NFT_ADDRESS = process.env.NEXT_PUBLIC_MEDICINE_NFT_ADDRESS || "0x43ca3D2C94be00692D207C6A1e60D8B325c6f12f";

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
  
  // Blockchain connection states
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
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
    if (isConnected && contract && connectedAccount) {
      fetchMintedMedicines();
    }
  }, [isConnected, contract, connectedAccount]);

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

      // Initialize contract
      const _contract = new ethers.Contract(
        MEDICINE_NFT_ADDRESS,
        MedicineTokenizerArtifact.abi,
        _signer
      );
      setContract(_contract);

      toast.success("Wallet connected successfully!");

    } catch (error: any) {
      console.error("Connection failed:", error);
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  // Fetch medicines minted by the connected manufacturer
  const fetchMintedMedicines = async () => {
    if (!contract || !connectedAccount) return;

    setIsLoadingMedicines(true);
    try {
      // We need to get the total supply and iterate through tokens to find ones minted by this manufacturer
      // This is an example approach - you might need to adjust based on your contract's capabilities
      
      // In a real implementation, you would query events or create a specialized view function
      // For this example, we'll simulate by checking the next token ID and iterating backwards
      
      const nextTokenId = await contract.getNextTokenId?.() || 0;
      const medicines: Medicine[] = [];
      
      // Check the last 20 tokens (limit the loop for performance)
      const startId = Math.max(0, Number(nextTokenId) - 20);
      
      for (let i = startId; i < Number(nextTokenId); i++) {
        try {
          // Check if the token exists and belongs to the current user
          const owner = await contract.ownerOf(i);
          
          if (owner.toLowerCase() === connectedAccount.toLowerCase()) {
            const details = await contract.getMedicineDetails(i);
            
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
            };
            
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
    if (!contract || !signer || !expiryDate) {
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
      const tx = await contract.mintMedicine(
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
            const parsedLog = contract.interface.parseLog({
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
      )}

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
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${medicine.ipfsHash}`, '_blank')}
                          >
                            View
                          </Button>
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
    </div>
  )
}
