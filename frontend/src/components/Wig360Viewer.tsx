import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, ZoomIn, Eye, Hand, Maximize2 } from "lucide-react";

interface Wig360ViewerProps {
  wigId: string;
  wigName: string;
  wigIcon: string;
}

/**
 * 图片式 360° 预览器
 *
 * 两种模式：
 * 1. 多帧模式（frames/ 目录存在 ≥2 张图）：纯帧切换，拖拽切换不同角度照片
 *    类似电商商品 360° 展示，体验流畅自然
 * 2. 单图模式：CSS 3D 透视变换模拟旋转
 */
export default function Wig360Viewer({ wigId, wigName, wigIcon }: Wig360ViewerProps) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 多角度帧
  const [frames, setFrames] = useState<string[]>([]);
  const [frameLabels, setFrameLabels] = useState<string[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const isMultiFrame = frames.length >= 2;

  const dragStartRef = useRef({ x: 0, frameIdx: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 8 方向定义（顺时针）
  const ANGLE_DEFS = [
    { name: "front",       label: "正面",       angle: 0 },
    { name: "right-front",  label: "右前 45°",   angle: 45 },
    { name: "right",        label: "右侧 90°",   angle: 90 },
    { name: "right-back",   label: "右后 135°",  angle: 135 },
    { name: "back",         label: "背面 180°",  angle: 180 },
    { name: "left-back",    label: "左后 225°",  angle: 225 },
    { name: "left",         label: "左侧 270°",  angle: 270 },
    { name: "left-front",   label: "左前 315°",  angle: 315 },
  ];

  // 检测多角度帧
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setCurrentFrameIdx(0);
    setRotation(0);
    setScale(1);
    setShowHint(true);

    const checkFrame = (url: string) =>
      new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null);
        img.src = url;
      });

    (async () => {
      const results = await Promise.all(
        ANGLE_DEFS.map((def) => checkFrame(`/wigs/${wigId}/frames/${def.name}.png`))
      );

      const found: string[] = [];
      const labels: string[] = [];
      results.forEach((url, i) => {
        if (url) {
          found.push(url);
          labels.push(ANGLE_DEFS[i].label);
        }
      });

      if (found.length >= 2) {
        setFrames(found);
        setFrameLabels(labels);
      } else {
        setFrames([]);
        setFrameLabels([]);
      }
    })();
  }, [wigId]);

  // ===== 多帧模式：拖拽切换帧 =====
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setShowHint(false);
    dragStartRef.current = {
      x: e.clientX,
      frameIdx: currentFrameIdx,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [currentFrameIdx]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !isMultiFrame) return;

    const dx = e.clientX - dragStartRef.current.x;
    const containerWidth = containerRef.current?.clientWidth || 400;
    // 拖拽一个容器宽度 = 旋转一圈（所有帧）
    const frameStep = containerWidth / frames.length;
    const stepCount = Math.round(dx / frameStep);

    // 从起始帧开始计算
    let newIdx = dragStartRef.current.frameIdx + stepCount;
    // 循环
    newIdx = ((newIdx % frames.length) + frames.length) % frames.length;
    setCurrentFrameIdx(newIdx);
  }, [isDragging, isMultiFrame, frames]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }, []);

  // ===== 单图模式：CSS 3D 旋转 =====
  const dragStart3DRef = useRef({ x: 0, y: 0, rotation: 0, tilt: 0 });
  const [tilt, setTilt] = useState(-5);

  const handlePointerDown3D = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setShowHint(false);
    dragStart3DRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotation: rotation,
      tilt: tilt,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [rotation, tilt]);

  const handlePointerMove3D = useCallback((e: React.PointerEvent) => {
    if (!isDragging || isMultiFrame) return;
    const dx = e.clientX - dragStart3DRef.current.x;
    const dy = e.clientY - dragStart3DRef.current.y;
    setRotation(dragStart3DRef.current.rotation + dx * 0.5);
    setTilt(Math.max(-30, Math.min(30, dragStart3DRef.current.tilt + dy * 0.3)));
  }, [isDragging, isMultiFrame]);

  const handlePointerUp3D = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }, []);

  // 双击重置
  const handleDoubleClick = useCallback(() => {
    setCurrentFrameIdx(0);
    setRotation(0);
    setTilt(-5);
    setScale(1);
    setShowHint(true);
  }, []);

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    setScale((prev) => {
      const next = prev + (e.deltaY > 0 ? -0.15 : 0.15);
      return Math.max(0.5, Math.min(3, next));
    });
  }, []);

  // 自动旋转（初始展示，3 秒后停止）
  useEffect(() => {
    if (!showHint || isDragging) return;
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, [showHint, isDragging]);

  useEffect(() => {
    if (!showHint || isDragging) return;
    if (isMultiFrame) {
      // 多帧模式：自动循环帧
      const interval = setInterval(() => {
        setCurrentFrameIdx((prev) => (prev + 1) % frames.length);
      }, 800);
      return () => clearInterval(interval);
    } else {
      // 单图模式：缓慢旋转
      let raf: number;
      const animate = () => {
        setRotation((prev) => prev + 0.3);
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
    }
  }, [showHint, isDragging, isMultiFrame, frames]);

  // 当前显示的图片
  const imageUrl = isMultiFrame
    ? frames[currentFrameIdx]
    : `/wigs/${wigId}.png`;

  // 角度标签
  const angleLabel = isMultiFrame
    ? (frameLabels[currentFrameIdx] || "正面")
    : (() => {
        const n = ((rotation % 360) + 360) % 360;
        if (n < 22.5 || n > 337.5) return "正面";
        if (n < 67.5) return "右前";
        if (n < 112.5) return "右侧";
        if (n < 157.5) return "右后";
        if (n < 202.5) return "背面";
        if (n < 247.5) return "左后";
        if (n < 292.5) return "左侧";
        return "左前";
      })();

  // 重置图片加载状态
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  return (
    <div
      className="relative w-full h-full bg-gradient-to-b from-[oklch(0.15_0.01_280)] to-[oklch(0.08_0.005_280)] overflow-hidden select-none"
      onWheel={handleWheel}
    >
      {/* 网格背景 */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      {/* 光晕 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[var(--neon-purple)]/8 blur-3xl pointer-events-none" />

      {/* 预览舞台 */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={isMultiFrame ? {} : { perspective: "1200px" }}
        onPointerDown={isMultiFrame ? handlePointerDown : handlePointerDown3D}
        onPointerMove={isMultiFrame ? handlePointerMove : handlePointerMove3D}
        onPointerUp={isMultiFrame ? handlePointerUp : handlePointerUp3D}
        onPointerCancel={isMultiFrame ? handlePointerUp : handlePointerUp3D}
        onDoubleClick={handleDoubleClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isMultiFrame ? `${wigId}-frame-${currentFrameIdx}` : wigId}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative"
            style={
              isMultiFrame
                ? { transform: `scale(${scale})` }
                : {
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${rotation}deg) rotateX(${tilt}deg) scale(${scale})`,
                    transition: isDragging ? "none" : "transform 0.1s ease-out",
                  }
            }
          >
            {!imageError ? (
              <img
                src={imageUrl}
                alt={`${wigName} ${angleLabel}`}
                draggable={false}
                className="max-h-[85%] max-w-[90%] object-contain"
                style={{
                  filter: "drop-shadow(0 15px 40px rgba(0,0,0,0.5))",
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-16">
                <div className="text-6xl opacity-50">{wigIcon}</div>
                <p className="text-sm text-[var(--muted-foreground)]">{wigName}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 加载中 */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <RotateCw className="w-8 h-8 text-[var(--neon-cyan)] animate-spin" />
          </div>
        )}
      </div>

      {/* 顶部标题 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur pointer-events-none flex items-center gap-2">
        <span className="text-base">{wigIcon}</span>
        <span className="text-sm text-white font-medium">{wigName}</span>
        <span className="text-xs text-[var(--neon-cyan)] ml-1">360° 预览</span>
      </div>

      {/* 角度指示器 */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 backdrop-blur pointer-events-none">
        <span className="text-xs text-[var(--neon-cyan)] font-medium">
          {angleLabel}
        </span>
      </div>

      {/* 拖拽提示（初始 4 秒） */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur flex items-center gap-2 pointer-events-none"
          >
            <motion.div
              animate={{ x: [-8, 8, -8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Hand className="w-4 h-4 text-[var(--neon-cyan)]" />
            </motion.div>
            <span className="text-xs text-white">左右拖拽查看 360°</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部操作提示 */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 pointer-events-none">
        <div className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur flex items-center gap-1.5">
          <Hand className="w-3 h-3 text-[var(--neon-cyan)]" />
          <span className="text-[10px] text-white">拖拽旋转</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur flex items-center gap-1.5">
          <ZoomIn className="w-3 h-3 text-[var(--neon-purple)]" />
          <span className="text-[10px] text-white">滚轮缩放</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur flex items-center gap-1.5">
          <Maximize2 className="w-3 h-3 text-[var(--muted-foreground)]" />
          <span className="text-[10px] text-white">双击重置</span>
        </div>
      </div>

      {/* 缩放指示器 */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur flex items-center gap-1.5 pointer-events-none">
        <Eye className="w-3 h-3 text-[var(--muted-foreground)]" />
        <span className="text-[10px] text-white font-mono">{Math.round(scale * 100)}%</span>
      </div>

      {/* 多角度帧进度指示器 */}
      {isMultiFrame && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
          {frames.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-200 ${
                i === currentFrameIdx
                  ? "w-5 bg-[var(--neon-cyan)]"
                  : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
