"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, Phone, User2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { NavDropdown } from "./NavDropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import logo from "@/assets/logo.png";

interface NavItem {
  name: string;
  link: string;
}

interface HeaderProps {
  navItems: NavItem[];
  className?: string;
}

export const Header = ({ navItems, className }: HeaderProps) => {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const visibleNavItems = navItems.slice(0, 3);
  const droppedNavItems = navItems.slice(3);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

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
  }, [navItems]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);


  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(link.replace("#", ""));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "py-3" : "py-6",
          className
        )}
      >
        <div className="section-container">
          <motion.nav
            className={cn(
              "relative flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500",
              scrolled ? "glass shadow-2xl" : "bg-transparent"
            )}
          >
            {/* Logo */}
            <motion.a
              href="#home"
              onClick={(e) => handleClick(e, "#home")}
              className="relative z-10 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img
                src={logo}
                alt="D4YS Logo"
                className="h-14 md:h-16 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,0,0,0.6)]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              />
            </motion.a>

            {/* Desktop Navigation */}
            <div
              className="hidden md:flex items-center gap-1"
              onMouseLeave={() => setHoveredPath(null)}
            >
              {visibleNavItems.map((item, index) => {
                const isActive = activeSection === item.link.replace("#", "");
                return (
                  <motion.a
                    key={item.name}
                    href={item.link}
                    onClick={(e) => handleClick(e, item.link)}
                    onMouseEnter={() => setHoveredPath(item.link)}
                    className={cn(
                      "relative px-4 py-2 rounded-full transition-colors duration-300",
                      isActive ? "text-foreground" : "text-foreground/80 hover:text-foreground"
                    )}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                  >
                    <span className="relative z-10 text-sm font-semibold uppercase tracking-wider">
                      {item.name}
                    </span>

                    {/* Sliding Hover Background */}
                    {item.link === hoveredPath && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-secondary/80 -z-10"
                        layoutId="navbar-hover"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6
                        }}
                      />
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary glow-red"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.a>
                );
              })}

              {droppedNavItems.length > 0 && (
                <NavDropdown
                  items={droppedNavItems}
                  activeSection={activeSection}
                  onNavigate={handleClick}
                />
              )}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.a
                      href="tel:+380684649487"
                      className="group relative flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-semibold tracking-wide text-foreground transition-all duration-300 hover:border-primary/60 hover:bg-primary/15"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <Phone className="h-3.5 w-3.5 text-primary transition-transform group-hover:rotate-12" />
                      <span className="hidden lg:inline">+380 68 464 9487</span>
                      <span className="lg:hidden">Зв’язок</span>
                    </motion.a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-primary text-primary-foreground border-primary"
                  >
                    Тренер Надія вам допоможе
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <motion.a
                href="#contact"
                onClick={(e) => handleClick(e, "#contact")}
                className="relative overflow-hidden rounded-full border border-primary/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-all duration-300 hover:bg-primary/10"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10">Записатися</span>
              </motion.a>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Link
                  to="/cabinet"
                  className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40"
                >
                  <User2 className="h-4 w-4" />
                  <span>Кабінет</span>
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden relative z-10 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.nav>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden overflow-y-auto"
          >
            {/* Decorative ambient glow */}
            <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

            <motion.div
              className="relative flex flex-col min-h-full px-6 pt-24 pb-10"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.05 } },
                closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
              }}
            >
              {/* Section label */}
              <motion.p
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: -10 },
                }}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 mb-6"
              >
                Навігація
              </motion.p>

              {/* Nav list */}
              <nav className="flex flex-col">
                {navItems.map((item, index) => {
                  const isActive = activeSection === item.link.replace("#", "");
                  return (
                    <motion.a
                      key={item.name}
                      href={item.link}
                      onClick={(e) => handleClick(e, item.link)}
                      variants={{
                        open: { opacity: 1, x: 0 },
                        closed: { opacity: 0, x: -20 },
                      }}
                      className={cn(
                        "group flex items-center justify-between py-4 border-b border-white/5 transition-colors",
                        isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            "text-xs font-mono tabular-nums transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "text-2xl font-black uppercase tracking-tight transition-transform group-hover:translate-x-1",
                            isActive && "text-shadow-glow"
                          )}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-xl transition-all duration-300",
                          isActive
                            ? "text-primary translate-x-0 opacity-100"
                            : "text-foreground/30 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        )}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </motion.a>
                  );
                })}
              </nav>

              {/* CTA block */}
              <motion.div
                className="mt-10 flex flex-col gap-3"
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 20 },
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 mb-1">
                  Дії
                </p>

                <button
                  type="button"
                  onClick={(e) =>
                    handleClick(
                      e as unknown as React.MouseEvent<HTMLAnchorElement>,
                      "#contact"
                    )
                  }
                  className="rounded-full bg-primary px-6 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/30"
                >
                  Записатися
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/cabinet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full border border-primary/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                  >
                    <User2 className="h-4 w-4" />
                    <span>Кабінет</span>
                  </Link>
                  <a
                    href="tel:+380684649487"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Дзвонити</span>
                  </a>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-1">
                  +380 68 464 9487 · Тренер Надія вам допоможе
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
