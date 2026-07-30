/**
 * 假发定位算法 v3 — 动态锚点 + 透视修正 + 可调偏移
 *
 * 核心改进（相比 v2）：
 * 1. 锚点下移：假发底部对齐眉心上方，不再用"眉心 - 0.6U"导致飞到头顶上方
 * 2. 尺寸放大：基础宽度 = face_width * 1.3，确保盖住耳朵
 * 3. 透视修正：Pitch 驱动 scale 变化（抬头缩小上移，低头放大下移）
 * 4. Y 轴偏移参数：yOffset 可手动微调
 * 5. 保留阻尼平滑器
 */

// ===== MediaPipe 关键点 =====
const LM = {
  BROW_CENTER: 9,      // 眉心
  CHIN: 152,           // 下巴
  NOSE_TIP: 1,         // 鼻尖
  NOSE_BRIDGE: 168,    // 鼻梁中点
  LEFT_EYE: 33,        // 左眼外角
  RIGHT_EYE: 263,      // 右眼外角
  LEFT_TEMPLE: 234,    // 左太阳穴
  RIGHT_TEMPLE: 454,   // 右太阳穴
  FOREHEAD: 10,        // 额头顶部
};

// ===== 输出接口 =====
export interface WigTransform {
  x: number;           // 假发中心 X（画布坐标，已平滑）
  y: number;           // 假发中心 Y（画布坐标，已平滑）
  scaleX: number;      // X轴缩放（Yaw 透视压缩）
  scaleY: number;      // Y轴缩放（Pitch 透视修正）
  rotation: number;    // 旋转角度（弧度，已平滑）
  baseWidth: number;   // 基础宽度（未缩放，供绘制用）
  baseHeight: number;  // 基础高度（未缩放，供绘制用）
}

interface RawTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  baseWidth: number;
  baseHeight: number;
}

/**
 * 可调参数（调试滑动条控制）
 */
export interface WigAdjustParams {
  /** 垂直偏移（像素，正值=下移，负值=上移） */
  yOffset: number;
  /** 大小缩放（1.0=默认，>1放大，<1缩小） */
  scale: number;
}

export const DEFAULT_ADJUST: WigAdjustParams = {
  yOffset: 0,
  scale: 1.0,
};

