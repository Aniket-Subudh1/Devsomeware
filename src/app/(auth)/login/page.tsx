"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { Toaster, toast } from "sonner";
import Link from "next/link";
function SignupFormDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (email === "" || password === "") {
      toast.error("Please fill all the fields");
      return;
    }
    setLoading(true);
    const fetchdata = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email:email.toLowerCase(),
        password,
      }),
    });
    const data = await fetchdata.json();
    setLoading(false);
    if (data.success) {
      toast.success("Login successful");
      window.location.href = "/";
    } else {
      toast.error(data.message);
    }
  };
  return (
    <div className="min-h-screen">
      <Toaster richColors />
      <div className="max-w-md  mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-gray-900 my-12">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          Welcome to Devsomeware
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Insert your credentials to prove you&apos;re not a bot. Or are you? 👀
        </p>

        <div className="my-8 relative">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4"></div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="team@devsomeware.com"
              type="email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </LabelInputContainer>
          <div className="flex justify-end absolute right-4 mb-10">
          <Link href="/forgot" className="text-sm text-neutral-700 dark:text-neutral-300 hover:underline">Forgot password?</Link>
        </div>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            onClick={handleSubmit}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </div>
            ) : (
              "Log In"
            )}
            <BottomGradient />
          </button>
          <div className="flex justify-center items-center mt-4">
          <span className="text-sm text-neutral-700 dark:text-neutral-300 ">Don’t have an account? <Link href="/join" className="underline text-green-500 mx-1">Create an account</Link>
        </span>
        </div>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          <div className="flex flex-col space-y-4">
            <button
              className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              onClick={() => {
                toast.info(
                  "Github login is not available yet. Please try another method."
                );
              }}
            >
              <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                GitHub
              </span>
              <BottomGradient />
            </button>
            <button
              className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              onClick={() => {
                toast.info(
                  "Google login is not available yet. Please try another method."
                );
              }}
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                Google
              </span>
              <BottomGradient />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SignupFormDemo;
const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
