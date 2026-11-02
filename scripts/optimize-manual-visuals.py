#!/usr/bin/env python3
"""Convert a single ZIP of approved PNA source artwork into 35 efficient cards.

Input: ZIP with <exact-technique-slug>.png/.jpg/.jpeg/.webp (no folders required).
Output: 480x600 AVIF/WebP pairs plus a private review contact sheet and JSON report.
This script DOES NOT publish the images or mark any technique approved.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import sys
from zipfile import ZipFile

from PIL import Image, ImageDraw, ImageFont, ImageOps, UnidentifiedImageError
import pillow_avif  # noqa: F401; registers the AVIF encoder/decoder

Image.MAX_IMAGE_PIXELS = 24_000_000
ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "src/data/manual-therapy-visual-manifest.json"
ALLOWED = {".png", ".jpg", ".jpeg", ".webp"}
MAX_ORIGINAL_SIZE = 30_000_000
TARGET_WIDTH, TARGET_HEIGHT = 480, 600

def encode(image, fmt, qualities, limit):
    for quality in qualities:
        buffer = io.BytesIO()
        options = {"quality": quality}
        if fmt == "AVIF":
            options["speed"] = 6
        else:
            options["method"] = 6
        image.save(buffer, format=fmt, **options)
        encoded = buffer.getvalue()
        if 1024 <= len(encoded) <= limit:
            return encoded, quality
    raise ValueError(f"{fmt} could not fit the {limit // 1000}KB safety budget")

def process(zip_path, output, report_dir):
    config = json.loads(MANIFEST.read_text(encoding="utf-8"))
    entries = {e["slug"]: e for e in config["entries"]}
    source_files = {}
    with ZipFile(zip_path) as archive:
        for member in archive.infolist():
            if member.is_dir() or member.filename.startswith("__MACOSX/"):
                continue
            name = Path(member.filename)
            if ".." in name.parts or name.is_absolute():
                raise ValueError("Unsafe ZIP path " + member.filename)
            if name.name.lower() in {".ds_store", "thumbs.db"}:
                continue
            if name.suffix.lower() not in ALLOWED:
                raise ValueError("Unexpected file in ZIP: " + member.filename)
            slug = name.stem
            if slug not in entries:
                raise ValueError("Unknown technique filename: " + member.filename)
            if slug in source_files:
                raise ValueError("Duplicate filename/slug: " + slug)
            if member.file_size > MAX_ORIGINAL_SIZE:
                raise ValueError(slug + " is too large to decode safely")
            source_files[slug] = member
        if not source_files:
            raise ValueError("ZIP has no approved technique-named source images")
        seen_sources = {}
        previews = []
        record = []
        output.mkdir(parents=True, exist_ok=True)
        report_dir.mkdir(parents=True, exist_ok=True)
        for slug, entry in entries.items():
            if slug not in source_files:
                continue
            original = archive.read(source_files[slug])
            if len(original) > MAX_ORIGINAL_SIZE:
                raise ValueError(slug + ": excessive decoded source size")
            fingerprint = hashlib.sha256(original).hexdigest()
            if fingerprint in seen_sources:
                raise ValueError(slug + " repeats source image for " + seen_sources[fingerprint])
            seen_sources[fingerprint] = slug
            try:
                with Image.open(io.BytesIO(original)) as raw:
                    if raw.width * raw.height > 24_000_000:
                        raise ValueError("Image dimensions too large: " + slug)
                    clean = ImageOps.exif_transpose(raw).convert("RGB")
                    centering = (entry["crop"]["x"] / 100, entry["crop"]["y"] / 100)
                    cover = ImageOps.fit(clean, (TARGET_WIDTH, TARGET_HEIGHT),
                                         method=Image.Resampling.LANCZOS, centering=centering)
            except (UnidentifiedImageError, OSError) as error:
                raise ValueError(slug + ": invalid image data") from error
            avif, qa = encode(cover, "AVIF", range(56, 22, -5), 65000)
            webp, qw = encode(cover, "WEBP", range(78, 28, -5), 85000)
            (output / (slug + ".avif")).write_bytes(avif)
            (output / (slug + ".webp")).write_bytes(webp)
            thumbnail = cover.resize((180, 225), Image.Resampling.LANCZOS)
            previews.append((slug, thumbnail))
            record.append({"slug": slug, "avifBytes": len(avif), "webpBytes": len(webp),
                           "avifQuality": qa, "webpQuality": qw, "status": entry["status"]})
        if len(previews) == 35 and config["publish"] and all(e["status"] == "approved" for e in entries.values()):
            print("Full approved pack prepared; deployment still requires explicit live flag.")
        else:
            print(f"Staging only: {len(previews)}/35 originals converted; no publishing enabled.")
        canvas_width = 5 * 196
        canvas_height = ((len(previews) + 4) // 5) * 268
        sheet = Image.new("RGB", (canvas_width, max(canvas_height, 268)), "#f6f8fc")
        drawing = ImageDraw.Draw(sheet)
        try:
            font = ImageFont.truetype("DejaVuSans.ttf", 12)
        except OSError:
            font = ImageFont.load_default()
        for index, (slug, thumb) in enumerate(previews):
            x, y = (index % 5) * 196 + 8, (index // 5) * 268 + 8
            sheet.paste(thumb, (x, y))
            drawing.text((x, y + 231), slug[:27], fill="#1a3354", font=font)
        sheet.save(report_dir / "manual-therapy-contact-sheet.jpg", "JPEG", quality=83, optimize=True)
        (report_dir / "manual-therapy-report.json").write_text(
            json.dumps({"count": len(record), "totalBytes": sum(x["avifBytes"] + x["webpBytes"] for x in record),
                        "files": record}, indent=2) + "\n", encoding="utf-8"
        )
        print("Created " + str(len(previews)) + " AVIF + WebP thumbnail pairs and private QA sheet.")

if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--zip", required=True, help="Local path to ZIP containing technique-named source files")
    cli.add_argument("--output", default="public/images/manual-therapy/cards")
    cli.add_argument("--report-dir", default=".manual-visual-preview")
    args = cli.parse_args()
    try:
        process(Path(args.zip), ROOT / args.output, ROOT / args.report_dir)
    except Exception as exc:
        print("ERROR:", exc, file=sys.stderr)
        sys.exit(1)
