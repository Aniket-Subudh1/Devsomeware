"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles1";
import { LogoMotion } from "@/sections/LogoMotion";
import {
  FaDiscord,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaHashtag,
} from "react-icons/fa";
import { CiAt } from "react-icons/ci";

export default function AboutPage() {
  return (
    <div className="h-auto w-full dark:bg-black bg-white dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex flex-col items-center justify-center overflow-hidden rounded-md">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <h1 className="md:text-7xl sm:text-5xl lg:text-7xl font-bold text-center text-white relative z-20 mt-[5rem]">
        About DevSomeware
      </h1>
      <div className="w-[40rem] h-40 relative mt-10">
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px w-1/4" />
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>

      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 text-white text-center mt-16">
        <p className="text-lg leading-relaxed -mt-[4rem]">
          <span className="font-bold text-purple-500">DevSomeware</span> is a
          thriving community of technology enthusiasts, developers, and
          innovators dedicated to exploring, learning, and creating cutting-edge
          solutions. At DevSomeware, we believe in empowering individuals with
          the knowledge and resources they need to succeed in the ever-evolving
          tech industry.
        </p>
        <p className="mt-6 text-lg leading-relaxed">
          Our mission is to foster collaboration, ignite creativity, and
          celebrate the spirit of innovation. Whether you&apos;re a seasoned
          developer or just starting your journey, DevSomeware offers a platform
          to connect with like-minded individuals, share ideas, and grow
          together. We organize workshops, hackathons, and community-driven
          projects to enable hands-on learning and skill development.
        </p>
        <p className="mt-6 text-lg leading-relaxed">
          Join us as we push the boundaries of technology and shape the future
          of development, one idea at a time. Be a part of a vibrant ecosystem
          that celebrates passion, curiosity, and resilience.
        </p>
      </div>
      <LogoMotion />

      {/* Social Media Handles Section */}
      <h2 className="text-5xl font-bold text-center text-white mt-16">
        Social Media Handles
      </h2>
      <div className="mt-12 flex flex-wrap justify-center mb-20 gap-12 text-white">
        <a
          href="https://discord.gg/QkRpF8r9dv"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-500"
        >
          <FaDiscord className="lg:text-8xl sm:text-5xl animate-float hover:scale-110 transition-transform glow-effect" />
        </a>
        <a
          href="https://x.com/DevSomware"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-500"
        >
          <FaTwitter className="lg:text-8xl sm:text-5xl animate-float hover:scale-110 transition-transform glow-effect" />
        </a>
        <a
          href="https://www.instagram.com/devsomeware/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-500"
        >
          <FaInstagram className="lg:text-8xl sm:text-5xl animate-float hover:scale-110 transition-transform glow-effect" />
        </a>
        <a
          href="https://www.linkedin.com/company/devsomeware/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-500"
        >
          <FaLinkedin className="lg:text-8xl sm:text-5xl animate-float hover:scale-110 transition-transform glow-effect" />
        </a>
        <a
          href="https://github.com/DevSomware"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-500"
        >
          <FaGithub className="lg:text-8xl sm:text-5xl animate-float hover:scale-110 transition-transform glow-effect" />
        </a>
        <a
          href="https://www.threads.net/@devsomeware?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-500"
        >
          <CiAt className="lg:text-8xl sm:text-5xl animate-float hover:scale-110 transition-transform glow-effect" />
        </a>
        <a
          href="https://hashnode.com/@devsomeware"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-500"
        >
          <FaHashtag className="lg:text-8xl sm:text-5xl animate-float hover:scale-110 transition-transform glow-effect" />
        </a>
      </div>
    </div>
  );
}
