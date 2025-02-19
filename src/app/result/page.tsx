"use client"

import { useState } from "react"
import { motion} from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users } from "lucide-react"

const data = [
  {
    teamname: "Code Crushers",
    teamleader: "Alice Johnson",
    teamdetails: ["Bob Smith", "Charlie Brown", "Diana Prince", "Ethan Hunt"],
  },
  {
    teamname: "Byte Busters",
    teamleader: "Frank Castle",
    teamdetails: ["Grace Hopper", "Hank Pym", "Iris West", "Jack Ryan"],
  },
  {
    teamname: "Tech Titans",
    teamleader: "Lara Croft",
    teamdetails: ["Max Payne", "Nora Allen", "Oscar Isaac", "Peter Parker"],
  },
]

export default function HackathonTeams() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<{ teamname: string; teamleader: string; teamdetails: string[] } | null>(null)

  const handleViewTeam = (team: { teamname: string; teamleader: string; teamdetails: string[] }) => {
    setSelectedTeam(team)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-black text-white p-2 sm:p-4 md:p-8 relative overflow-hidden lg:mt-6">
      {/* Background Pattern Layer */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: 'url(/hack.png)',
            backgroundSize: '150px',
            backgroundRepeat: 'repeat',
            transform: 'rotate(-15deg) scale(1.5)',
          }}
        />
      </div>

      {/* Large Center Watermark */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center"
        style={{
          backgroundImage: 'url(/hack.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '300px',
          transform: 'rotate(-15deg)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-4 sm:mb-8"
        >
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 opacity-20">
            <img src="/hack.png" alt="" className="w-12 sm:w-16 h-12 sm:h-16 object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-center px-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Zenotrone Selected Hackathon Teams
            </span>
          </h1>
        </motion.div>

        {/* Table Section */}
        <div className="w-full overflow-x-auto rounded-lg">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-black/50 backdrop-blur-lg shadow-lg min-w-[320px] relative"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-purple-300 whitespace-nowrap px-2 sm:px-4">Team Name</TableHead>
                  <TableHead className="text-purple-300 whitespace-nowrap px-2 sm:px-4">Team Leader</TableHead>
                  <TableHead className="text-purple-300 whitespace-nowrap px-2 sm:px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((team, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TableCell className="font-medium whitespace-nowrap px-2 sm:px-4">{team.teamname}</TableCell>
                    <TableCell className="whitespace-nowrap px-2 sm:px-4">{team.teamleader}</TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <Button
                        variant="outline"
                        onClick={() => handleViewTeam(team)}
                        className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap w-full sm:w-auto"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        View Team
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-gradient-to-br from-black to-purple-900 border-purple-500">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white">
              {selectedTeam?.teamname} Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTeam && (
            <div className="text-white">
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Team Leader</h3>
                <p className="text-sm sm:text-base">{selectedTeam.teamleader}</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Team Members</h3>
                <ul className="list-disc pl-5">
                  {selectedTeam.teamdetails.map((member, index) => (
                    <li
                      key={index}
                      className="text-sm sm:text-base mb-1"
                    >
                      {member}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}