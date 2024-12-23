"use client";
import { IconCloud } from "@/components/ui/cloudprops";
import { Cover } from "@/components/ui/cover";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const slugs = [
  "typescript",
  "javascript",
  "dart",
  "java",
  "react",
  "flutter",
  "android",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "androidstudio",
  "sonarqube",
  "figma",
];

export function TechSection() {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const testimonials = [
    {
      quote:
        "Keeping up with rapidly evolving technology ensures you stay relevant and innovative. Adaptability is the key to success.",
      name: "Tech Enthusiast",
      designation: "Learning Advocate",
      src: "/teche.jpeg",
    },
    {
      quote:
        "In a fast-paced tech world, embracing new tools daily helps achieve long-term growth and expertise.",
      name: "Innovator",
      designation: "Technology Explorer",
      src: "/innov.webp",
    },
    {
      quote:
        "Technology evolves at lightning speed—keeping pace is not just an option; it’s a necessity.",
      name: "Future Thinker",
      designation: "Tech Visionary",
      src: "/fthink.jpg",
    },
  ];

  return (
    <div className="mb-24">
      <motion.h1
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={headingVariants}
        className="text-4xl bg-gradient-to-b text-transparent bg-clip-text from-neutral-200 to-purple-500 md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6"
      >
        Coping with Rapidly <br /> Evolving <Cover>Technology</Cover>
      </motion.h1>
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between px-4 lg:px-16 ">
        <div className="lg:w-1/2 w-full lg:mt-16 lg:ml-14 lg:mr-8 mb-8 lg:mb-0 z-0 overflow-hidden">
          <AnimatedTestimonials testimonials={testimonials} />
        </div>
        <div className="lg:w-1/2 w-full flex justify-center">
          <IconCloud iconSlugs={slugs} />
        </div>
      </div>
    </div>
  );
}
