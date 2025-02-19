import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TicketIcon, ShieldCheckIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      <div className="absolute inset-0 bg-grid-white/10" />
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
          <div className="space-y-2 text-center">
            <h1 className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
              Ticket System
            </h1>
            <p className="text-muted-foreground">Choose your path to proceed</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/admin" className="group">
              <Button
                size="lg"
                className="relative h-32 w-full overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                  <ShieldCheckIcon className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-lg font-semibold">Admin Portal</span>
                </div>
              </Button>
            </Link>
            <Link href="/claim" className="group">
              <Button
                size="lg"
                variant="secondary"
                className="relative h-32 w-full overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                  <TicketIcon className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-lg font-semibold">Claim Ticket</span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