// =====================================================================
// 核心计算函数
// =====================================================================
export function calculateWigTransformRaw(
  landmarks: any[],
  videoWidth: number,
  videoHeight: number,
  adjust: WigAdjustParams = DEFAULT_ADJUST,
  isMirrored: boolean = true
): RawTransform | null {

  const brow = landmarks[LM.BROW_CENTER];
  const chin = landmarks[LM.CHIN];
  const noseTip = landmarks[LM.NOSE_TIP];
  const noseBridge = landmarks[LM.NOSE_BRIDGE];
  const leftEye = landmarks[LM.LEFT_EYE];
  const rightEye = landmarks[LM.RIGHT_EYE];
  const leftTemple = landmarks[LM.LEFT_TEMPLE];
  const rightTemple = landmarks[LM.RIGHT_TEMPLE];

  if (!brow || !chin || !noseTip || !noseBridge || !leftEye || !rightEye || !leftTemple || !rightTemple) {
    return null;
  }

  const toX = (x: number) => (isMirrored ? 1 - x : x) * videoWidth;
  const toY = (y: number) => y * videoHeight;

  // ================================================================
  // 步骤 1: 动态锚点 — 基准单位 U
  // U = 鼻梁(168) 到 下巴(152) 的距离
  // 用鼻梁而不是眉心，因为鼻梁更稳定，不受眉毛表情影响
  // ================================================================
  const browX = toX(brow.x);
  const browY = toY(brow.y);
  const chinY = toY(chin.y);
  const noseBridgeY = toY(noseBridge.y);
  const noseBridgeX = toX(noseBridge.x);
  const chinX = toX(chin.x);

  const U = Math.sqrt(
    (chinX - noseBridgeX) ** 2 + (chinY - noseBridgeY) ** 2
  );
  if (U < 1) return null;

  // ================================================================
  // 步骤 2: 头部宽度 — 太阳穴间距
  // ================================================================
  const leftTempleX = toX(leftTemple.x);
  const rightTempleX = toX(rightTemple.x);
  const templeWidth = Math.abs(rightTempleX - leftTempleX);
  const templeMidX = (leftTempleX + rightTempleX) / 2;

  // ================================================================
  // 步骤 3: 假发基础尺寸
  // 宽度 = face_width(太阳穴间距) * 1.3 * 用户缩放
  // 高度 = 宽度 * 假发图片宽高比（假发图片是竖长的，约 0.75）
  //   但我们用 U 来限定最小高度，确保覆盖头顶
  // ================================================================
  const baseWidth = templeWidth * 1.3 * adjust.scale;
  // 假发高度：用 U 的 1.0 倍（鼻梁到下巴的距离 ≈ 头顶到眉心的距离）
  const baseHeight = U * 1.1 * adjust.scale;

  // ================================================================
  // 步骤 4: Yaw → scaleX 透视压缩
  // ================================================================
  const noseX = toX(noseTip.x);
  const yawRatio = templeWidth > 0.001
    ? ((noseX - templeMidX) / templeWidth) * 2
    : 0;
  const yaw = Math.max(-1, Math.min(1, yawRatio));
  const scaleX = Math.max(0.35, Math.cos(yaw * Math.PI / 2));

  // ================================================================
  // 步骤 5: Pitch → scaleY 透视修正
  // 鼻尖在鼻梁→下巴线段上的比例
  // 正面约 0.4，抬头减小（鼻尖上移），低头增大（鼻尖下移）
  // 抬头：scaleY < 1（缩小），y 上移
  // 低头：scaleY > 1（放大），y 下移
  // ================================================================
  const noseTipY = toY(noseTip.y);
  const bridgeToChin = chinY - noseBridgeY;
  let pitchFactor = 0; // -1(抬头) ~ +1(低头)
  let scaleY = 1.0;

  if (Math.abs(bridgeToChin) > 0.001) {
    const noseRatio = (noseTipY - noseBridgeY) / bridgeToChin;
    // 正面约 0.4
    pitchFactor = Math.max(-1, Math.min(1, (noseRatio - 0.4) * 3));
    // 抬头 pitchFactor<0 → scaleY<1，低头 pitchFactor>0 → scaleY>1
    scaleY = 1.0 + pitchFactor * 0.15;
  }

  // ================================================================
  // 步骤 6: 假发中心位置
  //
  // 水平：眉心 X + Yaw 微移
  // 垂直：眉心 Y - baseHeight * 0.15（假发底部在眉心上方 15%处）
  //   + yOffset（用户手动调整）
  //   + Pitch 透视偏移（抬头上移，低下移）
  // ================================================================
  const x = browX + yaw * 0.1 * U;

  // 关键修正：假发中心 Y
  // 假发图片中心点大约在图片垂直中点
  // 我们希望假发底部（图片下边缘）在眉心上方一点
  // 所以中心 Y = 眉心Y - baseHeight/2 + baseHeight*0.35
  //   = 眉心Y - baseHeight * 0.15
  // 这意味着假发下边缘在 眉心Y + baseHeight * 0.35 处（眉心下方）
  // 不对，应该是：中心Y - baseHeight/2 = 底部Y
  // 底部Y = 眉心Y - baseHeight * 0.1（底部在眉心上方 10%）
  // 中心Y = 底部Y + baseHeight/2 = 眉心Y - baseHeight*0.1 + baseHeight*0.5
  //       = 眉心Y + baseHeight * 0.4
  //
  // 但这样假发会盖住眼睛...
  // 重新思考：假发图片是头模照片，中心大约在头顶到发际线中间
  // 我们要让发际线对齐眉心上方
  // 假发图片中，发际线大约在图片 60% 处（从顶部算）
  // 所以中心Y = 眉心Y - baseHeight * (0.6 - 0.5) = 眉心Y - baseHeight * 0.1
  //
  // 但实际图片各异，所以用 yOffset 让用户调
  const y = browY - baseHeight * 0.1
    + adjust.yOffset              // 用户手动偏移
    + pitchFactor * U * 0.1;      // Pitch 透视偏移

  // ================================================================
  // 步骤 7: Roll 旋转
  // ================================================================
  const eyeDx = toX(rightEye.x) - toX(leftEye.x);
  const eyeDy = toY(rightEye.y) - toY(leftEye.y);
  const rotation = Math.atan2(eyeDy, eyeDx);

  return {
    x,
    y,
    scaleX,
    scaleY,
    rotation,
    baseWidth,
    baseHeight,
  };
}

// =====================================================================
// 阻尼平滑器
// =====================================================================
export class WigSmoother {
  private prev: WigTransform | null = null;
  private alpha: number;

  constructor(alpha: number = 0.3) {
    this.alpha = alpha;
  }

  update(raw: RawTransform): WigTransform {
    if (!this.prev) {
      const init: WigTransform = {
        x: raw.x, y: raw.y,
        scaleX: raw.scaleX, scaleY: raw.scaleY,
        rotation: raw.rotation,
        baseWidth: raw.baseWidth, baseHeight: raw.baseHeight,
      };
      this.prev = { ...init };
      return init;
    }

    const smoothed: WigTransform = {
      x: this.lerp(this.prev.x, raw.x),
      y: this.lerp(this.prev.y, raw.y),
      scaleX: this.lerp(this.prev.scaleX, raw.scaleX),
      scaleY: this.lerp(this.prev.scaleY, raw.scaleY),
      rotation: this.lerpAngle(this.prev.rotation, raw.rotation),
      baseWidth: raw.baseWidth,  // 尺寸不平滑，避免抖动
      baseHeight: raw.baseHeight,
    };

    this.prev = { ...smoothed };
    return smoothed;
  }

  reset() {
    this.prev = null;
  }

  private lerp(prev: number, curr: number): number {
    return prev + (curr - prev) * this.alpha;
  }

  private lerpAngle(a: number, b: number): number {
    let diff = b - a;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    return a + diff * this.alpha;
  }
}
