/**
 * 假发定位算法 — 基于 MediaPipe Face Mesh 468 个关键点
 *
 * 核心思路：
 * 1. 用多个关键点确定头部的"发际线"位置（假发底部边界）
 * 2. 用头部宽度和高度确定假发的覆盖范围
 * 3. 用 Roll 角旋转假发，使其与头部倾斜一致
 * 4. 用 Pitch/Yaw 微调假发的垂直和水平偏移
 *
 * MediaPipe 关键点参考：
 * - 10:  额头顶部（发际线中点附近）
 * - 151: 额头中上部
 * - 9:   鼻梁上方（眉心）
 * - 234: 左侧太阳穴
 * - 454: 右侧太阳穴
 * - 127: 左侧脸颊上沿（颧骨上方）
 * - 356: 右侧脸颊上沿（颧骨上方）
 * - 21:  左眉上方发际线
 * - 251: 右眉上方发际线
 * - 71:  左耳上方
 * - 301: 右耳上方
 * - 152: 下巴
 * - 1:   鼻尖
 * - 168: 鼻梁中点
 * - 33:  左眼外角
 * - 263: 右眼外角
 * - 8:   眉心上方（前额中部）
 * - 5:   鼻根（两眼之间）
 */

// 关键点索引定义
export const WIG_LANDMARKS = {
  FOREHEAD_TOP: 10,       // 额头顶部
  FOREHEAD_MID: 151,      // 额头中部
  BROW_CENTER: 9,         // 眉心
  LEFT_TEMPLE: 234,       // 左太阳穴
  RIGHT_TEMPLE: 454,      // 右太阳 temple
  LEFT_BROW_TOP: 21,      // 左眉上方
  RIGHT_BROW_TOP: 251,    // 右眉上方
  LEFT_EAR_TOP: 127,      // 左耳上方
  RIGHT_EAR_TOP: 356,     // 右耳上方
  LEFT_CHEEK: 116,        // 左颧骨
  RIGHT_CHEEK: 345,       // 右颧骨
  CHIN: 152,              // 下巴
  NOSE_TIP: 1,            // 鼻尖
  NOSE_BRIDGE: 168,       // 鼻梁中点
  LEFT_EYE: 33,           // 左眼外角
  RIGHT_EYE: 263,         // 右眼外角
  NOSE_ROOT: 5,           // 鼻根
  FOREHEAD_CENTER: 8,     // 前额中部
};

export interface WigTransform {
  /** 假发中心 X（画布坐标） */
  cx: number;
  /** 假发中心 Y（画布坐标） */
  cy: number;
  /** 假发宽度（像素） */
  width: number;
  /** 假发高度（像素） */
  height: number;
  /** 旋转角度（弧度） */
  rotation: number;
  /** 垂直偏移（像素，正值=下移） */
  offsetY: number;
}

/**
 * 基于人脸关键点精确计算假发的位置和变换参数
 *
 * 算法步骤：
 *
 * 1. 确定发际线基准点：
 *    - 用关键点 10（额头顶部）作为发际线中点
 *    - 用关键点 21/251（左右眉上方）确定发际线宽度
 *    - 用关键点 234/454（左右太阳穴）确定头部最宽处
 *
 * 2. 计算假发宽度：
 *    - 取太阳穴间距（234→454）作为基础头部宽度
 *    - 假发需要覆盖整个头部，所以乘以 1.5 倍
 *    - 确保最少覆盖到耳朵位置
 *
 * 3. 计算假发高度：
 *    - 从发际线（10）到下巴（152）的距离作为脸部高度
 *    - 假发需要覆盖从头顶到发际线，约为脸部高度的 0.7 倍
 *    - 加上假发本身的造型高度，总高度约为脸高的 0.85 倍
 *
 * 4. 计算假发中心位置：
 *    - 水平：发际线中点的 X 坐标
 *    - 垂直：从发际线（10）向上偏移假发高度的 40%
 *      这样假发底部刚好在发际线位置，顶部在头顶上方
 *
 * 5. 计算旋转角度（Roll）：
 *    - 用双眼连线（33→263）的倾斜角度
 *    - 假发跟随头部一起倾斜
 *
 * 6. Pitch/Yaw 微调：
 *    - Pitch（点头/抬头）：通过鼻尖相对于眼睛的位置变化，
 *      调整假发的垂直偏移。抬头时假发上移，低头时下移
 *    - Yaw（左右转头）：通过鼻尖相对于面部中线的水平偏移，
 *      微调假发的水平位置
 *
 * @param landmarks MediaPipe 返回的 468 个关键点
 * @param videoWidth 视频宽度
 * @param videoHeight 视频高度
 * @param isMirrored 是否镜像翻转（前置摄像头通常为 true）
 */
