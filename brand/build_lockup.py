"""Geist wordmark outlines and lockups. Entry point: build.py"""
import re
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

from build_mark import BLACK, BLUE, fmt, piece_path, symbol_bbox

OUT = Path(__file__).parent
FONT = OUT / "fonts" / "Geist-Medium.ttf"
WORD = "The Hack Collective"


def kern_pairs(font):
    """Flatten GPOS PairPos lookups into {(left, right): xAdvance}."""
    pairs = {}
    if "GPOS" not in font:
        return pairs
    for lookup in font["GPOS"].table.LookupList.Lookup:
        for sub in lookup.SubTable:
            if getattr(sub, "LookupType", lookup.LookupType) == 9:
                sub = sub.ExtSubTable
            if sub.LookupType != 2:
                continue
            if sub.Format == 1:
                for g1, ps in zip(sub.Coverage.glyphs, sub.PairSet):
                    for rec in ps.PairValueRecord:
                        v = rec.Value1.XAdvance if rec.Value1 and hasattr(rec.Value1, "XAdvance") else 0
                        pairs.setdefault((g1, rec.SecondGlyph), v)
            elif sub.Format == 2:
                c1 = sub.ClassDef1.classDefs
                c2 = sub.ClassDef2.classDefs
                cov = set(sub.Coverage.glyphs)
                by_class1 = {}
                for g in cov:
                    by_class1.setdefault(c1.get(g, 0), []).append(g)
                by_class2 = {}
                for g in font.getGlyphOrder():
                    by_class2.setdefault(c2.get(g, 0), []).append(g)
                for i, c1rec in enumerate(sub.Class1Record):
                    for j, c2rec in enumerate(c1rec.Class2Record):
                        v = c2rec.Value1
                        v = v.XAdvance if v and hasattr(v, "XAdvance") else 0
                        if not v:
                            continue
                        for g1 in by_class1.get(i, []):
                            for g2 in by_class2.get(j, []):
                                pairs.setdefault((g1, g2), v)
    return pairs


def wordmark_path(text, size, tracking=0.0):
    """Return (path_d, width, cap_height) for text set at `size` px, baseline at y=0."""
    font = TTFont(FONT)
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    upm = font["head"].unitsPerEm
    scale = size / upm
    kern = kern_pairs(font)
    glyphs = [cmap[ord(ch)] for ch in text]
    pen = SVGPathPen(gs, ntos=lambda v: fmt(v))
    x = 0.0
    for i, g in enumerate(glyphs):
        tp = TransformPen(pen, (scale, 0, 0, -scale, x, 0))
        gs[g].draw(tp)
        adv = gs[g].width * scale
        if i + 1 < len(glyphs):
            adv += kern.get((g, glyphs[i + 1]), 0) * scale
        x += adv + tracking * size
    cap = font["OS/2"].sCapHeight * scale
    return pen.getCommands(), x, cap


def symbol_path_scaled(height, x, y):
    """Symbol path translated so its bbox is `height` tall with top-left at (x, y)."""
    d = piece_path()
    bx0, by0, bw, bh = symbol_bbox()
    s = height / bh
    cmds = re.findall(r"[MLCAZ][^MLCAZ]*", d)
    res = []
    for c in cmds:
        op, rest = c[0], re.findall(r"[-+]?\d*\.?\d+", c[1:])
        vals = [float(v) for v in rest]
        if op == "A":
            rx, ry, rot, laf, sf, px, py = vals
            res.append(f"A {fmt(rx*s)} {fmt(ry*s)} {rot:g} {int(laf)} {int(sf)} {fmt(x+(px-bx0)*s)} {fmt(y+(py-by0)*s)}")
        elif op == "Z":
            res.append("Z")
        else:
            pts = [f"{fmt(x+(vals[k]-bx0)*s)} {fmt(y+(vals[k+1]-by0)*s)}" for k in range(0, len(vals), 2)]
            res.append(f"{op} " + " ".join(pts))
    return " ".join(res), bw * s


def horizontal(fill, word_fill=None, bg=None):
    word_fill = word_fill or fill
    H = 256
    cap = 72.0           # wordmark cap height in px
    size = cap / 0.71    # Geist cap height ratio (sCapHeight/upm), refined below
    d_word, w_word, cap_real = wordmark_path(WORD, size)
    size *= cap / cap_real
    d_word, w_word, cap_real = wordmark_path(WORD, size)
    sym_h = cap * 1.25
    gap = cap * 0.5
    pad = 32
    d_sym, sym_w = symbol_path_scaled(sym_h, pad, (H - sym_h) / 2)
    baseline = (H + cap) / 2
    W = pad + sym_w + gap + w_word + pad
    word = f'<path fill="{word_fill}" transform="translate({fmt(pad + sym_w + gap)} {fmt(baseline)})" d="{d_word}"/>'
    rect = f'<rect width="{fmt(W)}" height="{H}" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(W)} {H}" role="img" aria-label="The Hack Collective">'
        f'{rect}<path fill="{fill}" d="{d_sym}"/>{word}</svg>\n'
    )


def stacked(fill, word_fill=None, bg=None):
    word_fill = word_fill or fill
    W = 512
    cap = 30.0
    size = cap / 0.71
    d_word, w_word, cap_real = wordmark_path(WORD, size)
    size *= cap / cap_real
    d_word, w_word, cap_real = wordmark_path(WORD, size)
    sym_h = 160
    gap = 36
    pad = 56
    H = pad + sym_h + gap + cap + pad
    d_sym, sym_w = symbol_path_scaled(sym_h, (W - symbol_bbox()[2]) / 2, pad)
    word = f'<path fill="{word_fill}" transform="translate({fmt((W - w_word) / 2)} {fmt(pad + sym_h + gap + cap)})" d="{d_word}"/>'
    rect = f'<rect width="{W}" height="{fmt(H)}" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {fmt(H)}" role="img" aria-label="The Hack Collective">'
        f'{rect}<path fill="{fill}" d="{d_sym}"/>{word}</svg>\n'
    )


def wordmark_only(fill, bg=None):
    cap = 72.0
    size = cap / 0.71
    d_word, w_word, cap_real = wordmark_path(WORD, size)
    size *= cap / cap_real
    d_word, w_word, _ = wordmark_path(WORD, size)
    pad = 32
    H = 256
    W = w_word + 2 * pad
    rect = f'<rect width="{fmt(W)}" height="{H}" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(W)} {H}" role="img" aria-label="The Hack Collective">'
        f'{rect}<path fill="{fill}" transform="translate({pad} {fmt((H + cap) / 2)})" d="{d_word}"/></svg>\n'
    )

