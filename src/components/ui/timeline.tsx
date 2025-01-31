"use client";
import {
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div
      className="w-full  font-sans md:px-10 relative overflow-hidden"
      ref={containerRef}
    >
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 [mask-image:linear-gradient(to_bottom,transparent,black)]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[size:40px_40px] animate-grid-pulse" />
      </div>

      <div className="max-w-9xl mx-auto py-20 px-4 md:px-8 lg:px-10 relative z-10">
        
        
      </div>

      <div ref={ref} className="relative max-w-7xl -mt-[180px] mx-auto pb-20 z-10">
        {data.map((item, index) => (
          <motion.div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10 group"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1}}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            {/* Animated Timeline Dot */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-black/20 flex items-center justify-center">
                <motion.div
                  className="h-4 w-4 rounded-full bg-purple-500/80 border-2 border-purple-300 relative"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(139,92,246,0.4)",
                      "0 0 0 10px rgba(139,92,246,0.0)",
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-purple-500 animate-pulse" />
                </motion.div>
              </div>
              <motion.h3
                style={{ y }}
                className="hidden md:block text-xl md:pl-20 md:text-4xl font-bold text-transparent bg-clip-text bg-[linear-gradient(45deg,#8b5cf6,#ec4899)] cyber-font"
              >
                {item.title}
              </motion.h3>
            </div>

            {/* Content Card */}
            <motion.div
              className="relative pl-20 pr-4 md:pl-4 w-full"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="md:hidden block text-2xl mb-4 text-left font-bold text-purple-200/90 cyber-font">
                {item.title}
              </div>
              <div className="relative bg-black/50 rounded-xl border-2 border-purple-500/20 p-6 backdrop-blur-lg shadow-[0_0_40px_rgba(139,92,246,0.1)] hover:shadow-[0_0_60px_rgba(139,92,246,0.2)] transition-all">
                <div className="absolute inset-0 rounded-xl bg-[linear-gradient(45deg,transparent_70%,rgba(139,92,246,0.1))] opacity-50 group-hover:opacity-80 transition-opacity" />
                {item.content}
              </div>
            </motion.div>
          </motion.div>
        ))}
        
        {/* Animated Timeline Line */}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-gradient-to-b from-purple-500/20 via-purple-400/30 to-transparent"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-purple-400/70 to-transparent rounded-full shadow-[0_0_40px_rgba(139,92,246,0.3)]"
          />
        </div>
      </div>
    </div>
  );
};