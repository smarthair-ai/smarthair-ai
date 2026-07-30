import { useRef, useEffect, useState, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { X, Camera, Shuffle, AlertCircle, Loader2, ScanFace, RotateCw, Box, Upload, Image as ImageIcon, Download, RefreshCw } from "lucide-react";
import {
  calculateWigTransformRaw,
  DEFAULT_ADJUST,
  type WigAdjustParams,
} from "@/utils/wigPosition";

// 懒加载 360° 预览组件
const Wig360Viewer = lazy(() => import("@/components/Wig360Viewer"));

interface ARTryOnProps {
  onClose: () => void;
}

const WIG_STYLES = [
  { id: "bangs", name: "空气刘海", icon: "✂️", multiAngle: true },
  { id: "curly", name: "羊毛卷", icon: "🌀", multiAngle: true },
  { id: "short-layered", name: "层次短发", icon: "✨", multiAngle: true },
  { id: "bob", name: "波波头", icon: "💇", multiAngle: false },
  { id: "long", name: "长直发", icon: "👩", multiAngle: false },
  { id: "french-bob", name: "法式慵懒波波烫", icon: "🇫🇷", multiAngle: true },
  { id: "wolf-cut", name: "高层次狼尾长发", icon: "🐺", multiAngle: true },
];

const ANGLE_SUFFIXES = ["left", "front", "right"];

export default function ARTryOn({ onClose }: ARTryOnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faceMeshRef = useRef<any>(null);

  // 摄像头实时预览
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 用户上传的照片
  const photoRef = useRef<HTMLImageElement | null>(null);
  // 假发图片缓存
  const wigImagesRef = useRef<HTMLImageElement[][]>([]);
  const singleWigImgRef = useRef<HTMLImageElement | null>(null);
  // 检测到的人脸关键点
  const landmarksRef = useRef<any[]>([]);

  const [status, setStatus] = useState<"idle" | "analyzing" | "ready" | "error" | "no-face">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentWig, setCurrentWig] = useState(0);
  const [mode, setMode] = useState<"camera" | "photo" | "3d">("photo");

  // 调试参数
  const [adjust, setAdjust] = useState<WigAdjustParams>(DEFAULT_ADJUST);
  const [showDebug, setShowDebug] = useState(false);
  const adjustRef = useRef(adjust);
  adjustRef.current = adjust;

  // 加载假发图片
  const loadWigImages = useCallback((wigIndex: number) => {
    const wig = WIG_STYLES[wigIndex];

    if (wig.multiAngle) {
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
            renderPhoto();
          }
        };
        img.onerror = () => {
          loadedCount++;
          const fallback = new Image();
          fallback.crossOrigin = "anonymous";
          fallback.src = `/wigs/${wig.id}.png`;
          fallback.onload = () => {
            wigImagesRef.current[wigIndex] = [fallback, fallback, fallback];
            renderPhoto();
          };
          fallback.onerror = () => {
            wigImagesRef.current[wigIndex] = [];
          };
        };
      });
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `/wigs/${wig.id}.png`;
      img.onload = () => {
        singleWigImgRef.current = img;
        renderPhoto();
      };
      img.onerror = () => {
        singleWigImgRef.current = null;
      };
    }
  }, []);

  // ===== 核心渲染：静态照片 + 假发融合 =====
  const renderPhoto = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置画布尺寸为照片尺寸
    const pw = photo.naturalWidth;
    const ph = photo.naturalHeight;
    canvas.width = pw;
    canvas.height = ph;

    // 绘制原始照片
    ctx.drawImage(photo, 0, 0, pw, ph);

    const lm = landmarksRef.current;
    if (lm.length === 0) return;

    // 计算假发变换参数（静态模式不需要平滑器）
    const transform = calculateWigTransformRaw(lm, pw, ph, adjustRef.current, false);
    if (!transform) return;

    // 获取假发图片
    const wig = WIG_STYLES[currentWig];
    let wigImg: HTMLImageElement | null = null;

    if (wig.multiAngle) {
      // 静态照片用正面图（索引 1）
      const images = wigImagesRef.current[currentWig];
      wigImg = images?.[1] || images?.[0] || null;
    } else {
      wigImg = singleWigImgRef.current;
    }

    if (!wigImg) return;

    const w = transform.baseWidth;
    const h = transform.baseHeight;

    // ===== 图像融合：阴影 + 高斯模糊边缘 + 色调匹配 =====

    // 1. 先绘制投影阴影（假发下方的阴影，让它有立体感）
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scaleX, transform.scaleY);

    // 阴影：偏移 + 模糊
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 8;
    ctx.globalAlpha = 0.5;

    // 绘制假发形状作为阴影底（用假发图片的轮廓）
    ctx.drawImage(wigImg, -w / 2, -h / 2, w, h);
    ctx.restore();

    // 2. 绘制假发本体（带边缘模糊）
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scaleX, transform.scaleY);

    // 用 filter 做边缘高斯模糊
    // blur 只影响边缘几像素，让假发边缘和皮肤自然过渡
    ctx.filter = "blur(1.5px)";
    ctx.globalAlpha = 0.95;
    ctx.drawImage(wigImg, -w / 2, -h / 2, w, h);

    // 再绘制一次清晰版本，但用 mask 让中心清晰边缘模糊
    ctx.filter = "none";
    ctx.globalAlpha = 0.9;
    ctx.drawImage(wigImg, -w / 2, -h / 2, w, h);

    ctx.restore();

    // 3. 底部渐变遮罩（让假发底部和额头过渡更自然）
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scaleX, transform.scaleY);

    // 在假发底部画一条渐变，从透明到肤色混合
    const grad = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.5);
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.15)");
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = grad;
    ctx.fillRect(-w / 2, h * 0.2, w, h * 0.3);

    ctx.restore();

  }, [currentWig]);

  // ===== 处理上传/拍照的照片 =====
  const handlePhoto = useCallback(async (file: Blob) => {
    setStatus("analyzing");
    setErrorMsg("");

    // 读取照片为 Image
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      photoRef.current = img;
      URL.revokeObjectURL(url);

      try {
        // 初始化 MediaPipe Face Mesh（如果还没初始化）
        if (!faceMeshRef.current) {
          const FaceMesh = (await import("@mediapipe/face_mesh")).FaceMesh;
          const faceMesh = new FaceMesh({
            locateFile: (file: string) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
          });
          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
          });
          faceMeshRef.current = faceMesh;
        }

        // 对照片运行人脸检测
        faceMeshRef.current.onResults((results: any) => {
          const landmarks = results.multiFaceLandmarks?.[0] || [];

          if (landmarks.length > 0) {
            landmarksRef.current = landmarks;
            setStatus("ready");
            // 加载默认假发并渲染
            loadWigImages(0);
          } else {
            setStatus("no-face");
          }
        });

        await faceMeshRef.current.send({ image: img });
      } catch (err) {
        setErrorMsg("人脸检测失败，请换一张正面照片");
        setStatus("error");
      }
    };
    img.onerror = () => {
      setErrorMsg("图片加载失败");
      setStatus("error");
    };
    img.src = url;
  }, [loadWigImages]);

  // 文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhoto(file);
  };

  // 拍照（调用摄像头拍一张，兼容旧入口）
  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  // ===== 摄像头实时预览 + 拍照试戴 =====
  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch {
      setErrorMsg("无法访问摄像头，请检查权限，或改用“照片试戴”上传图片");
      setStatus("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // 拍一张：把当前视频帧画到离屏画布（镜像，与预览一致）→ 交给现有人脸检测 + 融合管线
  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const vctx = c.getContext("2d");
    if (!vctx) return;
    vctx.translate(c.width, 0);
    vctx.scale(-1, 1); // 镜像，符合自拍习惯
    vctx.drawImage(video, 0, 0, c.width, c.height);
    c.toBlob((blob) => {
      if (blob) handlePhoto(blob);
    }, "image/png");
  }, [handlePhoto]);

  // 切换假发
  const switchWig = (idx: number) => {
    setCurrentWig(idx);
    loadWigImages(idx);
  };

  // 调试参数变化时重新渲染
  useEffect(() => {
    if (status === "ready") {
      renderPhoto();
    }
  }, [adjust, status, renderPhoto]);

  // 进入拍照试戴模式时打开摄像头，离开时关闭
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      if (mode === "camera") stopCamera();
    };
  }, [mode, startCamera, stopCamera]);

  // 下载结果
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `hairstyle-${WIG_STYLES[currentWig].id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // 重置
  const handleReset = () => {
    photoRef.current = null;
    landmarksRef.current = [];
    setStatus("idle");
    setAdjust(DEFAULT_ADJUST);
    if (mode === "camera") startCamera();
  };

  // 清理
  useEffect(() => {
    return () => {
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close(); } catch {}
      }
    };
  }, []);

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
            {mode === "camera" ? (
              <Camera className="w-5 h-5 text-[var(--neon-cyan)]" />
            ) : mode === "photo" ? (
              <ImageIcon className="w-5 h-5 text-[var(--neon-cyan)]" />
            ) : (
              <Box className="w-5 h-5 text-[var(--neon-purple)]" />
            )}
            <span className="text-sm font-medium text-white">
              {mode === "camera" ? "拍照试戴" : mode === "photo" ? "照片试戴" : "360° 预览"}
            </span>
          </div>

          {/* 模式切换 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("camera")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === "camera"
                  ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
                  : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">拍照试戴</span>
            </button>
            <button
              onClick={() => setMode("photo")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === "photo"
                  ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
                  : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">照片试戴</span>
            </button>
            <button
              onClick={() => setMode("3d")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === "3d"
                  ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
                  : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">360° 预览</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Viewport — 拍照试戴模式（摄像头实时预览 + 快门） */}
        {mode === "camera" && (
          <div className="relative aspect-[3/4] bg-black overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: "scaleX(-1)", display: status === "ready" ? "none" : "block" }}
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ display: status === "ready" ? "block" : "none" }}
            />

            {/* 实时预览中：快门按钮 */}
            {status === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="absolute top-4 left-0 right-0 text-center text-xs text-white/80 px-4">
                  对准脸部，点击按钮拍照试戴
                </p>
                <button
                  onClick={handleCapture}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-transform"
                >
                  <Camera className="w-7 h-7 text-black" />
                </button>
              </div>
            )}

            {/* 分析中 */}
            {status === "analyzing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <Loader2 className="w-10 h-10 text-[var(--neon-cyan)] animate-spin mb-3" />
                <span className="text-sm text-white">AI 正在检测面部...</span>
              </div>
            )}

            {/* 未检测到人脸 */}
            {status === "no-face" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/60">
                <ScanFace className="w-12 h-12 text-orange-400 mb-3" />
                <p className="text-sm text-white mb-1">未检测到人脸</p>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">请正对镜头、光线充足后重试</p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl glass-card text-white text-sm font-medium"
                >
                  重新拍照
                </button>
              </div>
            )}

            {/* 错误 */}
            {status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/60">
                <AlertCircle className="w-12 h-12 text-orange-400 mb-3" />
                <p className="text-sm text-white mb-1">出错了</p>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">{errorMsg}</p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl glass-card text-white text-sm font-medium"
                >
                  重新拍照
                </button>
              </div>
            )}

            {/* 就绪：结果 + 工具栏 */}
            {status === "ready" && (
              <div className="absolute top-3 left-3 flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs hover:bg-black/80 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重拍
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs hover:bg-black/80 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  保存
                </button>
              </div>
            )}
          </div>
        )}

        {/* Viewport — 照片试戴模式 */}
        {mode === "photo" && (
        <div className="relative aspect-[3/4] bg-black overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* 空闲状态 — 上传/拍照入口 */}
          {status === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-cyan)]/20 flex items-center justify-center mb-2">
                <ImageIcon className="w-10 h-10 text-[var(--neon-cyan)]" />
              </div>
              <p className="text-sm text-white text-center">上传一张正面照片</p>
              <p className="text-xs text-[var(--muted-foreground)] text-center max-w-xs">
                AI 会自动检测面部，为你戴上选中的发型
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleTakePhoto}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white text-sm font-medium hover:shadow-[0_0_20px_oklch(0.65_0.25_300/0.3)] transition-all"
                >
                  <Upload className="w-4 h-4" />
                  上传照片
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* 分析中 */}
          {status === "analyzing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-[var(--neon-cyan)] animate-spin mb-3" />
              <span className="text-sm text-[var(--muted-foreground)]">AI 正在检测面部...</span>
            </div>
          )}

          {/* 未检测到人脸 */}
          {status === "no-face" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <ScanFace className="w-12 h-12 text-orange-400 mb-3" />
              <p className="text-sm text-white mb-1">未检测到人脸</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">请使用正面清晰的照片</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl glass-card text-white text-sm font-medium"
              >
                重新上传
              </button>
            </div>
          )}

          {/* 错误 */}
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-400 mb-3" />
              <p className="text-sm text-white mb-1">出错了</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl glass-card text-white text-sm font-medium"
              >
                重新上传
              </button>
            </div>
          )}

          {/* 就绪状态 — 顶部工具栏 */}
          {status === "ready" && (
            <>
              <div className="absolute top-3 left-3 flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs hover:bg-black/80 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  换照片
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs hover:bg-black/80 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  保存
                </button>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        )}

        {/* Viewport — 360° 预览模式 */}
        {mode === "3d" && (
        <div className="relative aspect-[3/4] bg-black overflow-hidden">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-[var(--neon-purple)] animate-spin mb-3" />
                <span className="text-sm text-[var(--muted-foreground)]">正在加载预览引擎...</span>
              </div>
            }
          >
            <Wig360Viewer
              wigId={WIG_STYLES[currentWig].id}
              wigName={WIG_STYLES[currentWig].name}
              wigIcon={WIG_STYLES[currentWig].icon}
            />
          </Suspense>
        </div>
        )}

        {/* 发型选择 + 调试面板 */}
        {(mode === "3d" || status === "ready") && (
          <div className="p-4">
            {/* 调试面板 */}
            {(mode === "photo" || mode === "camera") && status === "ready" && (
              <div className="mb-4 p-3 rounded-xl bg-black/30 border border-white/10">
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="flex items-center gap-2 text-xs text-[var(--neon-cyan)] mb-2"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  {showDebug ? "收起微调" : "展开微调"}
                </button>
                {showDebug && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mb-1">
                        <span>垂直偏移</span>
                        <span className="text-white font-mono">{adjust.yOffset}px</span>
                      </div>
                      <input
                        type="range"
                        min={-200}
                        max={200}
                        value={adjust.yOffset}
                        onChange={(e) => setAdjust({ ...adjust, yOffset: Number(e.target.value) })}
                        className="w-full accent-[var(--neon-cyan)]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mb-1">
                        <span>大小</span>
                        <span className="text-white font-mono">{adjust.scale.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={2.5}
                        step={0.05}
                        value={adjust.scale}
                        onChange={(e) => setAdjust({ ...adjust, scale: Number(e.target.value) })}
                        className="w-full accent-[var(--neon-purple)]"
                      />
                    </div>
                    <button
                      onClick={() => setAdjust(DEFAULT_ADJUST)}
                      className="text-[10px] text-[var(--muted-foreground)] hover:text-white"
                    >
                      重置参数
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 发型选择器 */}
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
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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

            {(mode === "photo" || mode === "camera") && (
              <p className="text-[10px] text-[var(--muted-foreground)] mt-2 text-center">
                {mode === "camera"
                  ? "实时拍照 · AI 自动佩戴 · 可微调位置和大小"
                  : "上传正面照片 · AI 自动佩戴 · 可微调位置和大小"}
              </p>
            )}
            {mode === "3d" && (
              <p className="text-[10px] text-[var(--muted-foreground)] mt-2 text-center">
                拖拽旋转查看 360° 细节 · 滚轮缩放 · 双击重置
              </p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
