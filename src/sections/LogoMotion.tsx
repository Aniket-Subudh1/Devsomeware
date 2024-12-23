"use client";
/* eslint-disable jsx-a11y/alt-text */
import { useEffect, useState } from "react";
import Logo1 from "@/assets/logo1.png";
import Logo2 from "@/assets/logo2.png";
import Logo3 from "@/assets/logo3.png";
import Logo4 from "@/assets/logo4.png";
import Logo5 from "@/assets/logo5.png";
import Logo6 from "@/assets/logo6.png";
import Logo7 from "@/assets/logo1.png";
import Logo8 from "@/assets/logo2.png";
import Logo9 from "@/assets/logo3.png";
import Logo10 from "@/assets/logo4.png";
import Logo11 from "@/assets/logo5.png";
import Logo12 from "@/assets/logo6.png";
import Image from "next/image";
import { motion } from "framer-motion";

export const LogoMotion = () => {
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setDirection(
        scrollY > (window as unknown as { lastScrollY: number }).lastScrollY
          ? 1
          : -1
      );
      (window as unknown as { lastScrollY: number }).lastScrollY = scrollY;
    };

    (window as unknown as { lastScrollY: number }).lastScrollY = window.scrollY;
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logos = [
    Logo1,
    Logo2,
    Logo3,
    Logo4,
    Logo5,
    Logo6,
    Logo7,
    Logo8,
    Logo9,
    Logo10,
    Logo11,
    Logo12,
  ];

  return (
    <section className="lg:py-10 md:py-8 sm:py-2 min-w-screen">
      <div className="container">
        <div className="flex items-center gap-5">
          <div className="flex flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <motion.div
              initial={{ translateX: "-50%" }}
              animate={{ translateX: direction === 1 ? "0" : "-50%" }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
                direction: direction === 1 ? "normal" : "reverse",
              }}
              className="flex flex-none pr-14 gap-14 -translate-x-1/2"
            >
              {logos.map((logo, index) => (
                <div key={index} className="flex items-center gap-6">
                  <Image
                    src={logo}
                    alt={`Logo ${index + 1}`}
                    className="h-16 w-auto"
                  />
                  {index < logos.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-purple-500 text-xl font-bold"
                    >
                      ★
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
