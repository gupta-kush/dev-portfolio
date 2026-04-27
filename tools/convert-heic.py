"""Decode HEIC/HEIF files in a directory and write JPEG copies alongside.

Used because sharp's prebuilt libvips on Windows doesn't include the HEVC
plugin, so the JS importer can't decode them. Run this once before the
Node importer; it leaves the originals in place and adds .jpeg siblings
that import-photos.mjs will then consume.

Usage:
  python tools/convert-heic.py <srcDir> [<destDir>]

If destDir is omitted, JPEGs are written next to the originals.
"""

import sys
import os
from pathlib import Path

from pillow_heif import register_heif_opener
from PIL import Image, ImageOps

register_heif_opener()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    src = Path(sys.argv[1])
    dest = Path(sys.argv[2]) if len(sys.argv) > 2 else src
    dest.mkdir(parents=True, exist_ok=True)

    HEIC_EXT = {".heic", ".heif"}
    files = sorted(p for p in src.iterdir() if p.suffix.lower() in HEIC_EXT)
    if not files:
        print(f"No HEIC/HEIF files in {src}")
        return

    for p in files:
        out = dest / (p.stem + ".jpeg")
        try:
            with Image.open(p) as im:
                # EXIF orientation may be present in HEIC; bake it into pixels.
                im = ImageOps.exif_transpose(im)
                if im.mode != "RGB":
                    im = im.convert("RGB")
                im.save(out, "JPEG", quality=92, optimize=True)
            print(f"  {p.name}  {im.size[0]}x{im.size[1]}  →  {out.name}")
        except Exception as exc:
            print(f"  ! {p.name}: {exc}")


if __name__ == "__main__":
    main()
