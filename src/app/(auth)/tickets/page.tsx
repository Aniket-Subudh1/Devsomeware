"use client";
import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { motion } from "framer-motion";
import { Button } from "@/components/Button";
import Link from "next/link";
import EventTicket from "@/utils/EventTicket";
import { useAppSelector } from "@/lib/hook";
import { Spotlight } from "@/components/ui/spotlight";

const Card = () => {
  return (
    <div className="relative mt-10 border bg-black bg-opacity-10 backdrop-blur-[1px] overflow-hidden max-w-full h-auto sm:h-[100px] md:h-[150px] lg:h-[150px]">
      <Spotlight
        className="from-purple-500 via-purple-800 to-purple-500 blur-xl"
        size={64}
      />

      <div className="p-4">
        <h1 className="z-10 text-center font-bold text-purple-400 sm:text-2xl md:text-5xl lg:text-5xl md:py-4">
          &#123; Tickets for Events &#125;
        </h1>
        <h5 className="z-10 text-center text-gray-100 text-xs sm:text-sm md:text-lg lg:text-lg">
          Below are all the tickets you have purchased for the events.
        </h5>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <svg className="h-full w-full">
          <defs>
            <pattern
              id="grid-pattern"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 4H4M4 4V0M4 4H8M4 4V8"
                stroke="currentColor"
                strokeOpacity="0.3"
                className="stroke-black"
              />
              <rect
                x="3"
                y="3"
                width="2"
                height="2"
                fill="currentColor"
                fillOpacity="0.25"
                className="fill-black"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>
    </div>
  );
};

const TicketsPage = () => {
  const eventData = useAppSelector((state) => state.event);
  const user = useAppSelector((state) => state.user);

  const hasTicket = !!eventData?.ticketid;

  return (
    <main>
      <Card />
      <div className="min-h-screen bg-gradient-to-br  from-black via-black to-purple-900 -mt-20 flex items-center justify-center px-4 py-16">
        {hasTicket ? (
          <div className="flex flex-col items-center w-full max-w-4xl">
            <EventTicket
              name={user.name}
              eventName={eventData.eventname?.toUpperCase() || "UNKNOWN EVENT"}
              date="February 22, 2025"
              location="CUTM BBSR, Odisha"
              ticketId={eventData.ticketid}
            />
          </div>
        ) : (
          // If no ticket is found
          <BackgroundLines className="flex flex-col items-center w-full text-center py-20">
            <motion.h2
              className="bg-clip-text text-transparent bg-gradient-to-b from-purple-100 to-white text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
            >
              No Tickets Found!
            </motion.h2>
            <motion.p
              className="max-w-xl mx-auto text-purple-200 text-base sm:text-lg md:text-xl mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                delay: 0.3,
                ease: "easeInOut",
              }}
            >
              Stay tuned, upcoming events are on the way!
            </motion.p>
            <Link href="/contact">
              <Button>CONTACT US</Button>
            </Link>
          </BackgroundLines>
        )}
      </div>
    </main>
  );
};

export default TicketsPage;
