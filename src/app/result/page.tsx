"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";

const data = [
  {
    teamname: "311_Team",
    teamleader: "Sibasish Padhihari",
    teamdetails: [
      "Sibasish Padhihari",
      "Subham mishra",
      "Sawan Kumar patro",
      "B P ARYAAN",
      "Anshuman Panda",
    ],
  },
  {
    teamname: "AI Architects",
    teamleader: "Swapnajit Mohanty",
    teamdetails: [
      "Swapnajit Mohanty",
      "Sudip Bisui",
      "Smruti Sambhava Mishra",
      "DAYAL SANKAR GHOSH",
    ],
  },
  {
    teamname: "AceDevs",
    teamleader: "Devesh Das",
    teamdetails: ["Devesh Das", "Arbaz Arshad", "Shreya Somi", "Sounic Behera"],
  },
  {
    teamname: "BLUE",
    teamleader: "DEBASHISH MAHANTA",
    teamdetails: [
      "DEBASHISH MAHANTA",
      "Naman Parashar",
      "Sipun Dandpat",
      "Prasenjit Mohanta",
    ],
  },
  {
    teamname: "BreakingBytes",
    teamleader: "Pritam Das",
    teamdetails: ["Pritam Das", "Amlan Pulak Pani", "Bishnuprasad Sahoo"],
  },
  {
    teamname: "Byte navigators",
    teamleader: "Himansu Agrawal",
    teamdetails: [
      "Himansu Agrawal",
      "Subhalaxmi Nayak",
      "Yash Aaryan",
      "Tejaswini pradhan",
      "Anwesh Meher",
    ],
  },
  {
    teamname: "CLONING_CLOWN",
    teamleader: "SOUMEN SAGAR NAYAK",
    teamdetails: [
      "SOUMEN SAGAR NAYAK",
      "Arpita Priyadarsini",
      "Satyajit Parida",
      "Sourabh Kumar Mohanty",
      "ABHIJIT DASH",
    ],
  },
  {
    teamname: "Codeit!",
    teamleader: "Ayushman senapati",
    teamdetails: [
      "Ayushman senapati",
      "Apoorva Pattnaik",
      "Neel kumar parmar",
      "Lorence",
      "Tapasya Das",
    ],
  },
  {
    teamname: "D-SPARK",
    teamleader: "Preeti ranjan Pradhan",
    teamdetails: [
      "Preeti ranjan Pradhan",
      "Satyajyoti",
      "Dhiraj Gupta",
      "ATUL KUMAR RAJAK",
      "Hemanand Swamy",
    ],
  },
  {
    teamname: "DeepSynth",
    teamleader: "Dinabandhu Agrawal",
    teamdetails: [
      "Dinabandhu Agrawal",
      "Mrutyunjaya Swain",
      "Chinmay Paikaray",
      "ABHIJEET BEHERA",
      "Swapneswar Sahoo",
    ],
  },
  {
    teamname: "EduZen",
    teamleader: "Aurosmita Sahoo",
    teamdetails: [
      "Aurosmita Sahoo",
      "Swetalina Pradhan",
      "Gouri Mahala",
      "Rashmita Sahoo",
      "Nibedita Swain",
    ],
  },
  {
    teamname: "HACK HEROES",
    teamleader: "Ashutosh Mahakhud",
    teamdetails: [
      "Ashutosh Mahakhud",
      "Ritesh Gouda",
      "Disha Agarwalla",
      "Shakti Swarup",
      "Bhargavi Konchada",
    ],
  },
  {
    teamname: "MindMentor",
    teamleader: "Swapnajit Sahoo",
    teamdetails: [
      "Swapnajit Sahoo",
      "Annimesh Sasmal",
      "Anjali Kasoudhan",
      "Venzixx",
      "Ankit Nanda",
    ],
  },
  {
    teamname: "NO CODE BUDDIES",
    teamleader: "Manepalli Pavan Kumar",
    teamdetails: [
      "Manepalli Pavan Kumar",
      "Prithwijit Bose",
      "Satya Brata",
      "Lira Mohapatra",
    ],
  },
  {
    teamname: "Rookies",
    teamleader: "Jnanaranjan Pati",
    teamdetails: [
      "Jnanaranjan Pati",
      "Saisubham Sahoo",
      "RITIK RUPAM NANDA",
      "Gayatri Choudhary",
      "Prakash Parida",
    ],
  },
  {
    teamname: "Syntax Squad",
    teamleader: "Bismaya Jyoti Dalei",
    teamdetails: [
      "Bismaya Jyoti Dalei",
      "Sumit Kumar Prusty",
      "Anup Kumar Das",
    ],
  },
  {
    teamname: "Team_Nexus",
    teamleader: "Paritosh Samal",
    teamdetails: [
      "Paritosh Samal",
      "Abhitosh Samal",
      "Amansahoo Sahoo",
      "Amiya Sahoo",
    ],
  },
  {
    teamname: "TypeX",
    teamleader: "Sandeep Kumar Behera",
    teamdetails: [
      "Sandeep Kumar Behera",
      "Subhadarshan Sahoo",
      "Jatin Behera",
      "Girish Kumar Sahoo",
    ],
  },
  {
    teamname: "ZeroDay Troopers",
    teamleader: "Aditya srichandan",
    teamdetails: ["Aditya srichandan"],
  },
  {
    teamname: "abhilipsz8ao_Team",
    teamleader: "Abhilipsa pati",
    teamdetails: [
      "Abhilipsa pati",
      "Millan Kumar",
      "Barsha Rani Behera",
      "Roshan Patra",
      "Sonali Sahu",
    ],
  },
  {
    teamname: "debasispuruaxq_Team",
    teamleader: "Debasis Purohit",
    teamdetails: [
      "Debasis Purohit",
      "Debasish Padhi",
      "Shrejal Mohanty",
      "Subhankar Behera",
    ],
  },
  {
    teamname: "kdeepatrzv6v_Team",
    teamleader: "Kruti Deepa Tripathy",
    teamdetails: [
      "Kruti Deepa Tripathy",
      "suchismita rautaray",
      "Subhasmita Sahoo",
    ],
  },
  {
    teamname: "parthomau32h_Team",
    teamleader: "Partho Mahanty",
    teamdetails: [
      "Partho Mahanty",
      "Ayush Mohanty",
      "Sashwat Ranjan",
      "Afrin firdosh",
      "AYUSH MISHRA",
    ],
  },
  {
    teamname: "technical talking",
    teamleader: "Subhranshu Phari",
    teamdetails: [
      "Subhranshu Phari",
      "Debaraj Nayak",
      "Surya prasad Dash",
      "Amlan Anshuman Behera",
    ],
  },
  {
    teamname: "user_2yvikgsz8j0_Team",
    teamleader: "BRAJAKISHORE BEHERA",
    teamdetails: [
      "BRAJAKISHORE BEHERA",
      "Manab Jyoti Giri",
      "Saurya jit pradhan Saurya",
      "Mamnur Rajak",
      "Debasish Pradhan",
    ],
  },
];

