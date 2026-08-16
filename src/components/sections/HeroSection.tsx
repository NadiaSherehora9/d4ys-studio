"use client";
import React from "react";
import { motion } from "framer-motion";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { ScrollIndicator } from "@/components/ScrollIndicator";

export const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background"
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      {/* Red glow accent */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "hsl(var(--primary))" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Studio badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 text-xs uppercase tracking-[0.5em] text-muted-foreground font-semibold"
        >
          Dance Studio
        </motion.div>

        {/* SEO: hidden h1 for search engines */}
        <h1 className="sr-only">D4YS Studio — танцювальна студія в Білій Церкві. Дитячі та дорослі танці: Хореографія, Jazz-Funk</h1>

        {/* Text Hover Effect */}
        <div className="w-[90vw] max-w-4xl h-[200px] sm:h-[250px] md:h-[300px]" aria-hidden="true">
          <TextHoverEffect text="D4YS" />
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-4 px-4 text-center text-[11px] xs:text-xs sm:text-sm text-muted-foreground uppercase tracking-[0.15em] xs:tracking-[0.2em] sm:tracking-[0.3em] font-medium whitespace-nowrap"
        >
          Танцювальна студія <span className="text-primary">•</span> Біла Церква
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="mt-12"
        >
          <a
            href="#contact"
            className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden rounded-full bg-primary font-bold text-primary-foreground tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)]"
          >
            <span className="relative z-10">Записатися</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-12"
      >
        <ScrollIndicator />
      </motion.div>
    </section>
  );
};
