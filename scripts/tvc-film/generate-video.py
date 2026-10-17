"""Turn a still into a video clip through OpenRouter's video API (image-to-video).

Usage:
  python3 generate-video.py --first-frame s1.jpg --prompt-file s1.txt --out s1.mp4 \
      [--last-frame end.jpg] [--model google/veo-3.1-fast] [--duration 4] [--resolution 1080p] [--aspect 16:9]

The key is read from OPENROUTER_API_KEY, or from the file named by OPENROUTER_API_KEY_FILE.
"""
import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = 'https://openrouter.ai/api/v1'


def api_key():
    if os.environ.get('OPENROUTER_API_KEY'):
        return os.environ['OPENROUTER_API_KEY'].strip()
    return Path(os.environ['OPENROUTER_API_KEY_FILE']).read_text().strip()


def call(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={
        'Authorization': f'Bearer {api_key()}', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f'{e.code} {e.read().decode()[:600]}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--first-frame', required=True)
    ap.add_argument('--last-frame', help='optional image the clip should end on')
    ap.add_argument('--prompt-file', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--model', default='google/veo-3.1-fast')
    ap.add_argument('--duration', type=int, default=4)
    ap.add_argument('--resolution', default='1080p')
    ap.add_argument('--aspect', default='16:9')
    a = ap.parse_args()

    def frame(path, kind):
        url = 'data:image/jpeg;base64,' + base64.b64encode(Path(path).read_bytes()).decode()
        return {'type': 'image_url', 'image_url': {'url': url}, 'frame_type': kind}

    frames = [frame(a.first_frame, 'first_frame')]
    if a.last_frame:
        frames.append(frame(a.last_frame, 'last_frame'))
    job = json.loads(call(f'{API}/videos', {
        'model': a.model,
        'prompt': Path(a.prompt_file).read_text(),
        'duration': a.duration,
        'resolution': a.resolution,
        'aspect_ratio': a.aspect,
        'generate_audio': False,
        'frame_images': frames,
    }))
    print('submitted', job.get('id'), job.get('status'), flush=True)

    status = job
    for _ in range(80):
        if status.get('status') == 'completed':
            break
        if status.get('status') in ('failed', 'cancelled', 'expired'):
            sys.exit(f"job {status.get('status')}: {status.get('error')}")
        time.sleep(15)
        status = json.loads(call(f"https://openrouter.ai{status['polling_url']}"
                                 if status.get('polling_url', '').startswith('/') else
                                 status.get('polling_url') or f"{API}/videos/{job['id']}"))
    else:
        sys.exit('timed out waiting for the video')

    data = call(f"{API}/videos/{job['id']}/content?index=0")
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_bytes(data)
    print(f"wrote {a.out} ({len(data) // 1024} KB) cost={status.get('usage', {}).get('cost', status.get('cost'))}")


if __name__ == '__main__':
    main()
