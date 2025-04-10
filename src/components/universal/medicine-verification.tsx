import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Search } from "lucide-react"

export function MedicineVerification() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medicine Verification</CardTitle>
        <CardDescription>Verify authenticity and track medicine history</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="batch">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="batch">Batch</TabsTrigger>
            <TabsTrigger value="ownership">Ownership</TabsTrigger>
            <TabsTrigger value="recalls">Recalls</TabsTrigger>
          </TabsList>
          <TabsContent value="batch" className="space-y-4">
            <div className="space-y-2 pt-2">
              <Label htmlFor="batch-number">Batch Number</Label>
              <div className="flex space-x-2">
                <Input id="batch-number" placeholder="Enter batch number" />
                <Button size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md bg-green-50 p-3 border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Verified Authentic</h4>
                  <p className="text-sm text-green-700">
                    This batch has been verified as authentic and has not been reported in any recalls.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ownership" className="space-y-4">
            <div className="space-y-2 pt-2">
              <Label htmlFor="token-id">Medicine NFT ID</Label>
              <div className="flex space-x-2">
                <Input id="token-id" placeholder="Enter NFT ID" />
                <Button size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Ownership History</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 border-b">
                  <span className="font-mono">0xabc...def</span>
                  <span className="text-muted-foreground">Current Owner</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span className="font-mono">0x123...456</span>
                  <span className="text-muted-foreground">Jun 10, 2023</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span className="font-mono">0x789...012</span>
                  <span className="text-muted-foreground">May 25, 2023</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="font-mono">0xdef...789</span>
                  <span className="text-muted-foreground">Manufacturer</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recalls" className="space-y-4">
            <div className="space-y-2 pt-2">
              <Label htmlFor="recall-search">Search Recalls</Label>
              <div className="flex space-x-2">
                <Input id="recall-search" placeholder="Medicine name or batch" />
                <Button size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Active Recall Notice</h4>
                  <p className="text-sm text-amber-700">
                    Batch #A12345 of Antibiotic XYZ has been recalled due to packaging concerns.
                  </p>
                  <Button variant="link" className="h-auto p-0 text-amber-800">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