export function calculateWigTransform(
  landmarks: any[],
  videoWidth: number,
  videoHeight: number,
  isMirrored: boolean = true
): WigTransform | null {
  // 获取关键点
  const foreheadTop = landmarks[WIG_LANDMARKS.FOREHEAD_TOP];     // 10
  const leftTemple = landmarks[WIG_LANDMARKS.LEFT_TEMPLE];       // 234
  const rightTemple = landmarks[WIG_LANDMARKS.RIGHT_TEMPLE];     // 454
  const chin = landmarks[WIG_LANDMARKS.CHIN];                    // 152
  const noseTip = landmarks[WIG_LANDMARKS.NOSE_TIP];             // 1
  const leftEye = landmarks[WIG_LANDMARKS.LEFT_EYE];             // 33
  const rightEye = landmarks[WIG_LANDMARKS.RIGHT_EYE];           // 263

  // 检查关键点是否存在
  if (!foreheadTop || !leftTemple || !rightTemple || !chin || !leftEye || !rightEye) {
    return null;
  }

  // 坐标转换函数（镜像翻转）
  const toX = (x: number) => (isMirrored ? (1 - x) : x) * videoWidth;
  const toY = (y: number) => y * videoHeight;

  // ===== 步骤 1: 计算头部关键尺寸 =====

  // 太阳穴间距 — 头部最宽处
  const templeWidth = Math.abs(toX(rightTemple.x) - toX(leftTemple.x));

  // 发际线到下巴的距离 — 脸部高度
  const foreheadY = toY(foreheadTop.y);
  const chinY = toY(chin.y);
  const faceHeight = Math.abs(chinY - foreheadY);

  // ===== 步骤 2: 计算假发尺寸 =====

  // 假发宽度：太阳穴间距 × 1.5（覆盖两侧耳朵和发尾）
  const wigWidth = templeWidth * 1.5;

  // 假发高度：脸部高度 × 0.85（从头顶到发际线下方一点）
  const wigHeight = faceHeight * 0.85;

  // ===== 步骤 3: 计算假发中心位置 =====

  // 水平中心：发际线中点
  const foreheadCenterX = toX(foreheadTop.x);

  // 垂直中心：从发际线向上偏移假发高度的 35%
  // 这样假发图片的底部大约在发际线位置
  // 假发图片的中心点大约在头部的中上部
  const wigCenterY = foreheadY - wigHeight * 0.35;

  // ===== 步骤 4: 计算旋转角度（Roll）=====

  // 双眼连线的倾斜角度
  const eyeDx = toX(rightEye.x) - toX(leftEye.x);
  const eyeDy = toY(rightEye.y) - toY(leftEye.y);
  const rollAngle = Math.atan2(eyeDy, eyeDx);

  // ===== 步骤 5: Pitch/Yaw 微调 =====

  // Pitch（俯仰角）：通过鼻尖相对于眼睛中点的垂直位置变化
  // 抬头时鼻尖上移，低头时下移
  const noseTipY = toY(noseTip.y);
  const eyeMidY = (toY(leftEye.y) + toY(rightEye.y)) / 2;
  const eyeToChin = chinY - eyeMidY;
  let pitchOffsetY = 0;

  if (eyeToChin > 0.001) {
    const noseRatio = (noseTipY - eyeMidY) / eyeToChin;
    // 正面时约 0.35，抬头时减小（<0.35），低头时增大（>0.35）
    pitchOffsetY = (0.35 - noseRatio) * faceHeight * 0.2;
  }

  // Yaw（偏航角）：通过鼻尖相对于太阳穴中线的水平偏移
  const templeMidX = (toX(leftTemple.x) + toX(rightTemple.x)) / 2;
  const noseTipX = toX(noseTip.x);
  const yawOffset = (noseTipX - templeMidX) * 0.15;

  // ===== 步骤 6: 返回最终变换参数 =====

  return {
    cx: foreheadCenterX + yawOffset,
    cy: wigCenterY + pitchOffsetY,
    width: wigWidth,
    height: wigHeight,
    rotation: rollAngle,
    offsetY: 0,
  };
}

/**
 * 计算发际线的精确位置
 *
 * 用额头上方的多个关键点拟合一条发际线
 * 这比单用关键点 10 更准确
 */
export function getHairlineY(landmarks: any[], videoHeight: number): number {
  const points = [
    landmarks[WIG_LANDMARKS.FOREHEAD_TOP],     // 10
    landmarks[WIG_LANDMARKS.FOREHEAD_MID],     // 151
    landmarks[WIG_LANDMARKS.FOREHEAD_CENTER],  // 8
  ].filter(Boolean);

  if (points.length === 0) return 0;

  // 取这些点的平均 Y 值
  const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  return avgY * videoHeight;
}

/**
 * 计算头部宽度（包含耳朵区域）
 *
 * 用太阳穴和颧骨关键点确定头部最宽处
 */
export function getHeadWidth(
  landmarks: any[],
  videoWidth: number,
  isMirrored: boolean = true
): number {
  const toX = (x: number) => (isMirrored ? (1 - x) : x) * videoWidth;

  const leftTemple = landmarks[WIG_LANDMARKS.LEFT_TEMPLE];
  const rightTemple = landmarks[WIG_LANDMARKS.RIGHT_TEMPLE];
  const leftCheek = landmarks[WIG_LANDMARKS.LEFT_CHEEK];
  const rightCheek = landmarks[WIG_LANDMARKS.RIGHT_CHEEK];

  if (!leftTemple || !rightTemple) return 0;

  const templeWidth = Math.abs(toX(rightTemple.x) - toX(leftTemple.x));

  // 如果有颧骨数据，取更宽的值
  if (leftCheek && rightCheek) {
    const cheekWidth = Math.abs(toX(rightCheek.x) - toX(leftCheek.x));
    return Math.max(templeWidth, cheekWidth);
  }

  return templeWidth;
}
