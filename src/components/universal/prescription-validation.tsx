import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, QrCode, User } from "lucide-react"

export function PrescriptionValidation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescription Validation</CardTitle>
        <CardDescription>Verify and validate prescription NFTs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prescription-id">Prescription ID</Label>
          <div className="flex space-x-2">
            <Input id="prescription-id" placeholder="Enter prescription NFT ID" />
            <Button size="icon">
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md bg-green-50 p-3 border border-green-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">Valid Prescription</h4>
              <p className="text-sm text-green-700">This prescription is valid and has not been fully used.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Doctor Verification</h4>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Verified
            </Badge>
          </div>
          <div className="flex items-center space-x-2 p-2 border rounded-md">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium">Dr. Sarah Johnson</div>
              <div className="text-xs text-muted-foreground">License #MD12345</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Usage History</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 border-b">
              <span>Antibiotic XYZ 250mg</span>
              <span className="text-muted-foreground">1 of 3 used</span>
            </div>
            <div className="flex justify-between p-2">
              <span>Pain Reliever ABC 500mg</span>
              <span className="text-muted-foreground">0 of 2 used</span>
            </div>
          </div>
        </div>

        <Button className="w-full">Auto-fulfill Prescription</Button>
      </CardContent>
    </Card>
  )
}
