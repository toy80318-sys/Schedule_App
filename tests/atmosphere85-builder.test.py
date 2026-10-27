"""Acceptance gates run before any atmosphere-loop files are published."""
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

path = Path(__file__).resolve().parents[1] / "tools/build-atmosphere85.py"
spec = importlib.util.spec_from_file_location("atmosphere85", path)
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


def accepted():
    return {"format": "mazeland-atmosphere-v85-accepted-v1", "version": 85,
            "assets": [{"name": name, "qa": {flag: True for flag in builder.REVIEW_FLAGS},
                        "fps": 30, "seconds": 5, "width": 480, "height": 480,
                        "sourcePNGUnchanged": True, "preservedOriginalAlpha": False,
                        "alphaMethod": "source-rgba-periodic-flow", "sourceAlphaDerivedByResampling": True, "keyColor": "#00BBFF",
                        "motionDerivation": "Small in-place periodic motion guided by generated footage",
                        "model": "seedance_2_0_mini", "requestedSeconds": 5, "requestedResolution": "480p",
                        "nativeVideo": {"sha256": "f" * 64, "width": 640, "height": 640, "fps": 24, "frameCount": 121, "seconds": 5.041667},
                        "previewWidth": 128, "previewHeight": 128,
                        "prompt": "A fixed-camera natural cycle.",
                        "jobId": "00000000-0000-4000-8000-000000000001"}
                       for name in builder.NAMES]}


class AcceptanceGates(unittest.TestCase):
    def test_complete_review_is_required(self):
        sample = accepted()
        self.assertEqual(list(builder.validate_rows(sample)), builder.NAMES)
        for flag in builder.REVIEW_FLAGS:
            bad = copy.deepcopy(sample)
            bad["assets"][0]["qa"][flag] = False
            with self.assertRaisesRegex(ValueError, "Complete visual and alpha review"):
                builder.validate_rows(bad)

    def test_a_partial_or_duplicate_set_cannot_publish(self):
        for rows in (accepted()["assets"][:-1], accepted()["assets"][:-1] + [accepted()["assets"][0]]):
            with self.assertRaisesRegex(ValueError, "12 distinct reviewed loops"):
                builder.validate_rows({**accepted(), "assets": rows})

    def test_wrong_timing_and_false_alpha_provenance_are_rejected(self):
        for key, value in (("seconds", 4), ("fps", 24), ("width", 512), ("preservedOriginalAlpha", True),
                           ("sourcePNGUnchanged", False), ("alphaMethod", "original-alpha"),
                           ("keyColor", "url(bad)"), ("jobId", "missing"), ("prompt", ""), ("previewWidth", 480),
                           ("requestedSeconds", 6), ("model", ""), ("sourceAlphaDerivedByResampling", False), ("nativeVideo", {})):
            bad = accepted()
            bad["assets"][0][key] = value
            with self.subTest(key=key), self.assertRaises(ValueError):
                builder.validate_rows(bad)

    def test_file_paths_cannot_escape_the_reviewed_asset_folder(self):
        with self.assertRaisesRegex(ValueError, "Expected reviewed file"):
            builder.checked_file("../../outside.mp4", "source-assets/atmosphere-v85/cloud_01/key.mp4")

    def test_video_urls_change_when_the_media_bytes_change(self):
        for relative in ("source-assets/atmosphere-v85/cloud_01/key.mp4", "source-assets/atmosphere-v85/cloud_01/alpha.webm"):
            first = builder.versioned_video(relative, "a" * 64)
            next_version = builder.versioned_video(relative, "b" * 64)
            self.assertEqual(first, builder.RAW + relative + "?v=" + "a" * 12)
            self.assertNotEqual(first, next_version)

    def test_a_video_changed_after_review_cannot_publish(self):
        row = {"name": "cloud_01", "alphaWebM_SHA256": "a" * 64}
        with patch.object(builder, "digest", return_value="a" * 64):
            self.assertEqual(builder.reviewed_media_hash(row, "alphaWebM", Path("unused")), "a" * 64)
        with patch.object(builder, "digest", return_value="b" * 64), self.assertRaisesRegex(ValueError, "differ from the accepted review"):
            builder.reviewed_media_hash(row, "alphaWebM", Path("unused"))

    def test_registration_preserves_png_downloads_and_existing_scene_data(self):
        originals = json.loads((builder.ROOT / "docs/assets/atmosphere-v84/manifest.json").read_text("utf-8-sig"))["assets"]
        loops = [{**row, "id": row["id"].replace("84", "85", 1), "stillOnly": False,
                  "atmosphereVersion": 85} for row in originals]
        data = {"originals": originals, "script": builder.catalog_script({"assets": loops}).decode("utf-8")}
        code = """const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),api=require('./docs/source-download');
const input=JSON.parse(fs.readFileSync(0,'utf8')),catalog={assets:input.originals,backgrounds:['bright'],scenes:['saved'],sourceFiles:[{id:'keep'}]},context={window:{jejuFinalCatalog:catalog}};
const before=JSON.stringify(catalog),count=api.entries(catalog).length;vm.runInNewContext(input.script,context);
assert.equal(catalog.assets.length,24);assert.equal(api.entries(catalog).length,count);assert.equal(JSON.stringify({...catalog,assets:catalog.assets.slice(0,12)}),before);
const added=JSON.stringify(catalog);vm.runInNewContext(input.script,context);assert.equal(JSON.stringify(catalog),added);"""
        result = subprocess.run(["node", "-e", code], input=json.dumps(data), text=True,
                                capture_output=True, cwd=builder.ROOT)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
