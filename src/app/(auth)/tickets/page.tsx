"use client";
import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { motion } from "framer-motion";
import { Button } from "@/components/Button";
import Link from "next/link";
import EventTicket from "@/utils/EventTicket";
import { useAppSelector } from "@/lib/hook";
const TicketsPage = () => {
  const eventdata = useAppSelector((state) => state.event);
  return (
    <>
    {<BackgroundLines className="flex items-center min-h-screen sm:-mt-[6rem] justify-center w-full flex-col px-4">
      <motion.h2
        className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white sm:text-5xl md:text-5xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
      >
        No Tickets Found !
      </motion.h2>
      <motion.p
        className="max-w-xl mx-auto text-sm md:text-xl text-neutral-700 dark:text-neutral-400 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          delay: 0.3,
          ease: "easeInOut",
        }}
      >
        Wait for Upcoming Events , They are Comming Soon!!
      </motion.p>
      <br></br>
      <Link href="/contact">
        <Button>CONTACT US</Button>
      </Link>
    </BackgroundLines>}
    <div className="  flex items-center justify-center p-4">
      <EventTicket
        eventName="CodeCon 2023"
        date="Feburary 22, 2025"
        location="CUTM BBSR, Odisha"
        ticketId="CODECON-1234-5678"
      />
    </div>
    </>
  );
};

export default TicketsPage;
