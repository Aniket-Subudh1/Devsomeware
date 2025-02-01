"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Timeline } from "@/components/ui/timeline";
import { Ticket, Rocket, MessageCircle, Code, Zap, LucideIcon } from "lucide-react";
import { EventRegistrationModal } from "@/components/ui/EventRegistrationModal";
import { useAppSelector} from "@/lib/hook";
import { Toaster } from "sonner";
interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  showCursor?: boolean;
  customComponent?: React.ReactNode;
}

const Typewriter = ({
  text,
  speed = 2,
  delay = 0,
  onComplete,
  showCursor = true,
  customComponent,
}: TypewriterProps) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  
  useEffect(() => {
    if (!hasStarted) {
      const timeout = setTimeout(() => setHasStarted(true), delay);
      return () => clearTimeout(timeout);
    }

    if (currentIndex < text.length && !isComplete) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      setShowCustom(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete, delay, hasStarted]);

  return (
    <span className="font-mono tracking-tighter">
      {displayText}
      {showCustom && customComponent}
      {showCursor && !isComplete && hasStarted && (
        <motion.span
          className="ml-0.5 text-purple-400"
          animate={{ opacity: [0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          ▌
        </motion.span>
      )}
    </span>
  );
};

const LoadingDots = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-flex space-x-2 ml-2"
    >
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-purple-500 inline-block"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 1, 0.3],
            filter: [
              'brightness(1) blur(0px)',
              'brightness(1.3) blur(1px)',
              'brightness(1) blur(0px)'
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            delay: i * 0.2,
            ease: "easeInOut"
          }}  />
        ))}
      </motion.div>
    );
  };

const terminalLines = [
  { text: "> npm init ZeNoTronE", speed: 5 },
  { text: "> npm install AmazingTechEvent --save", speed: 10 },
  { text: "> npm run dev", speed: 5 },
  {
    text: "> INITIALIZING TECH JOURNEY",
    speed: 10,
    customComponent: <LoadingDots show={true} />,
  },
  {
    text: "[ COSMIC_REGISTRATION → OPENING_CEREMONY → TECH_TALKS → ZENOTRONE_HACKTHON ]",
    speed: 5,
  },
];

type TimelineEvent = {
  title: string;
  phase: string;
  date: string;
  status: "completed" | "ongoing" | "upcoming";
  icon: LucideIcon;
  highlights: string[];
  images: string[];
};

