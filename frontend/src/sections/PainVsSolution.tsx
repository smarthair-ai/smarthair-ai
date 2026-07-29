import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  MessageSquare,
  ImageOff,
  UserX,
  EyeOff,
  ScanFace,
  Glasses,
  ClipboardList,
  RotateCcw,
} from "lucide-react";
import { painPoints, solutions } from "@/data/content";

// 显式图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  ImageOff,
  UserX,
  EyeOff,
  ScanFace,
  Glasses,
  ClipboardList,
  RotateCcw,
};

export default function PainVsSolution() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="pain" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--neon-purple)] opacity-5 blur-[120px] rounded-full" />

      <div className="container relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--neon-pink)] animate-pulse" />
            <span className="text-sm text-[var(--muted-foreground)]">行业痛点 vs AI 方案</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">告别凭感觉</span>
            <span className="text-gradient">四大理发痛点，一次解决</span>
          </h2>
          <p className="text-base md:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            从"靠运气"到"靠数据"，AI + AR 让每一次剪发都有据可循
          </p>
        </motion.div>

        {/* Comparison grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Pain points column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white/80">传统痛点</h3>
            </div>

            {painPoints.map((pain, i) => {
              const PainIcon = iconMap[pain.icon];
              return (
              <motion.div
                key={pain.pain}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`glass-card rounded-2xl p-5 transition-all duration-300 ${
                  hoveredIndex === i ? "opacity-40 scale-[0.98]" : "opacity-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    {PainIcon && <PainIcon className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white/80 mb-1">
                      {pain.pain}
                    </h4>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {pain.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>

          {/* Solutions column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--neon-purple)]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[var(--neon-purple)]" />
              </div>
              <h3 className="text-xl font-bold text-gradient">AI 解决方案</h3>
            </div>

            {solutions.map((sol, i) => {
              const SolIcon = iconMap[sol.icon];
              return (
              <motion.div
                key={sol.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`glass-card-hover rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
                  hoveredIndex === i
                    ? "scale-[1.02] border-[var(--neon-purple)]/30"
                    : "scale-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      hoveredIndex === i
                        ? "bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)]"
                        : "bg-[var(--neon-purple)]/20"
                    }`}
                  >
                    {SolIcon && (
                      <SolIcon
                        className={`w-5 h-5 transition-colors ${
                          hoveredIndex === i ? "text-white" : "text-[var(--neon-purple)]"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white mb-1">
                      {sol.title}
                    </h4>
                    <p className="text-sm text-[var(--neon-cyan)] mb-2">{sol.desc}</p>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: hoveredIndex === i ? "auto" : 0,
                        opacity: hoveredIndex === i ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed pt-1 border-t border-white/5">
                        {sol.detail}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>

        {/* Connecting arrow (desktop) */}
        <div className="hidden md:flex justify-center mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center gap-3 px-6 py-3 rounded-full glass-card"
          >
            <span className="text-sm text-[var(--muted-foreground)]">传统模式</span>
            <ArrowRight className="w-5 h-5 text-[var(--neon-purple)]" />
            <span className="text-sm text-gradient font-medium">AI + AR 闭环</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
