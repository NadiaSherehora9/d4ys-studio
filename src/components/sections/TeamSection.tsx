"use client";
import React from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import sostavImage from "../../assets/sostav.png";
import nastyaImage from "../../assets/nastya.png";
import nikaImage from "../../assets/nika.png";
import nadiaImage from "../../assets/nadia.png";

interface Instructor {
  id: number;
  name: string;
  role: string;
  specialties: string[];
  bio: string;
  image: string;
  instagram?: string;
}

const instructors: Instructor[] = [
  {
    id: 1,
    name: "Анастасія",
    role: "Choreo",
    specialties: ["Choreo"],
    bio: "Енергійна та креативна. Навчить тебе не просто танцювати, а жити танцем. Переможниця багатьох чемпіонатів.",
    image: nastyaImage,
    instagram: "https://www.instagram.com/nesxeyy/",
  },
  {
    id: 2,
    name: "Надія",
    role: "Choreo",
    specialties: ["Choreo"],
    bio: "Професіоналізм та увага до деталей. Її хореографії завжди наповнені глибоким змістом та емоціями.",
    image: nadiaImage,
    instagram: "https://www.instagram.com/nyaa.930/",
  },
  {
    id: 3,
    name: "Вероніка",
    role: "Jazz-Funk",
    specialties: ["Jazz-Funk"],
    bio: "Грація та сила в кожному русі. Допоможе розкрити твою жіночність та впевненість на підборах.",
    image: nikaImage,
    instagram: "https://www.instagram.com/_richiekaspbrak_/",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const getSpecialtyColor = (specialty: string) => {
  switch (specialty) {
    case "Choreo":
    case "CHOREO":
      return "bg-primary/20 text-primary border-primary/30";
    case "Jazz-Funk":
    case "JAZZ-FUNK":
      return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    default:
      return "bg-secondary text-foreground border-border";
  }
};

export const TeamSection = () => {
  return (
    <section
      id="team"
      className="relative py-24 sm:py-32 bg-background overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-20"
          style={{ background: "hsl(var(--primary))" }}
          animate={{
            x: [0, 30, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-32 w-80 h-80 rounded-full blur-[120px] opacity-15"
          style={{ background: "hsl(var(--primary))" }}
          animate={{
            x: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="section-container relative z-10">
        {/* Section Header with Photo */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary mb-6"
            >
              Наша команда
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-foreground mb-6">
              Наші{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                Тренери
              </span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
              Професіонали, які надихають, мотивують та ведуть до успіху кожного
              учня. Ми - більше ніж просто студія, ми - сім'я, яка живе танцем.
            </p>
            <motion.a
              href="#schedule"
              className="hidden lg:inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/50 text-primary text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Переглянути розклад
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-sm lg:max-w-md">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl group z-10"
              >
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <img
                  src={sostavImage}
                  alt="Команда D4YS"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
              {/* Decorative elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
                className="absolute -z-10 top-4 -right-4 w-full h-full rounded-2xl border border-primary/20 bg-primary/5"
              />
              <div className="absolute -z-20 -bottom-8 -left-8 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-30" />
            </div>
          </motion.div>
        </div>

        {/* Instructors Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {instructors.map((instructor) => (
            <motion.div
              key={instructor.id}
              variants={cardVariants}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <motion.img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                  {/* Instagram Button */}
                  {instructor.instagram && (
                    <motion.a
                      href={instructor.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 p-2.5 rounded-full glass opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/20"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Instagram className="w-4 h-4 text-foreground" />
                    </motion.a>
                  )}

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {instructor.name}
                    </h3>
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-3">
                      {instructor.role}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {instructor.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${getSpecialtyColor(specialty)}`}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    {/* Bio - shows on hover */}
                    <motion.p className="text-xs text-muted-foreground leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-3">
                      {instructor.bio}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 lg:hidden"
        >
          <p className="text-muted-foreground text-sm mb-4">
            Готові почати свою танцювальну подорож?
          </p>
          <motion.a
            href="#schedule"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/50 text-primary text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Переглянути розклад
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
