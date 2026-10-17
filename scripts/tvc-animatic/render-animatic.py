"""Render the Giày BQ "Từng bước" animatic to MP4.

Steps: build per-shot pages, screenshot them with headless Chromium, animate each shot
with ffmpeg zoompan, synthesise a temp music/SFX track, then join everything.

Usage: python3 render-animatic.py <work-dir> <output.mp4>
"""
import json
import math
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
CHROME = next(Path('/opt/pw-browsers').glob('chromium-*/chrome-linux/chrome'))
FPS = 25
SR = 44100
DURATION = 30


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def screenshot(html, png, size, transparent=False):
    cmd = [str(CHROME), '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
           f'--window-size={size[0]},{size[1]}', '--virtual-time-budget=5000',
           f'--screenshot={png}', html.as_uri()]
    if transparent:
        cmd.insert(5, '--default-background-color=00000000')
    run(cmd)


def ease(n):
    # smoothstep of the shot progress, as an ffmpeg expression
    p = f'(on/{n - 1})'
    return f'({p}*{p}*(3-2*{p}))'


def render_shot(work, shot):
    n = round((shot['to'] - shot['from']) * FPS)
    (z0, z1), ((cx0, cy0), (cx1, cy1)) = shot['z'], shot['c']
    e = ease(n)
    z = f'{z0}+({z1}-{z0})*{e}'
    x = f'clip(({cx0}+({cx1}-{cx0})*{e})*iw-iw/zoom/2,0,iw-iw/zoom)'
    shake = '+5*sin(on*1.9)' if shot.get('shake') else ''
    y = f'clip(({cy0}+({cy1}-{cy0})*{e})*ih-ih/zoom/2{shake},0,ih-ih/zoom)'
    out = work / f"{shot['id']}.mp4"
    run(['ffmpeg', '-y', '-loop', '1', '-framerate', str(FPS), '-i', str(work / f"{shot['id']}-art.png"),
         '-loop', '1', '-framerate', str(FPS), '-i', str(work / f"{shot['id']}-cap.png"),
         '-filter_complex',
         f"[0]zoompan=z='{z}':x='{x}':y='{y}':d=1:s=1920x1080:fps={FPS},setsar=1[v];"
         f"[v][1]overlay=0:0,format=yuv420p",
         '-frames:v', str(n), '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', str(out)])
    return out


def tone(t, f, start, end, attack=0.6, release=0.8):
    env = np.clip((t - start) / attack, 0, 1) * np.clip((end - t) / release, 0, 1)
    return env * (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.003 * t))


def click(t, at, gain=1.0, body=110):
    d = t - at
    m = (d >= 0) & (d < 0.12)
    out = np.zeros_like(t)
    rng = np.random.default_rng(int(at * 1000))
    out[m] = gain * (0.6 * rng.standard_normal(m.sum()) * np.exp(-d[m] * 90)
                     + np.sin(2 * np.pi * body * d[m]) * np.exp(-d[m] * 35))
    return out


def soundtrack(path):
    t = np.arange(DURATION * SR) / SR
    note = lambda name: 440 * 2 ** ({'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}[name[0]] / 12 + int(name[1]) - 4)
    chords = [  # (start, end, notes)
        (0, 3, 'A3 C4 E4'), (3, 6, 'F3 A3 C4'), (6, 9, 'C4 E4 G4'), (9, 12, 'G3 B3 D4'),
        (12, 15, 'A3 C4 E4'), (15, 19, 'F3 A3 C4'), (19, 21, 'C4 E4 G4'), (21, 23, 'G3 B3 D4'),
        (23, 25, 'F3 A3 C4 F4'), (25, 27, 'G3 B3 D4 G4'), (27, 30.5, 'C4 E4 G4 C5'),
    ]
    music = np.zeros_like(t)
    for s, e, names in chords:
        fs = [note(x) for x in names.split()]
        for f in fs:
            music += tone(t, f, s - 0.2, e + 0.3) / len(fs)
        music += 0.8 * tone(t, fs[0] / 2, s - 0.1, e + 0.2, attack=0.2)
    # quiet open, warm dip at the match cut, swell to the crane-up, resolve on the logo
    level = np.interp(t, [0, 3, 12, 15, 19, 23, 26, 27, 29.2, 30], [.10, .14, .18, .15, .26, .34, .42, .36, .30, 0])
    music *= level

    chime = sum(np.exp(-np.clip(t - 27.2, 0, None) * 2.5) * (t >= 27.2) * np.sin(2 * np.pi * f * t) * g
                for f, g in [(1046.5, .18), (1568, .10), (2093, .06)])

    sfx = click(t, 0.9, 0.9)
    rng = np.random.default_rng(1)
    noise = rng.standard_normal(len(t))
    rain = np.convolve(noise, np.ones(12) / 12, mode='same') * np.interp(t, [2.8, 3.2, 5.8, 6.1], [0, .5, .5, 0], left=0, right=0)
    horn = 0.12 * np.sign(np.sin(2 * np.pi * 392 * t)) * ((t > 4.2) & (t < 4.5))
    for k in range(8):
        sfx += click(t, 6.5 + k * 0.29, 0.7)
    gaps = [0.5, 0.45, 0.4, 0.34, 0.3, 0.26, 0.22]
    at = 9.3
    for g in gaps:
        sfx += click(t, at, 0.45, body=180)
        at += g
    for k in range(4):
        sfx += click(t, 19.2 + k * 0.48, 0.4)

    mix = music + chime + 0.6 * sfx + rain + horn
    mix *= np.interp(t, [0, 0.3, 29.4, 30], [0, 1, 1, 0])
    mix = mix / np.abs(mix).max() * 0.85
    pcm = (mix * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    work, output = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    work.mkdir(parents=True, exist_ok=True)
    run(['node', str(HERE / 'build-animatic-pages.mjs'), str(work)])
    shots = json.loads((work / 'shots.json').read_text())

    clips = []
    for shot in shots:
        screenshot(work / f"{shot['id']}-art.html", work / f"{shot['id']}-art.png", (3840, 2160))
        screenshot(work / f"{shot['id']}-cap.html", work / f"{shot['id']}-cap.png", (1920, 1080), transparent=True)
        clips.append(render_shot(work, shot))
        print('rendered', shot['id'], flush=True)

    (work / 'clips.txt').write_text(''.join(f"file '{c}'\n" for c in clips))
    run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', str(work / 'clips.txt'), '-c', 'copy', str(work / 'video.mp4')])
    soundtrack(work / 'music.wav')
    run(['ffmpeg', '-y', '-i', str(work / 'video.mp4'), '-i', str(work / 'music.wav'),
         '-vf', f'fade=in:st=0:d=0.4,fade=out:st={DURATION - 0.6}:d=0.6',
         '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '160k', '-t', str(DURATION), '-movflags', '+faststart', str(output)])
    print('wrote', output)


if __name__ == '__main__':
    main()
