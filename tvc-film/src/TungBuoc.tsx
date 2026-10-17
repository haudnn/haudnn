import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { Audio, Video } from '@remotion/media';
import './fonts/be-vietnam-pro.css';

const fontFamily = '"Be Vietnam Pro", sans-serif';
const fontsReady = delayRender('Loading Be Vietnam Pro');
Promise.all(['400', '500', '700'].map((w) => document.fonts.load(`${w} 40px "Be Vietnam Pro"`, 'Bạn tận tuỵ')))
  .then(() => continueRender(fontsReady))
  .catch((err) => cancelRender(err));

export const FPS = 30;
export const DURATION = 30 * FPS;
const s = (sec: number) => Math.round(sec * FPS);

// One live-action clip, trimmed to start at `from` seconds into the generated footage.
const Clip: React.FC<{ src: string; from?: number; rate?: number }> = ({ src, from = 0, rate = 1 }) => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    <Video
      src={staticFile(`clips/${src}.mp4`)}
      trimBefore={s(from)}
      playbackRate={rate}
      muted
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </AbsoluteFill>
);

// Scene 7B: the worn pair is checked, then handed back restored.
const Warranty: React.FC = () => {
  const frame = useCurrentFrame();
  const swap = interpolate(frame, [s(1.0), s(1.25)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Clip src="s7b-worn" from={0.6} />
      <AbsoluteFill style={{ opacity: swap }}>
        <Sequence from={s(1.0)}>
          <Clip src="s7b-new" from={0.8} />
        </Sequence>
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
      <Clip src="s9" />
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

const SHOTS: { from: number; to: number; el: React.ReactNode }[] = [
  { from: 0, to: 3, el: <Clip src="s1" from={0.3} /> },
  { from: 3, to: 6, el: <Clip src="s2" from={0.5} /> },
  { from: 6, to: 9, el: <Clip src="s3" from={0.5} /> },
  { from: 9, to: 12, el: <Clip src="s4" from={0.5} /> },
  { from: 12, to: 15, el: <Clip src="s5" from={0.5} /> },
  { from: 15, to: 17, el: <Clip src="s6a" from={1} /> },
  { from: 17, to: 19, el: <Clip src="s6b" from={0.8} /> },
  { from: 19, to: 21, el: <Clip src="s7a" from={1} /> },
  { from: 21, to: 23, el: <Warranty /> },
  { from: 23, to: 27, el: <Clip src="s8" /> },
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
