import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  UserCircle,
  Trophy,
  ListOrdered,
  GitBranch,
  SlidersHorizontal,
  Info,
  Check,
  Glasses,
  ScanFace,
  Sparkles,
  ClipboardList,
  Scissors,
  Flame,
  HeartHandshake,
} from "lucide-react";
import { demoTabs } from "@/data/content";
import type { RecommendContent, ArContent, ConstructionContent } from "@/data/content";
import femaleHairImg from "@/assets/images/Professional_hairstyle_photo_o_2026-07-29T12-12-01.png";

// 显式图标映射 — 用于 data 中的动态图标名
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Glasses,
  ClipboardList,
  Scissors,
  Flame,
  HeartHandshake,
};

// Animated number counter
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 800;
          const start = Date.now();
          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
            else setDisplay(value);
          };
          animate();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return <span ref={ref}>{display}</span>;
}

export default function FeatureDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [arView, setArView] = useState(0);

  // Auto-rotate AR views — 移动端/低功耗模式下暂停轮播以节省电量
  useEffect(() => {
    if (activeTab !== 1) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const timer = setInterval(() => {
      setArView((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeTab]);

  const tab = demoTabs[activeTab];
  // Type narrowing: cast content to the correct type based on activeTab
  const recommendContent = activeTab === 0 ? (tab.content as RecommendContent) : null;
  const arContent = activeTab === 1 ? (tab.content as ArContent) : null;
  const constructionContent = activeTab === 2 ? (tab.content as ConstructionContent) : null;

  return (
    <section id="features" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute top-1/4 left-0 w-[500px] h-[400px] bg-[var(--neon-purple)] opacity-5 blur-[120px] rounded-full" />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <Play className="w-4 h-4 text-[var(--neon-purple)]" />
            <span className="text-sm text-[var(--muted-foreground)]">功能演示</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">从分析到施工</span>
            <span className="text-gradient">全流程展示</span>
          </h2>
          <p className="text-base md:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            智能推荐 · AR虚拟试戴 · 施工参数卡，三大核心功能一目了然
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {demoTabs.map((t, i) => {
            const TabIcon = iconMap[t.icon];
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === i
                    ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white shadow-[0_0_20px_oklch(0.65_0.25_300/0.3)]"
                    : "glass-card text-[var(--muted-foreground)] hover:text-white"
                }`}
              >
                {TabIcon && <TabIcon className="w-4 h-4" />}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            {/* Tab 1: Smart Recommendation */}
            {activeTab === 0 && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left: Scenario + Result */}
                <div className="space-y-4">
                  {/* Scenario card */}
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <UserCircle className="w-5 h-5 text-[var(--neon-cyan)]" />
                      <span className="text-sm text-[var(--muted-foreground)]">分析场景</span>
                    </div>
                    <p className="text-lg font-semibold text-white mb-4">
                      {recommendContent!.scenario}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/5 p-3">
                        <div className="text-xs text-[var(--muted-foreground)] mb-1">脸型</div>
                        <div className="text-sm text-white font-medium">圆脸</div>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <div className="text-xs text-[var(--muted-foreground)] mb-1">发质</div>
                        <div className="text-sm text-white font-medium">细软发</div>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <div className="text-xs text-[var(--muted-foreground)] mb-1">场景</div>
                        <div className="text-sm text-white font-medium">校园日常</div>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <div className="text-xs text-[var(--muted-foreground)] mb-1">打理难度</div>
                        <div className="text-sm text-white font-medium">中等</div>
                      </div>
                    </div>
                  </div>

                  {/* TOP1 recommendation */}
                  <div className="glass-card rounded-2xl p-6 border border-[var(--neon-purple)]/20 glow-purple">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-[var(--neon-cyan)]">TOP 1 推荐</span>
                      </div>
                      <div className="text-3xl font-bold text-gradient">
                        <AnimatedNumber value={recommendContent!.top1.score} />%
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {recommendContent!.top1.name}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">
                      {recommendContent!.top1.reason}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs bg-[var(--neon-purple)]/15 text-[var(--neon-purple)]">
                        {recommendContent!.top1.difficulty}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)]">
                        {recommendContent!.top1.scene}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Candidates + Weights */}
                <div className="space-y-4">
                  {/* TOP3 ranking */}
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ListOrdered className="w-5 h-5 text-[var(--neon-purple)]" />
                      <span className="text-sm font-medium text-white">TOP3 候选发型</span>
                    </div>
                    <div className="space-y-3">
                      {recommendContent!.candidates.map((c, i) => (
                        <div key={c.name} className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              i === 0
                                ? "bg-yellow-400/20 text-yellow-400"
                                : i === 1
                                ? "bg-gray-300/20 text-gray-300"
                                : "bg-orange-400/20 text-orange-400"
                            }`}
                          >
                            {c.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-white truncate">{c.name}</span>
                              <span className="text-sm text-[var(--neon-cyan)] font-mono ml-2">
                                {c.score}分
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${c.score}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  i === 0
                                    ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)]"
                                    : "bg-white/20"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weights */}
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <GitBranch className="w-5 h-5 text-[var(--neon-cyan)]" />
                      <span className="text-sm font-medium text-white">多权重匹配算法</span>
                    </div>
                    <div className="space-y-3">
                      {recommendContent!.weights.map((w, i) => (
                        <div key={w.name}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-[var(--muted-foreground)]">{w.name}</span>
                            <span className="text-sm text-white font-mono">{w.value}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${w.value * 3}%` }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                              className="h-full rounded-full bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: AR Try-on */}
            {activeTab === 1 && (
              <div className="grid lg:grid-cols-5 gap-6">
                {/* AR Preview - 3 views */}
                <div className="lg:col-span-3">
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Glasses className="w-5 h-5 text-[var(--neon-cyan)]" />
                        <span className="text-sm font-medium text-white">AR 三视角试戴</span>
                      </div>
                      <span className="text-xs text-[var(--neon-cyan)] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                        实时渲染
                      </span>
                    </div>

                    {/* View switcher */}
                    <div className="flex gap-2 mb-5">
                      {arContent!.views.map((view, i) => (
                        <button
                          key={view.label}
                          onClick={() => setArView(i)}
                          className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            arView === i
                              ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
                              : "bg-white/5 text-[var(--muted-foreground)]"
                          }`}
                        >
                          {view.label}
                        </button>
                      ))}
                    </div>

                    {/* AR Canvas */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-b from-[oklch(0.18_0.01_280)] to-[oklch(0.12_0.005_280)]">
                      <div className="absolute inset-0 grid-bg opacity-30" />
                      {/* Scan line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--neon-cyan)] to-transparent animate-scan" />

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={arView}
                          initial={{ opacity: 0, scale: 1.03 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0"
                        >
                          <img
                            src={femaleHairImg}
                            alt="AR 发型试戴"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        </motion.div>
                      </AnimatePresence>

                      {/* AR markers */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 backdrop-blur">
                        <ScanFace className="w-3 h-3 text-[var(--neon-cyan)]" />
                        <span className="text-[10px] text-white">识别中</span>
                      </div>
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur">
                        <span className="text-[10px] text-[var(--neon-purple)]">92% 匹配</span>
                      </div>

                      {/* View description */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="px-3 py-2 rounded-lg bg-black/50 backdrop-blur">
                          <p className="text-xs text-white font-medium">
                            {arContent!.views[arView].label}
                          </p>
                          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                            {arContent!.views[arView].desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Adjustable params */}
                <div className="lg:col-span-2">
                  <div className="glass-card rounded-2xl p-6 h-full">
                    <div className="flex items-center gap-2 mb-5">
                      <SlidersHorizontal className="w-5 h-5 text-[var(--neon-purple)]" />
                      <span className="text-sm font-medium text-white">可调参数</span>
                    </div>
                    <div className="space-y-5">
                      {arContent!.params.map((param) => (
                        <div key={param.label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[var(--muted-foreground)]">{param.label}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {param.options.map((opt, oi) => (
                              <button
                                key={opt}
                                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                                  oi === 0
                                    ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
                                    : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                        <Info className="w-3.5 h-3.5" />
                        <span>调节参数实时预览发型效果变化</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Construction Parameters */}
            {activeTab === 2 && (
              <div className="grid md:grid-cols-3 gap-6">
                {constructionContent!.sections.map((section, i) => {
                  const SectionIcon = iconMap[section.icon];
                  return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="glass-card rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--neon-purple)]/15 flex items-center justify-center">
                        {SectionIcon && <SectionIcon className="w-5 h-5 text-[var(--neon-purple)]" />}
                      </div>
                      <h3 className="text-base font-semibold text-white">{section.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item, ii) => (
                        <li key={ii} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
                          <Check className="w-4 h-4 text-[var(--neon-cyan)] mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
