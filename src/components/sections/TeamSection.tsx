"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Instagram } from "lucide-react";
import nikaImage from "@/assets/nika.png";
import nadiaImage from "@/assets/nadia.png";

const instructors = [
  {
    id: 1,
    name: "Надія",
    role: "Choreo",
    image: nadiaImage,
    instagram: "https://www.instagram.com/nyaa.930/",
    accent: "text-primary border-primary/35 bg-primary/10",
    number: "01",
  },
  {
    id: 2,
    name: "Вероніка",
    role: "Jazz-Funk",
    image: nikaImage,
    instagram: "https://www.instagram.com/_richiekaspbrak_/",
    accent: "text-pink-400 border-pink-500/35 bg-pink-500/10",
    number: "02",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export const TeamSection = () => {
  return (
    <section id="team" className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-36">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/10 blur-[160px]" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 grid gap-8 border-t border-white/10 pt-8 sm:mb-16 lg:grid-cols-12 lg:items-end"
        >
          <div className="lg:col-span-8">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
              Наша команда · 02 тренери
            </p>
            <h2 className="max-w-4xl text-[2.15rem] font-black uppercase leading-[0.88] tracking-[-0.04em] sm:text-5xl lg:text-7xl xl:text-8xl">
              Рух починається
              <span className="block text-primary">з довіри</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base lg:col-span-4 lg:pb-2">
            Дві різні енергії та один простір, у якому можна бути собою. Обирай
            напрям — тренерка допоможе знайти власну манеру руху.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:gap-8">
          {instructors.map((instructor, index) => (
            <motion.article
              key={instructor.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className={index === 1 ? "sm:mt-16" : ""}
            >
              <a
                href={instructor.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram тренерки ${instructor.name}`}
                className="group block focus:outline-none"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-card sm:rounded-[2rem]">
                  <img
                    src={instructor.image}
                    alt={`Тренерка ${instructor.name}`}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.045] group-focus-visible:scale-[1.045]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">
                          D4YS coach · {instructor.number}
                        </p>
                        <h3 className="text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">
                          {instructor.name}
                        </h3>
                      </div>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-primary group-focus-visible:bg-primary">
                        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-white/15 pt-4">
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${instructor.accent}`}>
                        {instructor.role}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                        <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
                        Instagram
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex justify-center sm:mt-16"
        >
          <a
            href="#location"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary/45 px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-primary transition hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            Побачити нашу студію
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
