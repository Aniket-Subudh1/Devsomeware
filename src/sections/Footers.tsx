import Logo from "@/assets/logo.svg";
import Image from "next/image";
import { Github, Instagram, Linkedin, X, Hash, Send } from "lucide-react";

export const Footers = () => {
  return (
    <footer className="relative z-20 bg-black backdrop-blur-none py-8 border-t border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + Branding */}
          <div className="flex items-center gap-3">
            <Image
              src={Logo}
              alt="DevSomeware Logo"
              width={100}
              height={30}
              className="w-24 h-auto"
            />
            <div className="font-bold text-white text-lg sm:text-xl md:text-2xl">
              DevSomeware
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/DevSomware"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-500"
            >
              <Github className="w-6 h-6 sm:w-7 sm:h-7" />
            </a>
            <a
              href="https://www.instagram.com/devsomeware/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-500"
            >
              <Instagram className="w-6 h-6 sm:w-7 sm:h-7" />
            </a>
            <a
              href="https://www.linkedin.com/company/devsomeware/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-500"
            >
              <Linkedin className="w-6 h-6 sm:w-7 sm:h-7" />
            </a>
            <a
              href="https://x.com/DevSomware"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-500"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </a>
            <a
              href="https://hashnode.com/@devsomeware"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-500"
            >
              <Hash className="w-6 h-6 sm:w-7 sm:h-7" />
            </a>
            <a
              href="https://www.threads.net/@devsomeware?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-500"
            >
              <Send className="w-6 h-6 sm:w-7 sm:h-7" />
            </a>
          </div>

          {/* Copyright Text */}
          <div className="text-gray-400 text-xs sm:text-sm md:text-base text-center md:text-right">
            © {new Date().getFullYear()} DevSomeware. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
