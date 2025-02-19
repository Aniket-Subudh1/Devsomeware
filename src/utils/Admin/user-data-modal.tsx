"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, MailIcon, TicketIcon, UserIcon } from "lucide-react"

interface UserData {
  name: string
  email: string
  photo: string
  ticketId: string
  ticketType: string
  purchaseDate: string
  status: string
}

interface UserDataModalProps {
  isOpen: boolean
  onClose: () => void
  userData: UserData
}

export function UserDataModal({ isOpen, onClose, userData }: UserDataModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Ticket Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-primary/10">
                <Image src={userData.photo || "/placeholder.svg"} alt={userData.name} fill className="object-cover" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold">{userData.name}</h3>
                <Badge variant={userData.status === "Valid" ? "default" : "destructive"} className="mt-2">
                  {userData.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <TicketIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ticket ID</p>
                  <p className="text-sm text-muted-foreground">{userData.ticketId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ticket Type</p>
                  <p className="text-sm text-muted-foreground">{userData.ticketType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Purchase Date</p>
                  <p className="text-sm text-muted-foreground">{userData.purchaseDate}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  

