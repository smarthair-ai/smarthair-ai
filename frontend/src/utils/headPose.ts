/**
 * 头部姿态计算 — 基于 MediaPipe Face Mesh 关键点
 *
 * 核心原理：
 * - Yaw（偏航角/左右转头）：通过鼻尖相对于面部中线的水平偏移量计算
 * - Pitch（俯仰角/点头）：通过鼻尖相对于双眼垂直距离的变化计算
 * - Roll（翻滚角/歪头）：通过双眼连线的倾斜角度计算
 */

// MediaPipe Face Mesh 关键点索引
const LANDMARKS = {
  NOSE_TIP: 1,          // 鼻尖
  NOSE_BRIDGE: 168,     // 鼻梁
  LEFT_EYE_OUTER: 33,   // 左眼外角
  RIGHT_EYE_OUTER: 263, // 右眼外角
  LEFT_FACE: 234,       // 左脸颊
  RIGHT_FACE: 454,      // 右脸颊
  FOREHEAD: 10,         // 额头
  CHIN: 152,            // 下巴
  LEFT_MOUTH: 61,       // 左嘴角
  RIGHT_MOUTH: 291,     // 右嘴角
};

export interface HeadPose {
  yaw: number;   // 偏航角（-90 ~ +90 度，正值=向右转头）
  pitch: number; // 俯仰角（-90 ~ +90 度，正值=抬头）
  roll: number;  // 翻滚角（-180 ~ +180 度，正值=向右歪头）
}

/**
 * 计算头部 Yaw（偏航角）
 *
 * 原理：鼻尖相对于左右脸颊中点的水平偏移比例
 * - 当正面朝前时，鼻尖在脸颊中点 → yaw ≈ 0
 * - 当向右转头时，鼻尖偏向左侧脸颊 → yaw > 0
 * - 当向左转头时，鼻尖偏向右侧脸颊 → yaw < 0
 *
 * @param landmarks MediaPipe 返回的 468 个关键点数组
 * @returns yaw 角度（度数）
 */
export function calculateYaw(landmarks: any[]): number {
  const nose = landmarks[LANDMARKS.NOSE_TIP];
  const leftFace = landmarks[LANDMARKS.LEFT_FACE];
  const rightFace = landmarks[LANDMARKS.RIGHT_FACE];

  if (!nose || !leftFace || !rightFace) return 0;

  // 脸宽（左右脸颊距离）
  const faceWidth = rightFace.x - leftFace.x;
  if (Math.abs(faceWidth) < 0.001) return 0;

  // 鼻尖相对于脸颊中点的偏移比例
  const faceCenterX = (leftFace.x + rightFace.x) / 2;
  const noseOffset = nose.x - faceCenterX;

  // 偏移比例转角度（经验值校准）
  // ratio 范围约 -0.5 ~ +0.5，映射到 -90 ~ +90 度
  const ratio = noseOffset / faceWidth;
  const yaw = ratio * 180; // 放大到角度范围

  return Math.max(-90, Math.min(90, yaw));
}

/**
 * 计算头部 Pitch（俯仰角）
 *
 * 原理：鼻尖相对于双眼中点的垂直距离变化
 * - 正面时，鼻尖在双眼下方固定比例处
 * - 抬头时，鼻尖上移，距离缩小
 * - 低头时，鼻尖下移，距离增大
 */
export function calculatePitch(landmarks: any[]): number {
  const nose = landmarks[LANDMARKS.NOSE_TIP];
  const leftEye = landmarks[LANDMARKS.LEFT_EYE_OUTER];
  const rightEye = landmarks[LANDMARKS.RIGHT_EYE_OUTER];
  const chin = landmarks[LANDMARKS.CHIN];

  if (!nose || !leftEye || !rightEye || !chin) return 0;

  const eyeY = (leftEye.y + rightEye.y) / 2;
  const eyeToChin = chin.y - eyeY;
  if (Math.abs(eyeToChin) < 0.001) return 0;

  // 鼻尖在眼→下巴线段上的位置比例
  // 正面时约 0.35，抬头时减小，低头时增大
  const noseRatio = (nose.y - eyeY) / eyeToChin;
  const pitch = (0.35 - noseRatio) * 200; // 经验校准

  return Math.max(-60, Math.min(60, pitch));
}

/**
 * 计算头部 Roll（翻滚角）
 *
 * 原理：双眼连线的倾斜角度
 */
export function calculateRoll(landmarks: any[]): number {
  const leftEye = landmarks[LANDMARKS.LEFT_EYE_OUTER];
  const rightEye = landmarks[LANDMARKS.RIGHT_EYE_OUTER];

  if (!leftEye || !rightEye) return 0;

  const dy = rightEye.y - leftEye.y;
  const dx = rightEye.x - leftEye.x;
  const roll = (Math.atan2(dy, dx) * 180) / Math.PI;

  return roll;
}

/**
 * 计算完整头部姿态
 */
export function calculateHeadPose(landmarks: any[]): HeadPose {
  return {
    yaw: calculateYaw(landmarks),
    pitch: calculatePitch(landmarks),
    roll: calculateRoll(landmarks),
  };
}

/**
 * 序列帧角度索引计算
 *
 * 根据当前 Yaw 角度，返回应该显示的图片索引
 *
 * @param yaw 当前偏航角（-90 ~ +90）
 * @param frameCount 总帧数（如 3 = 左/中/右，5 = 左侧/左45/正面/右45/右侧）
 * @returns 帧索引（0 = 最左，frameCount-1 = 最右）
 */
export function yawToFrameIndex(yaw: number, frameCount: number): number {
  // yaw 范围 -90 ~ +90，映射到 0 ~ frameCount-1
  // 负值=向左转头（显示左侧图），正值=向右转头（显示右侧图）
  const normalized = (yaw + 90) / 180; // 0 ~ 1
  const index = Math.round(normalized * (frameCount - 1));
  return Math.max(0, Math.min(frameCount - 1, index));
}

/**
 * 帧角度阈值表
 *
 * 3 帧模式：左 / 正面 / 右
 * - yaw < -15 → 帧 0（左侧面）
 * - -15 ≤ yaw ≤ 15 → 帧 1（正面）
 * - yaw > 15 → 帧 2（右侧面）
 */
export function getFrameThresholds(frameCount: number): number[] {
  if (frameCount === 3) {
    return [-15, 15]; // 两个阈值，分 3 个区间
  }
  if (frameCount === 5) {
    return [-30, -10, 10, 30]; // 四个阈值，分 5 个区间
  }
  // 默认：均匀分割
  const step = 180 / frameCount;
  const thresholds: number[] = [];
  for (let i = 1; i < frameCount; i++) {
    thresholds.push(-90 + step * i);
  }
  return thresholds;
}
