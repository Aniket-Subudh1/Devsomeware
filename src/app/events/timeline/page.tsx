"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Timeline } from "@/components/ui/timeline";
import { motion } from "framer-motion";

// Lucide icons:
import { Ticket, Rocket, MessageCircle, Code, Zap } from "lucide-react";

// Import our new registration modal
import { EventRegistrationModal } from "@/components/ui/EventRegistrationModal";


const terminalLines = [
  "> npm init ZeNoTronE",
  "> npm install AmazingTechEvent --save",
  "> npm run dev",
  "> INITIALIZING TECH JOURNEY...",
  "[ COSMIC_REGISTRATION → OPENING_CEREMONY → TECH_TALKS → ZENOTRONE_HACKTHON ]",
];


type TimelineEvent = {
  title: string;
  phase: string;
  date: string;
  status: "completed" | "ongoing" | "upcoming";
  icon: any;
  highlights: string[];
  images: string[];
};

export default function TimelineDemo() {
  const [showTimeline, setShowTimeline] = useState(false);
  const [terminalIndex, setTerminalIndex] = useState(0);

  
  useEffect(() => {
    if (terminalIndex < terminalLines.length) {
      const timer = setTimeout(() => {
        setTerminalIndex((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowTimeline(true), 500);
    }
  }, [terminalIndex]);

 
  const events: TimelineEvent[] = [
    {
      title: "Cosmic Registration",
      phase: "Stellar Entry Phase",
      date: "Feb 1-15, 2025",
      status: "upcoming",
      icon: Ticket, // Lucide icon
      highlights: [
        "Registration starts for all events",
        "Limited Seats for Hackathon & Tech Talks",
        "Team Registration Benefits",
        "Exclusive Swags for Early Registrations",
      ],
      images: ["/cos_r.png"],
    },
    {
      title: "Opening Ceremony & Orientation",
      phase: "Community Kickoff",
      date: "Feb 22, 2025",
      status: "upcoming",
      icon: Rocket,
      highlights: [
        "Introduction to DevSomeware Community",
        "Welcome Speeches by Founders & Group Leads",
        "Overview of Fullstack, AI, Blockchain, Cloud, and AR-VR Groups",
        "Interactive Quiz with Exciting Prizes",
      ],
      images: ["/ori.png"],
    },
    {
      title: "Tech Talks",
      phase: "Expert Knowledge Sessions",
      date: "Feb 22, 2025",
      status: "upcoming",
      icon: MessageCircle,
      highlights: [
        "Session 1: AI, Blockchain & Cloud Trends",
        "Session 2: AR-VR & Fullstack Innovations",
        "Live Q&A with Industry Experts",
        "Engagement via Interactive Polls",
      ],
      images: ["/talk.png"],
    },
    {
      title: "ZeNoTronE Hackathon",
      phase: "24hr Innovation Challenge",
      date: "Feb 22, 2025",
      status: "upcoming",
      icon: Code,
      highlights: [
        "Themes: AI for Social Impact, Cloud Innovations, Tech for Climate",
        "24-hour Challenge for Innovative Solutions",
        "Judging Criteria: Innovation, Feasibility, Impact, and More",
        "Winning Projects Receive Prizes and Recognition",
      ],
      images: ["/hack.png"],
    },
  ];
  

  return (
    <div className="w-full bg-purple -mt-16 min-h-screen flex flex-col">
      {/* Terminal effect */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-lg md:text-4xl mb-4 mt-28 text-transparent 
                   bg-clip-text bg-[linear-gradient(45deg,#8b5cf6,#ec4899)] 
                   font-bold max-w-4xl cyber-font text-center mx-auto"
      >
        DEV_SOMEWARE::ZENOTRONE_2025
      </motion.h2>

      <motion.div
        className="mb-8 text-left px-6 py-3 rounded-lg text-purple-300 font-mono 
                   bg-black/50 border border-purple-500 shadow-lg w-full max-w-xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {terminalLines.slice(0, terminalIndex + 1).map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.5 }}
            className="text-sm md:text-base"
          >
            {line}
          </motion.p>
        ))}
      </motion.div>

      {/* Glowing beam animation */}
      {showTimeline && (
        <motion.div
          className="w-full h-1 bg-purple-500/40 rounded-full overflow-hidden relative mb-0"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full w-20 bg-purple-500 blur-md rounded-full"
            animate={{ x: ["0%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </motion.div>
      )}

      {/* Timeline */}
      {showTimeline && (
        <Timeline
          data={events.map((event) => ({
            title: event.title,
            content: (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative group"
              >
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-purple-500/10 backdrop-blur-sm">
                    <event.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-100">
                      {event.title}
                    </h3>
                    <p className="text-sm text-purple-300/80">
                      {event.phase}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">
                        {event.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <p className="text-purple-200/80 text-sm leading-relaxed">
                    {event.highlights.join(", ")}
                  </p>

                  {/* If you still want to show images *outside* of the modal, keep this. 
                      Otherwise, remove it entirely if you want zero images. */}
                  <div className="grid grid-cols-2 gap-4">
                    {event.images.map((img, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="relative h-32 md:h-44 rounded-xl overflow-hidden 
                                   shadow-[0_0_24px_rgba(147,_51,_234,_0.15)]"
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Registration Button in bottom-right */}
                <div className="mt-4 text-right">
                  <EventRegistrationModal
                    title={event.title}
                    date={event.date}
                    highlights={event.highlights}
                    icon={event.icon} 
                    onConfirm={() => {
                      console.log(`User clicked YES for ${event.title}`);
                    }}
                  />
                </div>
              </motion.div>
            ),
          }))}
        />
      )}
    </div>
  );
}
