#!/usr/bin/env python3
"""Patch the verified 1.4.0 base archive with the current 1.4.1 fullscreen fix.

The original release archive is rebuilt and SHA256-verified by assemble-release.py.
This step replaces only maintained first-party extension files.
"""
import argparse
import json
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    f'CrystalLyrics/{name}': ROOT / 'extension' / 'CrystalLyrics' / name
    for name in ('content.js', 'manifest.json', 'README.md')
}
VERSION = '1.4.1'
LAUNCHER_FIX = 'launcher.hidden = !collapsed || Boolean(document.fullscreenElement);'


def build(base: Path, output: Path) -> None:
    if base.resolve() == output.resolve():
        raise ValueError('Base archive and output must be separate files.')
    with ZipFile(base) as src:
        existing = set(src.namelist())
        missing = set(FILES) - existing
        if missing:
            raise RuntimeError(f'Missing base entries: {sorted(missing)}')
        output.parent.mkdir(parents=True, exist_ok=True)
        with ZipFile(output, 'w') as dst:
            for entry in src.infolist():
                data = FILES[entry.filename].read_bytes() if entry.filename in FILES else src.read(entry)
                dst.writestr(entry, data)

    with ZipFile(output) as z:
        bad = z.testzip()
        if bad:
            raise RuntimeError(f'Corrupt archive entry: {bad}')
        manifest = json.loads(z.read('CrystalLyrics/manifest.json'))
        if manifest.get('version') != VERSION:
            raise RuntimeError(f'Expected extension version {VERSION}')
        content = z.read('CrystalLyrics/content.js').decode('utf-8')
        if LAUNCHER_FIX not in content:
            raise RuntimeError('Fullscreen launcher fix is missing.')
        if "document.addEventListener('fullscreenchange'" not in content:
            raise RuntimeError('Fullscreen event listener is missing.')
        if "overlayHost.hidden = !settings.enabled" not in content:
            raise RuntimeError('Expected lyric overlay logic is missing.')
    print(f'Created {output} ({output.stat().st_size:,} bytes); v{VERSION} validated.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist' / 'CrystalLyrics-v1.4.1.zip')
    args = parser.parse_args()
    build(args.base, args.output)
