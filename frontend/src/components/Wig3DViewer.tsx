import { useState, Suspense, Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, useProgress } from "@react-three/drei";
import { Loader2, AlertCircle } from "lucide-react";

interface Wig3DViewerProps {
  wigId: string;
  wigName: string;
}

// 加载 GLB 模型
function WigModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  return (
    <primitive
      object={gltf.scene}
      scale={1}
      position={[0, -0.5, 0]}
    />
  );
}

// 加载进度
function LoadingFallback() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 text-[var(--neon-cyan)] animate-spin" />
        <span className="text-xs text-white">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

// 错误回退 — 显示占位球体
function PlaceholderWig() {
  return (
    <mesh position={[0, 0, 0]}>
      {/* 假发形状占位：半球 */}
      <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial
        color="oklch(0.25 0.03 30)"
        roughness={0.7}
        metalness={0.1}
      />
      {/* 底部圆盘 */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="oklch(0.15 0.02 30)" side={2} />
      </mesh>
    </mesh>
  );
}

// 模型加载包装器 — 失败时显示占位
function SafeModel({ url }: { url: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return <PlaceholderWig />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary onError={() => setError(true)}>
        <WigModel url={url} />
      </ErrorBoundary>
    </Suspense>
  );
}

// 简易错误边界
class ErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function Wig3DViewer({ wigId, wigName }: Wig3DViewerProps) {
  const modelUrl = `/wigs/${wigId}.glb`;
  const [showHint, setShowHint] = useState(true);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[oklch(0.18_0.01_280)] to-[oklch(0.12_0.005_280)]">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 光照 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 3, -2]} intensity={0.4} color="oklch(0.70 0.18 200)" />

        {/* 环境光 */}
        <Environment preset="studio" />

        {/* 3D 模型 */}
        <SafeModel url={modelUrl} />

        {/* 接触阴影 */}
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.4}
          scale={4}
          blur={2}
          far={3}
        />

        {/* 拖拽旋转控制 */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={showHint}
          autoRotateSpeed={1.5}
          onStart={() => setShowHint(false)}
        />
      </Canvas>

      {/* 网格背景 */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* 标题 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur pointer-events-none">
        <span className="text-sm text-white font-medium">{wigName}</span>
        <span className="text-xs text-[var(--neon-cyan)] ml-2">3D 预览</span>
      </div>

      {/* 拖拽提示 */}
      {showHint && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur flex items-center gap-2 animate-pulse pointer-events-none">
          <span className="text-xs text-white">拖拽旋转 · 滚轮缩放 · 查看背面</span>
        </div>
      )}

      {/* 操作提示 */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 pointer-events-none">
        <div className="px-2 py-1 rounded-md bg-black/50 backdrop-blur flex items-center gap-1">
          <span className="text-[10px] text-[var(--muted-foreground)]">拖拽</span>
          <span className="text-[10px] text-white">旋转</span>
        </div>
        <div className="px-2 py-1 rounded-md bg-black/50 backdrop-blur flex items-center gap-1">
          <span className="text-[10px] text-[var(--muted-foreground)]">滚轮</span>
          <span className="text-[10px] text-white">缩放</span>
        </div>
      </div>

      {/* 模型文件缺失提示 */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-md bg-black/50 backdrop-blur flex items-center gap-1.5 pointer-events-none">
        <AlertCircle className="w-3 h-3 text-orange-400" />
        <span className="text-[10px] text-[var(--muted-foreground)]">
          示例模型 · 等待 .glb 素材
        </span>
      </div>
    </div>
  );
}