export default function TimelineDemo() {
  const [showTimeline, setShowTimeline] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const users = useAppSelector((state) => state.user);
  const eventdata = useAppSelector((state) => state.event);
  // Calculate delays based on previous lines' durations
  const lineDelays = useMemo(() => {
    const delays: number[] = [];
    let totalDelay = 1000; // Initial delay

    terminalLines.forEach((line, index) => {
      delays[index] = totalDelay;
      totalDelay += line.text.length * line.speed;
    });

    return delays;
  }, []);

  const handleLineComplete = () => {
    setVisibleLines((prev) => prev + 1);
  };

  useEffect(() => {
    if (visibleLines === terminalLines.length) {
      setTimeout(() => setShowTimeline(true), 500);
    }
  }, [visibleLines]);

  const events: TimelineEvent[] = [
    {
      title: "Cosmic Registration",
      phase: "Stellar Entry Phase",
      date: "Feb 1-15, 2025",
      status: "upcoming",
      icon: Ticket, 
      highlights: [
        "Registration starts for all events",
        "Limited Seats for Hackathon & Tech Talks",
        "Team Registration Benefits",
        "Exclusive Swags for Early Registrations",
      ],
      images: ["/cos_r.png"],
    },
    {
      title: "Opening Ceremony & Orientation",
      phase: "Community Kickoff",
      date: "Feb 22, 2025",
      status: "upcoming",
      icon: Rocket,
      highlights: [
        "Introduction to DevSomeware Community",
        "Welcome Speeches by Founders & Group Leads",
        "Overview of Fullstack, AI, Blockchain, Cloud, and AR-VR Groups",
        "Interactive Quiz with Exciting Prizes",
      ],
      images: ["/ori.png"],
    },
    {
      title: "Tech Talks",
      phase: "Expert Knowledge Sessions",
      date: "Feb 22, 2025",
      status: "upcoming",
      icon: MessageCircle,
      highlights: [
        "Session 1: AI, Blockchain & Cloud Trends",
        "Session 2: AR-VR & Fullstack Innovations",
        "Live Q&A with Industry Experts",
        "Engagement via Interactive Polls",
      ],
      images: ["/talk.png"],
    },
    {
      title: "ZeNoTronE Hackathon",
      phase: "24hr Innovation Challenge",
      date: "Feb 22, 2025",
      status: "upcoming",
      icon: Code,
      highlights: [
        "Themes: AI for Social Impact, Cloud Innovations, Tech for Climate",
        "24-hour Challenge for Innovative Solutions",
        "Judging Criteria: Innovation, Feasibility, Impact, and More",
        "Winning Projects Receive Prizes and Recognition",
      ],
      images: ["/hack.png"],
    },
  ];

  return (
    <div className="w-full bg-purple -mt-16 min-h-screen flex flex-col">
      <Toaster richColors/>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-lg md:text-4xl mb-4 mt-28 text-transparent 
                   bg-clip-text bg-[linear-gradient(45deg,#8b5cf6,#ec4899)] 
                   font-bold max-w-4xl cyber-font text-center mx-auto"
      >
        DEV_SOMEWARE::ZENOTRONE_2025
      </motion.h2>

      <motion.div
        className="mb-8 text-left px-6 py-3 rounded-lg text-purple-300
                   bg-black/50 border border-purple-500 shadow-lg w-full max-w-xl mx-auto
                   font-mono tracking-tighter text-sm md:text-base"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: [0, 1, 0.9, 1],
          y: 0,
        }}
        transition={{
          duration: 1.5,
          delay: 0.5,
          opacity: { times: [0, 0.2, 0.8, 1] },
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: `repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 4px)`,
          }}
        />
        {terminalLines.map((line, index) => (
          <div key={index} className="leading-loose">
            {visibleLines > index && (
              <>
                {line.text}
                {line.customComponent}
              </>
            )}
            {visibleLines === index && (
              <Typewriter
                text={line.text}
                speed={line.speed}
                delay={lineDelays[index]}
                onComplete={handleLineComplete}
                showCursor={visibleLines === index}
                customComponent={line.customComponent}
               
              />

            )}
          </div>
        ))}
      </motion.div>

      {/* Glowing beam animation */}
      {showTimeline && (
        <motion.div
          className="w-full h-1 bg-purple-500/40 rounded-full overflow-hidden relative mb-0"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full w-20 bg-purple-500 blur-md rounded-full"
            animate={{ x: ["0%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </motion.div>
      )}
{showTimeline && (
        <Timeline
          data={events.map((event) => ({
            title: event.title,
            content: (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative group"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column - Content */}
                  <div className="flex-1 md:relative">
                    {" "}
                    {/* Added relative positioning */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-purple-500/10 backdrop-blur-sm">
                        <event.icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-purple-100">
                          {event.title}
                        </h3>
                        <p className="text-sm text-purple-300/80">
                          {event.phase}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-medium text-purple-400">
                            {event.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {" "}
                      {/* Added bottom margin */}
                      {event.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start">
                          <Zap className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-purple-400" />
                          <span className="text-purple-200/80 text-sm leading-relaxed">
                            {highlight}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {/* Updated Button Container */}
                    <div className="md:relative md:right-0 mt-4 md:mt-6  ">
                      <EventRegistrationModal
                        title={event.title}
                        date={event.date}
                        highlights={event.highlights}
                        icon={event.icon}
                        users={users}
                        eventdata={eventdata}
                      />
                    </div>
                  </div>

                  {/* Right Column - Images */}
                  <div className="flex-1 order-first md:order-last">
                    {" "}
                    {/* Changed order for mobile */}
                    <div className="grid grid-cols-1 gap-4">
                      {event.images.map((img, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="relative h-48 md:h-56 rounded-xl overflow-hidden 
                             shadow-[0_0_24px_rgba(147,_51,_234,_0.15)]"
                        >
                          <Image
                            src={img}
                            alt="Event visual"
                            fill
                            className="object-cover"
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                            loading="lazy"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ),
          }))}
        />
      )}
    </div>
  );
}
