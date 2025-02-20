"use client"

import { useState } from "react"
import Link from "next/link"
import { QrScanner } from "@/utils/Admin/qr-scanner"
import { UserDataModal } from "@/utils/Admin/user-data-modal"
import { ArrowLeftIcon, QrCodeIcon } from "lucide-react";

// Mock user data - in a real app, this would come from an API
const mockUserData = {
  name: "John Doe",
  email: "john@example.com",
  photo: "/placeholder.svg?height=200&width=200",
  ticketId: "TICKET-123",
  ticketType: "VIP Access",
  purchaseDate: "2024-02-20",
  status: "Valid",
}

export default function ScannerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userData, setUserData] = useState(mockUserData)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)

  const handleScan = (data: string | null) => {
    if (data && data !== lastScannedCode) {
      console.log("Scanned QR code:", data)
      setLastScannedCode(data)
      
      // In a real app, you would validate the QR code data
      // and fetch user data from an API
      const ticketId = data.startsWith('TICKET-') ? data : `TICKET-${data.substring(0, 10)}`;
      
      setUserData({
        ...mockUserData,
        ticketId: ticketId
      })
      
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setLastScannedCode(null)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      <div className="absolute inset-0 bg-grid-white/10" />
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/claim"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Login
          </Link>
          <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-6 flex flex-col items-center space-y-2 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <QrCodeIcon className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Scan Ticket QR Code</h1>
              <p className="text-sm text-muted-foreground">Position the QR code within the frame to scan</p>
            </div>
            
            <QrScanner onScan={handleScan} isActive={!isModalOpen} />
            
            {lastScannedCode && (
              <div className="mt-4 text-sm text-center text-muted-foreground">
                Code scanned: {lastScannedCode.substring(0, 12)}...
              </div>
            )}
          </div>
        </div>
      </div>
      <UserDataModal isOpen={isModalOpen} onClose={handleCloseModal} userData={userData} />
    </div>
  )
}