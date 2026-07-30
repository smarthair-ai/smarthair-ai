/**
 * 假发融合绘制（公共函数）
 * 在已绘制好人物照片的 canvas 上，按几何变换叠加假发，
 * 三层融合：投影阴影 + 边缘高斯模糊 + 底部渐变遮罩，让假发"长"在头发上。
 */

export interface WigBlendTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  baseWidth: number;
  baseHeight: number;
}

export function drawWigBlend(
  ctx: CanvasRenderingContext2D,
  wigImg: HTMLImageElement,
  t: WigBlendTransform
) {
  const w = t.baseWidth;
  const h = t.baseHeight;

  // 1. 投影阴影（假发下方的投影，增加立体感）
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(t.rotation);
  ctx.scale(t.scaleX, t.scaleY);
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 8;
  ctx.globalAlpha = 0.5;
  ctx.drawImage(wigImg, -w / 2, -h / 2, w, h);
  ctx.restore();

  // 2. 本体 + 边缘模糊（让假发边缘和皮肤自然过渡）
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(t.rotation);
  ctx.scale(t.scaleX, t.scaleY);
  ctx.filter = "blur(1.5px)";
  ctx.globalAlpha = 0.95;
  ctx.drawImage(wigImg, -w / 2, -h / 2, w, h);
  ctx.filter = "none";
  ctx.globalAlpha = 0.9;
  ctx.drawImage(wigImg, -w / 2, -h / 2, w, h);
  ctx.restore();

  // 3. 底部渐变遮罩（假发底部和额头过渡更自然）
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(t.rotation);
  ctx.scale(t.scaleX, t.scaleY);
  const grad = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.5);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.15)");
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = grad;
  ctx.fillRect(-w / 2, h * 0.2, w, h * 0.3);
  ctx.restore();
}
