import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, X, ScanFace, Loader2, Check, AlertCircle } from "lucide-react";

interface CameraScanProps {
  onDetected: (faceShape: string, hairType: string) => void;
  onClose: () => void;
}

// 模拟 AI 识别结果 — 随机匹配一个脸型+发质组合
const mockResults = [
  { face: "oval", hair: "normal" },
  { face: "round", hair: "fine" },
  { face: "long", hair: "coarse" },
  { face: "square", hair: "normal" },
  { face: "diamond", hair: "fine" },
];

export default function CameraScan({ onDetected, onClose }: CameraScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "analyzing" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);

  // 启动摄像头
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("scanning");
    } catch (err) {
      const e = err as DOMError;
      if (e.name === "NotAllowedError") {
        setErrorMsg("摄像头权限被拒绝，请在浏览器设置中允许访问摄像头");
      } else if (e.name === "NotFoundError") {
        setErrorMsg("未检测到摄像头设备，请使用手动选择");
      } else {
        setErrorMsg("摄像头启动失败，请使用手动选择");
      }
      setStatus("error");
    }
  }, []);

  // 清理摄像头流
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // 组件挂载时启动摄像头
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // 扫描进度动画 — 模拟 AI 识别过程
  useEffect(() => {
    if (status !== "scanning") return;
    const startTime = Date.now();
    const duration = 3000; // 3 秒扫描

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setStatus("analyzing");
        // 模拟 AI 分析延迟
        setTimeout(() => {
          const result = mockResults[Math.floor(Math.random() * mockResults.length)];
          setStatus("done");
          // 1.5 秒后回调
          setTimeout(() => {
            stopCamera();
            onDetected(result.face, result.hair);
          }, 1500);
        }, 800);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [status, onDetected, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md mx-4 glass-card rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[var(--neon-cyan)]" />
            <span className="text-sm font-medium text-white">AI 智能检测</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Camera viewport */}
        <div className="relative aspect-[3/4] bg-black overflow-hidden">
          {/* Video stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />

          {/* Scan overlay — 仅在扫描中显示 */}
          {status === "scanning" && (
            <>
              {/* Face frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-60 border-2 border-[var(--neon-cyan)]/60 rounded-[50%] relative">
                  {/* Corner markers */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[var(--neon-cyan)] rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[var(--neon-cyan)] rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[var(--neon-cyan)] rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[var(--neon-cyan)] rounded-br-lg" />
                </div>
              </div>

              {/* Scan line */}
              <motion.div
                initial={{ top: "15%" }}
                animate={{ top: "85%" }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--neon-cyan)] to-transparent shadow-[0_0_10px_oklch(0.70_0.18_200/0.6)]"
              />

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <ScanFace className="w-4 h-4 text-[var(--neon-cyan)] animate-pulse" />
                  <span className="text-xs text-white">正在识别脸型与发质... {Math.round(progress)}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Analyzing overlay */}
          {status === "analyzing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-[var(--neon-cyan)] animate-spin mb-3" />
              <span className="text-sm text-white">AI 正在分析特征数据...</span>
            </div>
          )}

          {/* Result overlay */}
          {status === "done" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] flex items-center justify-center mb-4 shadow-[0_0_30px_oklch(0.65_0.25_300/0.5)]"
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>
              <span className="text-lg font-bold text-white mb-1">识别完成</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                已自动为你匹配脸型与发质
              </span>
            </motion.div>
          )}

          {/* Error overlay */}
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-400 mb-3" />
              <p className="text-sm text-white mb-2">{errorMsg}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setStatus("loading");
                    startCamera();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white text-sm font-medium"
                >
                  重试
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl glass-card text-white text-sm font-medium"
                >
                  手动选择
                </button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[var(--neon-cyan)] animate-spin mb-2" />
              <span className="text-xs text-[var(--muted-foreground)]">正在启动摄像头...</span>
            </div>
          )}
        </div>

        {/* Footer hint */}
        {status === "scanning" && (
          <div className="p-3 text-center">
            <p className="text-xs text-[var(--muted-foreground)]">
              将面部对准框内，保持光线充足
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// DOM Error type helper
interface DOMError extends Error {
  name: string;
}
