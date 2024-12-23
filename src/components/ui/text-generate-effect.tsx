"use client";

import { useLayoutEffect, useRef, CSSProperties } from "react";
import { stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: TextGenerateEffectProps) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");
  const isMounted = useRef(true);

  useLayoutEffect(() => {
    isMounted.current = true;

    if (scope.current) {
      const elements = scope.current.querySelectorAll(".animated-span");
      console.log("Elements found:", elements.length);

      if (elements.length === 0) {
        console.error("No elements found with the selector '.animated-span'");
        return;
      }

      const loopAnimation = async () => {
        try {
          await animate(
            ".animated-span",
            {
              opacity: [0, 1],

              "--blur": filter ? [10, 0] : [0, 0],
            },
            {
              duration: duration || 1,
              delay: stagger(0.2),
            }
          );

          if (isMounted.current) {
            setTimeout(loopAnimation, 1000);
          }
        } catch (error) {
          console.error("Animation error:", error);
        }
      };

      loopAnimation();
    } else {
      console.error("scope.current is null");
    }

    return () => {
      isMounted.current = false;
    };
  }, [animate, duration, filter, scope]);

  const renderWords = () => (
    <div ref={scope}>
      {wordsArray.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          className="animated-span dark:text-purple-200 text-black opacity-0"
          style={
            {
              "--blur": "10",
              filter: filter ? "blur(var(--blur)px)" : "none",
            } as CSSProperties
          }
        >
          {word}{" "}
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn(className)}>
      <div className="mt-4">
        <div className="dark:text-white text-black lg:text-2xl sm:text-lg leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
