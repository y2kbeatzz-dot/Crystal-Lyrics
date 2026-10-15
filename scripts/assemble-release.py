#!/usr/bin/env python3
"""Assemble and checksum the official CrystalLyrics ZIP from GitHub Pages-safe parts."""
import argparse
import base64
import hashlib
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / 'docs' / 'downloads'
PARTS = 8
EXPECTED_SHA256 = '70fed8ffbf053e2e08fdf6eb2febb282020e493db29dcbb256de8c97b6f7c8ed'


def build(output: Path) -> None:
    encoded = ''.join((SOURCE_DIR / f'part-{idx:02}.b64').read_text(encoding='ascii').strip()
                      for idx in range(1, PARTS + 1))
    data = base64.b64decode(encoded, validate=True)
    digest = hashlib.sha256(data).hexdigest()
    if digest != EXPECTED_SHA256:
        raise RuntimeError(f'Archive checksum mismatch: {digest}')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(data)
    with ZipFile(output) as zip_file:
        bad = zip_file.testzip()
        if bad:
            raise RuntimeError(f'Corrupt release entry: {bad}')
        if 'CrystalLyrics/manifest.json' not in zip_file.namelist():
            raise RuntimeError('Release manifest is missing')
    print(f'Created {output} ({len(data):,} bytes, verified SHA256: {digest})')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--output', type=Path, default=ROOT / 'dist' / 'CrystalLyrics-v1.4.zip')
    opts = ap.parse_args()
    build(opts.output)
