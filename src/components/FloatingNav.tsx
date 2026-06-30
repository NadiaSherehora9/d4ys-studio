"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  link: string;
}

interface FloatingNavProps {
  navItems: NavItem[];
  className?: string;
}

export const FloatingNav = ({ navItems, className }: FloatingNavProps) => {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);

      // Update active section based on scroll position
      const sections = navItems.map((item) => item.link.replace("#", ""));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, navItems]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    e.preventDefault();
    const element = document.getElementById(link.replace("#", ""));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: visible ? 0 : 100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
          className
        )}
      >
        <motion.div
          className="flex items-center gap-1 rounded-full glass px-2 py-2 shadow-2xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={(e) => handleClick(e, item.link)}
              className={cn(
                "nav-link relative rounded-full px-3 py-2 text-xs md:text-sm transition-all duration-300",
                activeSection === item.link.replace("#", "") &&
                  "text-foreground"
              )}
            >
              <span className="relative z-10">{item.name}</span>
              {activeSection === item.link.replace("#", "") && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-full bg-secondary"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              {activeSection === item.link.replace("#", "") && (
                <motion.div
                  layoutId="active-dot"
                  className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary glow-red animate-pulse-glow"
                />
              )}
            </a>
          ))}
        </motion.div>
      </motion.nav>
    </AnimatePresence>
  );
};
