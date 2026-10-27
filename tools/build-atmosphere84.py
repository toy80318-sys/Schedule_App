"""Read-only PNG QA and deterministic packaging for the 12 atmosphere sprites."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import zipfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-assets/atmosphere-v84"
PUBLIC = ROOT / "docs/assets/atmosphere-v84"
DEFAULT_OUTPUT = Path(r"D:\work\2026\0510_부천영화제\08_Hoban\제주_움직임요소_PNG_V84_20261028")
BASE = "https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/atmosphere-v84/"
EDITOR = "https://toy80318-sys.github.io/Schedule_App/editor.html?v=20261028-atmosphere84"
ZIP_NAME = "Mazeland_Atmosphere_v84_12PNG.zip"
LABELS = {
    "cloud": ["풍성한 진주빛 구름", "길게 흐르는 비단 구름", "가벼운 깃털 구름", "층을 이루는 여명 구름"],
    "butterfly": ["넓은 날개의 프리즘 나비", "긴 꼬리의 프리즘 나비", "둥근 날개의 유리 나비", "가느다란 날개의 요정 나비"],
    "particle": ["샴페인빛 별 입자", "오팔 진주빛 입자", "프리즘 결정 반짝임", "빛나는 꽃잎 입자"],
}
THEMES = ["sunset", "day", "night", "morning"]


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def inspect_png(path: Path):
    data = path.read_bytes()
    with Image.open(path) as image:
        if image.format != "PNG" or image.mode != "RGBA" or data[25] != 6:
            raise ValueError(f"{path.name}: actual RGBA PNG required")
        alpha = image.getchannel("A")
        histogram = alpha.histogram()
        low, high = alpha.getextrema()
        width, height = image.size
        edge = max(alpha.crop((0, 0, width, 1)).getextrema()[1],
                   alpha.crop((0, height - 1, width, height)).getextrema()[1],
                   alpha.crop((0, 0, 1, height)).getextrema()[1],
                   alpha.crop((width - 1, 0, width, height)).getextrema()[1])
        # Alpha 1-2 edge haze may remain; the visible object must be complete.
        visible = alpha.point(lambda value: 255 if value >= 8 else 0).getbbox()
        if low != 0 or high < 32 or not sum(histogram[1:255]) or edge > 2 or not visible:
            raise ValueError(f"{path.name}: missing real transparency or clipped visible form")
        if visible[0] <= 0 or visible[1] <= 0 or visible[2] >= width or visible[3] >= height:
            raise ValueError(f"{path.name}: visible object touches the image boundary")
        total = width * height
        visible_pixels = sum(histogram[8:])
        cumulative = 0
        for median in range(8, 256):
            cumulative += histogram[median]
            if cumulative >= visible_pixels / 2:
                break
        qa = {
            "mode": "RGBA", "alphaMin": low, "alphaMax": high,
            "transparentPixelShare": round(histogram[0] / total, 6),
            "translucentPixelShare": round(sum(histogram[1:255]) / total, 6),
            "visiblePixelShare": round(visible_pixels / total, 6),
            "visibleAlphaMean": round(sum(value * histogram[value] for value in range(8, 256)) / visible_pixels, 3),
            "visibleAlphaMedian": median,
            "materialTranslucentShare": round(sum(histogram[32:224]) / visible_pixels, 6),
            "edgeAlphaMax": edge, "alphaRawBounds": list(alpha.getbbox()),
            "visibleBoundsAtAlpha8": list(visible),
        }
    return width, height, hashlib.sha256(data).hexdigest(), list(visible), qa


def make_manifest():
    files = [f"{category}_{number:02}.png" for category in LABELS for number in range(1, 5)]
    missing = [name for name in files if not (SOURCE / name).is_file()]
    if missing:
        raise ValueError("Waiting for accepted original PNGs: " + ", ".join(missing))
    assets = []
    for category, names in LABELS.items():
        for number, name in enumerate(names, 1):
            file = f"{category}_{number:02}.png"
            width, height, digest, bounds, qa = inspect_png(SOURCE / file)
            src = BASE + file
            assets.append({
                "id": f"atmosphere84-{category}-{number:02}", "name": name,
                "file": file, "src": src, "preview": src, "thumb": src,
                "width": width, "height": height, "sha256": digest,
                "category": category, "group": "decor", "kind": "image",
                "compatibleThemes": THEMES, "completeObject": True,
                "transparent": True, "stillOnly": True, "lightingBaked": True,
                "imageStyleVersion": 84, "atmosphereVersion": 84, "ready": True, "motion": "stationary",
                "alphaBounds": bounds, "verification": qa,
            })
            if category == "cloud":
                assets[-1]["atmosphere"] = "cloud"
    return {"format": "jeju-atmosphere-assets-v1", "version": 84, "date": "2026-10-28",
            "tool": "built-in image_gen", "count": 12, "assets": assets}


def prompts():
    path = SOURCE / "prompts.json"
    if not path.is_file():
        raise ValueError(f"Missing sanitized prompt source: {path.name}")
    rows = json.loads(path.read_text("utf-8-sig"))["assets"]
    if len(rows) != 12 or any(set(row) != {"file", "prompt"} for row in rows):
        raise ValueError("Canonical prompt source must contain exactly 12 file/prompt records")
    by_file = {row["file"]: row["prompt"] for row in rows}
    result = []
    for category in LABELS:
        for number in range(1, 5):
            file = f"{category}_{number:02}.png"
            if not isinstance(by_file.get(file), str) or not by_file[file].strip():
                raise ValueError(f"Missing final image prompt: {file}")
            result.append({"file": file, "prompt": by_file[file]})
    return {"format": "jeju-atmosphere-prompts-v1", "version": 84, "assets": result}


def catalog_script(manifest):
    data = json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))
    return ("// Complete, independently generated transparent atmosphere sprites.\n"
            "window.jejuAtmosphere84=" + data + ";\n"
            "if(window.jejuFinalCatalog){const c=window.jejuFinalCatalog;"
            "c.sourceFiles||=[];for(const a of window.jejuAtmosphere84.assets){"
            "if(!c.assets.some(v=>v.id===a.id))c.assets.push(a);"
            "if(!c.sourceFiles.some(v=>v.id===a.id))c.sourceFiles.push({id:a.id,relativePath:a.file,stablePreviewUrl:a.src});}}\n").encode("utf-8")


def gallery(manifest, local=False):
    data = json.dumps(manifest["assets"], ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return ('''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>메이즈랜드 · 구름·프리즘 나비·빛 입자 V84</title><style>
:root{font:15px/1.6 system-ui,sans-serif;color:#e9f1ed;background:#101f23}*{box-sizing:border-box}body{margin:0}main{max-width:1400px;margin:auto;padding:28px 24px 50px}h1{font-size:clamp(23px,3vw,34px);margin:12px 0 4px}p{margin:0;color:#b6c9c5}.eyebrow{color:#aee4d6;font-size:13px;letter-spacing:.1em}a{color:#c7efe4}nav,.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}nav a,.download{display:inline-block;padding:9px 14px;border:1px solid #628d80;border-radius:9px;text-decoration:none;background:#234a43}.primary{color:#102821;background:#bce9d6;font-weight:700}.toolbar{align-items:center;position:sticky;top:0;z-index:2;background:#152b2bee;padding:12px;border-radius:12px;backdrop-filter:blur(10px)}label{font-weight:650}select{font:inherit;color:#ecf6f0;background:#203d3b;border:1px solid #71998c;border-radius:7px;padding:7px}select:focus-visible,a:focus-visible{outline:3px solid #e3c68e;outline-offset:3px}.note{font-size:13px}h2{font-size:22px;margin:30px 0 12px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.card{min-width:0;border:1px solid #49625c;border-radius:14px;overflow:hidden;background:#172e2e}.sample{height:240px;display:grid;place-items:center;background-color:#dfe7e0;background-image:repeating-conic-gradient(#e3e8e3 0 25%,#b9c8c0 0 50%);background-position:center;background-size:20px 20px}.sample img{display:block;width:100%;height:100%;max-height:240px;object-fit:contain;padding:15px}body[data-mode=light] .sample{background:#f1eee6}body[data-mode=dark] .sample{background:#122526}body[data-mode=scene] .sample{background-color:#334944;background-image:var(--scene);background-size:cover}.info{padding:14px}.info h3{font-size:16px;margin:0 0 4px}.info p{font-size:12px;overflow-wrap:anywhere}.info a{margin-top:10px;font-size:13px}.legend{margin-top:32px;padding:16px;border-left:3px solid #a9dcc6;background:#1b3533}.status{margin-left:auto;color:#b6c9c5;font-size:13px}@media(max-width:1000px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:540px){main{padding:20px 14px}.grid{grid-template-columns:1fr}.sample,.sample img{height:270px;max-height:270px}.toolbar{position:static}.status{margin-left:0}}
</style></head><body data-mode="checker"><main><div class="eyebrow">MAZELAND · V84 · 12 PNG</div><h1>구름 · 프리즘 나비 · 빛 입자</h1><p>구름 4종, 나비 4종, 반짝이는 파티클 4종을 각각 온전한 투명 PNG로 만들었습니다.</p><nav><a class="primary" href="__ZIP__" __ZIP_ATTRIBUTE__>__ZIP_LABEL__</a><a href="__EDITOR__" target="_blank" rel="noopener">에디터 열기</a><a href="__MANIFEST__">요소 목록</a></nav><div class="toolbar"><label for="backdrop">비교 배경</label><select id="backdrop"><option value="checker">투명 체크</option><option value="light">밝은 단색</option><option value="dark">어두운 단색</option><option value="morning">아침</option><option value="day">낮</option><option value="sunset">노을</option><option value="night">달빛</option></select><span class="status" id="loadStatus" role="status">12개 이미지 준비 중</span></div><p class="note">비교 배경은 미리보기에만 표시됩니다. PNG 원본의 투명도와 색상은 바뀌지 않습니다.</p><div id="sections"></div><div class="legend"><p>이 자료는 독립된 정지 이미지입니다. 객체마다 크기·위치·투명도를 정한 뒤, 구름 이동·나비 비행·입자 반짝임을 각각 연결할 수 있습니다. 새 동작 영상이나 배경 합성본은 포함하지 않았습니다.</p></div></main><script>
const assets=__DATA__,local=__LOCAL__,groups=[['cloud','구름'],['butterfly','프리즘 나비'],['particle','반짝이는 파티클']];let loaded=0,failed=0;
for(const [kind,label]of groups){const section=document.createElement('section'),title=document.createElement('h2'),grid=document.createElement('div');title.textContent=label+' 4종';grid.className='grid';section.append(title,grid);document.querySelector('#sections').append(section);for(const a of assets.filter(a=>a.category===kind)){const card=document.createElement('article'),sample=document.createElement('div'),image=document.createElement('img'),info=document.createElement('div'),name=document.createElement('h3'),meta=document.createElement('p'),link=document.createElement('a');card.className='card';sample.className='sample';info.className='info';image.src=local?'PNG/'+a.file:a.src;image.alt=a.name;image.decoding='async';image.onload=()=>{loaded++;showStatus()};image.onerror=()=>{failed++;showStatus()};name.textContent=a.name;meta.textContent='투명 PNG · '+a.width+' × '+a.height+' · '+a.file;link.href=image.src;link.textContent='원본 PNG 열기';link.target='_blank';link.rel='noopener';sample.append(image);info.append(name,meta,link);card.append(sample,info);grid.append(card)}}
function showStatus(){document.querySelector('#loadStatus').textContent=loaded+' / 12개 표시'+(failed?' · '+failed+'개 다시 확인 필요':'')}
document.querySelector('#backdrop').addEventListener('change',event=>{const value=event.target.value,code={sunset:'BG01',day:'BG02',night:'BG03',morning:'BG04'}[value];document.body.dataset.mode=code?'scene':value;if(code)document.body.style.setProperty('--scene','url("https://raw.githubusercontent.com/toy80318-sys/Schedule_App/main/source-assets/set-review-v01/'+code+'-B04-V05.png")')});
</script></body></html>'''.replace("__DATA__", data).replace("__LOCAL__", "true" if local else "false")
            .replace("__ZIP__", "PNG/" if local else "assets/atmosphere-v84/" + ZIP_NAME)
            .replace("__ZIP_ATTRIBUTE__", "" if local else "download")
            .replace("__ZIP_LABEL__", "PNG 원본 폴더 열기" if local else "12종 PNG ZIP 받기")
            .replace("__MANIFEST__", "manifest.json" if local else "assets/atmosphere-v84/manifest.json")
            .replace("__EDITOR__", EDITOR)
            .replace("</head>", ('' if local else '<link rel="stylesheet" href="site-nav.css?v=45"><script defer src="site-nav.js?v=85"></script>')+'</head>')).encode("utf-8")


README = """제주 메이즈랜드 · 움직임 요소 PNG V84

