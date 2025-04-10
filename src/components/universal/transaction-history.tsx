"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ExternalLink } from "lucide-react"

// Mock transaction data
const transactions = [
  {
    id: "tx1",
    hash: "0x1234...5678",
    type: "sale",
    date: "2023-06-15T14:30:00",
    parties: {
      seller: "0xabc...def",
      buyer: "0x789...012",
    },
    fee: "0.002",
    status: "confirmed",
  },
  {
    id: "tx2",
    hash: "0x5678...9012",
    type: "donation",
    date: "2023-06-14T09:15:00",
    parties: {
      donor: "0xdef...abc",
      recipient: "0x345...678",
    },
    fee: "0.001",
    status: "confirmed",
  },
  {
    id: "tx3",
    hash: "0x9012...3456",
    type: "sale",
    date: "2023-06-13T16:45:00",
    parties: {
      seller: "0x123...456",
      buyer: "0x789...012",
    },
    fee: "0.003",
    status: "failed",
  },
]

export function TransactionHistory() {
  const [transactionType, setTransactionType] = useState("all")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View your recent transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Select defaultValue="all" onValueChange={setTransactionType}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="sale">Sales</SelectItem>
                <SelectItem value="donation">Donations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input type="date" placeholder="Date Range" />
          </div>
        </div>

        <div className="space-y-3">
          {transactions
            .filter((tx) => transactionType === "all" || tx.type === transactionType)
            .map((tx) => (
              <div key={tx.id} className="flex flex-col p-3 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline flex items-center"
                      >
                        {tx.hash}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      <Badge
                        variant={tx.status === "confirmed" ? "outline" : "destructive"}
                        className={tx.status === "confirmed" ? "bg-green-50 text-green-700 border-green-200" : ""}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(tx.date).toLocaleString()}</div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {tx.type}
                  </Badge>
                </div>

                <div className="mt-2 text-xs">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {"seller" in tx.parties && (
                      <>
                        <span className="text-muted-foreground">Seller:</span>
                        <span className="font-mono">{tx.parties.seller}</span>
                      </>
                    )}
                    {"buyer" in tx.parties && (
                      <>
                        <span className="text-muted-foreground">Buyer:</span>
                        <span className="font-mono">{tx.parties.buyer}</span>
                      </>
                    )}
                    {"donor" in tx.parties && (
                      <>
                        <span className="text-muted-foreground">Donor:</span>
                        <span className="font-mono">{tx.parties.donor}</span>
                      </>
                    )}
                    {"recipient" in tx.parties && (
                      <>
                        <span className="text-muted-foreground">Recipient:</span>
                        <span className="font-mono">{tx.parties.recipient}</span>
                      </>
                    )}
                    <span className="text-muted-foreground">Fee:</span>
                    <span>{tx.fee} ETH</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
