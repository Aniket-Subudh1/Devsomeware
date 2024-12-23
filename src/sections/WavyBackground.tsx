"use client";
import React, { useRef } from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { motion, useInView } from "framer-motion";

export function WavyBackgroundDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50px 0px", once: false });

  return (
    <WavyBackground className="max-w-4xl mx-auto pb-12">
      <div ref={ref}>
        <motion.p
          className="text-2xl md:text-4xl lg:text-6xl bg-gradient-to-b bg-clip-text text-transparent from-neutral-200 to-purple-500  font-bold inter-var text-center shadow-glow"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          OPEN SOURCE COMMUNITY
        </motion.p>

        <motion.p
          className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          We are a community of developers, designers, and creators who love
          open-source.
        </motion.p>
      </div>
    </WavyBackground>
  );
}
