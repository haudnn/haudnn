import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Audio } from '@remotion/media';
import './fonts/be-vietnam-pro.css';

const fontFamily = '"Be Vietnam Pro", sans-serif';
const fontsReady = delayRender('Loading Be Vietnam Pro');
Promise.all(['400', '500', '700'].map((w) => document.fonts.load(`${w} 40px "Be Vietnam Pro"`, 'Bạn tận tuỵ')))
  .then(() => continueRender(fontsReady))
  .catch((err) => cancelRender(err));

export const FPS = 30;
export const DURATION = 30 * FPS;
const s = (sec: number) => Math.round(sec * FPS);
const ease = Easing.bezier(0.45, 0, 0.25, 1);

type Move = { zoom: [number, number]; x?: [number, number]; y?: [number, number]; shake?: boolean };

// One still with a camera move. x and y are offsets in % of the frame at the end points.
const Shot: React.FC<{ src: string; move: Move }> = ({ src, move }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const zoom = interpolate(p, [0, 1], move.zoom);
  const x = interpolate(p, [0, 1], move.x ?? [0, 0]);
  const y = interpolate(p, [0, 1], move.y ?? [0, 0]);
  const shakeX = move.shake ? Math.sin(frame * 0.9) * 0.25 + Math.sin(frame * 2.3) * 0.12 : 0;
  const shakeY = move.shake ? Math.cos(frame * 1.3) * 0.2 : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000' }}>
      <Img
        src={staticFile(`shots/${src}.jpg`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoom}) translate(${x + shakeX}%, ${y + shakeY}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 8: the only camera rise in the film, from her shoes on stage up to her face.
const CraneUp: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const imgHeight = (width * 2752) / 1536;
  const p = interpolate(frame, [s(0.3), durationInFrames - s(0.4)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.6, 0, 0.3, 1),
  });
  const top = interpolate(p, [0, 1], [height - imgHeight, -imgHeight * 0.06]);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000' }}>
      <Img src={staticFile('shots/s8.jpg')} style={{ position: 'absolute', left: 0, top, width, height: imgHeight }} />
    </AbsoluteFill>
  );
};

// Scene 7B: the worn pair is checked, then handed back restored.
const Warranty: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = interpolate(frame, [s(1.1), s(1.45)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Shot src="s7b-worn" move={{ zoom: [1.04, 1.1], x: [1, 0] }} />
      <AbsoluteFill style={{ opacity: swap }}>
        <Shot src="s7b-new" move={{ zoom: [1.06, 1.1] }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Packshot: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = (start: number) => ({
    opacity: interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    transform: `translateY(${interpolate(frame, [start, start + 18], [24, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    })}px)`,
  });
  return (
    <AbsoluteFill>
      <Shot src="s9" move={{ zoom: [1.0, 1.05], x: [0, -1] }} />
      <AbsoluteFill style={{ left: '57%', right: '3%', justifyContent: 'center', gap: 34, fontFamily, color: '#3a2417' }}>
        <div style={{ ...rise(6), fontSize: 80, fontWeight: 700, lineHeight: 1.12 }}>
          Bạn tận lực.
          <br />
          Chúng tôi tận tuỵ.
        </div>
        <div style={{ ...rise(22), display: 'flex', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              background: '#3a2417',
              color: '#f6efe6',
              fontWeight: 700,
              fontSize: 54,
              letterSpacing: '0.18em',
              padding: '14px 26px 14px 34px',
            }}
          >
            GIÀY BQ
          </div>
          <div style={{ fontSize: 36, fontWeight: 500 }}>Bảo hành trọn đời</div>
        </div>
      </AbsoluteFill>
      <div
        style={{
          ...rise(30),
          position: 'absolute',
          bottom: 36,
          width: '100%',
          textAlign: 'center',
          fontFamily,
          fontSize: 20,
          color: 'rgba(58,36,23,.75)',
        }}
      >
        Áp dụng theo chính sách bảo hành của Giày BQ
      </div>
    </AbsoluteFill>
  );
};

// Light film finish over every shot: vignette, soft warm grade and grain.
const FilmLook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.38) 100%)' }} />
      <AbsoluteFill style={{ background: 'rgba(255,170,90,.05)', mixBlendMode: 'soft-light' }} />
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.07, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// Rain streaks for the traffic scene, drawn deterministically per frame.
const Rain: React.FC = () => {
  const frame = useCurrentFrame();
  const drops = Array.from({ length: 70 }, (_, i) => {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const r = seed - Math.floor(seed);
    const x = (r * 2100 + frame * 9) % 2100 - 90;
    const y = ((i * 97 + frame * 64) % 1300) - 150;
    return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 70} stroke="rgba(220,230,255,.35)" strokeWidth={2} />;
  });
  return (
    <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: 'absolute' }}>
      {drops}
    </svg>
  );
};

const SHOTS: { from: number; to: number; el: React.ReactNode }[] = [
  { from: 0, to: 3, el: <Shot src="s1" move={{ zoom: [1.0, 1.1], x: [0, 2], y: [0, -1] }} /> },
  {
    from: 3,
    to: 6,
    el: (
      <AbsoluteFill>
        <Shot src="s2" move={{ zoom: [1.12, 1.12], x: [2, -2], shake: true }} />
        <Rain />
      </AbsoluteFill>
    ),
  },
  { from: 6, to: 9, el: <Shot src="s3" move={{ zoom: [1.18, 1.18], x: [6, -6] }} /> },
  { from: 9, to: 12, el: <Shot src="s4" move={{ zoom: [1.0, 1.06] }} /> },
  { from: 12, to: 15, el: <Shot src="s5" move={{ zoom: [1.06, 1.1] }} /> },
  { from: 15, to: 17, el: <Shot src="s6a" move={{ zoom: [1.12, 1.04] }} /> },
  { from: 17, to: 19, el: <Shot src="s6b" move={{ zoom: [1.08, 1.12], x: [2, -2] }} /> },
  { from: 19, to: 21, el: <Shot src="s7a" move={{ zoom: [1.14, 1.04], x: [-2, 1] }} /> },
  { from: 21, to: 23, el: <Warranty /> },
  { from: 23, to: 27, el: <CraneUp /> },
  { from: 27, to: 30, el: <Packshot /> },
];

const VO: { file: string; at: number }[] = [
  { file: 'vo-1', at: 0.3 },
  { file: 'vo-2', at: 6.2 },
  { file: 'vo-3', at: 12.4 },
  { file: 'vo-4', at: 19.3 },
  { file: 'vo-5', at: 23.2 },
];

// Music sits under the voice, then swells into the crane-up and settles on the logo.
const musicVolume = (f: number) =>
  interpolate(
    f,
    [0, s(0.5), s(12), s(15), s(19), s(22.6), s(23.4), s(27), s(28.6), s(30)],
    [0, 0.45, 0.45, 0.4, 0.5, 0.5, 0.75, 0.75, 0.6, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

export const TungBuoc: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10, DURATION - 18, DURATION - 1], [1, 0, 0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {SHOTS.map((shot) => (
        <Sequence key={shot.from} from={s(shot.from)} durationInFrames={s(shot.to) - s(shot.from)}>
          {shot.el}
        </Sequence>
      ))}
      <FilmLook />
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: fade }} />
      <Audio src={staticFile('audio/music.mp3')} volume={musicVolume} />
      {VO.map((v) => (
        <Sequence key={v.file} from={s(v.at)}>
          <Audio src={staticFile(`audio/${v.file}.wav`)} volume={1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
