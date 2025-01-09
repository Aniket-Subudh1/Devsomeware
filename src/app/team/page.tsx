"use client";
import React from "react";
import Image from "next/image";
import Swagat from "@/assets/swagat.jpg";
import Bhawani from "@/assets/bhawani.jpg";
import Aniket from "@/assets/aniket.jpg";
import Disha from "@/assets/disha.jpg";
import Ankit from "@/assets/ankit.jpg";
import Khawar from "@/assets/khawar.jpeg";
import Aryan from "@/assets/aryan.jpg";
import WatermarkLogo from "@/assets/logo.png";
import Mir from "@/assets/mir.jpg";
import Nyaya from "@/assets/nyaya.jpg";
import Saneev from "@/assets/saneev.webp";
import Asutosh from "@/assets/asutosh.jpg";
import Priyanshu from "@/assets/priyanshu.jpg";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { StaticImageData } from "next/image";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const MentorCard = () => (
  <div className="w-[350px] relative mt-4 h-[430px] group mx-auto dark:bg-black bg-white dark:border-2 border-purple-500 border rounded-md dark:text-white text-black flex flex-col">
    <div className="absolute top-2 left-2 w-[5rem] h-10 z-10 opacity-100">
      <Image
        src={WatermarkLogo}
        alt="Watermark"
        layout="responsive"
        objectFit="contain"
      />
    </div>
    {/* Image */}
    <div className="w-full rounded-t-md h-[350px] group-hover:h-[410px] overflow-hidden transition-all duration-300">
      <Image
        src={Saneev}
        alt="mentor"
        width={600}
        height={600}
        className="h-full w-full scale-105 group-hover:scale-100 grayscale group-hover:grayscale-0 object-cover transition-all duration-300"
      />
    </div>
    {/* Info */}
    <article className="relative overflow-hidden flex-grow">
      <div className="info p-2 translate-y-0 group-hover:-translate-y-20 transition-all duration-300">
        <p className="md:text-2xl font-semibold">Saneev Kumar Das</p>
        <p className="sm:text-base text-sm">Mentor &amp; AI/ML Expert</p>
      </div>
      {/* Role on hover */}
      <button className="absolute h-10 -bottom-8 opacity-0 group-hover:opacity-100 cursor-pointer group-hover:bottom-3 text-3xl font-medium transition-all duration-300 w-full text-center">
        Mentor &amp; AI/ML Expert
      </button>
    </article>
  </div>
);

const MemberCard = ({
  name,
  role,
  image,
  github,
  linkedin,
}: {
  name: string;
  role: string;
  image: StaticImageData;
  github: string;
  linkedin: string;
}) => (
  <div className="w-[350px] relative mt-4 h-[430px] group mx-auto dark:bg-black bg-white dark:border-2 border-purple-500 border rounded-md dark:text-white text-black flex flex-col">
    {/* Watermark */}
    <div className="absolute top-2 left-2 w-[5rem] h-10 z-10 opacity-100">
      <Image
        src={WatermarkLogo}
        alt="Watermark"
        layout="responsive"
        objectFit="contain"
      />
    </div>
    {/* Social Icons */}
    <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
      <a
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-white dark:bg-black border border-purple-500 rounded-full hover:scale-110 transition-transform flex items-center justify-center"
      >
        <FaGithub className="text-purple-500 text-lg" />
      </a>
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-white dark:bg-black border border-purple-500 rounded-full hover:scale-110 transition-transform flex items-center justify-center"
      >
        <FaLinkedin className="text-purple-500 text-lg" />
      </a>
    </div>
    {/* Image */}
    <div className="w-full rounded-t-md h-[350px] group-hover:h-[410px] overflow-hidden transition-all duration-300">
      <Image
        src={image}
        alt={name}
        width={600}
        height={600}
        className="h-full w-full scale-105 group-hover:scale-100 grayscale group-hover:grayscale-0 object-cover transition-all duration-300"
      />
    </div>
    {/* Info */}
    <article className="relative overflow-hidden flex-grow">
      <div className="info p-2 translate-y-0 group-hover:-translate-y-20 transition-all duration-300">
        <p className="md:text-2xl font-semibold">{name}</p>
        <p className="sm:text-base text-sm">{role}</p>
      </div>
      {/* Role on hover */}
      <button className="absolute h-10 -bottom-8 opacity-0 group-hover:opacity-100 cursor-pointer group-hover:bottom-3 text-3xl font-medium transition-all duration-300 w-full text-center">
        {role}
      </button>
    </article>
  </div>
);

