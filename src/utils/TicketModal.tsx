/* eslint-disable @typescript-eslint/no-explicit-any */
import { Github, Linkedin, Mail } from "lucide-react"
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react";

export default function ZenotroneEventDialog({renderModal,setRenderModal,setRender,result}:{renderModal:boolean,setRenderModal:React.Dispatch<React.SetStateAction<boolean>>,setRender:React.Dispatch<React.SetStateAction<boolean>>,result:any}) {
  const [loading,setLoading] = useState(false);
  const claimTicket = async ()=>{
    try{
      setLoading(true);
      const res = await fetch('/api/claim',{
        method:'POST',
        body:JSON.stringify({id:result.ticketid}),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setLoading(false);
      setRenderModal(false);
      setRender(true);
      if(data.success){
        toast.success(data.message);
        
      }
      else{
        toast.error(data.message);
      }
    }
    catch(err){
      console.log(err);
      toast.error('Something went wrong try again after sometime');
    }
  }
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
              <AvatarImage src={result&&result.userid.img} alt="Participant" />
              <AvatarFallback>{result&&result.userid.name[0]}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <h3 className="font-semibold text-lg">{result&&result.userid.name}</h3>
              <p className="text-sm text-muted-foreground">{result&&result.userid.email}</p>
              <div className="flex gap-2 mt-2">
                <Button size="icon" variant="outline" onClick={()=>window.open(result&&result.userid?.github)}>
                  <Github className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={()=>window.open(result&&result.userid?.linkedin)}>
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={()=>window.open(`mailto:${result&&result.userid.email}`)}>
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Ticket ID:</span>
              <span className="text-sm">{result&&result.ticketid}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="outline">{result.clm?"Claimed":"Not Claimed"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Zenotrone Hackathon:</span>
              <Badge variant="outline">{result.iszentrone?"Participated":"Not Participated"}</Badge>
            </div>
          </div>
        </div>
        <Button className="w-full" onClick={claimTicket}>
        {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    'Claim Ticket'
                  )}
          </Button>
      </DialogContent>
    </Dialog>
  )
}

