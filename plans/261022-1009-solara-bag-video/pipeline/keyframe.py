"""Generate a 9:16 keyframe with an OpenRouter image model using product photos as references.

usage: python3 keyframe.py <out.png> <prompt-file> <ref1> [ref2 ...]
"""
import base64, json, os, sys, requests

MODEL = os.environ.get("IMG_MODEL", "google/gemini-3-pro-image")
out, prompt_file, refs = sys.argv[1], sys.argv[2], sys.argv[3:]
prompt = open(prompt_file).read()

content = [{"type": "text", "text": prompt}]
for r in refs:
    mime = "image/png" if r.endswith(".png") else "image/jpeg"
    b64 = base64.b64encode(open(r, "rb").read()).decode()
    content.append({"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}})

resp = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}"},
    json={
        "model": MODEL,
        "modalities": ["image", "text"],
        "image_config": {"aspect_ratio": "9:16"},
        "messages": [{"role": "user", "content": content}],
    },
    timeout=300,
)
data = resp.json()
if resp.status_code != 200:
    sys.exit(f"error {resp.status_code}: {json.dumps(data)[:800]}")
msg = data["choices"][0]["message"]
images = msg.get("images") or []
if not images:
    sys.exit(f"no image returned: {str(msg.get('content'))[:500]}")
url = images[0]["image_url"]["url"]
open(out, "wb").write(base64.b64decode(url.split(",", 1)[1]))
print(out, data.get("usage", {}).get("cost"))
