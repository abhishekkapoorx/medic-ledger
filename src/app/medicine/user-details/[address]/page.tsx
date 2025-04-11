"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CalendarIcon, CheckCircle, Clock, FileText } from "lucide-react";

// Import contract ABIs and setup
import UserRegistryArtifact from "../../../../../sol_back/artifacts/contracts/UserRegistry.sol/UserRegistry.json";

// Define user role mapping for display purposes
const UserRoles: Record<string, string> = {
  "0": "Patient",
  "1": "Doctor",
  "2": "Manufacturer",
  "3": "Distributor", 
  "4": "Retailer",
  "5": "Donor"
};

// Define UserData interface
interface UserData {
  role: string;
  name: string;
  licenseIPFSHash: string;
  isVerified: boolean;
  isActive: boolean;
  registrationDate: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const userAddress = params?.address as string;
  
  // State for user data
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userAddress || !ethers.isAddress(userAddress)) {
        setError("Invalid Ethereum address provided");
        setLoading(false);
        return;
      }
      
      try {
        // Call the API to get user details
        const response = await fetch(`/api/check-user?address=${userAddress}`);
        const data = await response.json();
        console.log(data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (!data.isRegistered) {
          throw new Error("User is not registered on the platform");
        }
        
        setUserData({
          role: data.role,
          name: data.name,
          licenseIPFSHash: data.licenseIPFSHash,
          isVerified: data.isVerified === 'true',
          isActive: data.isActive === 'true',
          registrationDate: data.registrationDate,
        });
      } catch (err: any) {
        console.error("Failed to fetch user details:", err);
        setError(err.message || "Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [userAddress]);
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Format date
  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'Not available';
    
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return 'Invalid date';
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">User Details</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-[150px] mb-2" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">User Details</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Details</h1>
        <p className="text-sm font-mono bg-muted p-2 rounded">
          Address: {formatAddress(userAddress)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* User Profile Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Profile
              {userData?.isActive !== undefined && (
                <Badge variant={userData.isActive ? "default" : "destructive"}>
                  {userData.isActive ? "Active" : "Inactive"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage src="" alt={userData?.name} />
                <AvatarFallback className="text-2xl">{userData?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{userData?.name?.toUpperCase() || 'No Name'}</h2>
              <Badge className="mt-2" variant="outline">{UserRoles[userData?.role || '0'] || 'Unknown Role'}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className={userData?.isVerified ? "text-green-500" : "text-neutral-300"} size={16} />
                <span>Verification Status: {userData?.isVerified ? "Verified" : "Not Verified"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-neutral-500" size={16} />
                <span>Registered on: {formatDate(userData?.registrationDate || '')}</span>
              </div>
              {userData?.licenseIPFSHash && (
                <div className="flex items-center gap-2">
                  <FileText className="text-neutral-500" size={16} />
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${userData.licenseIPFSHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm truncate text-blue-500 hover:underline"
                    title={userData.licenseIPFSHash}
                  >
                    License: {userData.licenseIPFSHash.length > 20 ? 
                      `${userData.licenseIPFSHash.substring(0, 20)}...` : 
                      userData.licenseIPFSHash}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>View Full Profile</Button>
          </CardFooter>
        </Card>
        
        {/* Activity Summary */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
            <CardDescription>Recent user activities on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transactions">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="medicines">Medicines</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions" className="space-y-4">
                <div className="rounded-md border p-4 mt-4">
                  <div className="flex items-center gap-4">
                    <Clock size={24} />
                    <div>
                      <h3 className="font-medium">No recent transactions</h3>
                      <p className="text-sm text-neutral-500">This user has no recent blockchain transactions.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="medicines" className="space-y-4">
                <div className="rounded-md border p-4 mt-4">
                  <div className="flex items-center gap-4">
                    <Clock size={24} />
                    <div>
                      <h3 className="font-medium">No medicine records</h3>
                      <p className="text-sm text-neutral-500">No medicine transactions found for this user.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="prescriptions" className="space-y-4">
                <div className="rounded-md border p-4 mt-4">
                  <div className="flex items-center gap-4">
                    <Clock size={24} />
                    <div>
                      <h3 className="font-medium">No prescription records</h3>
                      <p className="text-sm text-neutral-500">No prescription data found for this user.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}