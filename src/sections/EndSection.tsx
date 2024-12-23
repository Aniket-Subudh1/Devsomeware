"use client";
import Image from "next/image";
import Logo from "@/assets/logo.svg";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export const EndSection = () => {
  return (
    <section className="relative lg:mb-12 sm:mb-2  bg-black text-white py-20">
      <div className="container mx-auto px-4 flex  flex-col lg:flex-row items-center justify-center lg:gap-[20rem] sm:gap-[5rem]">
        <motion.div
          className="relative flex justify-center items-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-purple-300 via-[#6a0dad] to-[#6a0dad] blur-3xl opacity-50"
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          ></motion.div>
          <motion.div
            className="relative w-40 h-40 md:w-48 md:h-48 bg-gray-900 rounded-full shadow-2xl flex items-center justify-center"
            animate={{ y: [-10, 10, -10] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src={Logo}
              alt="DevSomeware Logo"
              className="w-20 h-auto md:w-24"
            />
          </motion.div>
        </motion.div>

        {/* Right: Links */}
        <motion.div
          className="flex flex-col gap-6 text-center lg:text-left"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.h3
            className="text-2xl bg-gradient-to-b text-transparent bg-clip-text from-neutral-200 to-purple-500 md:text-3xl font-bold"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Important Links
          </motion.h3>
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delayChildren: 0.3,
              staggerChildren: 0.2,
            }}
          >
            <motion.a
              href="https://docs.devsomeware.com/default-guide/terms-and-conditions"
              className="flex items-center gap-2 text-lg md:text-xl hover:text-gray-400"
              whileHover={{ x: 5 }}
            >
              Privacy Policy <ChevronRight className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="https://docs.devsomeware.com/default-guide/terms-and-conditions"
              className="flex items-center gap-2 text-lg md:text-xl hover:text-gray-400"
              whileHover={{ x: 5 }}
            >
              Terms and Conditions <ChevronRight className="w-6 h-6" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
