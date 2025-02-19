"use client"

import type React from "react"
import { Toaster,toast } from "sonner"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginFormProps {
  onLogin: (success: boolean) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Hardcoded password check (not secure for production)
    if (password === process.env.NEXT_PUBLIC_PASSWORD) {
      onLogin(true)
    } else {
        toast.error("Invalid password")
        onLogin(false)
    }
  }

  return (
    <Card className="w-[350px]">
        <Toaster richColors position="top-center"/>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

