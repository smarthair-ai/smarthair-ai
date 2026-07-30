import { useRef, useEffect, useState, useCallback } from "react";
import {
  Camera,
  Upload,
  Loader2,
  ScanFace,
  AlertCircle,
  RotateCw,
  Download,
  RefreshCw,
  Shuffle,
} from "lucide-react";
import {
  calculateWigTransformRaw,
  DEFAULT_ADJUST,
  type WigAdjustParams,
} from "@/utils/wigPosition";
import { drawWigBlend } from "@/utils/wigRender";
import { WIG_STYLES, ANGLE_SUFFIXES } from "@/components/ARTryOn";

interface DemoTryOnProps {
  initialWigName?: string;
}

/**
 * 嵌入在 Demo 第 3 步的"真实拍照/上传试戴"窗口。
 * 复用与 ARTryOn 相同的人脸检测 + 假发融合算法，区别在于这里直接内嵌，
 * 不再有 360° / 多标签切换，聚焦"选照片 → 试戴 → 微调/保存"。
 */
export default function DemoTryOn({ initialWigName }: DemoTryOnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<any>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const wigImagesRef = useRef<HTMLImageElement[][]>([]);
  const singleWigImgRef = useRef<HTMLImageElement | null>(null);
  const landmarksRef = useRef<any[]>([]);

  const [status, setStatus] = useState<"idle" | "analyzing" | "ready" | "error" | "no-face">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const initialIdx = Math.max(0, WIG_STYLES.findIndex((w) => w.name === initialWigName));
  const [currentWig, setCurrentWig] = useState(initialIdx);
  const [inputMethod, setInputMethod] = useState<"none" | "camera">("none");

  const [adjust, setAdjust] = useState<WigAdjustParams>(DEFAULT_ADJUST);
  const [showDebug, setShowDebug] = useState(false);
  const adjustRef = useRef(adjust);
  adjustRef.current = adjust;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPhoto = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pw = photo.naturalWidth;
    const ph = photo.naturalHeight;
    canvas.width = pw;
    canvas.height = ph;
    ctx.drawImage(photo, 0, 0, pw, ph);

    const lm = landmarksRef.current;
    if (lm.length === 0) return;

    const transform = calculateWigTransformRaw(lm, pw, ph, adjustRef.current, false);
    if (!transform) return;

    const wig = WIG_STYLES[currentWig];
    let wigImg: HTMLImageElement | null = null;
    if (wig.multiAngle) {
      const images = wigImagesRef.current[currentWig];
      wigImg = images?.[1] || images?.[0] || null;
    } else {
      wigImg = singleWigImgRef.current;
    }
    if (!wigImg) return;

    drawWigBlend(ctx, wigImg, transform);
  }, [currentWig]);

  const handlePhoto = useCallback(
    async (file: Blob) => {
      setStatus("analyzing");
      setErrorMsg("");
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        photoRef.current = img;
        URL.revokeObjectURL(url);
        try {
          if (!faceMeshRef.current) {
            const FaceMesh = (await import("@mediapipe/face_mesh")).FaceMesh;
            const faceMesh = new FaceMesh({
              locateFile: (f: string) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
            });
            faceMesh.setOptions({
              maxNumFaces: 1,
              refineLandmarks: true,
              minDetectionConfidence: 0.5,
            });
            faceMeshRef.current = faceMesh;
          }
          faceMeshRef.current.onResults((results: any) => {
            const landmarks = results.multiFaceLandmarks?.[0] || [];
            if (landmarks.length > 0) {
              landmarksRef.current = landmarks;
              setStatus("ready");
              loadWigImages(0);
            } else {
              setStatus("no-face");
            }
          });
          await faceMeshRef.current.send({ image: img });
        } catch {
          setErrorMsg("人脸检测失败，请换一张正面照片");
          setStatus("error");
        }
      };
      img.onerror = () => {
        setErrorMsg("图片加载失败");
        setStatus("error");
      };
      img.src = url;
    },
    [loadWigImages]
  );

  const handleTakePhoto = () => fileInputRef.current?.click();

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
      setErrorMsg("无法访问摄像头，请检查权限，或改用“上传照片”");
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

  const switchWig = (idx: number) => {
    setCurrentWig(idx);
    loadWigImages(idx);
  };

  useEffect(() => {
    if (status === "ready") renderPhoto();
  }, [adjust, status, renderPhoto]);

  useEffect(() => {
    if (inputMethod === "camera") startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [inputMethod, startCamera, stopCamera]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `hairstyle-${WIG_STYLES[currentWig].id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleReset = () => {
    photoRef.current = null;
    landmarksRef.current = [];
    setStatus("idle");
    setInputMethod("none");
    setAdjust(DEFAULT_ADJUST);
  };

  useEffect(() => {
    return () => {
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close(); } catch {}
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* 试戴窗口 */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-b from-[oklch(0.18_0.01_280)] to-[oklch(0.12_0.005_280)] border border-white/10">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ display: status === "ready" ? "block" : "none" }}
        />

        {/* 选择输入方式 */}
        {status === "idle" && inputMethod === "none" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-cyan)]/20 flex items-center justify-center">
              <Camera className="w-8 h-8 text-[var(--neon-cyan)]" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white">拍照或上传照片试戴</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-xs">
                AI 自动检测面部，把发型戴到你的照片上
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setInputMethod("camera")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white text-sm font-medium hover:shadow-[0_0_20px_oklch(0.65_0.25_300/0.3)] transition-all"
              >
                <Camera className="w-4 h-4" />
                拍照
              </button>
              <button
                onClick={handleTakePhoto}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
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
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhoto(f);
              }}
              className="hidden"
            />
          </div>
        )}

        {/* 实时预览（拍照） */}
        {status === "idle" && inputMethod === "camera" && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
              muted
              playsInline
            />
            <p className="absolute top-4 left-0 right-0 text-center text-xs text-white/80 px-4">
              对准脸部，点击按钮拍照试戴
            </p>
            <button
              onClick={handleCapture}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-transform"
            >
              <Camera className="w-7 h-7 text-black" />
            </button>
            <button
              onClick={() => setInputMethod("none")}
              className="absolute bottom-9 right-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs hover:bg-black/80 transition-colors"
            >
              返回
            </button>
          </>
        )}

        {/* 分析中 */}
        {status === "analyzing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
            <Loader2 className="w-10 h-10 text-[var(--neon-cyan)] animate-spin mb-3" />
            <span className="text-sm text-white">AI 正在检测面部...</span>
          </div>
        )}

        {/* 未检测到人脸 */}
        {status === "no-face" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/60">
            <ScanFace className="w-12 h-12 text-orange-400 mb-3" />
            <p className="text-sm text-white mb-1">未检测到人脸</p>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">请使用正面清晰的照片</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl glass-card text-white text-sm font-medium"
            >
              重新选择
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
              重新选择
            </button>
          </div>
        )}

        {/* 就绪：工具栏 */}
        {status === "ready" && (
          <div className="absolute top-3 left-3 flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-xs hover:bg-black/80 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重拍/换照片
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

      {/* 发型选择 + 微调 */}
      <div>
        {/* 微调面板 */}
        {status === "ready" && (
          <div className="mb-3 p-3 rounded-xl bg-black/30 border border-white/10">
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
          <span className="text-xs text-[var(--neon-cyan)]">{WIG_STYLES[currentWig].name}</span>
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
      </div>
    </div>
  );
}
