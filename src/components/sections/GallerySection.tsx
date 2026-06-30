"use client";
import React from "react";
import { motion } from "framer-motion";
import { ThreeDMarquee } from "@/components/ui/three-d-marquee";

// Import gallery images
import galleryNew1 from "@/assets/galery-new1.png";
import galleryNew2 from "@/assets/galery-new2.png";
import galleryNew3 from "@/assets/galery-new3.png";
import galleryNew4 from "@/assets/galery-new4.png";
import galleryNew5 from "@/assets/galery-new5.jpg";
import galleryNew6 from "@/assets/galery-new6.png";

// 12 items (6 unique x 2) so each of 4 columns has 3 photos before the seamless duplicate.
const galleryImages = [
  galleryNew1,
  galleryNew2,
  galleryNew3,
  galleryNew4,
  galleryNew5,
  galleryNew6,
  galleryNew2,
  galleryNew4,
  galleryNew1,
  galleryNew6,
  galleryNew3,
  galleryNew5,
];

export const GallerySection = () => {
  return (
    <section
      id="gallery"
      className="relative bg-background py-20 sm:py-28 overflow-hidden"
    >
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[24rem] h-[24rem] rounded-full bg-primary/5 blur-3xl" />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-20 text-center mb-12 sm:mb-16 px-4"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary mb-6"
        >
          Атмосфера
        </motion.span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-foreground">
          Відчуй нашу{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
            енергію
          </span>
        </h2>
        <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Моменти з наших залів, репетицій та виступів — це більше, ніж просто танець.
        </p>
      </motion.div>

      {/* 3D Marquee */}
      <div className="relative z-20">
        <ThreeDMarquee images={galleryImages} />
      </div>

      {/* Top & bottom gradient fades for cinematic feel */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};
