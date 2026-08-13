"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, MapPin, Navigation, Play } from "lucide-react";

const instagramUrl = "https://www.instagram.com/p/DX9cm4fMmF4/";
const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=%D0%B2%D1%83%D0%BB.+%D0%93%D0%B5%D1%80%D0%BE%D1%97%D0%B2+%D0%9D%D0%B5%D0%B1%D0%B5%D1%81%D0%BD%D0%BE%D1%97+%D0%A1%D0%BE%D1%82%D0%BD%D1%96+2%D0%90+%D0%A2%D0%A0%D0%A6+%D0%92%D0%B5%D0%B3%D0%B0+%D0%91%D1%96%D0%BB%D0%B0+%D0%A6%D0%B5%D1%80%D0%BA%D0%B2%D0%B0";

export const LocationSection = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    setVideoError(false);

    try {
      await video.play();
    } catch {
      video.load();
      try {
        await video.play();
      } catch {
        setVideoError(true);
      }
    }
  }, []);

  const revealLocation = () => {
    setIsRevealed(true);
    void playVideo();
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRevealed && videoRef.current?.paused) {
        void playVideo();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRevealed, playVideo]);

  return (
    <section id="location" className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(255,0,0,0.14),transparent_32%)]" />

      <div className="section-container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75 }}
            className="lg:col-span-6"
          >
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary">
                Наша локація
              </span>
            </div>

            <h2 className="text-5xl font-black uppercase leading-[0.88] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-8xl">
              Знайди
              <span className="block text-primary">свій ритм</span>
              у місті
            </h2>

            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Ми в самому серці Білої Церкви. У відео показали шлях до студії,
              щоб перше знайомство почалося легко.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                <MapPin className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Адреса
                </p>
                <p className="mt-1 text-sm font-bold uppercase sm:text-base">Вега · 2А</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                <Navigation className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Орієнтир
                </p>
                <p className="mt-1 text-sm font-bold uppercase sm:text-base">4 поверх</p>
              </div>
            </div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(255,0,0,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,0,0,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              Відкрити на мапі
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32, rotate: 1.5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="relative mx-auto w-full max-w-[440px] lg:col-span-6"
          >
            <div className="absolute -inset-5 rounded-[2.5rem] border border-primary/15 sm:-inset-7" />
            <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-primary/20 blur-[70px]" />

            <div className="relative aspect-[9/15] overflow-hidden rounded-[1.75rem] border border-white/15 bg-zinc-950 shadow-2xl sm:rounded-[2.25rem]">
              <video
                ref={videoRef}
                className={`h-full w-full object-cover transition-[filter,transform] duration-1000 ease-out ${
                  isRevealed
                    ? "scale-100 brightness-90 blur-0"
                    : "scale-110 brightness-[0.42] blur-xl"
                }`}
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback"
                onCanPlay={() => {
                  if (isRevealed && videoRef.current?.paused) void playVideo();
                }}
                onError={() => setVideoError(true)}
                aria-hidden="true"
              >
                <source src="/studio-location-mobile.mp4" media="(max-width: 767px)" type="video/mp4" />
                <source src="/studio-location.mp4" type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/35" />

              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md sm:left-6 sm:top-6">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Біла Церква
              </div>

              <AnimatePresence>
                {!isRevealed && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35 }}
                    onClick={revealLocation}
                    aria-label="Дізнатись розташування студії"
                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center px-6 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md sm:h-20 sm:w-20"
                    >
                      <Play className="ml-1 h-6 w-6 fill-white text-white sm:h-7 sm:w-7" aria-hidden="true" />
                    </motion.span>
                    <span className="max-w-xs text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
                      Дізнатись розташування
                    </span>
                    <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
                      Натисни, щоб побачити шлях
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isRevealed && (
                  <motion.a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-5 left-5 right-5 flex min-h-12 items-center justify-between gap-3 rounded-full border border-white/15 bg-black/50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-xl transition hover:bg-primary sm:bottom-6 sm:left-6 sm:right-6"
                  >
                    Дивитися повне відео
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </motion.a>
                )}
              </AnimatePresence>

              {isRevealed && videoError && (
                <button
                  type="button"
                  onClick={() => void playVideo()}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/55 px-6 text-center backdrop-blur-sm"
                >
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-primary">
                    <Play className="ml-1 h-5 w-5 fill-white text-white" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-black uppercase tracking-[0.16em]">Відтворити маршрут</span>
                  <span className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/60">Натисніть ще раз</span>
                </button>
              )}
            </div>

            <div className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 rotate-90 text-[9px] font-semibold uppercase tracking-[0.32em] text-white/30 sm:block">
              D4YS studio · 49.7989° N
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
