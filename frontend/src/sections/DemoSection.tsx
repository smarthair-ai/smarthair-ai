import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanFace,
  Sparkles,
  Glasses,
  Check,
  ChevronRight,
  RotateCw,
  SlidersHorizontal,
  Loader2,
  ArrowRight,
  Camera,
} from "lucide-react";
import { demoFaces, demoHairTypes, recommendations } from "@/data/content";
import CameraScan from "@/components/CameraScan";
import ARTryOn from "@/components/ARTryOn";
import DemoTryOn from "@/components/DemoTryOn";

type Step = 0 | 1 | 2 | 3;

export default function DemoSection() {
  const [step, setStep] = useState<Step>(0);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [hairType, setHairType] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAR, setShowAR] = useState(false);

  const handleCameraDetected = (face: string, hair: string) => {
    setFaceShape(face);
    setHairType(hair);
    setShowCamera(false);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setStep(2);
    }, 1500);
  };

  const handleAnalyze = () => {
    if (!faceShape || !hairType) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setStep(2);
    }, 2000);
  };

  const reset = () => {
    setStep(0);
    setFaceShape(null);
    setHairType(null);
  };

  const recs =
    faceShape && hairType
      ? recommendations[faceShape]?.[hairType] || []
      : [];

  const steps = [
    { num: 1, label: "脸型分析", icon: ScanFace },
    { num: 2, label: "AI推荐", icon: Sparkles },
    { num: 3, label: "AR试戴", icon: Glasses },
  ];

  return (
    <section id="demo" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute top-1/3 right-0 w-[600px] h-[500px] bg-[var(--neon-purple)] opacity-8 blur-[130px] rounded-full" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[400px] bg-[var(--neon-cyan)] opacity-5 blur-[120px] rounded-full" />

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
            <Sparkles className="w-4 h-4 text-[var(--neon-purple)]" />
            <span className="text-sm text-[var(--muted-foreground)]">Demo 体验区</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">亲自体验</span>
            <span className="text-gradient">AI 发型设计全流程</span>
          </h2>
          <p className="text-base md:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            选择你的脸型和发质，AI 自动推荐最佳发型，AR 三视角预览效果
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 md:gap-4">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                  step >= i
                    ? "glass-card border border-[var(--neon-purple)]/30"
                    : "bg-white/5"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= i
                      ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
                      : "bg-white/10 text-[var(--muted-foreground)]"
                  }`}
                >
                  {step > i ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`text-sm hidden sm:inline ${
                    step >= i ? "text-white" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight
                  className={`w-4 h-4 ${
                    step > i ? "text-[var(--neon-purple)]" : "text-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Demo content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 0: Select face shape & hair type */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Quick experience — AR & 360° preview */}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => setShowAR(true)}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white font-bold hover:shadow-[0_0_30px_oklch(0.65_0.25_300/0.4)] transition-all duration-300"
                  >
                    <Camera className="w-5 h-5" />
                    <span>立即体验 AR 试戴</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">HOT</span>
                  </button>
                  <button
                    onClick={() => setShowCamera(true)}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl glass-card border border-[var(--neon-cyan)]/30 text-white font-medium hover:border-[var(--neon-cyan)]/60 transition-all duration-300"
                  >
                    <ScanFace className="w-4 h-4 text-[var(--neon-cyan)]" />
                    <span>摄像头智能检测脸型</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-[var(--muted-foreground)]">或手动选择脸型发质</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Face shape selection */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ScanFace className="w-5 h-5 text-[var(--neon-cyan)]" />
                    <h3 className="text-base font-semibold text-white">选择你的脸型</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {demoFaces.map((face) => (
                      <button
                        key={face.id}
                        onClick={() => setFaceShape(face.id)}
                        className={`p-4 rounded-xl text-center transition-all duration-300 ${
                          faceShape === face.id
                            ? "bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-cyan)]/20 border border-[var(--neon-purple)]/40 scale-105"
                            : "bg-white/5 border border-transparent hover:bg-white/10"
                        }`}
                      >
                        {/* Face shape icon */}
                        <svg viewBox="0 0 40 40" className="w-10 h-10 mx-auto mb-2">
                          <defs>
                            <linearGradient id={`face-${face.id}`} x1="0" y1="0" x2="1" y2="1">
                              <stop
                                offset="0%"
                                stopColor={
                                  faceShape === face.id
                                    ? "oklch(0.65 0.25 300)"
                                    : "oklch(0.5 0.01 280)"
                                }
                              />
                              <stop
                                offset="100%"
                                stopColor={
                                  faceShape === face.id
                                    ? "oklch(0.70 0.18 200)"
                                    : "oklch(0.4 0.01 280)"
                                }
                              />
                            </linearGradient>
                          </defs>
                          {face.id === "round" && <circle cx="20" cy="20" r="13" fill={`url(#face-${face.id})`} />}
                          {face.id === "square" && <rect x="8" y="8" width="24" height="24" rx="3" fill={`url(#face-${face.id})`} />}
                          {face.id === "long" && <ellipse cx="20" cy="20" rx="9" ry="14" fill={`url(#face-${face.id})`} />}
                          {face.id === "diamond" && <polygon points="20,7 30,20 20,33 10,20" fill={`url(#face-${face.id})`} />}
                          {face.id === "oval" && <ellipse cx="20" cy="20" rx="11" ry="15" fill={`url(#face-${face.id})`} />}
                        </svg>
                        <div className={`text-sm font-medium ${faceShape === face.id ? "text-white" : "text-[var(--muted-foreground)]"}`}>
                          {face.label}
                        </div>
                        <div className="text-[10px] text-[var(--muted-foreground)] mt-1 line-clamp-2">
                          {face.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair type selection */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal className="w-5 h-5 text-[var(--neon-purple)]" />
                    <h3 className="text-base font-semibold text-white">选择你的发质</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {demoHairTypes.map((hair) => (
                      <button
                        key={hair.id}
                        onClick={() => setHairType(hair.id)}
                        className={`p-4 rounded-xl text-left transition-all duration-300 ${
                          hairType === hair.id
                            ? "bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-cyan)]/20 border border-[var(--neon-purple)]/40 scale-105"
                            : "bg-white/5 border border-transparent hover:bg-white/10"
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${hairType === hair.id ? "text-white" : "text-[var(--muted-foreground)]"}`}>
                          {hair.label}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {hair.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Analyze button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleAnalyze}
                    disabled={!faceShape || !hairType || analyzing}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium transition-all duration-300 ${
                      faceShape && hairType && !analyzing
                        ? "neon-button bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white hover:shadow-[0_0_30px_oklch(0.65_0.25_300/0.4)]"
                        : "bg-white/5 text-[var(--muted-foreground)] cursor-not-allowed"
                    }`}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI 分析中...</span>
                      </>
                    ) : (
                      <>
                        <ScanFace className="w-4 h-4" />
                        <span>开始 AI 分析</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: AI Recommendation results */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Analysis summary */}
                <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-[var(--muted-foreground)] mb-0.5">AI 分析完成</div>
                    <div className="text-base text-white">
                      {demoFaces.find(f => f.id === faceShape)?.label} ·{" "}
                      {demoHairTypes.find(h => h.id === hairType)?.label}
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    重新选择
                  </button>
                </div>

                {/* TOP3 Recommendations */}
                <div className="grid md:grid-cols-3 gap-4">
                  {recs.map((rec, i) => (
                    <motion.div
                      key={rec.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.5 }}
                      className={`glass-card rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                        i === 0
                          ? "border border-[var(--neon-purple)]/30 glow-purple hover:scale-[1.02]"
                          : "hover:scale-[1.02]"
                      }`}
                      onClick={() => setStep(3)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            i === 0
                              ? "bg-yellow-400/20 text-yellow-400"
                              : i === 1
                              ? "bg-gray-300/20 text-gray-300"
                              : "bg-orange-400/20 text-orange-400"
                          }`}
                        >
                          TOP{i + 1}
                        </div>
                        <div className="text-2xl font-bold text-gradient">{rec.score}</div>
                      </div>
                      <h4 className="text-base font-semibold text-white mb-2">{rec.name}</h4>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">
                        {rec.reason}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-[var(--muted-foreground)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Continue button */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => setShowAR(true)}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white font-medium hover:shadow-[0_0_30px_oklch(0.65_0.25_300/0.4)] transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>开启真实 AR 试戴</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">AI</span>
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
                  >
                    或查看模拟预览 →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: AR Try-on */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* AR preview */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Glasses className="w-5 h-5 text-[var(--neon-cyan)]" />
                      <span className="text-sm font-medium text-white">AR 虚拟试戴</span>
                    </div>
                      <span className="text-xs text-[var(--neon-cyan)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                      拍照上传试戴
                      </span>
                  </div>

                  <DemoTryOn initialWigName={recs[0]?.name} />
                </div>

                {/* Params + Actions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <SlidersHorizontal className="w-4 h-4 text-[var(--neon-purple)]" />
                      <span className="text-sm font-medium text-white">参数调节</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "长度", opts: ["耳下", "下巴", "锁骨", "胸口"] },
                        { label: "卷度", opts: ["微卷", "大波浪", "羊毛卷"] },
                        { label: "发色", opts: ["黑茶", "冷灰", "茶棕", "栗棕"] },
                      ].map((p) => (
                        <div key={p.label}>
                          <div className="text-xs text-[var(--muted-foreground)] mb-1.5">{p.label}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {p.opts.map((opt, oi) => (
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
                  </div>

                  <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Check className="w-4 h-4 text-[var(--success)]" />
                        <span className="text-sm font-medium text-white">体验完成</span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        你已体验完整的 AI 发型设计流程：脸型分析 → 智能推荐 → AR 试戴。
                        实际系统中还会生成理发师施工参数与居家护理教程。
                      </p>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={reset}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl glass-card glass-card-hover text-white text-sm font-medium"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        再试一次
                      </button>
                      <button
                        onClick={() => document.querySelector("#business")?.scrollIntoView({ behavior: "smooth" })}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white text-sm font-medium hover:shadow-[0_0_20px_oklch(0.65_0.25_300/0.3)] transition-shadow"
                      >
                        了解商业模式
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Camera scan modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraScan
            onDetected={handleCameraDetected}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      {/* AR try-on modal */}
      <AnimatePresence>
        {showAR && <ARTryOn onClose={() => setShowAR(false)} />}
      </AnimatePresence>
    </section>
  );
}
