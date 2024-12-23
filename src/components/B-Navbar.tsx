"use client";
import { Dock, DockIcon } from "@/components/ui/dock";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu } from "@/utils/Menu/UserMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { navItems } from "@/data/nav.config";
import cn from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function BottomNavbar() {
  const pathname = usePathname();
  const [pressedIcon, setPressedIcon] = useState<string | null>(null);

  function isActivePath(pathname: string, link: string): boolean {
    const normalize = (path: string) =>
      path.replace(/\/$/, "").toLowerCase() || "/";
    const currentPath = normalize(pathname);
    const itemLink = normalize(link);

    if (itemLink === "/") {
      return currentPath === "/";
    } else {
      return currentPath === itemLink || currentPath.startsWith(itemLink + "/");
    }
  }

  useEffect(() => {
    setPressedIcon(null);
  }, [pathname]);

  const navItemLinks = navItems.map((item) => item.link);
  const duplicateLinks = navItemLinks.filter(
    (item, index) => navItemLinks.indexOf(item) !== index
  );
  if (duplicateLinks.length > 0) {
    console.warn("Duplicate navItem links detected:", duplicateLinks);
  }

  return (
    <div className="block md:hidden">
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto mb-10 flex origin-bottom h-full max-h-14">
        <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent  [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"></div>

        <TooltipProvider>
          <Dock className="z-50 pointer-events-auto backdrop-blur-3xl relative mx-auto flex min-h-full h-full items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]">
            {navItems.map((item) => {
              const key = `nav-${item.id}`;
              return (
                <DockIcon key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.link}
                        className={cn(
                          buttonVariants({
                            variant: "ghost",
                            size: "icon",
                          }),
                          "w-12 h-12 flex items-center justify-center"
                        )}
                      >
                        <span
                          onClick={() => {
                            console.log(`Icon ${item.name} clicked`);
                            setPressedIcon(item.name);
                          }}
                        >
                          {React.cloneElement(item.icon, {
                            className: cn(
                              "h-5 w-5",
                              isActivePath(pathname, item.link) ||
                                pressedIcon === item.name
                                ? "text-purple-500"
                                : "text-gray-600 dark:text-gray-400 hover:text-purple-500"
                            ),
                          })}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              );
            })}
                  <div className="m-2"><UserMenu/>
</div>
          </Dock>
          
        </TooltipProvider>

        {pressedIcon && (
          <div className="absolute bottom-16 mx-auto text-center w-full">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-bold text-purple-500">{pressedIcon}</span>
            </p>
          </div>
        )}
  
      </div>
      
    </div>
  );
}
