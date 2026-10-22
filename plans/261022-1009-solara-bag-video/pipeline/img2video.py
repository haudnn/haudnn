"""Image-to-video via OpenRouter /videos: submit, poll, download.

usage: python3 img2video.py <out.mp4> <prompt-file> <first.png> [last.png]
env: VID_MODEL (default google/veo-3.1-fast), VID_DURATION (default 4)
"""
import base64, json, os, sys, time, requests

API = "https://openrouter.ai/api/v1/videos"
H = {"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}"}
out, prompt_file, frames = sys.argv[1], sys.argv[2], sys.argv[3:]


def data_url(path):
    return "data:image/png;base64," + base64.b64encode(open(path, "rb").read()).decode()


body = {
    "model": os.environ.get("VID_MODEL", "google/veo-3.1-fast"),
    "prompt": open(prompt_file).read(),
    "frame_images": [
        {"type": "image_url", "image_url": {"url": data_url(f)}, "frame_type": t}
        for f, t in zip(frames, ["first_frame", "last_frame"])
    ],
    "resolution": "720p",
    "aspect_ratio": "9:16",
    "duration": int(os.environ.get("VID_DURATION", "4")),
    "generate_audio": False,
}
r = requests.post(API, headers=H, json=body, timeout=120)
job = r.json()
if r.status_code >= 300:
    sys.exit(f"submit error {r.status_code}: {json.dumps(job)[:800]}")
jid = job.get("id")
print("job", jid, flush=True)

deadline = time.time() + 900
while time.time() < deadline:
    s = requests.get(f"{API}/{jid}", headers=H, timeout=60).json()
    st = s.get("status")
    if st in ("completed", "succeeded"):
        break
    if st in ("failed", "error", "cancelled"):
        sys.exit(f"job failed: {json.dumps(s)[:800]}")
    time.sleep(10)
else:
    sys.exit("timeout")

urls = s.get("unsigned_urls") or s.get("urls") or []
if not urls:
    sys.exit(f"no url in result: {json.dumps(s)[:800]}")
v = requests.get(urls[0], headers=H if "openrouter.ai" in urls[0] else None, timeout=300)
v.raise_for_status()
open(out, "wb").write(v.content)
print(out, s.get("usage"))
