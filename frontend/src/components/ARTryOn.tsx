import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Camera, Shuffle, AlertCircle, Loader2, ScanFace, RotateCw } from "lucide-react";
import {
  calculateHeadPose,
  yawToFrameIndex,
  type HeadPose,
} from "@/utils/headPose";

interface ARTryOnProps {
  onClose: () => void;
}

/**
 * 假发样式列表
 *
 * multiAngle: 是否启用多角度序列帧模式
 * - true: 加载 {id}-left.png, {id}-front.png, {id}-right.png 三张图
 * - false: 加载单张 {id}.png（兼容旧模式）
 */
const WIG_STYLES = [
  { id: "bangs", name: "空气刘海", icon: "✂️", multiAngle: true },
  { id: "curly", name: "羊毛卷", icon: "🌀", multiAngle: true },
  { id: "bob", name: "波波头", icon: "💇", multiAngle: false },
  { id: "long", name: "长直发", icon: "👩", multiAngle: false },
  { id: "french-bob", name: "法式慵懒波波烫", icon: "🇫🇷", multiAngle: true },
  { id: "wolf-cut", name: "高层次狼尾长发", icon: "🐺", multiAngle: true },
];

// 多角度帧定义（3 帧：左 / 正面 / 右）
const ANGLE_SUFFIXES = ["left", "front", "right"];
const FRAME_COUNT = 3;

