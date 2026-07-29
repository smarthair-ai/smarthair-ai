import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Camera,
  ScanFace,
  Database,
  Brain,
  Glasses,
  Users,
  ChevronDown,
  ArrowDown,
} from "lucide-react";
import { architecture } from "@/data/content";
import mirrorImg from "@/assets/images/Futuristic_smart_mirror_in_a_m_2026-07-29T12-12-55.png";

// 显式图标映射 — 用于 data 中的动态图标名
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Camera,
  ScanFace,
  Database,
  Brain,
  Glasses,
  Users,
};

export default function Architecture() {
  const [selectedLayer, setSelectedLayer] = useState(0);

  const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    purple: {
      bg: "bg-[var(--neon-purple)]/15",
      text: "text-[var(--neon-purple)]",
      border: "border-[var(--neon-purple)]/30",
      glow: "shadow-[0_0_20px_oklch(0.65_0.25_300/0.2)]",
    },
    cyan: {
      bg: "bg-[var(--neon-cyan)]/15",
      text: "text-[var(--neon-cyan)]",
      border: "border-[var(--neon-cyan)]/30",
      glow: "shadow-[0_0_20px_oklch(0.70_0.18_200/0.2)]",
    },
  };

  return (
    <section id="architecture" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[var(--neon-cyan)] opacity-5 blur-[120px] rounded-full" />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <Layers className="w-4 h-4 text-[var(--neon-cyan)]" />
            <span className="text-sm text-[var(--muted-foreground)]">六层技术架构</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">从采集到施工</span>
            <span className="text-gradient">完整闭环</span>
          </h2>
          <p className="text-base md:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            点击每一层，查看该层的具体技术细节与实现方案
          </p>
        </motion.div>

        {/* Visual banner - smart mirror */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto mb-10"
        >
          <div className="relative rounded-2xl overflow-hidden glass-card aspect-[21/9]">
            {/* Skeleton placeholder while image loads */}
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.01_280)] to-[oklch(0.14_0.005_280)] animate-pulse" />
            <img
              src={mirrorImg}
              alt="智能镜面 AR 发型设计"
              className="relative w-full h-full object-cover"
              onLoad={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "1";
              }}
              style={{ opacity: 0, transition: "opacity 0.4s ease" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--neon-purple)]/20 backdrop-blur flex items-center justify-center">
                  <Camera className="w-4 h-4 text-[var(--neon-purple)]" />
                </div>
                <span className="text-sm text-white font-medium">智能镜面设备</span>
              </div>
              <div className="flex gap-2">
                {["镜面摄像头", "AR渲染", "触控交互"].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] glass-card text-[var(--neon-cyan)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Architecture layers - vertical stack */}
        <div className="max-w-4xl mx-auto space-y-3">
          {architecture.map((layer, i) => {
            const colors = colorMap[layer.color];
            const isSelected = selectedLayer === i;
            const LayerIcon = iconMap[layer.icon];
            return (
              <motion.button
                key={layer.layer}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                onClick={() => setSelectedLayer(i)}
                className={`w-full text-left glass-card rounded-2xl p-4 md:p-5 transition-all duration-300 border ${
                  isSelected
                    ? `${colors.border} ${colors.glow} scale-[1.01]`
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Layer number */}
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    {LayerIcon && <LayerIcon className={`w-5 h-5 md:w-6 md:h-6 ${colors.text}`} />}
                  </div>

                  {/* Layer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-mono ${colors.text}`}>{layer.layer}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">—</span>
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-white truncate">
                      {layer.name}
                    </h3>
                  </div>

                  {/* Expand indicator */}
                  <motion.div
                    animate={{ rotate: isSelected ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 ${isSelected ? colors.text : "text-[var(--muted-foreground)]"}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </div>

                {/* Detail panel */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-white/5">
                        <h4 className={`text-sm font-medium mb-3 ${colors.text}`}>
                          {layer.detail.title}
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {layer.detail.points.map((point, pi) => (
                            <motion.div
                              key={pi}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: pi * 0.05 }}
                              className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${colors.bg.replace('/15','/60')} mt-1.5 flex-shrink-0`} />
                              <span>{point}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Flow diagram hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-10 text-sm text-[var(--muted-foreground)]"
        >
          <ArrowDown className="w-4 h-4 text-[var(--neon-purple)]" />
          <span>数据自上而下流动，六层协同完成"分析→推荐→预览→施工"闭环</span>
        </motion.div>
      </div>
    </section>
  );
}
