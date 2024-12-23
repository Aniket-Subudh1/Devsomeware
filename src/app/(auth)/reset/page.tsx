"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useRouter } from "next/navigation";
function SignupFormDemo() {
    const searchParams = useSearchParams()
    const router = useRouter();
  const token = searchParams.get('token')
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (cpassword=== "" || password === "") {
      toast.error("Please fill all the fields");
      return;
    }
    if (cpassword !== password) {
      toast.error("Passwords do not match");
        return;
    }
    if(token===null){
        toast.error("Invalid Token");
        return;
    }
    if(password.length<5){
        toast.error("Password must be at least 5 characters long");
        return;
    }
    setLoading(true);
    const fetchdata = await fetch("/api/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });
    const data = await fetchdata.json();
    setLoading(false);
    if (data.success) {
      toast.success(data.message);
      setTimeout(() => {
        toast.success("Redirecting to login page...");
        setTimeout(()=>{
        router.push("/login")
        },1000)
      },1000)
    } else {
      toast.error(data.message);
    }
  };
  return (
    <div className="min-h-screen">
      <Toaster richColors />
      <div className="max-w-md  mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-gray-900 my-12">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
  Reset Your Password
</h2>
<p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
  Enter your new password and confirm it below to reset your password. Make sure to choose a strong and secure password! 🔒
</p>


        <div className="my-8 relative">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4"></div>
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

          <LabelInputContainer className="mb-4">
            <Label htmlFor="cpassword">Confirm Password</Label>
            <Input
              id="cpassword"
              placeholder="••••••••"
              type="password"
              onChange={(e) => {
                setCPassword(e.target.value);
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
                Resetting...
              </div>
            ) : (
              "Reset Password"
            )}
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
        </div>
      </div>
    </div>
  );
}
const FallBack = () => {
    return (
        <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
         <p className="ml-2">Loading...</p>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<FallBack />}>
            <SignupFormDemo />
        </Suspense>
    );
}
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
