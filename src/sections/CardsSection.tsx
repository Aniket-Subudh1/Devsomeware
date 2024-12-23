"use client";
import React from "react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Users, Code, Rocket, GitFork } from "lucide-react";
import { motion } from "framer-motion";

const CardContent = ({
  title,
  description,
  icon: Icon,
  customStyles,
  animationDelay,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  customStyles?: string;
  animationDelay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: animationDelay }}
      viewport={{ once: false, amount: 0.2 }}
      className={`lg:flex justify-center`}
    >
      <CardSpotlight
        className={`p-6 flex flex-col justify-between relative bg-black border border-neutral-700 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform ${customStyles}`}
      >
        <div>
          <p className="lg:text-2xl sm:text-lg font-bold relative z-20 text-white">
            {title}
          </p>
          <p className="text-neutral-300 mt-4 relative z-20 sm:text-sm lg:text-sm">
            {description}
          </p>
        </div>
        <div className="absolute bottom-4 left-4 h-14 w-14 border-2 border-purple-500 rounded-lg flex items-center justify-center">
          <Icon className="h-8 w-8 text-purple-500" />
        </div>
      </CardSpotlight>
    </motion.div>
  );
};

export function CardsSection() {
  const cardsData = [
    {
      title: "Open Source Contributions",
      description:
        "Contribute to impactful open-source projects and collaborate with developers worldwide.",
      icon: GitFork,
      customStyles: "h-[18rem] lg:h-[20rem] lg:w-[20rem] lg:top-20",
      animationDelay: 0.2,
    },
    {
      title: "Hackathons & Events",
      description:
        "Participate in exciting hackathons, workshops, and meetups to sharpen your skills.",
      icon: Rocket,
      customStyles: "h-[18rem] lg:h-[20rem] lg:w-[20rem]",
      animationDelay: 0.2,
    },
    {
      title: "Developer Networking",
      description:
        "Connect with like-minded developers and expand your professional network.",
      icon: Users,
      customStyles: "h-[18rem] lg:h-[20rem] lg:w-[20rem]",
      animationDelay: 0.4,
    },
    {
      title: "Learn & Grow",
      description:
        "Access resources, mentorship, and opportunities to grow as a developer.",
      icon: Code,
      customStyles: "h-[18rem] lg:h-[20rem] lg:w-[20rem] lg:top-20",
      animationDelay: 0.4,
    },
  ];

  return (
    <div className="relative h-auto w-full py-12 px-4 bg-white dark:bg-black">
      <div className="absolute inset-0 bg-dot-black/[0.2] -mt-24 dark:bg-dot-white/[0.2] pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto relative -top-10 z-0">
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.2 }}
          className="lg:text-5xl sm:text-3xl -mt-28 font-bold text-center text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 to-purple-500 py-8"
        >
          What We Offer?
        </motion.p>
        <div className="flex flex-col items-center space-y-6 lg:flex-row lg:justify-center lg:space-y-0 lg:space-x-6">
          {cardsData.map((card, index) => (
            <CardContent
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              customStyles={card.customStyles}
              animationDelay={card.animationDelay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
