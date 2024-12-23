"use client";
import React from "react";
import { motion } from "framer-motion";

export const TextHoverEffect = ({
  text,
  duration,
}: {
  text: string;
  duration?: number;
}) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      <defs>
        {/* Gradient Definition */}
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          x1="0%"
          x2="100%"
          y1="0%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#6a0dad" /> {/* Original */}
          <stop offset="25%" stopColor="#8a2be2" /> {/* Slightly lighter */}
          <stop offset="50%" stopColor="#9932cc" /> {/* Medium light */}
          <stop offset="75%" stopColor="#b57edc" /> {/* Lighter shade */}
          <stop offset="100%" stopColor="#dcb4fc" /> {/* Very light */}
        </linearGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
        <motion.linearGradient
          id="animatedGradient"
          gradientUnits="userSpaceOnUse"
          x1="0%"
          x2="200%"
          y1="0%"
          y2="0%"
          animate={{ x1: ["0%", "100%"], x2: ["100%", "200%"] }}
          transition={{
            duration: duration || 4,
            ease: "linear",
            repeat: Infinity,
            delay: 0.2,
          }}
        >
          <stop offset="0%" stopColor="#6a0dad" /> {/* Original */}
          <stop offset="25%" stopColor="#8a2be2" /> {/* Slightly lighter */}
          <stop offset="50%" stopColor="#9932cc" /> {/* Medium light */}
          <stop offset="75%" stopColor="#b57edc" /> {/* Lighter shade */}
          <stop offset="100%" stopColor="#dcb4fc" /> {/* Very light */}
        </motion.linearGradient>
      </defs>
      {/* Static Text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="font-[helvetica] font-bold fill-transparent stroke-neutral-200 dark:stroke-neutral-800 text-3xl -mb-20"
      >
        {text}
      </text>
      {/* Animated Gradient Text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#animatedGradient)"
        strokeWidth="0.3"
        className="font-[helvetica] font-bold fill-transparent text-3xl -mb-20"
      >
        {text}
      </text>
    </svg>
  );
};
