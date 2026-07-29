import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Camera, Shuffle, AlertCircle, Loader2, ScanFace } from "lucide-react";

interface ARTryOnProps {
  onClose: () => void;
}

// 假发样式列表 — 对应 public/wigs/ 目录下的 PNG 图片
const WIG_STYLES = [
  { id: "bangs", name: "空气刘海", icon: "✂️" },
  { id: "curly", name: "羊毛卷", icon: "🌀" },
  { id: "bob", name: "波波头", icon: "💇" },
  { id: "long", name: "长直发", icon: "👩" },
  { id: "french-bob", name: "法式慵懒波波烫", icon: "🇫🇷" },
  { id: "wolf-cut", name: "高层次狼尾长发", icon: "🐺" },
];

export default function ARTryOn({ onClose }: ARTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const wigImgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number>(0);
  const landmarksRef = useRef<any[]>([]);

  const [status, setStatus] = useState<"loading" | "running" | "error" | "noface">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentWig, setCurrentWig] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);

  // 加载假发图片
  const loadWigImage = useCallback((wigId: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `/wigs/${wigId}.png`;
    img.onload = () => {
      wigImgRef.current = img;
    };
    img.onerror = () => {
      // 如果图片加载失败，使用 Canvas 绘制替代假发
      wigImgRef.current = null;
    };
  }, []);

  // 用 Canvas 绘制程序化假发（无需外部图片）
  const drawProceduralWig = useCallback((ctx: CanvasRenderingContext2D, wigId: string, cx: number, cy: number, w: number, h: number, angle: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.3);
    grad.addColorStop(0, "oklch(0.35 0.05 30)");
    grad.addColorStop(0.5, "oklch(0.25 0.03 30)");
    grad.addColorStop(1, "oklch(0.20 0.02 30)");

    ctx.fillStyle = grad;

    if (wigId === "bangs") {
      // 空气刘海 — 顶部弧形 + 两侧碎发
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.5, h * 0.35, 0, Math.PI, 0);
      ctx.fill();
      // 刘海缝隙
      ctx.strokeStyle = "oklch(0.15 0.02 30)";
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * w * 0.12, -h * 0.2);
        ctx.lineTo(i * w * 0.1, h * 0.1);
        ctx.stroke();
      }
      // 两侧碎发
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(-w * 0.45, h * 0.1, w * 0.15, h * 0.4, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.45, h * 0.1, w * 0.15, h * 0.4, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (wigId === "curly") {
      // 羊毛卷 — 多个圆形堆叠
      for (let i = -3; i <= 3; i++) {
        for (let j = -1; j <= 2; j++) {
          const x = i * w * 0.13 + (j % 2) * w * 0.06;
          const y = -j * h * 0.15;
          const r = w * 0.09;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // 两侧
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-w * 0.4 - i * 3, h * 0.05 + i * h * 0.1, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w * 0.4 + i * 3, h * 0.05 + i * h * 0.1, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (wigId === "bob") {
      // 波波头 — 圆顶 + 两侧齐长
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.55, h * 0.4, 0, Math.PI, 0);
      ctx.fill();
      // 两侧齐发
      ctx.fillRect(-w * 0.5, 0, w * 0.15, h * 0.6);
      ctx.fillRect(w * 0.35, 0, w * 0.15, h * 0.6);
      // 发尾弧线
      ctx.beginPath();
      ctx.ellipse(-w * 0.42, h * 0.6, w * 0.1, h * 0.05, 0, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.42, h * 0.6, w * 0.1, h * 0.05, 0, 0, Math.PI);
      ctx.fill();
    } else if (wigId === "long") {
      // 长直发 — 顶部弧形 + 两侧长发
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.5, h * 0.35, 0, Math.PI, 0);
      ctx.fill();
      // 两侧长发
      ctx.beginPath();
      ctx.moveTo(-w * 0.5, 0);
      ctx.quadraticCurveTo(-w * 0.6, h * 0.5, -w * 0.45, h * 0.9);
      ctx.lineTo(-w * 0.3, h * 0.9);
      ctx.quadraticCurveTo(-w * 0.35, h * 0.5, -w * 0.3, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.5, 0);
      ctx.quadraticCurveTo(w * 0.6, h * 0.5, w * 0.45, h * 0.9);
      ctx.lineTo(w * 0.3, h * 0.9);
      ctx.quadraticCurveTo(w * 0.35, h * 0.5, w * 0.3, 0);
      ctx.fill();
      // 高光
      ctx.strokeStyle = "oklch(0.4 0.05 30)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-w * 0.2, -h * 0.2);
      ctx.lineTo(-w * 0.25, h * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.2, -h * 0.2);
      ctx.lineTo(w * 0.25, h * 0.7);
      ctx.stroke();
    } else if (wigId === "french-bob") {
      // 法式慵懒波波烫（程序化备用）
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.52, h * 0.38, 0, Math.PI, 0);
      ctx.fill();
      // 两侧慵懒大C波纹
      for (let side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * w * 0.5, -h * 0.05);
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          const x = side * (w * 0.5 + Math.sin(t * Math.PI * 2) * w * 0.08);
          const y = -h * 0.05 + t * h * 0.75;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(side * w * 0.35, h * 0.7);
        ctx.quadraticCurveTo(side * w * 0.42, h * 0.35, side * w * 0.35, -h * 0.05);
        ctx.fill();
      }
      // 刘海
      ctx.beginPath();
      ctx.ellipse(0, h * 0.02, w * 0.35, h * 0.12, 0, 0, Math.PI);
      ctx.fill();
      // 纹理线条
      ctx.strokeStyle = "oklch(0.45 0.05 30)";
      ctx.lineWidth = 1.5;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * w * 0.1, -h * 0.15);
        ctx.quadraticCurveTo(
          i * w * 0.12 + Math.sin(i) * w * 0.03,
          h * 0.15,
          i * w * 0.1,
          h * 0.45
        );
        ctx.stroke();
      }
    } else if (wigId === "wolf-cut") {
      // 高层次狼尾长发（程序化备用）
      // 顶部蓬松区
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.05, w * 0.5, h * 0.35, 0, Math.PI, 0);
      ctx.fill();
      // 轻薄齐刘海
      ctx.beginPath();
      ctx.ellipse(0, h * 0.05, w * 0.35, h * 0.1, 0, 0, Math.PI);
      ctx.fill();
      // 两侧高层次长发 + 狼尾碎发
      for (const side of [-1, 1]) {
        const baseX = side * w * 0.35;
        // 主长发
        ctx.beginPath();
        ctx.moveTo(baseX, -h * 0.05);
        ctx.quadraticCurveTo(side * w * 0.55, h * 0.25, side * w * 0.45, h * 0.55);
        ctx.quadraticCurveTo(side * w * 0.35, h * 0.75, side * w * 0.5, h * 0.9);
        ctx.lineTo(side * w * 0.25, h * 0.9);
        ctx.quadraticCurveTo(side * w * 0.28, h * 0.6, side * w * 0.25, h * 0.3);
        ctx.quadraticCurveTo(side * w * 0.22, h * 0.1, baseX, -h * 0.05);
        ctx.fill();
        // 狼尾碎须
        ctx.strokeStyle = "oklch(0.35 0.03 30)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(baseX + side * i * w * 0.04, h * 0.15 + i * h * 0.08);
          ctx.quadraticCurveTo(
            baseX + side * (w * 0.1 + i * w * 0.03),
            h * 0.35 + i * h * 0.08,
            baseX + side * (w * 0.05 + i * w * 0.02),
            h * 0.55 + i * h * 0.06
          );
          ctx.stroke();
        }
      }
      // 高光
      ctx.strokeStyle = "oklch(0.45 0.05 30)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-w * 0.15, -h * 0.15);
      ctx.lineTo(-w * 0.22, h * 0.65);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.15, -h * 0.15);
      ctx.lineTo(w * 0.22, h * 0.65);
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  // 初始化 MediaPipe Face Mesh
  useEffect(() => {
    let cancelled = false;

    const initFaceMesh = async () => {
      try {
        // 动态导入 MediaPipe（避免 SSR 问题）
        const FaceMesh = (await import("@mediapipe/face_mesh")).FaceMesh;
        const Camera = (await import("@mediapipe/camera_utils")).Camera;

        if (cancelled) return;

        const faceMesh = new FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          landmarksRef.current = results.multiFaceLandmarks?.[0] || [];
          if (landmarksRef.current.length > 0) {
            setFaceDetected(true);
          } else {
            setFaceDetected(false);
          }
        });

        faceMeshRef.current = faceMesh;

        // 启动摄像头
        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (faceMeshRef.current) {
                await faceMeshRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
            facingMode: "user",
          });

          cameraRef.current = camera;
          await camera.start();
          if (!cancelled) setStatus("running");
        }

        // 加载默认假发
        loadWigImage(WIG_STYLES[0].id);
      } catch (err) {
        if (cancelled) return;
        const e = err as Error;
        if (e.message.includes("Permission") || e.message.includes("denied")) {
          setErrorMsg("摄像头权限被拒绝，请在浏览器设置中允许访问");
        } else {
          setErrorMsg("摄像头启动失败，请检查设备或权限设置");
        }
        setStatus("error");
      }
    };

    initFaceMesh();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (cameraRef.current) {
        try { cameraRef.current.stop(); } catch {}
      }
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close(); } catch {}
      }
      // 停止所有视频流
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [loadWigImage]);

  // Canvas 渲染循环 — 绘制视频帧 + 假发叠加
  useEffect(() => {
    if (status !== "running") return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      if (video.readyState >= 2) {
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        canvas.width = vw;
        canvas.height = vh;

        // 镜像绘制视频帧
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -vw, 0, vw, vh);
        ctx.restore();

        // 获取人脸关键点
        const lm = landmarksRef.current;
        if (lm.length > 0) {
          // 关键点索引
          // 10 = 头顶中央, 234 = 左脸侧, 454 = 右脸侧
          // 1 = 鼻尖, 152 = 下巴, 33 = 左眼外角, 263 = 右眼外角
          const top = lm[10];        // 头顶
          const leftFace = lm[234];  // 左脸颊
          const rightFace = lm[454]; // 右脸颊
          const chin = lm[152];      // 下巴
          const leftEye = lm[33];    // 左眼外角
          const rightEye = lm[263];  // 右眼外角

          // 转换为画布坐标（镜像翻转）
          const toCanvasX = (x: number) => (1 - x) * vw;
          const toCanvasY = (y: number) => y * vh;

          const topX = toCanvasX(top.x);
          const topY = topY_raw(top.y, vh);
          const leftX = toCanvasX(leftFace.x);
          const rightX = toCanvasX(rightFace.x);
          const eyeLeftX = toCanvasX(leftEye.x);
          const eyeRightX = toCanvasX(rightEye.x);

          // 计算脸宽（用于缩放假发）
          const faceWidth = Math.abs(rightX - leftX);
          // 计算脸高（头顶到下巴）
          const faceHeight = Math.abs(toCanvasY(chin.y) - topY);

          // 计算头部旋转角度（基于双眼连线）
          const eyeDy = toCanvasY(rightEye.y) - toCanvasY(leftEye.y);
          const eyeDx = eyeRightX - eyeLeftX;
          const angle = Math.atan2(eyeDy, eyeDx);

          // 假发尺寸
          const wigW = faceWidth * 1.4;
          const wigH = faceHeight * 0.9;

          // 假发中心点：头顶上方一点
          const wigCx = topX;
          const wigCy = topY - faceHeight * 0.1;

          // 绘制假发
          const wigId = WIG_STYLES[currentWig].id;
          if (wigImgRef.current) {
            // 使用加载的 PNG 图片
            ctx.save();
            ctx.translate(wigCx, wigCy);
            ctx.rotate(angle);
            ctx.drawImage(wigImgRef.current, -wigW / 2, -wigH / 2, wigW, wigH);
            ctx.restore();
          } else {
            // 使用程序化绘制
            drawProceduralWig(ctx, wigId, wigCx, wigCy, wigW, wigH, angle);
          }

          // 绘制关键点标记（调试用，可注释掉）
          // drawLandmarks(ctx, lm, vw);

          // 绘制扫描框
          if (!faceDetected) {
            // no-op
          }
        }
      }
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, currentWig, faceDetected, drawProceduralWig]);

  // 头顶 Y 坐标修正（向上偏移）
  const topY_raw = (y: number, vh: number) => y * vh - 10;

  // 切换假发
  const switchWig = (idx: number) => {
    setCurrentWig(idx);
    loadWigImage(WIG_STYLES[idx].id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg mx-4 glass-card rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[var(--neon-cyan)]" />
            <span className="text-sm font-medium text-white">AR 虚拟试戴</span>
            {faceDetected && (
              <span className="flex items-center gap-1 text-xs text-[var(--neon-cyan)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                已识别
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Camera + Canvas viewport */}
        <div className="relative aspect-[3/4] bg-black overflow-hidden" ref={containerRef}>
          {/* 隐藏的 video 元素（MediaPipe 需要） */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-0"
          />

          {/* Canvas 显示画面 + 假发叠加 */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Loading state */}
          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-[var(--neon-cyan)] animate-spin mb-3" />
              <span className="text-sm text-[var(--muted-foreground)]">正在加载 AI 模型...</span>
              <span className="text-xs text-[var(--muted-foreground)] mt-1">首次加载约需 5-10 秒</span>
            </div>
          )}

          {/* No face state */}
          {status === "running" && !faceDetected && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur flex items-center gap-2">
              <ScanFace className="w-4 h-4 text-[var(--neon-purple)] animate-pulse" />
              <span className="text-xs text-white">请将面部对准画面中央</span>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-400 mb-3" />
              <p className="text-sm text-white mb-2">{errorMsg}</p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl glass-card text-white text-sm font-medium"
              >
                关闭
              </button>
            </div>
          )}

          {/* Scan line decoration */}
          {status === "running" && faceDetected && (
            <motion.div
              initial={{ top: "10%" }}
              animate={{ top: "90%" }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--neon-cyan)]/50 to-transparent pointer-events-none"
            />
          )}
        </div>

        {/* Wig style selector */}
        {status === "running" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-[var(--neon-purple)]" />
                <span className="text-xs text-[var(--muted-foreground)]">切换发型</span>
              </div>
              <span className="text-xs text-[var(--neon-cyan)]">{WIG_STYLES[currentWig].name}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {WIG_STYLES.map((wig, i) => (
                <button
                  key={wig.id}
                  onClick={() => switchWig(i)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                    currentWig === i
                      ? "bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-cyan)]/20 border border-[var(--neon-purple)]/40"
                      : "bg-white/5 border border-transparent hover:bg-white/10"
                  }`}
                >
                  <span className="text-xl">{wig.icon}</span>
                  <span className={`text-[10px] ${currentWig === i ? "text-white" : "text-[var(--muted-foreground)]"}`}>
                    {wig.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
