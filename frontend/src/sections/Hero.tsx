import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
  ScanFace,
  Glasses,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { heroData } from "@/data/content";
import arPreviewImg from "@/assets/images/A_futuristic_AR_hairstyle_prev_2026-07-29T12-11-29.png";

export default function Hero() {
  const [viewIndex, setViewIndex] = useState(0);

  useEffect(() => {
    // 移动端/低功耗模式下暂停轮播以节省电量
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const timer = setInterval(() => {
      setViewIndex((prev) => (prev + 1) % heroData.arViews.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden grid-bg"
    >
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-[var(--neon-purple)] opacity-20 blur-[120px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-[var(--neon-cyan)] opacity-15 blur-[140px] rounded-full animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-5 md:gap-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card w-fit">
              <Sparkles className="w-4 h-4 text-[var(--neon-cyan)]" />
              <span className="text-sm text-[var(--muted-foreground)]">
                AI + AR 智能发型设计系统
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                <span className="text-white">{heroData.title}</span>
                <br />
                <span className="text-gradient animate-gradient">
                  {heroData.titleHighlight}
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-[var(--muted-foreground)] leading-relaxed max-w-xl">
              {heroData.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollTo("#demo")}
                className="neon-button group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white font-medium hover:shadow-[0_0_30px_oklch(0.65_0.25_300/0.4)] transition-all duration-300"
              >
                <span>{heroData.ctas[0].label}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo("#business")}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl glass-card glass-card-hover text-white font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{heroData.ctas[1].label}</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {heroData.stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="glass-card rounded-xl p-3 text-center"
                >
                  <div className="text-xl md:text-2xl font-bold text-gradient">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                    {stat.sub}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: AR Device Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative flex justify-center items-center mt-4 lg:mt-0"
          >
            <div className="relative animate-float">
              {/* Phone Frame */}
              <div className="relative w-[240px] md:w-[300px] h-[480px] md:h-[600px] rounded-[2.5rem] border-[3px] border-white/10 glass-card overflow-hidden glow-purple">
                {/* Screen Content */}
                <div className="absolute inset-0 flex flex-col">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 pt-4 pb-2">
                    <span className="text-[10px] text-white/60">SmartHair AI</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                      <span className="text-[10px] text-[var(--neon-cyan)]">AR Live</span>
                    </div>
                  </div>

                  {/* AR Preview Area */}
                  <div className="flex-1 relative mx-3 mb-3 rounded-2xl overflow-hidden bg-gradient-to-b from-[oklch(0.18_0.01_280)] to-[oklch(0.12_0.005_280)]">
                    {/* Real AR preview image */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={viewIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <img
                          src={arPreviewImg}
                          alt="AR 发型预览"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </motion.div>
                    </AnimatePresence>

                    {/* Scan line effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--neon-cyan)] to-transparent animate-scan" />
                    </div>

                    {/* AR markers */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur">
                      <ScanFace className="w-3 h-3 text-[var(--neon-cyan)]" />
                      <span className="text-[9px] text-white">脸型识别 ✓</span>
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/40 backdrop-blur">
                      <span className="text-[9px] text-[var(--neon-purple)]">匹配度 92%</span>
                    </div>

                    {/* View label */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={viewIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-center"
                        >
                          <div className="text-[10px] font-medium text-white">
                            {heroData.arViews[viewIndex].label}
                          </div>
                          <div className="text-[8px] text-[var(--muted-foreground)]">
                            {heroData.arViews[viewIndex].desc}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* View switcher */}
                  <div className="flex justify-center gap-2 pb-4 px-3">
                    {heroData.arViews.map((view, i) => (
                      <button
                        key={view.label}
                        onClick={() => setViewIndex(i)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] transition-all ${
                          viewIndex === i
                            ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
                            : "glass-card text-[var(--muted-foreground)]"
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl" />
              </div>

              {/* Floating labels */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-8 md:-left-12 top-1/4 glass-card rounded-xl px-3 py-2 hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--neon-purple)]/20 flex items-center justify-center">
                    <ScanFace className="w-4 h-4 text-[var(--neon-purple)]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">AI 分析</div>
                    <div className="text-xs text-white font-medium">圆脸 · 细软发</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 md:-right-8 top-1/2 glass-card rounded-xl px-3 py-2 hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--neon-cyan)]/20 flex items-center justify-center">
                    <Glasses className="w-4 h-4 text-[var(--neon-cyan)]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">AR 试戴</div>
                    <div className="text-xs text-white font-medium">三视角实时</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -right-2 md:-right-4 bottom-8 glass-card rounded-xl px-3 py-2 hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                    <RotateCw className="w-4 h-4 text-[var(--success)]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">施工参数</div>
                    <div className="text-xs text-white font-medium">已生成</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-[var(--muted-foreground)]">向下滚动</span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1.5 rounded-full bg-[var(--neon-cyan)]"
          />
        </div>
      </motion.div>
    </section>
  );
}
