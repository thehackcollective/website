"""Jigsaw symbol geometry. Entry point: build.py"""
import math
from pathlib import Path

OUT = Path(__file__).parent
BLUE = "#006bff"  # Vercel --vbg-blue-700, oklch(57.61% 0.2508 258.23)
BLACK = "#0a0a0a"

# Tab geometry in units of the side length S (local frame: s along edge, d outward).
R_HEAD = 0.20   # head radius
D_HEAD = 0.25   # head centre distance from the edge
N_HALF = 0.12   # neck half-width
F_EDGE = 0.06   # fillet radius edge -> neck
F_HEAD = 0.05   # fillet radius neck -> head


def fmt(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def arc_cubics(c, r, a0, a1, steps=None):
    """Circular arc from angle a0 to a1 (radians) as cubic beziers, local frame."""
    sweep = a1 - a0
    n = steps or max(1, math.ceil(abs(sweep) / (math.pi / 2)))
    k = 4 / 3 * math.tan(sweep / n / 4)
    out = []
    for i in range(n):
        t0 = a0 + sweep * i / n
        t1 = a0 + sweep * (i + 1) / n
        p0 = (c[0] + r * math.cos(t0), c[1] + r * math.sin(t0))
        p3 = (c[0] + r * math.cos(t1), c[1] + r * math.sin(t1))
        p1 = (p0[0] - k * r * math.sin(t0), p0[1] + k * r * math.cos(t0))
        p2 = (p3[0] + k * r * math.sin(t1), p3[1] - k * r * math.cos(t1))
        out.append((p1, p2, p3))
    return out


# Gooey profile: no undercut. The edge rises through one S-curve into a head of radius R_HEAD.
G_RISE = 0.12   # height of the S-curve shoulder (head centre sits at this height)
G_RUN = 0.12    # horizontal run of the S-curve shoulder
G_K = 0.6       # S-curve tension (0.55 = near-circular, higher = flatter start)


def tab_profile():
    """Return (start_point, list of cubic segments) in the local frame, left to right."""
    R, h, w, k = R_HEAD, G_RISE, G_RUN, G_K
    start = (-(R + w), 0.0)
    segs = [((-(R + w) + k * w, 0.0), (-R, h - k * h), (-R, h))]          # shoulder S-curve up
    segs += arc_cubics((0.0, h), R, math.pi, 0.0, steps=2)                 # head, clockwise over the top
    segs.append(((R, h - k * h), ((R + w) - k * w, 0.0), (R + w, 0.0)))    # shoulder S-curve down
    return start, segs


def tab_profile_undercut():
    """Classic jigsaw profile with a neck narrower than the head (kept for reference)."""
    # fillet edge->neck, centre (-(N+F), F), from angle -90deg (on edge) to 0deg (on neck line)
    c1 = (-(N_HALF + F_EDGE), F_EDGE)
    # fillet neck->head: tangent to line s=-N and externally tangent to the head circle
    c2s = -(N_HALF + F_HEAD)
    c2d = D_HEAD - math.sqrt((R_HEAD + F_HEAD) ** 2 - c2s**2)
    c2 = (c2s, c2d)
    # tangent point on head circle, angle from head centre toward c2
    ang = math.atan2(c2[1] - D_HEAD, c2[0])  # negative (below-left)
    head_c = (0.0, D_HEAD)
    segs = []
    start = (c1[0], 0.0)
    segs += arc_cubics(c1, F_EDGE, -math.pi / 2, 0)                      # concave shoulder
    segs.append((( -N_HALF, F_EDGE), (-N_HALF, c2d), (-N_HALF, c2d)))     # neck line (degenerate cubic)
    segs += arc_cubics(c2, F_HEAD, 0, ang + math.pi)                     # fillet to head (concave)
    segs += arc_cubics(head_c, R_HEAD, ang + 2 * math.pi, -math.pi - ang, steps=4)  # head, clockwise over the top
    segs_right = []
    c2r = (-c2s, c2d)
    segs_right += arc_cubics(c2r, F_HEAD, -ang, math.pi)                 # fillet back to neck
    segs_right.append(((N_HALF, c2d), (N_HALF, F_EDGE), (N_HALF, F_EDGE)))
    segs_right += arc_cubics((-c1[0], F_EDGE), F_EDGE, math.pi, 3 * math.pi / 2)
    return start, segs + segs_right


def side_with_tab(P, Q, outward, sign, S):
    (px, py), (qx, qy) = P, Q
    mx, my = (px + qx) / 2, (py + qy) / 2
    ux, uy = (qx - px), (qy - py)
    L = math.hypot(ux, uy)
    ux, uy = ux / L, uy / L
    nx, ny = outward

    def m(p):
        s, d = p
        return (mx + ux * s * S + nx * d * S * sign, my + uy * s * S + ny * d * S * sign)

    start, segs = tab_profile()
    a = m(start)
    cmds = [f"L {fmt(a[0])} {fmt(a[1])}"]
    for c1, c2, p in segs:
        a, b, c = m(c1), m(c2), m(p)
        cmds.append(f"C {fmt(a[0])} {fmt(a[1])} {fmt(b[0])} {fmt(b[1])} {fmt(c[0])} {fmt(c[1])}")
    cmds.append(f"L {fmt(qx)} {fmt(qy)}")
    return cmds


def symbol_bbox(S=144, canvas=256, r=22, centre="mass"):
    w = S * (1 + G_RISE + R_HEAD)
    dx, dy = mass_offset(S, r) if centre == "mass" else (0.0, 0.0)
    return (canvas - w) / 2 - dx, (canvas - S) / 2 - dy, w, S


def _raw_piece_path(x0, y0, S, r):
    x1, y1 = x0 + S, y0 + S
    d = [f"M {fmt(x0 + r)} {fmt(y0)}", f"L {fmt(x1 - r)} {fmt(y0)}", f"A {r} {r} 0 0 1 {fmt(x1)} {fmt(y0 + r)}"]
    d += side_with_tab((x1, y0 + r), (x1, y1 - r), (1, 0), +1, S)   # right: knob
    d.append(f"A {r} {r} 0 0 1 {fmt(x1 - r)} {fmt(y1)}")
    d += side_with_tab((x1 - r, y1), (x0 + r, y1), (0, 1), -1, S)   # bottom: socket
    d.append(f"A {r} {r} 0 0 1 {fmt(x0)} {fmt(y1 - r)}")
    d.append(f"L {fmt(x0)} {fmt(y0 + r)}")
    d.append(f"A {r} {r} 0 0 1 {fmt(x0 + r)} {fmt(y0)}")
    d.append("Z")
    return " ".join(d)


def mass_offset(S, r):
    """(dx, dy) from the bbox centre to the ink centroid, so callers can centre on mass."""
    import io
    import cairosvg
    from PIL import Image
    scale = 4
    w = S * (1 + G_RISE + R_HEAD)
    raw = _raw_piece_path(0, 0, S, r)
    png = cairosvg.svg2png(
        bytestring=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {S}" width="{w*scale}" height="{S*scale}"><path d="{raw}"/></svg>'.encode()
    )
    im = Image.open(io.BytesIO(png)).convert("RGBA").getchannel("A")
    W, H = im.size
    px = im.load()
    m = sx = sy = 0
    for y in range(H):
        for x in range(W):
            v = px[x, y]
            if v:
                m += v
                sx += v * (x + 0.5)
                sy += v * (y + 0.5)
    cx, cy = sx / m / scale, sy / m / scale
    return cx - w / 2, cy - S / 2


def piece_path(S=144, r=22, canvas=256, centre="mass"):
    """Jigsaw piece on a square canvas, centred on its centre of mass (default) or its bbox."""
    w = S * (1 + G_RISE + R_HEAD)
    dx, dy = mass_offset(S, r) if centre == "mass" else (0.0, 0.0)
    x0 = (canvas - w) / 2 - dx
    y0 = (canvas - S) / 2 - dy
    return _raw_piece_path(x0, y0, S, r)


def svg(body, size=256, bg=None, title="The Hack Collective"):
    rect = f'<rect width="{size}" height="{size}" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="{title}">'
        f"{rect}{body}</svg>\n"
    )

