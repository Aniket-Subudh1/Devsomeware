"use client"
import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { Cover } from "@/components/ui/cover";
import Swagat from "@/assets/swagat.jpg"
import Basir from "@/assets/basir.jpg"
import Aniket from "@/assets/aniket.jpg"
import Ankit from "@/assets/ankit.jpg"
import Nyaya from "@/assets/nyaya.jpg"
import Phani from "@/assets/phani.jpeg"
import Abhisek from "@/assets/abhishek.jpeg"
import Disha from "@/assets/disha.jpg";
import Khawar from "@/assets/khawar.jpeg";
import Aryan from "@/assets/aryan.jpg";
import Mir from "@/assets/mir.jpg";
import Smruti from "@/assets/smruti.jpeg";
import Bhawani from "@/assets/bhawani.jpg";
import Asutosh from "@/assets/asutosh.jpg";
import Priyanshu from "@/assets/priyanshu.jpg";
import Kamlesh from "@/assets/rbaba.jpg";
import hp from "@/assets/hp.jpg";
import { MentorCard, MemberCard } from "@/components/ui/card-components"
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
            Mentor &amp; Core Community
          </h2>
          <div className="flex  ml-[980px] justify-end w-full hidden lg:block">
  <button
    className="inline-flex  lg:h-16 sm:h-10 animate-shimmer items-center justify-center rounded-md border border-purple-500/20  
       bg-[linear-gradient(110deg,#000103,45%,#4c1d95,55%,#000103)] bg-[length:200%_100%] 
       px-6 font-medium lg:text-xl sm:text-md text-purple-300 transition-colors 
       hover:bg-[linear-gradient(110deg,#000103,45%,#6d28d9,55%,#000103)] 
       hover:text-purple-200 hover:border-purple-500/40
       focus:outline-none focus:ring-2 focus:ring-purple-500/50 
       focus:ring-offset-2 focus:ring-offset-black"
    onClick={() => router.push("/team/leads")} 
  >
    View Leads &amp; Co-Leads
  </button>
</div>


          <div className="flex flex-wrap justify-center gap-12">
            <MentorCard />
            <MemberCard
              name="Basir Khan"
              role="Core Community Lead"
              image={Basir}
              github="https://github.com/BasirKhan418"
              linkedin="https://www.linkedin.com/in/basir-khan-5aa62b258/"
            />
            <MemberCard
              name="Aniket Subudhi"
              role="Core Community Lead"
              image={Aniket}
              github="https://github.com/Aniket-Subudh1"
              linkedin="https://www.linkedin.com/in/aniket-subudh1/"
            />
            <MemberCard
              name="Ankit Kumar Yadav"
              role="Core Community Lead"
              image={Ankit}
              github="https://github.com/BoundlessKris"
              linkedin="https://www.linkedin.com/in/ankit-kumar-yadav-041227270/"
            />
            <MemberCard
              name="Swagat Kumar Dash"
              role="Core Community Lead"
              image={Swagat}
              github="https://github.com/Swagat-D"
              linkedin="https://www.linkedin.com/in/swagatdash15/"
            />
            
            <MemberCard
              name="Nyayabrata Das"
              role="Core Community Lead"
              image={Nyaya}
              github="https://github.com/Nyayabrata01"
              linkedin="https://www.linkedin.com/in/nyayabrata-das-544642294/"
            />
          </div>
          <h2 className="text-white text-3xl font-bold mt-24 mb-12 text-center animate-fadeIn">
            Core Community Members
          </h2>
          <div className="flex flex-wrap justify-center gap-12">
            <MemberCard
              name="Asutosh Parida"
              role="Core Community Member"
              image={Asutosh}
              github="https://github.com/asutoshparida8658"
              linkedin="https://www.linkedin.com/in/asutosh-parida-b3b686250"
            />
            <MemberCard
              name="Mir Sadab Ali"
              role="Core Community Member"
              image={Mir}
              github="https://github.com/SadabAli"
              linkedin="https://www.linkedin.com/in/mir-sadab-ali-b29157268/"
            />
            <MemberCard
              name="Priyanshu Kumar"
              role="Core Community Member"
              image={Priyanshu}
              github="https://github.com/Priyanshu270603"
              linkedin="https://www.linkedin.com/in/priyanshu-kumar-305902303"
            />
            <MemberCard
              name="Smrutirupa Parida"
              role="Core Community Member"
              image={Smruti}
              github="https://github.com/"
              linkedin="https://in.linkedin.com/in/smrutirupa-parida-594758294"
            />
           
            <MemberCard
              name="Aryan Ashima Swain"
              role="Core Community Member"
              image={Aryan}
              github="https://github.com/SARYAN23"
              linkedin="https://www.linkedin.com/in/aryan-ashima-swain-8727b4300/"
            />
            
            <MemberCard
              name="Bhawani Sankar Das"
              role="Core Community Member"
              image={Bhawani}
              github="https://github.com/BhawaniDas"
              linkedin="https://www.linkedin.com/in/bhawani-sankar-das-023889336/"
            />
            <MemberCard
              name="Khawar Ahmed Khan"
              role="Core Community Member"
              image={Khawar}
              github="https://github.com/khawarahemad"
              linkedin="https://www.linkedin.com/in/khawarahemad/"
            />
            <MemberCard
              name="Kamlesh Sahani"
              role="Core Community Member"
              image={Kamlesh}
              github="https://github.com/Kamlesh2pvt"
              linkedin="https://www.linkedin.com/in/kamlesh-sahani-a416b6238"
            />
            
            
          </div>
          <h2 className="text-white text-3xl font-bold mt-24 mb-12 text-center animate-fadeIn">
            Social Media Team
          </h2>
           <div className="flex flex-wrap justify-center gap-12">
            <MemberCard
              name="Abhisek Maharana"
              role="Social Media Team Member"
              image={Abhisek}
              github="https://github.com/abhisekvirus"
              linkedin="https://www.linkedin.com/in/abhisek-maharana-4ba802302"
            />
             <MemberCard
              name="Charita Ranjan Pradhan"
              role="Social Media Team Member"
              image={hp}
              github="https://github.com/abhisekvirus"
              linkedin="https://in.linkedin.com/in/charita-ranjan-pradhan-b1703b2bb"
            />
            </div>
            <div className="flex mt-10 justify-center w-full block lg:hidden">
  <button
    className="inline-flex  lg:h-16 sm:h-10 animate-shimmer items-center justify-center rounded-md border border-purple-500/20  
       bg-[linear-gradient(110deg,#000103,45%,#4c1d95,55%,#000103)] bg-[length:200%_100%] 
       px-6 font-medium lg:text-xl sm:text-md text-purple-300 transition-colors 
       hover:bg-[linear-gradient(110deg,#000103,45%,#6d28d9,55%,#000103)] 
       hover:text-purple-200 hover:border-purple-500/40
       focus:outline-none focus:ring-2 focus:ring-purple-500/50 
       focus:ring-offset-2 focus:ring-offset-black"
    onClick={() => router.push("/team/leads")} 
  >
    View Leads &amp; Co-Leads
  </button>
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

