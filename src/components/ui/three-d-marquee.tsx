"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface ThreeDMarqueeProps {
  images: string[];
  className?: string;
}

/**
 * Lightweight "alive" marquee:
 * - Two horizontal rows scrolling in opposite directions.
 * - Tiles tilt slightly for a 3D feel without the perf cost of full perspective.
 * - Pure CSS transform animations (GPU), no framer-motion infinite loops.
 * - Pauses on hover; respects prefers-reduced-motion.
 */
export function ThreeDMarquee({ images, className }: ThreeDMarqueeProps) {
  // Build two rows from the source images so each row feels distinct.
  // Photos are duplicated within each row so seamless loop has enough content.
  const rowA = images.length
    ? images.filter((_, i) => i % 2 === 0).concat(images.filter((_, i) => i % 2 === 0))
    : [];
  const rowB = images.length
    ? images.filter((_, i) => i % 2 === 1).concat(images.filter((_, i) => i % 2 === 1))
    : [];

  const renderRow = (
    row: string[],
    direction: "left" | "right",
    duration: number,
    tiltSign: 1 | -1
  ) => (
    <div
      className="three-d-marquee-row relative w-full overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className="three-d-marquee-track flex gap-5 md:gap-8 w-max"
        style={{
          animation: `${
            direction === "left" ? "tdm-scroll-left" : "tdm-scroll-right"
          } ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {[...row, ...row].map((image, idx) => {
          // Alternate tilt for a dynamic, scattered look.
          const tilt = (idx % 2 === 0 ? 2.5 : -2.5) * tiltSign;
          return (
            <div
              key={idx}
              className="three-d-marquee-tile group relative h-56 w-40 md:h-80 md:w-60 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/50 transition-transform duration-500 hover:z-20 hover:ring-primary/70"
              style={{ ["--tilt" as string]: `${tilt}deg` }}
            >
              <img
                src={image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: "inset 0 0 40px hsl(0 100% 50% / 0.35)" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "three-d-marquee relative w-full flex flex-col gap-5 md:gap-8 py-4",
        className
      )}
      style={{ contentVisibility: "auto" }}
    >
      {renderRow(rowA, "left", 70, 1)}
      {renderRow(rowB, "right", 90, -1)}
    </div>
  );
}
