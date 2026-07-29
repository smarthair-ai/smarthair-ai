import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCw, ZoomIn, Eye, Sparkles } from "lucide-react";

interface Wig360ViewerProps {
  wigId: string;
  wigName: string;
  wigIcon: string;
}

/**
 * 图片式 360° 预览器
 *
 * 使用真实假发 PNG 图片 + CSS 3D 变换，实现拖拽旋转预览。
 * 支持水平旋转（模拟查看不同角度）和缩放。
 *
 * 当有多角度帧图片时（frames/ 目录），切换为真正的多帧 360° 旋转。
 * 否则使用单张图片 + 3D 透视变换模拟旋转效果。
 */
export default function Wig360Viewer({ wigId, wigName, wigIcon }: Wig360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);     // Y 轴旋转角度
  const [tilt, setTilt] = useState(-5);            // X 轴倾斜
  const [scale, setScale] = useState(1);           // 缩放
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 多角度帧支持（如果存在 frames/ 目录）
  const [frames, setFrames] = useState<string[]>([]);
  const [frameAngles, setFrameAngles] = useState<number[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);

  const dragStartRef = useRef({ x: 0, y: 0, rotation: 0, tilt: 0 });
  const lastDragTimeRef = useRef(0);
  const velocityRef = useRef(0); // 拖拽释放后的惯性速度

  // 8 方向多角度帧定义（角度按顺时针排列）
  const ANGLE_DEFS = [
    { name: "front", label: "正面", angle: 0 },
    { name: "right-front", label: "右前", angle: 45 },
    { name: "right", label: "右侧", angle: 90 },
    { name: "right-back", label: "右后", angle: 135 },
    { name: "back", label: "背面", angle: 180 },
    { name: "left-back", label: "左后", angle: 225 },
    { name: "left", label: "左侧", angle: 270 },
    { name: "left-front", label: "左前", angle: 315 },
  ];

  // 检测是否存在多角度帧图片
  // 按 8 方向顺序收集，缺失的用 null 占位，保持角度对应关系
  useEffect(() => {
    const checkFrame = (url: string) =>
      new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null);
        img.src = url;
      });

    const checkNamedFrames = async () => {
      const results = await Promise.all(
        ANGLE_DEFS.map((def) => checkFrame(`/wigs/${wigId}/frames/${def.name}.png`))
      );
      return results; // 保持 8 长度，缺失为 null
    };

    const checkLegacyFrames = async () => {
      const results = await Promise.all(
        [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
          checkFrame(`/wigs/${wigId}/frames/frame-${i}.png`)
        )
      );
      return results;
    };

    (async () => {
      const named = await checkNamedFrames();
      const hasNamed = named.some((f) => f !== null);
      const slots = hasNamed ? named : await checkLegacyFrames();

      // 仅保留存在的帧，但记录其原始角度索引
      const found = slots
        .map((url, idx) => ({ url, idx }))
        .filter((item): item is { url: string; idx: number } => item.url !== null);

      if (found.length >= 2) {
        setFrames(found.map((f) => f.url));
        setFrameAngles(found.map((f) => ANGLE_DEFS[f.idx]?.angle ?? f.idx * 45));
      }
      // 否则使用单图模式
    })();
  }, [wigId]);

  // 拖拽处理
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setShowHint(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotation: rotation,
      tilt: tilt,
    };
    velocityRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [rotation, tilt]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // 水平拖拽 → Y 轴旋转（每像素约 0.5 度）
    const newRotation = dragStartRef.current.rotation + dx * 0.5;
    setRotation(newRotation);

    // 垂直拖拽 → X 轴倾斜（限制范围）
    const newTilt = Math.max(-30, Math.min(30, dragStartRef.current.tilt + dy * 0.3));
    setTilt(newTilt);

    // 计算速度（用于惯性）
    const now = Date.now();
    const dt = now - lastDragTimeRef.current;
    if (dt > 0) {
      velocityRef.current = (dx * 0.5) / dt * 16; // 每帧位移
    }
    lastDragTimeRef.current = now;

    // 如果有多角度帧，根据旋转角度切换帧
    if (frames.length > 0 && frameAngles.length > 0) {
      const normalized = ((newRotation % 360) + 360) % 360; // 0~360
      // 找到离当前角度最近的存在帧
      let minDiff = Infinity;
      let bestIdx = 0;
      for (let i = 0; i < frameAngles.length; i++) {
        // 镜像对称：180° 之后的区域映射回已有帧
        let targetAngle = frameAngles[i];
        if (normalized > 180) {
          targetAngle = 360 - targetAngle;
        }
        const diff = Math.abs(normalized - targetAngle);
        if (diff < minDiff) {
          minDiff = diff;
          bestIdx = i;
        }
      }
      setCurrentFrameIdx(bestIdx);
    }
  }, [isDragging, frames]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // 惯性滑动
    if (Math.abs(velocityRef.current) > 0.5) {
      const animate = () => {
        setRotation((prev) => {
          const next = prev + velocityRef.current;
          velocityRef.current *= 0.95; // 阻尼衰减
          if (Math.abs(velocityRef.current) > 0.1) {
            requestAnimationFrame(animate);
          }
          return next;
        });
      };
      requestAnimationFrame(animate);
    }
  }, []);

  // 双击重置
  const handleDoubleClick = useCallback(() => {
    setRotation(0);
    setTilt(-5);
    setScale(1);
    setShowHint(true);
  }, []);

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => {
      const next = prev + (e.deltaY > 0 ? -0.1 : 0.1);
      return Math.max(0.5, Math.min(2.5, next));
    });
  }, []);

  // 自动旋转动画（初始展示）
  useEffect(() => {
    if (!showHint || isDragging) return;
    let raf: number;
    const animate = () => {
      setRotation((prev) => prev + 0.3);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [showHint, isDragging]);

  const imageUrl = frames.length > 0
    ? frames[currentFrameIdx]
    : `/wigs/${wigId}.png`;

  // 角度指示器（基于旋转角度计算）
  const angleLabel = (() => {
    const normalized = ((rotation % 360) + 360) % 360;
    if (frames.length > 0 && frameAngles.length > 0) {
      const displayAngle = normalized <= 180 ? normalized : 360 - normalized;
      const side = normalized <= 180 ? "右" : "左";
      const def = ANGLE_DEFS.find((d) => d.angle === frameAngles[currentFrameIdx]);
      if (def) {
        const label = def.label.replace("右", side).replace("左", side);
        return `${label} · ${Math.round(displayAngle)}°`;
      }
      return `${Math.round(displayAngle)}°`;
    }
    if (normalized < 22.5 || normalized > 337.5) return "正面";
    if (normalized < 67.5) return "右前";
    if (normalized < 112.5) return "右侧";
    if (normalized < 157.5) return "右后";
    if (normalized < 202.5) return "背面";
    if (normalized < 247.5) return "左后";
    if (normalized < 292.5) return "左侧";
    return "左前";
  })();

  return (
    <div
      className="relative w-full h-full bg-gradient-to-b from-[oklch(0.18_0.01_280)] to-[oklch(0.12_0.005_280)] overflow-hidden"
      onWheel={handleWheel}
    >
      {/* 网格背景 */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      {/* 光晕效果 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[var(--neon-purple)]/10 blur-3xl pointer-events-none" />

      {/* 3D 旋转舞台 */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: "1000px" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* 图片容器（3D 变换） */}
        <motion.div
          key={frames.length > 0 ? `${wigId}-frame-${currentFrameIdx}` : wigId}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg) rotateX(${tilt}deg) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          {!imageError ? (
            <img
              src={imageUrl}
              alt={`${wigName} 预览`}
              draggable={false}
              className="max-h-[70%] max-w-[80%] object-contain rounded-2xl shadow-2xl"
              style={{
                filter: "drop-shadow(0 10px 30px rgba(139,92,246,0.3))",
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-12">
              <div className="text-6xl">{wigIcon}</div>
              <p className="text-sm text-[var(--muted-foreground)] text-center">
                {wigName}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]/60">
                图片资源加载中...
              </p>
            </div>
          )}

          {/* 加载中 */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RotateCw className="w-8 h-8 text-[var(--neon-cyan)] animate-spin" />
            </div>
          )}
        </motion.div>
      </div>

      {/* 顶部标题 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur pointer-events-none flex items-center gap-2">
        <span className="text-base">{wigIcon}</span>
        <span className="text-sm text-white font-medium">{wigName}</span>
        <span className="text-xs text-[var(--neon-cyan)] ml-1">360° 预览</span>
      </div>

      {/* 角度指示器 */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 backdrop-blur pointer-events-none">
        <span className="text-xs text-[var(--neon-cyan)] font-mono">
          {angleLabel} · {Math.round(((rotation % 360) + 360) % 360)}°
        </span>
      </div>

      {/* 拖拽提示 */}
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur flex items-center gap-2 pointer-events-none"
        >
          <motion.div
            animate={{ x: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-4 h-4 text-[var(--neon-cyan)]" />
          </motion.div>
          <span className="text-xs text-white">拖拽旋转 · 滚轮缩放 · 双击重置</span>
        </motion.div>
      )}

      {/* 底部操作提示 */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 pointer-events-none">
        <div className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur flex items-center gap-1.5">
          <RotateCw className="w-3 h-3 text-[var(--neon-cyan)]" />
          <span className="text-[10px] text-white">拖拽旋转</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur flex items-center gap-1.5">
          <ZoomIn className="w-3 h-3 text-[var(--neon-purple)]" />
          <span className="text-[10px] text-white">滚轮缩放</span>
        </div>
      </div>

      {/* 缩放指示器 */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur flex items-center gap-1.5 pointer-events-none">
        <Eye className="w-3 h-3 text-[var(--muted-foreground)]" />
        <span className="text-[10px] text-white font-mono">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* 多角度帧指示器 */}
      {frames.length > 0 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
          {frames.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentFrameIdx
                  ? "bg-[var(--neon-cyan)] w-4"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
