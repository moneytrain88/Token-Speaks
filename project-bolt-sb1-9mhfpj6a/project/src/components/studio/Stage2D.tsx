import { useEffect, useRef } from 'react';
import { FACE_HEIGHT, FACE_WIDTH, STATIC_FACE_LAYERS, buildMouthLayer, resolveLayerPaint, type FaceLayer, type FacePalette } from '@/lib/face2d/face';
import { drawFace2D } from '@/lib/face2d/drawFace';
import type { AudioSubscribe } from '@/hooks/useLiveMicrophone';

interface Stage2DProps {
  palette: FacePalette;
  subscribe: AudioSubscribe;
  isRecording: boolean;
  recordCanvas: HTMLCanvasElement;
}

const REST_MOUTH = buildMouthLayer(0);

function FacePath({ layer, palette }: { layer: FaceLayer; palette: FacePalette }) {
  const paint = resolveLayerPaint(layer, palette);
  return (
    <path
      d={layer.d}
      fill={paint.fill ?? 'none'}
      stroke={paint.stroke}
      strokeWidth={paint.strokeWidth}
      opacity={paint.opacity}
    />
  );
}

export function Stage2D({ palette, subscribe, isRecording, recordCanvas }: Stage2DProps) {
  const mouthRef = useRef<SVGPathElement>(null);
  const latestRef = useRef({ palette, isRecording, recordCanvas });

  useEffect(() => {
    latestRef.current = { palette, isRecording, recordCanvas };
  }, [palette, isRecording, recordCanvas]);

  useEffect(
    () =>
      subscribe(({ level }) => {
        mouthRef.current?.setAttribute('d', buildMouthLayer(level).d);
        const latest = latestRef.current;
        if (latest.isRecording) {
          const ctx = latest.recordCanvas.getContext('2d');
          if (ctx) drawFace2D(ctx, latest.palette, level);
        }
      }),
    [subscribe],
  );

  const mouthPaint = resolveLayerPaint(REST_MOUTH, palette);

  return (
    <svg
      viewBox={`0 0 ${FACE_WIDTH} ${FACE_HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label="2D cartoon character"
    >
      <g strokeLinecap="round" strokeLinejoin="round">
        {STATIC_FACE_LAYERS.map((layer) => (
          <FacePath key={layer.id} layer={layer} palette={palette} />
        ))}
        <path
          ref={mouthRef}
          d={REST_MOUTH.d}
          fill={mouthPaint.fill}
          stroke={mouthPaint.stroke}
          strokeWidth={mouthPaint.strokeWidth}
        />
      </g>
    </svg>
  );
}