export default function HackathonTeams() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{
    teamname: string;
    teamleader: string;
    teamdetails: string[];
  } | null>(null);

  const handleViewTeam = (team: {
    teamname: string;
    teamleader: string;
    teamdetails: string[];
  }) => {
    setSelectedTeam(team);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-2 sm:p-4 md:p-8 relative overflow-hidden lg:mt-6">
      {/* Background Pattern Layer */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/hack.png)",
            backgroundSize: "150px",
            backgroundRepeat: "repeat",
            transform: "rotate(-15deg) scale(1.5)",
          }}
        />
      </div>

      {/* Large Center Watermark */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center"
        style={{
          backgroundImage: "url(/hack.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "300px",
          transform: "rotate(-15deg)",
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
            <img
              src="/hack.png"
              alt=""
              className="w-12 sm:w-16 h-12 sm:h-16 object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-center px-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Zenotrone Selected Hackathon Teams
            </span>
          </h1>
        </motion.div>

        {/* Table Section */}
        {/* Table Section */}
        <div className="w-full flex justify-center items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-black/50 backdrop-blur-lg shadow-lg min-w-[320px] w-full max-w-4xl relative rounded-lg"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-purple-300 whitespace-nowrap px-2 sm:px-4">
                    Team Name
                  </TableHead>
                  <TableHead className="text-purple-300 whitespace-nowrap px-2 sm:px-4">
                    Team Leader
                  </TableHead>
                  <TableHead className="text-purple-300 whitespace-nowrap px-2 sm:px-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-900 ">
                {data.map((team, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-800"
                  >
                    <TableCell className="font-medium whitespace-nowrap px-2 sm:px-4">
                      {team.teamname}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-2 sm:px-4">
                      {team.teamleader}
                    </TableCell>
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
        <DialogContent className="bg-gradient-to-br from-black to-purple-900 border-purple-500 opacity-80">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center text-white">
              {selectedTeam?.teamname} Details
            </DialogTitle>
          </DialogHeader>

          {selectedTeam && (
            <div className="text-white">
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Team Leader
                </h3>
                <p className="text-sm sm:text-base">
                  {selectedTeam.teamleader}
                </p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Team Members
                </h3>
                <ul className="list-disc pl-5">
                  {selectedTeam.teamdetails.map((member, index) => (
                    <li key={index} className="text-sm sm:text-base mb-1">
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
  );
}
