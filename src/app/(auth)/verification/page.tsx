"use client";
import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { motion } from "framer-motion";
import { Button } from "@/components/Button";
import Link from "next/link";
const VerificationPage = () => {
  return (
    <BackgroundLines className="flex items-center min-h-screen sm:-mt-[5rem] justify-center w-full flex-col px-4">
      <motion.h2
        className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
      >
        Application Under Verification
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
        Thank you for applying to join <strong>DevSomeware</strong>. Your
        application is currently under verification. Our team is reviewing your
        submission, and you will receive an update soon. We appreciate your
        patience and look forward to having you as part of our community.
      </motion.p>
      <br></br>
      <Link href="/contact">
        <Button>CONTACT US</Button>
      </Link>
    </BackgroundLines>
  );
};

export default VerificationPage;
