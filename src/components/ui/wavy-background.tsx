"use client";
import { cn } from "@/lib/util";
import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 3,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: unknown;
}) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();

  const getSpeed = React.useCallback(
    () => (speed === "slow" ? 0.001 : 0.002),
    [speed]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    let w = (ctx.canvas.width = window.innerWidth);
    let h = (ctx.canvas.height = window.innerHeight / 2);
    let nt = 0;
    ctx.filter = `blur(${blur}px)`;

    const waveColors = colors || [
      "#6a0dad",
      "#8b5cf6",
      "#9f7aea",
      "#b794f4",
      "#d8b4fe",
    ];

    const drawWave = (n: number) => {
      nt += getSpeed();
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + h * 0.5);
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.fillStyle = backgroundFill || "black";
      ctx.globalAlpha = Math.min(1, Math.max(0, waveOpacity || 0.5));
      ctx.fillRect(0, 0, w, h);
      drawWave(5);
      animationIdRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight / 2;
      ctx.filter = `blur(${blur}px)`;
    };

    window.addEventListener("resize", handleResize);
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationIdRef.current!);
    };
  }, [
    blur,
    colors,
    speed,
    waveOpacity,
    waveWidth,
    backgroundFill,
    getSpeed,
    noise,
  ]);

  return (
    <div
      className={cn(
        "relative sm:h-[350px] lg:h-[400px]  flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute sm:-mt-10  lg:-mt-2 inset-0 -z-30"
        ref={canvasRef}
        style={{ filter: `blur(${blur}px)` }}
      ></canvas>

      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};