구름 4종 / 프리즘 나비 4종 / 반짝이는 파티클 4종, 총 12개의 독립 PNG입니다.
PNG 폴더에는 생성 원본을 수정 없이 그대로 담았습니다. 캔버스의 빈 부분은 실제 알파 투명도입니다.
preview.html에서 체크·밝은색·어두운색으로 가장자리를 비교할 수 있습니다.
아침·낮·노을·달빛 배경 미리보기는 인터넷 연결이 필요합니다.

manifest.json: 원본 크기, 파일명, SHA-256, 종류, 투명도 검사 정보
prompts.json: 각 이미지의 최종 제작 프롬프트

이 패키지는 정지 이미지 원본입니다. 배경에 배치하거나 새 동작 영상을 만들지는 않았습니다.
구름 이동, 나비의 비행/날갯짓, 입자의 크기/투명도/반짝임은 이후 각각 연결하면 됩니다.
밝은 배경에서도 입자를 쓰려면 작은 크기부터 확인하고, 나비의 반투명 날개에는 일반 알파 블렌딩을 사용하세요.
""".encode("utf-8")


def outputs(manifest, prompt_set):
    files = {f"PNG/{a['file']}": (SOURCE / a["file"]).read_bytes() for a in manifest["assets"]}
    files.update({"manifest.json": encoded(manifest), "prompts.json": encoded(prompt_set),
                  "README.txt": README, "preview.html": gallery(manifest, local=True)})
    return files


def zip_bytes(path: Path, files):
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for name, content in files.items():
            item = zipfile.ZipInfo(name, date_time=(2026, 10, 28, 0, 0, 0))
            item.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(item, content)
    if path.stat().st_size >= 95 * 1024 * 1024:
        raise ValueError("PNG package exceeds the single-file hosting budget")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    manifest = make_manifest()
    prompt_set = prompts()
    generated = {
        PUBLIC / "manifest.json": encoded(manifest),
        PUBLIC / "prompts.json": encoded(prompt_set),
        ROOT / "docs/atmosphere84-catalog.js": catalog_script(manifest),
        ROOT / "docs/atmosphere-assets-v84-archive.html": gallery(manifest),
    }
    if args.check:
        for path, content in generated.items():
            if not path.is_file() or path.read_bytes().replace(b"\r\n", b"\n") != content:
                raise ValueError(f"Rebuild required: {path.relative_to(ROOT)}")
        with zipfile.ZipFile(PUBLIC / ZIP_NAME) as archive:
            expected = outputs(manifest, prompt_set)
            if set(archive.namelist()) != set(expected):
                raise ValueError("ZIP file list differs from the 12 accepted originals")
            for name, content in expected.items():
                if archive.read(name) != content:
                    raise ValueError(f"ZIP member differs from original: {name}")
        print("PASS: 12 RGBA originals, alpha edges, hashes, metadata, gallery and source ZIP")
        return
    for path, content in generated.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
    package = outputs(manifest, prompt_set)
    args.output.mkdir(parents=True, exist_ok=True)
    for name, content in package.items():
        path = args.output / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
    for path in sorted(SOURCE.glob("*-report.json")) + sorted(SOURCE.glob("*-prompts.json")):
        target = args.output / "검수" / path.name
        target.parent.mkdir(exist_ok=True)
        shutil.copy2(path, target)
    zip_bytes(PUBLIC / ZIP_NAME, package)
    shutil.copy2(PUBLIC / ZIP_NAME, args.output / ZIP_NAME)
    for asset in manifest["assets"]:
        if hashlib.sha256((args.output / "PNG" / asset["file"]).read_bytes()).hexdigest() != asset["sha256"]:
            raise ValueError(f"Copied original differs: {asset['file']}")
    print(f"BUILT: {len(manifest['assets'])} unchanged PNGs; {args.output}")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, zipfile.BadZipFile) as error:
        raise SystemExit(str(error)) from error