export default function ARTryOn({ onClose }: ARTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const landmarksRef = useRef<any[]>([]);

  // 多角度图片缓存：wigImagesRef[currentWig][frameIndex]
  const wigImagesRef = useRef<HTMLImageElement[][]>([]);
  // 单张图片缓存（兼容旧模式）
  const singleWigImgRef = useRef<HTMLImageElement | null>(null);

  const [status, setStatus] = useState<"loading" | "running" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentWig, setCurrentWig] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [headPose, setHeadPose] = useState<HeadPose>({ yaw: 0, pitch: 0, roll: 0 });
  const [currentFrame, setCurrentFrame] = useState(1); // 默认正面

  // 加载假发图片（支持多角度和单张两种模式）
  const loadWigImages = useCallback((wigIndex: number) => {
    const wig = WIG_STYLES[wigIndex];

    if (wig.multiAngle) {
      // 多角度模式：加载 3 张图
      const images: HTMLImageElement[] = [];
      let loadedCount = 0;

      ANGLE_SUFFIXES.forEach((suffix, i) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `/wigs/${wig.id}-${suffix}.png`;
        img.onload = () => {
          images[i] = img;
          loadedCount++;
          if (loadedCount === ANGLE_SUFFIXES.length) {
            wigImagesRef.current[wigIndex] = images;
          }
        };
        img.onerror = () => {
          // 如果多角度图片加载失败，回退到单张模式
          loadedCount++;
          const fallback = new Image();
          fallback.crossOrigin = "anonymous";
          fallback.src = `/wigs/${wig.id}.png`;
          fallback.onload = () => {
            // 三帧都用同一张图
            wigImagesRef.current[wigIndex] = [fallback, fallback, fallback];
          };
          fallback.onerror = () => {
            wigImagesRef.current[wigIndex] = [];
          };
        };
      });
    } else {
      // 单张模式
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `/wigs/${wig.id}.png`;
      img.onload = () => {
        singleWigImgRef.current = img;
      };
      img.onerror = () => {
        singleWigImgRef.current = null;
      };
    }
  }, []);

  // 初始化 MediaPipe Face Mesh
  useEffect(() => {
    let cancelled = false;

    const initFaceMesh = async () => {
      try {
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
          setFaceDetected(landmarksRef.current.length > 0);
        });

        faceMeshRef.current = faceMesh;

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

        // 加载默认假发图片
        loadWigImages(0);
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
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [loadWigImages]);

  // Canvas 渲染循环 — 绘制视频帧 + 多角度假发叠加
  useEffect(() => {
    if (status !== "running") return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 平滑插值：避免帧切换闪烁
    let smoothYaw = 0;
    const SMOOTH_FACTOR = 0.3;
    let lastFrameUpdate = 0;

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

        const lm = landmarksRef.current;
        if (lm.length > 0) {
          // 计算头部姿态
          const pose = calculateHeadPose(lm);

          // 平滑 Yaw 值（指数移动平均）
          smoothYaw = smoothYaw * (1 - SMOOTH_FACTOR) + pose.yaw * SMOOTH_FACTOR;

          // 更新 UI 显示（节流，每 100ms 更新一次）
          const now = Date.now();
          if (now - lastFrameUpdate > 100) {
            lastFrameUpdate = now;
            setHeadPose(pose);

            // 计算当前应显示的帧索引
            const frameIdx = yawToFrameIndex(smoothYaw, FRAME_COUNT);
            setCurrentFrame(frameIdx);
          }

          // 关键点坐标
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
          const topY = top.y * vh - 10;
          const leftX = toCanvasX(leftFace.x);
          const rightX = toCanvasX(rightFace.x);

          // 计算脸宽和脸高
          const faceWidth = Math.abs(rightX - leftX);
          const faceHeight = Math.abs(toCanvasY(chin.y) - topY);

          // 头部旋转角度（Roll — 歪头）
          const eyeDy = toCanvasY(rightEye.y) - toCanvasY(leftEye.y);
          const eyeDx = toCanvasX(rightEye.x) - toCanvasX(leftEye.x);
          const rollAngle = Math.atan2(eyeDy, eyeDx);

          // 假发尺寸和位置
          const wigW = faceWidth * 1.4;
          const wigH = faceHeight * 0.9;
          const wigCx = topX;
          const wigCy = topY - faceHeight * 0.1;

          // 获取当前假发样式
          const wig = WIG_STYLES[currentWig];

          if (wig.multiAngle) {
            // 多角度模式：根据 Yaw 选择对应帧
            const frameIdx = yawToFrameIndex(smoothYaw, FRAME_COUNT);
            const images = wigImagesRef.current[currentWig];

            if (images && images[frameIdx]) {
              ctx.save();
              ctx.translate(wigCx, wigCy);
              ctx.rotate(rollAngle); // 应用 Roll 旋转
              ctx.drawImage(images[frameIdx], -wigW / 2, -wigH / 2, wigW, wigH);
              ctx.restore();
            } else if (images && images[1]) {
              // 帧未加载完，先用正面图
              ctx.save();
              ctx.translate(wigCx, wigCy);
              ctx.rotate(rollAngle);
              ctx.drawImage(images[1], -wigW / 2, -wigH / 2, wigW, wigH);
              ctx.restore();
            }
          } else {
            // 单张模式
            if (singleWigImgRef.current) {
              ctx.save();
              ctx.translate(wigCx, wigCy);
              ctx.rotate(rollAngle);
              ctx.drawImage(singleWigImgRef.current, -wigW / 2, -wigH / 2, wigW, wigH);
              ctx.restore();
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, currentWig]);

  // 切换假发
  const switchWig = (idx: number) => {
    setCurrentWig(idx);
    loadWigImages(idx);
  };

  // 帧方向标签
  const frameLabel = currentFrame === 0 ? "← 左侧" : currentFrame === 1 ? "正面" : "右侧 →";

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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-0"
          />
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

          {/* Head pose indicator */}
          {status === "running" && faceDetected && (
            <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur space-y-1">
              <div className="flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-[var(--neon-cyan)]" />
                <span className="text-[10px] text-white font-mono">
                  Yaw: {Math.round(headPose.yaw)}°
                </span>
              </div>
              <div className="text-[10px] text-[var(--neon-cyan)] font-medium">{frameLabel}</div>
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--neon-cyan)]">{WIG_STYLES[currentWig].name}</span>
                {WIG_STYLES[currentWig].multiAngle && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--neon-purple)]/15 text-[var(--neon-purple)]">
                    多角度
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                  <span className={`text-[10px] text-center ${currentWig === i ? "text-white" : "text-[var(--muted-foreground)]"}`}>
                    {wig.name}
                  </span>
                </button>
              ))}
            </div>

            {/* 提示 */}
            {WIG_STYLES[currentWig].multiAngle && (
              <p className="text-[10px] text-[var(--muted-foreground)] mt-2 text-center">
                转动头部可查看不同角度效果（左 / 正面 / 右）
              </p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
