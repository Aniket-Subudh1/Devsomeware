"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PinContainer } from "@/components/ui/3d-pin";

const JoinUsPage = () => {
  const router = useRouter();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const handleRedirect = (path: string) => {
    setLoadingPath(path);

    setTimeout(() => {
      router.push(path);
    }, 2000);
  };

  return (
    <div className="h-auto min-h-screen w-full dark:bg-black bg-white dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex flex-col items-center py-6 lg:py-12 overflow-x-hidden">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="relative z-20 text-center mb-8 lg:mb-12">
        <h1 className="text-3xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 to-purple-500 font-bold py-4 lg:py-8">
          Join Devsomeware
        </h1>
        <p className="text-base lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto px-4">
          Become a part of Devsomeware! Apply as a <strong>Member</strong> to
          join our community and access exclusive opportunities. Once you're a
          Member, you can also apply to become a <strong>Lead/Co-Lead</strong>{" "}
          and take your contributions to the next level!
        </p>
      </div>

      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 lg:gap-24 gap-6 lg:-top-10 max-w-5xl w-full px-4 lg:px-6">
        <div className="flex justify-center">
          <PinContainer title="Join as Member" href="/joinf">
            <div className="flex flex-col w-[330px] lg:w-[30rem] p-4 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 text-white rounded-lg shadow-lg">
              <h3 className="text-xl lg:text-2xl bg-gradient-to-b text-transparent bg-clip-text from-neutral-200 to-purple-500 font-bold mb-4">
                {memberContent.title}
              </h3>
              <p className="text-sm lg:text-base text-gray-300">
                {memberContent.description}
              </p>
              <button
                onClick={() => handleRedirect("/joinf")}
                disabled={loadingPath === "/joinf"}
                className={`mt-6 px-4 py-2 font-bold text-sm rounded-md transition ${
                  loadingPath === "/joinf"
                    ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                    : "bg-black hover:bg-gray-500"
                }`}
              >
                {loadingPath === "/joinf" ? "Redirecting..." : "Apply as Member"}
              </button>
            </div>
          </PinContainer>
        </div>

        <div className="flex justify-center">
          <PinContainer title="Apply as Lead/Co-Lead" href="/leadf">
            <div className="flex flex-col w-[330px] lg:w-[30rem] p-4 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 text-white rounded-lg shadow-lg">
              <h3 className="text-xl lg:text-2xl font-bold mb-4 bg-gradient-to-b text-transparent bg-clip-text from-neutral-200 to-purple-500">
                {leadContent.title}
              </h3>
              <p className="text-sm lg:text-base text-gray-300">
                {leadContent.description}
              </p>
              <button
                onClick={() => handleRedirect("/leadf")}
                disabled={loadingPath === "/leadf"}
                className={`mt-6 px-4 py-2 font-bold text-sm rounded-md transition ${
                  loadingPath === "/leadf"
                    ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                    : "bg-black hover:bg-gray-500"
                }`}
              >
                {loadingPath === "/leadf"
                  ? "Redirecting..."
                  : "Apply as Lead/Co-Lead"}
              </button>
            </div>
          </PinContainer>
        </div>
      </div>
    </div>
  );
};

const memberContent = {
  title: "Join as a Member",
  description:
    "Become a Member of Devsomeware to access exclusive opportunities, participate in projects, and grow with a vibrant community of developers.",
};

const leadContent = {
  title: "Apply as Lead/Co-Lead",
  description:
    "Take the next step and apply as a Lead/Co-Lead. As a Lead, you'll mentor members, lead projects, and contribute significantly to our community's success.",
};

export default JoinUsPage;