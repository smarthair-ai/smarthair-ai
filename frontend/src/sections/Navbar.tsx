import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Menu, X, Shield } from "lucide-react";

const navLinks = [
  { label: "痛点对比", href: "#pain" },
  { label: "技术架构", href: "#architecture" },
  { label: "功能演示", href: "#features" },
  { label: "Demo体验", href: "#demo" },
  { label: "商业模式", href: "#business" },
  { label: "商家咨询", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-card border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav("#hero")}>
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--neon-purple)] blur-lg opacity-50" />
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-white">SmartHair</span>
              <span className="text-[10px] text-[var(--neon-cyan)] tracking-widest">AI SYSTEM</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] group-hover:w-3/4 transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs text-[var(--success)]">
              <Shield className="w-3.5 h-3.5" />
              <span>隐私保护</span>
            </div>
            <button
              onClick={() => handleNav("#demo")}
              className="neon-button px-5 py-2 rounded-lg bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white text-sm font-medium hover:shadow-[0_0_20px_oklch(0.65_0.25_300/0.4)] transition-shadow"
            >
              立即体验
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 glass-card border-b border-white/5 md:hidden overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="text-left px-4 py-3 text-sm text-[var(--muted-foreground)] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleNav("#demo")}
                className="mt-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white text-sm font-medium text-center"
              >
                立即体验 Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
