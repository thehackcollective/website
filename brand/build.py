"""Build every brand asset into public/. Run: python3 brand/build.py"""
import io
import json
import shutil
from pathlib import Path

import cairosvg
from PIL import Image

from build_lockup import horizontal, stacked, wordmark_only
from build_mark import BLACK, BLUE, piece_path, svg

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
BRAND = PUBLIC / "brand"
INK = "#171717"
WHITE = "#ffffff"
ICON_SIZES = (32, 64, 128, 192, 256, 512)
OG_W, OG_H = 1200, 630


def png(svg_text, width, height=None):
    return cairosvg.svg2png(bytestring=svg_text.encode(), output_width=width, output_height=height or width)


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data if isinstance(data, bytes) else data.encode())


def og(lockup_svg, bg):
    """1200x630 card: lockup centred, 56% of the width."""
    lock = Image.open(io.BytesIO(png(lockup_svg, int(OG_W * 0.56)))).convert("RGBA")
    card = Image.new("RGBA", (OG_W, OG_H), bg)
    card.alpha_composite(lock, ((OG_W - lock.width) // 2, (OG_H - lock.height) // 2))
    out = io.BytesIO()
    card.convert("RGB").save(out, "PNG", optimize=True)
    return out.getvalue()


def main():
    if BRAND.exists():
        shutil.rmtree(BRAND)
    d = piece_path()
    icon = svg(f'<path fill="{BLUE}" d="{d}"/>')
    icon_white = svg(f'<path fill="{WHITE}" d="{d}"/>')
    icon_black = svg(f'<path fill="#000000" d="{d}"/>')
    icon_on_blue = svg(f'<path fill="{WHITE}" d="{d}"/>', bg=BLUE)
    icon_on_black = svg(f'<path fill="{WHITE}" d="{d}"/>', bg=BLACK)
    favicon = svg(f'<path fill="{BLUE}" d="{piece_path(S=160, r=24)}"/>')

    # Symbol
    write(BRAND / "icon.svg", icon)
    write(BRAND / "icon-white.svg", icon_white)
    write(BRAND / "icon-black.svg", icon_black)
    write(BRAND / "icon-on-blue.svg", icon_on_blue)
    write(BRAND / "icon-on-black.svg", icon_on_black)
    for s in ICON_SIZES:
        write(BRAND / f"icon-{s}.png", png(icon, s))
        write(BRAND / f"icon-white-{s}.png", png(icon_white, s))
    write(BRAND / "icon-on-blue-512.png", png(icon_on_blue, 512))
    write(BRAND / "icon-on-blue-1024.png", png(icon_on_blue, 1024))

    # Wordmark and lockups
    write(BRAND / "wordmark.svg", wordmark_only(INK))
    write(BRAND / "wordmark-white.svg", wordmark_only(WHITE))
    write(BRAND / "lockup.svg", horizontal(BLUE, INK))
    write(BRAND / "lockup-white.svg", horizontal(WHITE))
    write(BRAND / "lockup-black.svg", horizontal("#000000"))
    write(BRAND / "lockup-stacked.svg", stacked(BLUE, INK))
    write(BRAND / "lockup-stacked-white.svg", stacked(WHITE))
    write(BRAND / "lockup-1200.png", png(horizontal(BLUE, INK), 1200))
    write(BRAND / "lockup-white-1200.png", png(horizontal(WHITE), 1200))

    # Open Graph
    write(BRAND / "og.png", og(horizontal(BLUE, INK), WHITE))
    write(BRAND / "og-dark.png", og(horizontal(WHITE), BLACK))

    # Browser conventions at the root
    write(PUBLIC / "favicon.svg", favicon)
    frames = [Image.open(io.BytesIO(png(favicon, s))) for s in (16, 32, 48)]
    ico = io.BytesIO()
    frames[0].save(ico, "ICO", sizes=[(f.width, f.height) for f in frames], append_images=frames[1:])
    write(PUBLIC / "favicon.ico", ico.getvalue())
    write(PUBLIC / "apple-touch-icon.png", png(icon_on_blue, 180))
    write(
        PUBLIC / "site.webmanifest",
        json.dumps(
            {
                "name": "The Hack Collective",
                "short_name": "Hack Collective",
                "icons": [
                    {"src": "/brand/icon-192.png", "sizes": "192x192", "type": "image/png"},
                    {"src": "/brand/icon-512.png", "sizes": "512x512", "type": "image/png"},
                    {"src": "/brand/icon-on-blue-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
                ],
                "theme_color": BLUE,
                "background_color": WHITE,
                "display": "browser",
            },
            indent=2,
        )
        + "\n",
    )
    print(f"wrote {len(list(BRAND.iterdir()))} files to {BRAND.relative_to(ROOT)} + favicon.svg, favicon.ico, apple-touch-icon.png, site.webmanifest")


if __name__ == "__main__":
    main()
