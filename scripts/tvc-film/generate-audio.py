"""Generate speech or music through OpenRouter's audio-output models (streamed).

Usage:
  python3 generate-audio.py --model openai/gpt-audio --voice coral --prompt-file vo.txt --out vo.wav
  python3 generate-audio.py --model google/lyria-3-clip-preview --prompt-file music.txt --out music.mp3

The key is read from OPENROUTER_API_KEY, or from the file named by OPENROUTER_API_KEY_FILE.
gpt-audio streams raw 24 kHz mono PCM16, which is wrapped into a WAV file.
"""
import argparse
import base64
import json
import os
import sys
import urllib.request
import wave
from pathlib import Path

API = 'https://openrouter.ai/api/v1/chat/completions'


def api_key():
    if os.environ.get('OPENROUTER_API_KEY'):
        return os.environ['OPENROUTER_API_KEY'].strip()
    return Path(os.environ['OPENROUTER_API_KEY_FILE']).read_text().strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True)
    ap.add_argument('--prompt-file', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--voice')
    ap.add_argument('--system', help='system instruction file')
    a = ap.parse_args()

    messages = []
    if a.system:
        messages.append({'role': 'system', 'content': Path(a.system).read_text()})
    messages.append({'role': 'user', 'content': Path(a.prompt_file).read_text()})
    body = {'model': a.model, 'messages': messages, 'modalities': ['text', 'audio'], 'stream': True}
    if a.voice:
        body['audio'] = {'voice': a.voice, 'format': 'pcm16'}
    req = urllib.request.Request(API, data=json.dumps(body).encode(), headers={
        'Authorization': f'Bearer {api_key()}', 'Content-Type': 'application/json'})

    chunks, text, fmt, cost = [], [], None, None
    with urllib.request.urlopen(req, timeout=600) as r:
        for raw in r:
            line = raw.decode().strip()
            if not line.startswith('data:') or line == 'data: [DONE]':
                continue
            evt = json.loads(line[5:])
            if evt.get('usage'):
                cost = evt['usage'].get('cost')
            for ch in evt.get('choices', []):
                delta = ch.get('delta', {})
                audio = delta.get('audio') or {}
                if audio.get('data'):
                    chunks.append(base64.b64decode(audio['data']))
                fmt = audio.get('format', fmt)
                if audio.get('transcript'):
                    text.append(audio['transcript'])
                if delta.get('content'):
                    text.append(delta['content'])
    if not chunks:
        sys.exit('no audio returned: ' + ''.join(text)[:300])

    data = b''.join(chunks)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    if a.voice:
        with wave.open(str(out), 'wb') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(24000)
            w.writeframes(data)
    else:
        out.write_bytes(data)
    print(f'wrote {out} ({len(data) // 1024} KB) format={fmt} cost={cost} transcript={"".join(text)[:120]!r}')


if __name__ == '__main__':
    main()
