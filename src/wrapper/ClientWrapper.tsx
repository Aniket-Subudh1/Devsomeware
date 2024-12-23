"use client";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Preloader } from "@/components/ui/preloader";
import { Navbar } from "@/components/Navbar";
import BottomNavbar from "@/components/B-Navbar";
import { Footers } from "@/sections/Footers";

export const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? (
        <Preloader />
      ) : (
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Navbar />
          {children}
          <BottomNavbar />
          <Footers />
        </ThemeProvider>
      )}
    </>
  );
};
