import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tag, Clock, AlertCircle, ShoppingCart, CheckCircle, Loader2 } from "lucide-react";
import useWallet from "@/hooks/useWallet";
import { ethers } from "ethers";
import { formatAddress } from "@/utils/blockchain";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Define MedicineListing interface to match contract structure
interface MedicineListing {
  tokenId: string;
  seller: string;
  price: string;
  isDonation: boolean;
  isActive: boolean;
  // Additional details we'll fetch from medicine contract
  name?: string;
  batchNumber?: string;
  expiryDate?: Date;
  manufactureDate?: Date;
  ipfsHash?: string;
  isExpired?: boolean;
}

export function MedicineDashboard({ userType }: { userType: string }) {
  const router = useRouter();
  const { account, contracts, isConnected } = useWallet();
  const [listings, setListings] = useState<MedicineListing[]>([]);
  const [ownedMedicines, setOwnedMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState("");
  const [isDonation, setIsDonation] = useState(false);
  const [showListingDialog, setShowListingDialog] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MedicineListing | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [myListings, setMyListings] = useState<MedicineListing[]>([]);

  // Fetch marketplace listings when component mounts
  useEffect(() => {
    if (isConnected && contracts.marketplaceContract && contracts.medicineContract) {
      fetchMarketplaceListings();
    }
  }, [isConnected, contracts.marketplaceContract, contracts.medicineContract]);

  // Fetch owned medicines for sellers
  useEffect(() => {
    if (isConnected && contracts.medicineContract && account && userType === "seller") {
      fetchOwnedMedicines();
    }
  }, [isConnected, contracts.medicineContract, account, userType]);

  // Fetch all marketplace listings
  const fetchMarketplaceListings = async () => {
    if (!contracts.marketplaceContract || !contracts.medicineContract) return;
    
    setLoading(true);
    try {
      // Get the total number of active listings
      const listingsCount = await contracts.marketplaceContract.getActiveListingsCount();
      console.log(`Found ${listingsCount} active listings`);
      
      // Get active listings (paginated in batches of 10)
      const pageSize = 10;
      const page = 0;
      const activeListings = await contracts.marketplaceContract.getActiveListings(page, pageSize);
      
      // Process listings to add medicine details
      const processedListings: MedicineListing[] = [];
      const myActiveListings: MedicineListing[] = [];
      
      for (const listing of activeListings) {
        // Skip if listing is not active (shouldn't happen but just to be safe)
        if (!listing.isActive) continue;
        
        try {
          // Get medicine details for this listing
          const tokenId = listing.tokenId.toString();
          const medicineDetails = await contracts.medicineContract.getMedicineDetails(tokenId);
          
          const now = new Date();
          const expiryDate = new Date(Number(medicineDetails.expiryDate) * 1000);
          const isExpired = expiryDate < now;
          
          // Create full listing object with medicine details
          const fullListing: MedicineListing = {
            tokenId: tokenId,
            seller: listing.seller,
            price: ethers.formatEther(listing.price),
            isDonation: listing.isDonation,
            isActive: listing.isActive,
            name: medicineDetails.name,
            batchNumber: medicineDetails.batchNumber,
            expiryDate: expiryDate,
            manufactureDate: new Date(Number(medicineDetails.manufactureDate) * 1000),
            ipfsHash: medicineDetails.ipfsHash,
            isExpired: isExpired
          };
          
          processedListings.push(fullListing);
          
          // If this listing belongs to the current user, add to myListings
          if (listing.seller.toLowerCase() === account?.toLowerCase()) {
            myActiveListings.push(fullListing);
          }
        } catch (err) {
          console.error(`Error fetching details for token ${listing.tokenId}:`, err);
        }
      }
      
      setListings(processedListings);
      setMyListings(myActiveListings);
      
    } catch (error) {
      console.error("Error fetching marketplace listings:", error);
      toast.error("Failed to load marketplace listings");
    } finally {
      setLoading(false);
    }
  };

  // Fetch medicines owned by the current user (for sellers)
  const fetchOwnedMedicines = async () => {
    if (!contracts.medicineContract || !account) return;
    
    setLoading(true);
    try {
      const nextTokenId = await contracts.medicineContract.getNextTokenId() || 0;
      const medicines = [];
      
      // Check the last 50 tokens (adjust as needed)
      const startId = Math.max(0, Number(nextTokenId) - 50);
      
      for (let i = startId; i < Number(nextTokenId); i++) {
        try {
          const owner = await contracts.medicineContract.ownerOf(i);
          
          // Only include medicines owned by the current user
          if (owner.toLowerCase() === account.toLowerCase()) {
            const details = await contracts.medicineContract.getMedicineDetails(i);
            
            // Convert blockchain data to usable format
            const medicine = {
              tokenId: i.toString(),
              name: details.name,
              batchNumber: details.batchNumber,
              manufactureDate: new Date(Number(details.manufactureDate) * 1000),
              expiryDate: new Date(Number(details.expiryDate) * 1000),
              composition: details.composition,
              storageConditions: details.storageConditions,
              ipfsHash: details.ipfsHash
            };
            
            // Skip expired medicines
            if (medicine.expiryDate > new Date()) {
              medicines.push(medicine);
            }
          }
        } catch (err) {
          // Token might not exist or other error - continue to next token
          continue;
        }
      }
      
      setOwnedMedicines(medicines);
      
    } catch (error) {
      console.error("Error fetching owned medicines:", error);
      toast.error("Failed to load your medicines");
    } finally {
      setLoading(false);
    }
  };

  // List a medicine for sale or donation
  const handleListMedicine = async () => {
    if (!contracts.marketplaceContract || !selectedMedicine) {
      toast.error("Please select a medicine to list");
      return;
    }
    
    setIsListing(true);
    try {
      // Convert price to wei (or 0 for donations)
      const priceInWei = isDonation 
        ? ethers.parseEther("0")
        : ethers.parseEther(listingPrice || "0");
      
      // Approve marketplace contract to transfer the medicine NFT
      if (!contracts.medicineContract || !contracts.marketplaceContract) {
        throw new Error("Contracts not initialized");
      }
      
      await contracts.medicineContract.approve(
        await contracts.marketplaceContract.getAddress(),
        selectedMedicine
      );
      
      // List the medicine on the marketplace
      const tx = await contracts.marketplaceContract.listMedicine(
        selectedMedicine,
        priceInWei
      );
      
      toast.loading("Listing medicine on marketplace...");
      await tx.wait();
      toast.dismiss();
      toast.success("Medicine listed successfully!");
      
      // Refresh listings
      fetchMarketplaceListings();
      fetchOwnedMedicines();
      setShowListingDialog(false);
      
    } catch (error: any) {
      console.error("Error listing medicine:", error);
      toast.error(error.reason || error.message || "Failed to list medicine");
    } finally {
      setIsListing(false);
    }
  };

  // Purchase a medicine
  const handlePurchaseMedicine = async () => {
    if (!contracts.marketplaceContract || !selectedListing) {
      toast.error("No listing selected");
      return;
    }
    
    setIsPurchasing(true);
    try {
      // Convert price to wei for payment
      const priceInWei = ethers.parseEther(selectedListing.price);
      
      // Purchase the medicine (passing 0 for prescriptionId since we're not handling prescriptions yet)
      const tx = await contracts.marketplaceContract.purchaseMedicine(
        selectedListing.tokenId,
        0, // prescriptionId (0 means no prescription)
        { value: priceInWei }
      );
      
      toast.loading("Purchasing medicine...");
      await tx.wait();
      toast.dismiss();
      toast.success("Medicine purchased successfully!");
      
      // Refresh listings
      fetchMarketplaceListings();
      setShowBuyDialog(false);
      
    } catch (error: any) {
      console.error("Error purchasing medicine:", error);
      toast.error(error.reason || error.message || "Failed to purchase medicine");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Cancel a listing
  const handleCancelListing = async (tokenId: string) => {
    if (!contracts.marketplaceContract) return;
    
    try {
      const tx = await contracts.marketplaceContract.cancelListing(tokenId);
      
      toast.loading("Canceling listing...");
      await tx.wait();
      toast.dismiss();
      toast.success("Listing canceled successfully!");
      
      // Refresh listings
      fetchMarketplaceListings();
      fetchOwnedMedicines();
      
    } catch (error: any) {
      console.error("Error canceling listing:", error);
      toast.error(error.reason || error.message || "Failed to cancel listing");
    }
  };

  // Open listing dialog with selected medicine
  const openListingDialog = (tokenId: string) => {
    setSelectedMedicine(tokenId);
    setListingPrice("");
    setIsDonation(false);
    setShowListingDialog(true);
  };

  // Open buy dialog with selected listing
  const openBuyDialog = (listing: MedicineListing) => {
    setSelectedListing(listing);
    setShowBuyDialog(true);
  };

  // Render seller view (list medicines, manage listings)
  const renderSellerView = () => {
    return (
      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">My Inventory</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : ownedMedicines.length === 0 ? (
              <div className="col-span-full text-center py-8 border rounded-md">
                <p className="text-muted-foreground">You don't have any medicines to list</p>
              </div>
            ) : (
              ownedMedicines.map((medicine) => (
                <Card key={medicine.tokenId} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{medicine.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {medicine.batchNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                      {medicine.ipfsHash ? (
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${medicine.ipfsHash}`}
                          alt={medicine.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-medicine.png";
                          }}
                        />
                      ) : (
                        <div className="text-muted-foreground">No Image</div>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Expires: {medicine.expiryDate.toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => openListingDialog(medicine.tokenId)}
                    >
                      List for Sale
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="listings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myListings.length === 0 ? (
              <div className="col-span-full text-center py-8 border rounded-md">
                <p className="text-muted-foreground">You don't have any active listings</p>
              </div>
            ) : (
              myListings.map((listing) => (
                <Card key={listing.tokenId} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{listing.name}</CardTitle>
                      {listing.isDonation ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Donation</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {listing.price} ETH
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {listing.batchNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                      {listing.ipfsHash ? (
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${listing.ipfsHash}`}
                          alt={listing.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-medicine.png";
                          }}
                        />
                      ) : (
                        <div className="text-muted-foreground">No Image</div>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Expires: {listing.expiryDate?.toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={() => handleCancelListing(listing.tokenId)}
                    >
                      Cancel Listing
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  // Render buyer view (browse and purchase medicines)
  const renderBuyerView = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length === 0 ? (
            <div className="col-span-full text-center py-8 border rounded-md">
              <p className="text-muted-foreground">No medicines available for purchase</p>
            </div>
          ) : (
            listings.filter(l => !l.isExpired).map((listing) => (
              <Card key={listing.tokenId} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{listing.name}</CardTitle>
                    {listing.isDonation ? (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Donation</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {listing.price} ETH
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {listing.batchNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                    {listing.ipfsHash ? (
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/${listing.ipfsHash}`}
                        alt={listing.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-medicine.png";
                        }}
                      />
                    ) : (
                      <div className="text-muted-foreground">No Image</div>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Expires: {listing.expiryDate?.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      Seller: {formatAddress(listing.seller)}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => openBuyDialog(listing)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {listing.isDonation ? "Request Donation" : "Purchase"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render admin view (future implementation)
  const renderAdminView = () => {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">Admin view not implemented yet</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Medicine Listing Dialog */}
      <Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Medicine for Sale</DialogTitle>
            <DialogDescription>
              Enter listing details for your medicine
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDonation"
                checked={isDonation}
                onChange={(e) => setIsDonation(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isDonation">List as Donation</Label>
            </div>
            
            {!isDonation && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (ETH)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  placeholder="0.00"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowListingDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleListMedicine}
              disabled={!isDonation && (!listingPrice || parseFloat(listingPrice) <= 0) || isListing}
            >
              {isListing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Listing...
                </>
              ) : (
                'List Medicine'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medicine Purchase Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedListing?.isDonation ? "Request Donation" : "Purchase Medicine"}
            </DialogTitle>
            <DialogDescription>
              {selectedListing?.isDonation
                ? "Request this medicine donation"
                : `Confirm your purchase of ${selectedListing?.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="font-medium">Medicine:</span>
                <span>{selectedListing.name}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="font-medium">Batch Number:</span>
                <span>{selectedListing.batchNumber}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="font-medium">Expiry Date:</span>
                <span>{selectedListing.expiryDate?.toLocaleDateString()}</span>
              </div>
              
              {!selectedListing.isDonation && (
                <div className="flex flex-col space-y-1">
                  <span className="font-medium">Price:</span>
                  <span className="text-lg font-bold">{selectedListing.price} ETH</span>
                </div>
              )}
              
              <div className="flex flex-col space-y-1">
                <span className="font-medium">Seller:</span>
                <span>{formatAddress(selectedListing.seller)}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBuyDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchaseMedicine}
              disabled={selectedListing?.isDonation ? isPurchasing : isPurchasing || !selectedListing?.price}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : selectedListing?.isDonation ? (
                'Request Donation'
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main content based on user type */}
      {userType === "seller" && renderSellerView()}
      {userType === "buyer" && renderBuyerView()}
      {userType === "admin" && renderAdminView()}
    </div>
  );
}
