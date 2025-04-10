"use client";

import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { CalendarIcon, CheckCircle, AlertCircle, FileText, Clock } from "lucide-react";
import truncateEthAddress from 'truncate-eth-address'
import { UserRoles } from '@/lib/constants';

export default function UserDashboard() {
  // Get user data from Redux store
  const userData = useSelector((state:any) => state.user);

  console.log(userData)

  // Format date
  const formattedDate = userData.registrationDate ? 
    new Date(userData.registrationDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : 'Not available';

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* User Profile Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Profile
              <Badge variant={userData.isActive ? "default" : "destructive"}>
                {userData.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage src="" alt={userData.name} />
                <AvatarFallback className="text-2xl">{userData.name.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{userData.name?.toUpperCase() || 'No Name'}</h2>
              <Badge className="mt-2" variant="outline">{UserRoles[userData.role] || 'No Role'}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className={userData.isVerified ? "text-green-500" : "text-neutral-300"} size={16} />
                <span>Verification Status: {userData.isVerified ? "Verified" : "Not Verified"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-neutral-500" size={16} />
                <span>Registered on: {formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="text-neutral-500" size={16} />
                <span className="text-sm truncate" title={truncateEthAddress(userData.licenseIPFSHash)}>
                  License: {userData.licenseIPFSHash ? 
                    (userData.licenseIPFSHash.length > 20 ? 
                      `${userData.licenseIPFSHash.substring(0, 20)}...` : 
                      userData.licenseIPFSHash) : 
                    'Not available'}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Edit Profile</Button>
          </CardFooter>
        </Card>
        
        {/* Activity Summary */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
            <CardDescription>Overview of your recent activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="prescriptions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="medicines">Medicines</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              <TabsContent value="prescriptions" className="space-y-4">
                <div className="rounded-md border p-4 mt-4">
                  <div className="flex items-center gap-4">
                    <Clock size={24} />
                    <div>
                      <h3 className="font-medium">No recent prescriptions</h3>
                      <p className="text-sm text-neutral-500">You haven't created any prescriptions yet.</p>
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
                      <p className="text-sm text-neutral-500">No medicine transactions found.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="transactions" className="space-y-4">
                <div className="rounded-md border p-4 mt-4">
                  <div className="flex items-center gap-4">
                    <Clock size={24} />
                    <div>
                      <h3 className="font-medium">No recent transactions</h3>
                      <p className="text-sm text-neutral-500">Your transaction history is empty.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform based on your role</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userData.role === 'Doctor' && (
            <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center">
              <FileText size={24} />
              <span>Create Prescription</span>
            </Button>
          )}
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center">
            <CheckCircle size={24} />
            <span>Verify Medicine</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center">
            <AlertCircle size={24} />
            <span>Report Issue</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center">
            <CalendarIcon size={24} />
            <span>Schedule</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}