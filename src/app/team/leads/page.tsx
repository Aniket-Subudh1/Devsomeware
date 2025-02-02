"use client"
import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { Cover } from "@/components/ui/cover";
import Aniket from "@/assets/aniket.jpg"
import Nyaya from "@/assets/nyaya.jpg"
import Aryan from "@/assets/aryan.jpg";
import Mir from "@/assets/mir.jpg";
import Asutosh from "@/assets/asutosh.jpg";
import { MemberCard } from "@/components/ui/card-components"
import { useInView } from "react-intersection-observer";

export default function TeamPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.2,
  });
  const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const router = useRouter();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);
  return (
    <div className="min-h-screen w-full bg-black flex  z-20  flex-col items-center justify-start p-10 relative overflow-hidden">
      {/* Dynamic Background */}
      <div
        className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
          opacity: 1 - scrollY * 0.002,
        }}
      ></div>

      {/* Purple Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/40 to-black pointer-events-none"></div>

      {/* Glass Effect Background */}
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl">
       
      <motion.h1
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={headingVariants}
        className="text-4xl bg-gradient-to-b text-transparent bg-clip-text from-neutral-200 to-purple-900 md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6"
      >
        MEET OUR <Cover>TEAM</Cover>
      </motion.h1>
       

        {/* Mentor & Core Community Section */}
        <div className="w-full mt-10">
          <h2 className="text-white text-3xl font-bold mb-12 text-center animate-fadeIn">
            DOMAIN LEADS
          </h2>
          


          <div className="flex flex-wrap justify-center gap-12">
            <MemberCard
              name="Aniket Subudhi"
              role="Fullstack Lead"
              image={Aniket}
              github="https://github.com/Aniket-Subudh1"
              linkedin="https://www.linkedin.com/in/aniket-subudh1/"
            />
            <MemberCard
              name="Mir Shadab Ali"
              role="AI/ML Lead"
              image={Mir}
              github="https://github.com/SadabAli"
              linkedin="https://www.linkedin.com/in/mir-sadab-ali-b29157268/"
            />
             <MemberCard
              name="Nyayabrata Das"
              role="Cloud Computing Lead"
              image={Nyaya}
              github="https://github.com/Nyayabrata01"
              linkedin="https://www.linkedin.com/in/nyayabrata-das-544642294/"
            />
            <MemberCard
              name="Asutosh Parida"
              role="CyberSecurity Lead"
              image={Asutosh}
              github="https://github.com/asutoshparida8658"
              linkedin="https://www.linkedin.com/in/asutosh-parida-b3b686250"
            />
            <MemberCard
              name="Aryan Ashima Swain"
              role="BlockChain Lead"
              image={Aryan}
              github="https://github.com/SARYAN23"
              linkedin="https://www.linkedin.com/in/aryan-ashima-swain-8727b4300/"
            />
            
          </div>
        </div>
        </div>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute w-[600px] h-[600px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute w-[700px] h-[700px] bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      
    </div>
  )
}

