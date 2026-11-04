import {
  FACE_HEIGHT,
  FACE_WIDTH,
  STATIC_FACE_LAYERS,
  buildMouthLayer,
  resolveLayerPaint,
  type FaceLayer,
  type FacePalette,
} from '@/lib/face2d/face';

function paintLayer(ctx: CanvasRenderingContext2D, layer: FaceLayer, palette: FacePalette) {
  const path = new Path2D(layer.d);
  const paint = resolveLayerPaint(layer, palette);
  ctx.save();
  ctx.globalAlpha = paint.opacity ?? 1;
  if (paint.fill) {
    ctx.fillStyle = paint.fill;
    ctx.fill(path);
  }
  if (paint.stroke) {
    ctx.strokeStyle = paint.stroke;
    ctx.lineWidth = paint.strokeWidth ?? 6;
    ctx.stroke(path);
  }
  ctx.restore();
}

export function drawFace2D(ctx: CanvasRenderingContext2D, palette: FacePalette, level: number) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.clearRect(0, 0, FACE_WIDTH, FACE_HEIGHT);
  for (const layer of STATIC_FACE_LAYERS) {
    paintLayer(ctx, layer, palette);
  }
  paintLayer(ctx, buildMouthLayer(level), palette);
}
