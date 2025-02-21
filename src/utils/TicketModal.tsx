import { Github, Linkedin, Mail } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ZenotroneEventDialog({renderModal,setRenderModal,setRender}:{renderModal:boolean,setRenderModal:React.Dispatch<React.SetStateAction<boolean>>,setRender:React.Dispatch<React.SetStateAction<boolean>>}) {
  return (
    <Dialog open={renderModal} >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zenotrone Event</DialogTitle>
          <DialogDescription>Event participant details</DialogDescription>
          <X className="absolute top-4 right-4 cursor-pointer" onClick={()=>{
            setRenderModal(false)
            setRender(true);
            }} />
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Participant" />
              <AvatarFallback>ZE</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <h3 className="font-semibold text-lg">Jane Doe</h3>
              <p className="text-sm text-muted-foreground">jane.doe@example.com</p>
              <div className="flex gap-2 mt-2">
                <Button size="icon" variant="outline">
                  <Github className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Ticket ID:</span>
              <span className="text-sm">ZE-2024-001</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="outline">Not Claimed</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Zenotrone Hackathon:</span>
              <Badge variant="outline">Participated</Badge>
            </div>
          </div>
        </div>
        <Button className="w-full">Claim Ticket</Button>
      </DialogContent>
    </Dialog>
  )
}

