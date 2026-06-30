import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import shoesPng from "../assets/shoes.png";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] text-white selection:bg-white selection:text-black font-syne">
      <SEO title="404 — Сторінку не знайдено" description="Вибачте, запитувану сторінку не знайдено." />
      
      {/* Background Noise */}
      <div className="absolute inset-0 z-[1] opacity-[0.05] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Top Label */}
      <div className="absolute top-8 left-0 right-0 z-40 flex justify-center">
        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
          404 Error Page
        </span>
      </div>

      {/* Main Composition */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-[100vw] h-screen overflow-hidden">
        
        {/* Left Giant 4 */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[25vh] md:h-full flex items-end md:items-center justify-center md:justify-end w-full md:w-[35%]"
        >
          <span className="font-anton text-[40vh] md:text-[120vh] leading-none text-[#D00000] tracking-tighter translate-y-[15%] md:translate-y-0 md:translate-x-[20%] blur-[2px] opacity-90 select-none">
            4
          </span>
        </motion.div>

        {/* Center Content (Shoes + Text) */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full md:w-[30%] h-[50vh] md:h-full">
          
          {/* Shoes Image as the "0" visual anchor */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Glow behind shoes */}
            <div className="absolute inset-0 bg-gradient-radial from-[#D00000]/40 to-transparent blur-[30px] md:blur-[50px]" />
            
            <motion.img 
              src={shoesPng} 
              alt="404 Shoes"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="w-[70%] md:w-[140%] max-w-none h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] grayscale-[10%] contrast-110 brightness-90"
            />
          </motion.div>

          {/* Overlay Text Block */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
             {/* Dark Gradient Backdrop for Readability */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.7)_0%,transparent_70%)] opacity-80 z-[-1]" />

             {/* Small 404 label */}
             <span className="text-xs md:text-sm font-bold tracking-[0.3em] mb-2 md:mb-4 text-[#D00000] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">Error 404</span>
             
             {/* Error Message */}
             <h2 className="text-base md:text-2xl font-black text-center uppercase tracking-wider max-w-[280px] leading-tight mb-6 md:mb-8 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white">
               Вибач, ми не знайшли цю сторінку
             </h2>

             {/* Scribble Button */}
             <div className="pointer-events-auto relative group cursor-pointer scale-90 md:scale-100">
               <Link to="/" className="relative z-10 px-8 py-3 block">
                 <span className="font-syne font-black italic text-lg md:text-2xl tracking-wide text-white group-hover:text-black transition-colors duration-300 drop-shadow-lg">
                   ПОВЕРНУТИСЯ
                 </span>
               </Link>
               
               {/* Scribble SVG */}
               <svg 
                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[200%] -z-10 text-[#D00000] group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_15px_rgba(208,0,0,0.6)]" 
                 viewBox="0 0 200 60" 
                 fill="none" 
                 xmlns="http://www.w3.org/2000/svg"
               >
                 <motion.path 
                   d="M10 30C40 5 160 5 190 30C160 55 40 55 10 30Z" 
                   stroke="currentColor" 
                   strokeWidth="4"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 1.2, delay: 0.5, ease: "circOut" }}
                   className="opacity-90"
                 />
                 <motion.path 
                   d="M15 35C45 15 155 15 185 35" 
                   stroke="currentColor" 
                   strokeWidth="3"
                   strokeLinecap="round"
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 0.8, delay: 0.7 }}
                   className="opacity-70"
                 />
                 <motion.path 
                   d="M20 25C50 45 150 45 180 25" 
                   stroke="currentColor" 
                   strokeWidth="2"
                   strokeLinecap="round"
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 0.8, delay: 0.9 }}
                   className="opacity-60"
                 />
               </svg>
             </div>
          </div>
        </div>

        {/* Right Giant 4 */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[25vh] md:h-full flex items-start md:items-center justify-center md:justify-start w-full md:w-[35%]"
        >
          <span className="font-anton text-[40vh] md:text-[120vh] leading-none text-[#D00000] tracking-tighter -translate-y-[15%] md:translate-y-0 md:-translate-x-[20%] blur-[2px] opacity-90 select-none">
            4
          </span>
        </motion.div>

      </div>

      {/* Bottom Label */}
      <div className="absolute bottom-8 left-0 right-0 z-40 flex justify-center text-center px-4">
        <p className="text-[10px] md:text-xs font-medium tracking-widest text-white/40 uppercase max-w-md">
          Сторінка, яку ви шукаєте, не існує або сталася інша помилка.
        </p>
      </div>

    </div>
  );
};

export default NotFound;
