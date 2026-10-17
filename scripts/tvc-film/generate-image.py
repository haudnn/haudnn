"""Generate one image through OpenRouter's image models.

Usage:
  OPENROUTER_API_KEY=... python3 generate-image.py --prompt-file p.txt --out out.png \
      [--model google/gemini-3-pro-image] [--aspect 16:9] [--size 2K] [--ref ref1.png --ref ref2.png]

The key is read from OPENROUTER_API_KEY, or from the file named by OPENROUTER_API_KEY_FILE.
"""
import argparse
import base64
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = 'https://openrouter.ai/api/v1/chat/completions'


def api_key():
    if os.environ.get('OPENROUTER_API_KEY'):
        return os.environ['OPENROUTER_API_KEY'].strip()
    path = os.environ.get('OPENROUTER_API_KEY_FILE')
    if path:
        return Path(path).read_text().strip()
    sys.exit('Set OPENROUTER_API_KEY or OPENROUTER_API_KEY_FILE')


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or 'image/png'
    return f'data:{mime};base64,{base64.b64encode(Path(path).read_bytes()).decode()}'


def generate(prompt, model, aspect, refs, size=None, retries=3):
    content = [{'type': 'text', 'text': prompt}]
    content += [{'type': 'image_url', 'image_url': {'url': data_uri(r)}} for r in refs]
    body = {
        'model': model,
        'messages': [{'role': 'user', 'content': content}],
        'modalities': ['image', 'text'],
        'image_config': {'aspect_ratio': aspect, **({'image_size': size} if size else {})},
    }
    req = urllib.request.Request(API, data=json.dumps(body).encode(), headers={
        'Authorization': f'Bearer {api_key()}', 'Content-Type': 'application/json'})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                res = json.load(r)
            images = res['choices'][0]['message'].get('images') or []
            if images:
                url = images[0]['image_url']['url']
                return base64.b64decode(url.split(',', 1)[1]), res.get('usage', {})
            print('no image returned:', json.dumps(res)[:400], file=sys.stderr)
        except (urllib.error.URLError, KeyError, TimeoutError) as e:
            detail = e.read().decode()[:400] if isinstance(e, urllib.error.HTTPError) else e
            print(f'attempt {attempt + 1} failed: {detail}', file=sys.stderr)
        time.sleep(4 * (attempt + 1))
    sys.exit('image generation failed')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--prompt-file', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--model', default='google/gemini-3-pro-image')
    ap.add_argument('--aspect', default='16:9')
    ap.add_argument('--size', help='1K, 2K or 4K where the model supports it')
    ap.add_argument('--ref', action='append', default=[])
    a = ap.parse_args()
    img, usage = generate(Path(a.prompt_file).read_text(), a.model, a.aspect, a.ref, a.size)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_bytes(img)
    print(f'wrote {a.out} ({len(img) // 1024} KB) cost={usage.get("cost")}')


if __name__ == '__main__':
    main()
