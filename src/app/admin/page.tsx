"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { LoginForm } from "@/utils/Admin/login-form"

// Dynamically import DataTable with no SSR to avoid hydration issues
const DataTable = dynamic(() => import('@/utils/Admin/data-table').then(mod => mod.DataTable), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/userdata")
      if (!res.ok) throw new Error('Failed to fetch data')
      const response = await res.json()
      setData(response.data)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">Error loading data: {error}</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!isLoggedIn ? (
        <LoginForm onLogin={setIsLoggedIn} />
      ) : (
        <div className="lg:max-w-6xl md:max-w-6xl w-full">
          <h1 className="text-2xl font-bold mb-4">Data Table</h1>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <DataTable data={data} />
          )}
        </div>
      )}
    </main>
  )
}