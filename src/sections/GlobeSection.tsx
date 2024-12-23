"use client";
import React from "react";
import { motion } from "framer-motion";
import Earth from "@/components/ui/globe";
import { Sparkles } from "@/components/ui/sparkles";

function GlobeSection() {
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <>
      <div className="h-screen overflow-hidden bg-black text-white">
        <article className="grid gap-4 text-center relative z-10 pt-10">
          <motion.span
            className="inline-block text-sm border p-1 px-3 w-fit mx-auto rounded-full border-[#6a0dad] bg-black"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.8 }} // Re-trigger animations
            variants={textVariants}
          >
            Join the Movement
          </motion.span>
          <motion.h1
            className="text-4xl font-semibold bg-gradient-to-b from-[#edeffd] to-[#6a0dad] bg-clip-text text-transparent leading-[100%] tracking-tighter"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.8 }} // Re-trigger animations
            variants={textVariants}
          >
            Empower Developers,
            <br />
            Build the Future Together.
          </motion.h1>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.8 }} // Re-trigger animations
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 1, ease: "easeOut" },
              },
            }}
          >
            <Earth />
          </motion.div>
        </article>
        <div className="relative -mt-32 h-80 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#6a0dad,transparent_90%)] before:opacity-40 after:absolute after:-left-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[10%] after:border-t after:border-[#6a0dad] after:bg-[#2d143f]">
          <Sparkles
            density={800}
            speed={1.2}
            size={1.2}
            direction="top"
            opacitySpeed={2}
            color="#6a0dad"
            className="absolute inset-x-0 bottom-0 h-full w-full "
          />
        </div>
      </div>
    </>
  );
}

export default GlobeSection;