export default function TeamPage() {
  return (
    <div className="h-auto w-full  dark:bg-black bg-white dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex flex-col items-center justify-center lg:-mt-20 sm:mt-3 overflow-hidden rounded-md">
      <TextHoverEffect text="Meet Our Team" />

      {/* Mentor Section */}
      <div className="lg:-mt-20 sm:-mt-2 ">
        <h2 className="text-white text-3xl font-bold mb-8 text-center">
          Mentor
        </h2>
        <MentorCard />
      </div>
      {/* Core Community Members */}
      <div className="mt-16 mb-10">
        <h2 className="text-white text-3xl font-bold mb-8 text-center">
          Core Community Members
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          <MemberCard
            name="Aniket Subudhi"
            role="Core Community Lead"
            image={Aniket}
            github="https://github.com/Aniket-Subudh1"
            linkedin="https://www.linkedin.com/in/aniket-subudh1/"
          />
          <MemberCard
            name="Swagat Kumar Dash"
            role="Core Community Lead"
            image={Swagat}
            github="https://github.com/Swagat-D"
            linkedin="https://www.linkedin.com/in/swagatdash15/"
          />
          <MemberCard
            name="Ankit Kumar Yadav"
            role="Core Community Lead"
            image={Ankit}
            github="https://github.com/BoundlessKris"
            linkedin="https://www.linkedin.com/in/ankit-kumar-yadav-041227270/"
          />
          <MemberCard
            name="Nyayabrata Das"
            role="Core Community Lead"
            image={Nyaya}
            github="https://github.com/Nyayabrata01"
            linkedin="https://www.linkedin.com/in/nyayabrata-das-544642294/"
          />
        </div>
      </div>

      {/* Team Members */}
      <div className="mt-16 mb-10">
        <h2 className="text-white text-3xl font-bold mb-8 text-center">
          Team Members
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          <MemberCard
            name="Asutosh Parida"
            role="Team Member"
            image={Asutosh}
            github="https://github.com/asutoshparida8658"
            linkedin="https://www.linkedin.com/in/asutosh-parida-b3b686250"
          />
          <MemberCard
            name="Disha Mishra"
            role="Team Member"
            image={Disha}
            github="https://github.com/dishaamishraa"
            linkedin="https://www.linkedin.com/in/disha-mishra-699245279/"
          />
          <MemberCard
            name="Mir Sadab Ali"
            role="Team Member"
            image={Mir}
            github="https://github.com/SadabAli"
            linkedin="https://www.linkedin.com/in/mir-sadab-ali-b29157268/"
          />
          <MemberCard
            name="Priyanshu Kumar"
            role="Team Member"
            image={Priyanshu}
            github="https://github.com/Priyanshu270603"
            linkedin="https://www.linkedin.com/in/priyanshu-kumar-305902303"
          />
          <MemberCard
            name="Bhawani Sankar Das"
            role="Team Member"
            image={Bhawani}
            github="https://github.com/BhawaniDas"
            linkedin="https://www.linkedin.com/in/bhawani-sankar-das-023889336/"
          />
          <MemberCard
            name="Aryan Ashima Swain"
            role="Team Member"
            image={Aryan}
            github="https://github.com/SARYAN23"
            linkedin="https://www.linkedin.com/in/aryan-ashima-swain-8727b4300/"
          />
          <MemberCard
            name="Khawar Ahmed Khan"
            role="Team Member"
            image={Khawar}
            github="https://github.com/khawarahemad"
            linkedin="https://www.linkedin.com/in/khawarahemad/"
          />
        </div>
      </div>
    </div>
  );
}
