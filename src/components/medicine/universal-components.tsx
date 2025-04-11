"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Scan, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import useWallet from "@/hooks/useWallet"
import toast from "react-hot-toast"

export default function UniversalComponents() {
  const [qrValue, setQrValue] = useState("")
  const [scanResult, setScanResult] = useState<null | { isAuthentic: boolean; message: string }>(null)
  const [medicineId, setMedicineId] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const { contracts, isConnected } = useWallet()

  const handleScan = () => {
    // Mock scan result - in a real app, this would use a QR scanner
    setScanResult({
      isAuthentic: Math.random() > 0.2, // 80% chance of being authentic for demo
      message: "Medicine verification complete",
    })
  }

  const handleGenerateQR = () => {
    // In a real app, this would generate a QR code from the IPFS hash
    setQrValue("https://example.com/verify/medicine/123")
  }

  const handleViewDetails = () => {
    // Navigate to medicine details page
    router.push("/medicine/details/123")
  }

  const handleSearch = async () => {
    if (!medicineId) {
      toast.error("Please enter a medicine ID")
      return
    }

    if (!isConnected || !contracts.medicineContract) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSearching(true)
    try {
      // Check if medicine exists by trying to get its owner
      await contracts.medicineContract.ownerOf(medicineId)
      
      // If it exists, navigate to the medicine details page
      router.push(`/medicine/details/${medicineId}`)
    } catch (error: any) {
      console.error("Error searching for medicine:", error)
      toast.error("Medicine not found or invalid ID")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>QR Verification Panel</CardTitle>
          <CardDescription>Generate or scan QR codes for medicine verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
            {qrValue ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48 bg-white border flex items-center justify-center">
                  {/* This would be a real QR code in production */}
                  <QrCode className="w-32 h-32" />
                </div>
                <p className="text-sm text-center break-all max-w-xs">{qrValue}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <QrCode className="w-16 h-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Generate a QR code for verification</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleGenerateQR} className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Generate QR
            </Button>
            <Button onClick={handleScan} variant="outline" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scan Batch
            </Button>
          </div>

          {scanResult && (
            <div
              className={`p-4 rounded-lg flex items-center ${
                scanResult.isAuthentic ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {scanResult.isAuthentic ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              <div>
                <p className="font-medium">{scanResult.isAuthentic ? "Authentic Medicine" : "Potential Counterfeit"}</p>
                <p className="text-sm">{scanResult.message}</p>
              </div>
            </div>
          )}

          <Button variant="link" onClick={handleViewDetails} className="w-full">
            View Medicine Details
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medicine Lookup</CardTitle>
          <CardDescription>Find medicine details by token ID</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter medicine token ID" 
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>

          <div className="p-6 border rounded-lg flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Scan className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Enter a medicine token ID to view its complete details
            </p>
          </div>

          <Button variant="outline" className="w-full">
            Report Counterfeit
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
