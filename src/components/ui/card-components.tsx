import Image from "next/image"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import type { StaticImageData } from "next/image"
import WatermarkLogo from "@/assets/logo.png"
import Saneev from "@/assets/saneev.jpg"

export const MentorCard = () => (
  <div className="card-wrapper" style={{ perspective: "1000px" }}>
    <div className="card animate-fadeIn lg:w-[380px] md:w-[380px]  w-[350px] sm:w-[350px] relative mt-4 h-[480px] group mx-auto bg-gradient-to-br from-purple-900/40 to-black/60 border-2 border-purple-500/50 rounded-xl text-white flex flex-col overflow-hidden backdrop-blur-md shadow-2xl hover:shadow-purple-500/30 transition-all duration-500">
      {/* Watermark */}
      <div className="absolute top-4 left-4 w-[6rem] h-12 z-10 opacity-70">
        <Image src={WatermarkLogo || "/placeholder.svg"} alt="Watermark" layout="responsive" objectFit="contain" />
      </div>
      {/* Mentor Image */}
      <div className="w-full rounded-t-xl h-[400px] group-hover:h-[440px] overflow-hidden transition-all duration-500">
        <Image
          src={Saneev || "/placeholder.svg"}
          alt="mentor"
          width={600}
          height={600}
          className="h-full w-full scale-105 group-hover:scale-100 grayscale-[50%] group-hover:grayscale-0 object-cover transition-all duration-500"
        />
      </div>
      {/* Mentor Info */}
      <article className="relative overflow-hidden flex-grow bg-gradient-to-b from-purple-900/70 to-black/70">
        <div className="info p-6 translate-y-0 group-hover:-translate-y-24 transition-all duration-500">
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Saneev Kumar Das
          </p>
          <p className="text-lg text-purple-200 mt-2">Mentor &amp; AI/ML Expert</p>
        </div>
        <div className="absolute h-24 -bottom-24 opacity-0 group-hover:opacity-100 group-hover:bottom-0 transition-all duration-500 w-full text-center bg-purple-600/80 flex items-center justify-center">
          <span className="text-2xl font-medium">Mentor &amp; AI/ML Expert</span>
        </div>
      </article>
    </div>
  </div>
)

export const MemberCard = ({
  name,
  role,
  image,
  github,
  linkedin,
}: {
  name: string
  role: string
  image: StaticImageData
  github: string
  linkedin: string
}) => (
  <div className="card-wrapper" style={{ perspective: "1000px" }}>
    <div className="card animate-fadeIn lg:w-[380px] md:w-[380px]  w-[350px] sm:w-[350px] relative mt-4 h-[480px] group mx-auto bg-gradient-to-br from-purple-900/40 to-black/60 border-2 border-purple-500/50 rounded-xl text-white flex flex-col overflow-hidden backdrop-blur-md shadow-2xl hover:shadow-purple-500/30 transition-all duration-500">
      {/* Watermark */}
      <div className="absolute top-4 left-4 w-[6rem] h-12 z-10 opacity-70">
        <Image src={WatermarkLogo || "/placeholder.svg"} alt="Watermark" layout="responsive" objectFit="contain" />
      </div>
      {/* Social Icons */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-purple-900/50 border border-purple-500/50 rounded-full hover:scale-110 transition-transform flex items-center justify-center backdrop-blur-sm hover:bg-purple-600/70"
        >
          <FaGithub className="text-purple-300 text-xl" />
        </a>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-purple-900/50 border border-purple-500/50 rounded-full hover:scale-110 transition-transform flex items-center justify-center backdrop-blur-sm hover:bg-purple-600/70"
        >
          <FaLinkedin className="text-purple-300 text-xl" />
        </a>
      </div>
      {/* Member Image */}
      <div className="w-full rounded-t-xl h-[400px] group-hover:h-[440px] overflow-hidden transition-all duration-500">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={600}
          height={600}
          className="h-full w-full scale-105 group-hover:scale-100 grayscale-[50%] group-hover:grayscale-0 object-cover transition-all duration-500"
        />
      </div>
      {/* Member Info */}
      <article className="relative overflow-hidden flex-grow bg-gradient-to-b from-purple-900/70 to-black/70">
        <div className="info p-6 translate-y-0 group-hover:-translate-y-24 transition-all duration-500">
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {name}
          </p>
          <p className="text-lg text-purple-200 mt-2">{role}</p>
        </div>
        <div className="absolute h-24 -bottom-24 opacity-0 group-hover:opacity-100 group-hover:bottom-0 transition-all duration-500 w-full text-center bg-purple-600/80 flex items-center justify-center">
          <span className="text-2xl font-medium">{role}</span>
        </div>
      </article>
    </div>
  </div>
)

