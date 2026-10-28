"""Register reviewed 5-second atmosphere loops without changing original PNG assets."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import subprocess
import zipfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-assets/atmosphere-v85"
PUBLIC = ROOT / "docs/assets/atmosphere-v85"
RAW = "https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/"
NAMES = [f"{kind}_{i:02}" for kind in ("cloud", "butterfly", "particle") for i in range(1, 5)]
REVIEW_FLAGS = ("passed", "loopReviewPassed", "allFramesReviewed", "alphaReviewPassed")
ZIP_NAME = "Mazeland_Atmosphere_v85_12Loops.zip"


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def checked_file(relative, expected):
    if not isinstance(relative, str) or relative.replace("\\", "/") != expected:
        raise ValueError(f"Expected reviewed file: {expected}")
    path = (ROOT / relative).resolve()
    if not path.is_relative_to(SOURCE.resolve()) or not path.is_file():
        raise ValueError(f"Reviewed file missing: {expected}")
    return path


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def versioned_video(relative, sha256):
    return RAW + relative + "?v=" + sha256[:12]


def reviewed_media_hash(row, key, path):
    value = digest(path)
    if row.get(key + "_SHA256") != value:
        raise ValueError(f"Video bytes differ from the accepted review: {row['name']}/{key}")
    return value


def probe(path):
    result = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
                             "-show_entries", "stream=width,height,nb_read_frames,color_space,color_transfer,color_primaries,color_range:format=duration",
                             "-of", "json", str(path)], check=True, capture_output=True, text=True)
    data = json.loads(result.stdout)
    stream = data["streams"][0]
    if (stream["width"], stream["height"], int(stream["nb_read_frames"])) != (480, 480, 150):
        raise ValueError(f"Expected 480x480 and 150 decoded frames: {path.name}")
    if abs(float(data["format"]["duration"]) - 5) > 0.04:
        raise ValueError(f"Expected five seconds: {path.name}")
    if tuple(stream.get(key) for key in ("color_space", "color_range", "color_primaries", "color_transfer")) != ("bt709", "tv", "bt709", "bt709"):
        raise ValueError(f"Expected explicit BT.709 matrix, limited range, primaries and transfer: {path.name}")


def validate_rows(accepted):
    rows = accepted.get("assets", [])
    if accepted.get("format") != "mazeland-atmosphere-v85-accepted-v1" or accepted.get("version") != 85:
        raise ValueError("A reviewed v85 acceptance manifest is required")
    if len(rows) != 12 or {row.get("name") for row in rows} != set(NAMES):
        raise ValueError("All 12 distinct reviewed loops are required")
    for row in rows:
        if any(row.get("qa", {}).get(flag) is not True for flag in REVIEW_FLAGS):
            raise ValueError(f"Complete visual and alpha review is required: {row.get('name')}")
        if (row.get("fps"), row.get("seconds"), row.get("width"), row.get("height")) != (30, 5, 480, 480):
            raise ValueError(f"Loop dimensions/timing differ: {row['name']}")
        if row.get("sourcePNGUnchanged") is not True or row.get("preservedOriginalAlpha") is not False or row.get("alphaMethod") != "source-rgba-periodic-flow" or row.get("sourceAlphaDerivedByResampling") is not True:
            raise ValueError(f"Original PNG and derived-alpha provenance is required: {row['name']}")
        if not row.get("motionDerivation", "").strip() or not re.fullmatch(r"[a-z0-9_]+", row.get("model", "")):
            raise ValueError(f"Motion derivation and actual model are required: {row['name']}")
        native = row.get("nativeVideo", {})
        if row.get("requestedSeconds") not in (4, 5) or row.get("requestedResolution") != "480p" or not re.fullmatch(r"[a-fA-F0-9]{64}", native.get("sha256", "")):
            raise ValueError(f"Native generation provenance is required: {row['name']}")
        if any(not isinstance(native.get(key), (int, float)) or not math.isfinite(native[key]) or native[key] <= 0 for key in ("width", "height", "fps", "frameCount", "seconds")):
            raise ValueError(f"Native generation dimensions/timing are required: {row['name']}")
        if (row.get("previewWidth"), row.get("previewHeight")) != (128, 128):
            raise ValueError(f"A 128x128 editor preview is required: {row['name']}")
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", row.get("keyColor", "")) or not row.get("prompt", "").strip():
            raise ValueError(f"Missing key color or generation prompt: {row['name']}")
        if not re.fullmatch(r"[0-9a-fA-F-]{36}", row.get("jobId", "")):
            raise ValueError(f"Missing generation job: {row['name']}")
    return {row["name"]: row for row in rows}


def make_manifest(accepted):
    rows = validate_rows(accepted)
    original = json.loads((ROOT / "docs/assets/atmosphere-v84/manifest.json").read_text("utf-8-sig"))
    originals = {a["file"].removesuffix(".png"): a for a in original["assets"]}
    assets, files = [], {}
    for name in NAMES:
        row, old = rows[name], originals[name]
        if row.get("sourcePNG", "").replace("\\", "/") != f"source-assets/atmosphere-v84/{name}.png":
            raise ValueError(f"Original PNG mismatch: {name}")
        if digest(ROOT / row["sourcePNG"]) != old["sha256"]:
            raise ValueError(f"Original PNG changed: {name}")
        base = f"source-assets/atmosphere-v85/{name}/"
        paths = {"keyMP4": checked_file(row.get("keyMP4"), base + "key.mp4"),
                 "alphaWebM": checked_file(row.get("alphaWebM"), base + "alpha.webm")}
        for path in paths.values():
            probe(path)
        expected = [base + f"frames/frame_{i:04}.png" for i in range(150)]
        if row.get("frames") != expected:
            raise ValueError(f"Expected 150 ordered reviewed frames: {name}")
        previews = [base + f"preview_frames/frame_{i:04}.png" for i in range(150)]
        if row.get("previewFrames") != previews:
            raise ValueError(f"Expected 150 ordered editor preview frames: {name}")
        hashes = {}
        for label, sequence, size in (("frames", expected, 480), ("previewFrames", previews, 128)):
            hashes[label] = []
            for relative in sequence:
                path = checked_file(relative, relative)
                with Image.open(path) as image:
                    if image.mode != "RGBA" or image.size != (size, size):
                        raise ValueError(f"Expected a {size}x{size} RGBA frame: {relative}")
                    alpha = image.getchannel("A")
                    bounds = alpha.point(lambda a: 255 if a >= 8 else 0).getbbox()
                    if alpha.getextrema()[0] != 0 or not bounds or min(bounds[:2]) <= 0 or bounds[2] >= size or bounds[3] >= size:
                        raise ValueError(f"Missing transparency or clipped visible form: {relative}")
                hashes[label].append(digest(path))
        kind, number = name.rsplit("_", 1)
        media_hashes = {key: reviewed_media_hash(row, key, path) for key, path in paths.items()}
        asset = {**old, "id": f"atmosphere85-{kind}-{number}", "name": old["name"] + " · 5초 루프",
                 "atmosphereVersion": 85, "imageStyleVersion": 85, "stillOnly": False,
                 "baseAssetId": old["id"], "frames": [RAW + path for path in expected],
                 "previewFrames": [RAW + path for path in previews], "previewWidth": 128, "previewHeight": 128,
                 "fps": 30, "duration": 5, "frameCount": 150, "loopWidth": 480, "loopHeight": 480,
                 "loopInPlace": True, "loopVideo": versioned_video(base + "alpha.webm", media_hashes["alphaWebM"]),
                 "keyVideo": versioned_video(base + "key.mp4", media_hashes["keyMP4"]), "keyColor": row["keyColor"],
                 "jobId": row["jobId"], "model": row["model"], "prompt": row["prompt"],
                 "requestedSeconds": row["requestedSeconds"], "requestedResolution": row["requestedResolution"],
                 "nativeVideo": {key: row["nativeVideo"][key] for key in ("sha256", "width", "height", "fps", "frameCount", "seconds")},
                 "alphaMethod": "source-rgba-periodic-flow", "preservedOriginalAlpha": False,
                 "sourceAlphaDerivedByResampling": True, "motionDerivation": row["motionDerivation"],
                 "loopReview": {flag: True for flag in REVIEW_FLAGS},
                 "loopHashes": {**media_hashes, **hashes}}
        assets.append(asset)
        for key, path in paths.items():
            files[f"{'MP4' if key == 'keyMP4' else 'WebM'}/{name}.{ 'mp4' if key == 'keyMP4' else 'webm'}"] = path.read_bytes()
    manifest = {"format": "jeju-atmosphere-loops-v1", "version": 85, "date": "2026-10-28",
                "count": 12, "tool": "Higgsfield motion-guided source RGBA loops", "models": sorted({a['model'] for a in assets}), "assets": assets}
    return manifest, files


def catalog_script(manifest):
    data = json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))
    return ("// Reviewed loops retain the original V84 PNG download metadata.\nwindow.jejuAtmosphere85=" + data + ";\n"
            "if(window.jejuFinalCatalog)for(const a of window.jejuAtmosphere85.assets)"
            "if(!window.jejuFinalCatalog.assets.some(v=>v.id===a.id))window.jejuFinalCatalog.assets.push(a);\n").encode("utf-8")


def gallery(manifest):
    assets = [{**{k: a[k] for k in ("id", "name", "category", "loopVideo", "keyVideo", "src")}, "sequenceZip":"https://github.com/toy80318-sys/Schedule_App/releases/download/mazeland-separated-loops-v88/"+a["id"]+"_PNG_ALPHA_v85.zip",
               "frames": ["assets/web-v87/loop-" + a["id"] + ".webp"]} for a in manifest["assets"]]
    data = json.dumps(assets, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return ('''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>메이즈랜드 · 루프 영상 모음</title><link rel="stylesheet" href="site-nav.css?v=86"><script defer src="site-nav.js?v=95"></script><style>
:root{font:15px/1.6 system-ui,sans-serif;color:#edf4ef;background:#102224}*{box-sizing:border-box}body{margin:0}main{max-width:1400px;margin:auto;padding:28px 24px}h1{font-size:clamp(24px,3vw,34px);margin:0}p{color:#bdd0ca}nav{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}a{color:#c6f1dd}nav a{padding:9px 14px;border:1px solid #739d8d;border-radius:9px;text-decoration:none}a:focus-visible,video:focus-visible{outline:3px solid #ffd58d;outline-offset:3px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.card{border:1px solid #4e6d62;border-radius:13px;overflow:hidden;background:#193330}.preview{background:repeating-conic-gradient(#dce4dc 0 25%,#aabdb0 0 50%) 0/20px 20px}.preview video{display:block;width:100%;aspect-ratio:1;object-fit:contain}.info{padding:14px}.info h3{font-size:16px;margin:0}.info p{font-size:12px}.info a{display:inline-block;margin-right:10px;font-size:13px}h2{margin-top:28px}details{margin-top:24px}summary{cursor:pointer}@media(max-width:1000px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:540px){.grid{grid-template-columns:1fr}main{padding:20px 14px}}
</style><link rel="stylesheet" href="collection.css?v=86"></head><body><main class="collection"><p><a class="button" href="butterflies-oil.html?v=20261028-v98#wingbeat-motion">새 추상 유화 나비 · 실제 날갯짓 검수 →</a></p><p><a class="button" href="element-loops.html?v=20261028-v95">최신 480px · 3초 루프 28종 보기 →</a></p><h1>배경과 분리 요소 · 32종 루프</h1><p>배경 4종 · 풀·잎·나무·현무암 16종 · 구름·나비·빛 12종 / 480px 미리보기 / 무음</p><nav><a href="layered-garden.html?v=20261028-v89r1">분리 레이어로 재생</a><a href="assets/atmosphere-v85/'''+ZIP_NAME+'''" download>구름·나비·빛 12종 영상 ZIP</a><a href="editor.html?v=20261028-v89r1">에디터 열기</a><a href="source-cutouts.html?category=atmosphere&v=20261028-v89r1">정지 PNG 원본 12종</a></nav><p>아래 영상은 투명 배경 미리보기입니다. 보색 배경 MP4와 투명 WebM을 각각 내려받을 수 있습니다.</p><div id="sections"></div><details><summary>투명도와 검수 정보</summary><p>Higgsfield 생성 영상의 움직임을 바탕으로 원본 PNG를 부드럽게 변형해 반복을 맞춘 파생 소스입니다. 투명도도 함께 변형한 결과이며 정지 PNG 원본은 그대로 보존했습니다. 통과한 반복 경계·전체 프레임·투명도 검수 기록은 <a href="assets/atmosphere-v85/manifest.json">요소 목록</a>에 포함되어 있습니다.</p></details></main><script>
const assets=__DATA__;for(const[k,label]of[['cloud','구름'],['butterfly','프리즘 나비'],['particle','반짝이는 파티클']]){const section=document.createElement('section'),heading=document.createElement('h2'),grid=document.createElement('div');heading.textContent=label+' 4종';grid.className='grid';section.append(heading,grid);document.querySelector('#sections').append(section);for(const a of assets.filter(x=>x.category===k)){const card=document.createElement('article'),preview=document.createElement('div'),video=document.createElement('video'),info=document.createElement('div'),name=document.createElement('h3'),meta=document.createElement('p');card.className='card';preview.className='preview';info.className='info';video.controls=true;video.loop=true;video.muted=true;video.playsInline=true;video.preload='none';video.poster=a.frames[0];video.src=a.loopVideo;video.setAttribute('aria-label',a.name+' 투명 반복 영상');name.textContent=a.name;meta.textContent='480 × 480 · 5초 · 30fps';preview.append(video);info.append(name,meta);for(const[text,url]of[['보색 MP4',a.keyVideo],['투명 WebM',a.loopVideo],['원본 PNG',a.src],['PNG 알파 시퀀스',a.sequenceZip]]){const link=document.createElement('a');link.href=url;link.textContent=text;link.target='_blank';link.rel='noopener';info.append(link)}card.append(preview,info);grid.append(card)}}
</script><script src="separated-motion.js?v=88"></script><script src="separated-loop-gallery.js?v=88"></script></body></html>'''.replace("__DATA__", data)).encode("utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--accepted", type=Path, default=SOURCE / "accepted.json")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if not args.accepted.is_file():
        raise ValueError("No reviewed acceptance manifest; no public output was written")
    accepted = json.loads(args.accepted.read_text("utf-8-sig"))
    manifest, files = make_manifest(accepted)
    generated = {PUBLIC / "manifest.json": encoded(manifest), ROOT / "docs/atmosphere85-catalog.js": catalog_script(manifest),
                 ROOT / "docs/atmosphere-loops.html": gallery(manifest)}
    files["manifest.json"] = encoded(manifest)
    files["README.txt"] = "메이즈랜드 V85 · 12종 5초 루프\nMP4: 보색 단색 배경으로 합성한 정원용 파생 루프\nWebM: 원본 RGBA를 움직임에 맞춰 변형한 투명 파생 루프\nHiggsfield 생성 영상의 움직임을 주기화한 파생본이며 생성 원본 영상과 구분됩니다. 정지 원본 PNG는 그대로 보존했습니다.\n".encode("utf-8")
    if args.check:
        for path, content in generated.items():
            if not path.is_file() or path.read_bytes().replace(b"\r\n", b"\n") != content:
                raise ValueError(f"Rebuild required: {path.relative_to(ROOT)}")
        with zipfile.ZipFile(PUBLIC / ZIP_NAME) as archive:
            if set(archive.namelist()) != set(files) or any(archive.read(name) != data for name, data in files.items()):
                raise ValueError("Loop ZIP differs from the reviewed originals")
        print("PASS: all 12 reviewed loops, original PNG hashes, 1800 original-size and 1800 preview RGBA frames, video probes and public outputs")
        return
    for path, content in generated.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
    with zipfile.ZipFile(PUBLIC / ZIP_NAME, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for name, data in files.items():
            entry = zipfile.ZipInfo(name, date_time=(2026, 10, 28, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(entry, data)
    if (PUBLIC / ZIP_NAME).stat().st_size >= 95 * 1024 * 1024:
        raise ValueError("Loop ZIP exceeds the single-file hosting budget")
    print("BUILT: 12 accepted loops; original PNG assets and saved layouts remain unchanged")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError, zipfile.BadZipFile) as error:
        raise SystemExit(str(error)) from error
