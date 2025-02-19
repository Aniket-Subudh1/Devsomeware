"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyIcon, ArrowLeftIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"

export default function ClaimPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (password === process.env.NEXT_PUBLIC_PASSWORD) {
      router.push("/claim/scanner")
    } else {
      setError("Invalid password. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      <div className="absolute inset-0 bg-grid-white/10" />
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-6 flex flex-col items-center space-y-2 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <KeyIcon className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Login to Claim Ticket</h1>
              <p className="text-sm text-muted-foreground">Enter your password to access the ticket scanner</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="transition-shadow duration-300 focus:shadow-lg"
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

