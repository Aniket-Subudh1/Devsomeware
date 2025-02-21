/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {ChevronUp, ChevronDown } from "lucide-react"
// Move ExcelJS import into the export function to avoid SSR issues

interface DataTableProps {
  data: Array<{
    iszentrone: any
    clm: any
    ticketid: any
    userid: any
    email: string
    ticketStatus: string
  }>
}

export function DataTable({ data }: DataTableProps) {
  const [filteredData, setFilteredData] = useState(data)
  const [nameFilter, setNameFilter] = useState("")
  const [ticketFilter, setTicketFilter] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DataTableProps["data"][0] | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })

  // Dynamically import ExcelJS and file-saver only when needed
 

  useEffect(() => {
    let result = [...data]

    if (nameFilter) {
      result = result.filter(item => 
        item.userid?.name?.toLowerCase().includes(nameFilter.toLowerCase())
      )
    }

    if (ticketFilter) {
      result = result.filter(item => 
        item.ticketid?.toString().toLowerCase().includes(ticketFilter.toLowerCase())
      )
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]
        if (!aValue || !bValue) return 0
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    setFilteredData(result)
  }, [data, nameFilter, ticketFilter, sortConfig])

  const handleSort = (key: keyof DataTableProps["data"][0]) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    })
  }

  

  const getSortIcon = (key: keyof DataTableProps["data"][0]) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search by name" 
            value={nameFilter} 
            onChange={e => setNameFilter(e.target.value)} 
            className="w-full sm:w-[200px]" 
          />
          <Input 
            placeholder="Search by ticket ID" 
            value={ticketFilter} 
            onChange={e => setTicketFilter(e.target.value)} 
            className="w-full sm:w-[200px]" 
          />
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto">
        <Table className="w-full min-w-[700px]">
          <TableHeader>
            <TableRow>
              {["Name", "Email", "Ticket ID", "Ticket Status"].map((header, index) => (
                <TableHead
                  key={index}
                  className="cursor-pointer hover:bg-gray-900 text-left px-3 py-2 whitespace-nowrap"
                  onClick={() => handleSort(header.toLowerCase().replace(" ", "") as keyof DataTableProps["data"][0])}
                >
                  <div className="flex items-center">
                    {header}
                    {getSortIcon(header.toLowerCase().replace(" ", "") as keyof DataTableProps["data"][0])}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-gray-900">
                <TableCell className="px-3 py-2 whitespace-nowrap">
                  {row.userid?.name || '-'}
                </TableCell>
                <TableCell className="px-3 py-2 whitespace-nowrap">
                  {row.email || '-'}
                </TableCell>
                <TableCell className="px-3 py-2 whitespace-nowrap">
                  {row.ticketid || '-'}
                </TableCell>
                <TableCell className="px-3 py-2 whitespace-nowrap">
                  {!row.clm ? "Not Claimed" : "Claimed"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}