"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Heart, Loader2 } from "lucide-react"
import useWallet from "@/hooks/useWallet"
import { formatAddress } from "@/utils/blockchain"
import toast from "react-hot-toast"
import { ethers } from "ethers"

interface Medicine {
  tokenId: string;
  name: string;
  batchNumber: string;
  manufactureDate: Date;
  expiryDate: Date;
  isExpired: boolean;
}

interface DonationHistory {
  id: string;
  medicineName: string;
  recipient: string;
  timestamp: Date;
  status: string;
  thankYouNote: string | null;
}

export default function DonorInterface() {
  const [selectedMedicine, setSelectedMedicine] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [prescriptionId, setPrescriptionId] = useState("")
  const [message, setMessage] = useState("")
  const [ownedMedicines, setOwnedMedicines] = useState<Medicine[]>([])
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  
  // Use wallet hook
  const { account, contracts, isConnected } = useWallet()

  // Load owned medicines when connected
  useEffect(() => {
    if (isConnected && contracts.medicineContract && account) {
      fetchOwnedMedicines();
    }
  }, [isConnected, contracts.medicineContract, account]);

  // Fetch owned medicines from blockchain
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
          
          // Only include medicines owned by the connected donor
          if (owner.toLowerCase() === account.toLowerCase()) {
            const details = await contracts.medicineContract.getMedicineDetails(i);
            
            const expiryDate = new Date(Number(details.expiryDate) * 1000);
            const now = new Date();
            
            const medicine: Medicine = {
              tokenId: i.toString(),
              name: details.name,
              batchNumber: details.batchNumber,
              manufactureDate: new Date(Number(details.manufactureDate) * 1000),
              expiryDate: expiryDate,
              isExpired: now > expiryDate
            };
            
            // Only show non-expired medicines
            if (!medicine.isExpired) {
              medicines.push(medicine);
            }
          }
        } catch (err) {
          // Token might not exist or other error - continue to next token
          continue;
        }
      }
      
      setOwnedMedicines(medicines);
      
      // Set mock donation history for now (would come from a database or event logs in production)
      setDonationHistory([
        {
          id: "1",
          medicineName: "Paracetamol",
          recipient: "0x1234...5678",
          timestamp: new Date("2023-05-10"),
          status: "Used",
          thankYouNote: "Thank you for your donation! It helped me recover from my fever.",
        },
        {
          id: "2",
          medicineName: "Vitamin C",
          recipient: "0x5678...9012",
          timestamp: new Date("2023-06-15"),
          status: "Active",
          thankYouNote: null,
        },
      ]);
      
    } catch (error: any) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to fetch owned medicines: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contracts.medicineContract || !account || !selectedMedicine) {
      toast.error("Please connect wallet and select a medicine");
      return;
    }
    
    // Validate recipient address
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      toast.error("Please enter a valid recipient address");
      return;
    }
    
    setIsTransferring(true);
    try {
      // Call safeTransferFrom to transfer the medicine NFT
      const tokenId = selectedMedicine;
      
      toast.loading("Transferring medicine NFT...");
      const tx = await contracts.medicineContract["safeTransferFrom(address,address,uint256)"](
        account,
        recipientAddress,
        tokenId
      );
      
      const receipt = await tx.wait();
      toast.dismiss();
      
      if (receipt.status === 1) {
        toast.success(`Medicine #${tokenId} donated to ${recipientAddress}`);
        
        // Update owned medicines to reflect the donation
        setOwnedMedicines(prevMedicines => 
          prevMedicines.filter(medicine => medicine.tokenId !== tokenId)
        );
        
        // Add to donation history
        const donated = ownedMedicines.find(m => m.tokenId === tokenId);
        if (donated) {
          setDonationHistory(prev => [
            {
              id: Date.now().toString(),
              medicineName: donated.name,
              recipient: recipientAddress,
              timestamp: new Date(),
              status: "Active",
              thankYouNote: null
            },
            ...prev
          ]);
        }
        
        // Reset form
        setSelectedMedicine("");
        setRecipientAddress("");
        setPrescriptionId("");
        setMessage("");
      } else {
        throw new Error("Donation failed");
      }
      
    } catch (error: any) {
      console.error("Donation failed:", error);
      toast.error(error.reason || error.message || "Donation failed");
    } finally {
      setIsTransferring(false);
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
      
      <Card>
        <CardHeader>
          <CardTitle>Donate Medicine</CardTitle>
          <CardDescription>Donate medicine to someone in need</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selectMedicine">Select Medicine NFT</Label>
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a medicine to donate" />
                </SelectTrigger>
                <SelectContent>
                  {ownedMedicines.map((medicine) => (
                    <SelectItem key={medicine.tokenId} value={medicine.tokenId}>
                      {medicine.name} (Expires: {format(medicine.expiryDate, "MMM d, yyyy")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientAddress">Recipient Address</Label>
              <Input 
                id="recipientAddress" 
                placeholder="0x..." 
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescriptionId">Prescription ID (Optional)</Label>
              <Input 
                id="prescriptionId" 
                placeholder="Enter prescription ID if applicable" 
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Donation Message (Optional)</Label>
              <Textarea 
                id="message" 
                placeholder="Add a personal message to the recipient"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={!selectedMedicine || !recipientAddress || isTransferring}
            >
              {isTransferring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Donation...
                </>
              ) : (
                'Donate Medicine'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>View your past medicine donations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Thank You Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donationHistory.length > 0 ? (
                donationHistory.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>{donation.medicineName}</TableCell>
                    <TableCell className="font-mono text-xs">{donation.recipient}</TableCell>
                    <TableCell>{format(donation.timestamp, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          donation.status === "Used" ? "bg-green-100 text-green-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {donation.thankYouNote ? (
                        <div className="flex items-center">
                          <Heart className="h-3 w-3 text-red-500 mr-1" />
                          <span className="text-xs italic">{donation.thankYouNote}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No note yet</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No donation history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
