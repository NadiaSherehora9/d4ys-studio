"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Flame } from "lucide-react";

type Direction = {
  number: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  Icon: React.ComponentType<{ className?: string }>;
  accentFrom: string;
  accentTo: string;
};

const directions: Direction[] = [
  {
    number: "01",
    title: "Хорео",
    tagline: "Авторська хореографія",
    description:
      "Побудуємо власний рух, характер і подачу. Сплав техніки, енергії та емоції — від бази до сценічних постановок.",
    features: ["Техніка руху", "Праця в команді", "Сценічна присутність"],
    Icon: Flame,
    accentFrom: "from-primary",
    accentTo: "to-primary/40",
  },
  {
    number: "02",
    title: "JazzFunk",
    tagline: "Жіночність і впевненість",
    description:
      "Грація, пластика, характер. Стиль, що підкреслює індивідуальність і вчить володіти тілом на всі 100%.",
    features: ["Пластика та гнучкість", "Стиль і подача", "Впевненість у собі"],
    Icon: Sparkles,
    accentFrom: "from-pink-500",
    accentTo: "to-primary/40",
  },
];

export const DirectionsSection = () => {
  return (
    <section
      id="directions"
      className="relative bg-background py-20 sm:py-28 overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-40 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl" />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative text-center mb-14 sm:mb-20 section-container"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary mb-6"
        >
          Directions
        </motion.span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-foreground">
          Обери свій{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
            стиль
          </span>
        </h2>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Два напрямки — дві філософії руху. Обирай те, що звучить саме в тобі.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {directions.map((dir, index) => (
            <motion.article
              key={dir.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-sm p-8 sm:p-10 lg:p-12 min-h-[420px] sm:min-h-[480px] flex flex-col justify-between transition-all duration-500 hover:border-primary/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20"
            >
              {/* Animated gradient blob behind */}
              <div
                className={`pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br ${dir.accentFrom} ${dir.accentTo} opacity-20 blur-3xl transition-all duration-700 group-hover:opacity-40 group-hover:scale-110`}
              />

              {/* Top: number + icon */}
              <div className="relative flex items-start justify-between">
                <span className="font-black text-7xl sm:text-8xl lg:text-9xl leading-none text-transparent bg-clip-text bg-gradient-to-br from-white/20 to-white/5 select-none">
                  {dir.number}
                </span>
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 border border-primary/30 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 group-hover:scale-110">
                  <dir.Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              </div>

              {/* Middle: title + description */}
              <div className="relative mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                  {dir.tagline}
                </p>
                <h3 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[0.9]">
                  {dir.title}
                </h3>
                <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
                  {dir.description}
                </p>
              </div>

              {/* Bottom: feature pills */}
              <ul className="relative mt-8 flex flex-wrap gap-2">
                {dir.features.map((f) => (
                  <li
                    key={f}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-foreground/80 transition-colors duration-300 group-hover:border-primary/30 group-hover:bg-primary/10"
                  >
                    {f}
                  </li>
                ))}
              </ul>

              {/* Animated bottom accent line */}
              <div className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-transparent transition-all duration-700 group-hover:w-full" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
