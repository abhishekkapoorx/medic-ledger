import { SellerInterface } from "@/components/marketplace/seller-interface"
import { BuyerInterface } from "@/components/marketplace/buyer-interface"
import { AdminInterface } from "@/components/marketplace/admin-interface"
import { TransactionHistory } from "@/components/universal/transaction-history"
import { MedicineVerification } from "@/components/universal/medicine-verification"
import { PrescriptionValidation } from "@/components/universal/prescription-validation"

type MedicineDashboardProps = {
  userType: "seller" | "buyer" | "admin"
}

export function MedicineDashboard({ userType }: MedicineDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {userType === "seller" && <SellerInterface />}
        {userType === "buyer" && <BuyerInterface />}
        {userType === "admin" && <AdminInterface />}
      </div>
      <div className="space-y-6">
        <TransactionHistory />
        <MedicineVerification />
        <PrescriptionValidation />
      </div>
    </div>
  )
}
