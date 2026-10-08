import { HL } from "@/lib/hairline-kernel.js";

/**
 * Assemble: eight copies of one jigsaw piece lie scattered and crooked on a
 * thin plinth, one of them already seated in a 4 x 2 solve and bright. The
 * nearer the pointer comes to the centre of the plinth, the more pieces slide,
 * turn and drop into their places, the ones nearest the centre first; far away
 * they drift back to the heap. The pieces lock because each is the same piece
 * turned a quarter at a time: knob into socket, flat against flat. The slider
 * is the reach, in world units: how far from the centre the solve begins.
 *
 * The pattern: a field, read as a count. The pointer sets a distance on the
 * ground plane, which never moves; each piece has its own threshold on it.
 */
const { Cam, clamp, facing, fit, lerp, mk, poly, prism, proj, put, rad, reducedMotion, register, rings, ringAt, solid, spring, stepS, pointer, disposer, unproj } = HL;

const TH = 3.4, PL = 3, PX = 66, PY = 46;
// the piece as a ring of samples [u, v, nu, nv] about its body centre, and its crease ring, inset 1.3
const OUTER = [[-6.4,-9.0,-0.014,-1.0],[6.4,-9.0,0.014,-1.0],[7.39,-8.8,0.383,-0.924],[8.24,-8.24,0.707,-0.707],[8.8,-7.39,0.924,-0.383],[9.0,-6.4,0.993,-0.12],[9.0,-5.76,0.997,-0.073],[9.1,-5.04,0.96,-0.28],[9.39,-4.44,0.818,-0.575],[9.84,-3.99,0.575,-0.818],[10.44,-3.7,0.28,-0.96],[11.16,-3.6,0.15,-0.989],[12.3,-3.42,0.31,-0.951],[13.29,-2.91,0.589,-0.808],[14.07,-2.13,0.808,-0.589],[14.58,-1.14,0.951,-0.31],[14.76,0.0,1.0,-0.0],[14.58,1.14,0.951,0.31],[14.07,2.13,0.808,0.589],[13.29,2.91,0.589,0.808],[12.3,3.42,0.31,0.951],[11.16,3.6,0.15,0.989],[10.44,3.7,0.28,0.96],[9.84,3.99,0.575,0.818],[9.39,4.44,0.818,0.575],[9.1,5.04,0.96,0.28],[9.0,5.76,0.997,0.073],[9.0,6.4,0.993,0.12],[8.8,7.39,0.924,0.383],[8.24,8.24,0.707,0.707],[7.39,8.8,0.383,0.924],[6.4,9.0,0.12,0.993],[5.76,9.0,-0.073,0.997],[5.04,8.9,-0.28,0.96],[4.44,8.61,-0.575,0.818],[3.99,8.16,-0.818,0.575],[3.7,7.56,-0.96,0.28],[3.6,6.84,-0.989,0.15],[3.42,5.7,-0.951,0.31],[2.91,4.71,-0.808,0.589],[2.13,3.93,-0.589,0.808],[1.14,3.42,-0.31,0.951],[0.0,3.24,0.0,1.0],[-1.14,3.42,0.31,0.951],[-2.13,3.93,0.589,0.808],[-2.91,4.71,0.808,0.589],[-3.42,5.7,0.951,0.31],[-3.6,6.84,0.989,0.15],[-3.7,7.56,0.96,0.28],[-3.99,8.16,0.818,0.575],[-4.44,8.61,0.575,0.818],[-5.04,8.9,0.28,0.96],[-5.76,9.0,0.073,0.997],[-6.4,9.0,-0.12,0.993],[-7.39,8.8,-0.383,0.924],[-8.24,8.24,-0.707,0.707],[-8.8,7.39,-0.924,0.383],[-9.0,6.4,-1.0,0.014],[-9.0,-6.4,-1.0,-0.014],[-8.8,-7.39,-0.924,-0.383],[-8.24,-8.24,-0.707,-0.707],[-7.39,-8.8,-0.383,-0.924]];
const INNER = [[-6.3,-7.7,-0.008,-1.0],[6.3,-7.7,0.008,-1.0],[6.84,-7.59,0.383,-0.924],[7.29,-7.29,0.707,-0.707],[7.59,-6.84,0.924,-0.383],[7.7,-6.3,0.998,-0.056],[7.7,-4.93,0.999,-0.043],[7.79,-4.31,0.96,-0.281],[8.03,-3.8,0.818,-0.576],[8.42,-3.41,0.576,-0.818],[8.93,-3.17,0.281,-0.96],[9.55,-3.08,0.151,-0.989],[10.52,-2.92,0.311,-0.95],[11.37,-2.49,0.59,-0.808],[12.04,-1.82,0.808,-0.59],[12.47,-0.97,0.95,-0.311],[12.63,0.0,1.0,-0.0],[12.47,0.97,0.95,0.311],[12.04,1.82,0.808,0.59],[11.37,2.49,0.59,0.808],[10.52,2.92,0.311,0.95],[9.55,3.08,0.151,0.989],[8.93,3.17,0.281,0.96],[8.42,3.41,0.576,0.818],[8.03,3.8,0.818,0.576],[7.79,4.31,0.96,0.281],[7.7,4.93,0.999,0.043],[7.7,6.3,0.998,0.056],[7.59,6.84,0.924,0.383],[7.29,7.29,0.707,0.707],[6.84,7.59,0.383,0.924],[6.3,7.7,0.056,0.998],[4.93,7.7,-0.043,0.999],[4.31,7.61,-0.281,0.96],[3.8,7.37,-0.576,0.818],[3.41,6.98,-0.818,0.576],[3.17,6.47,-0.96,0.281],[3.08,5.85,-0.989,0.151],[2.92,4.88,-0.95,0.311],[2.49,4.03,-0.808,0.59],[1.82,3.36,-0.59,0.808],[0.97,2.93,-0.311,0.95],[0.0,2.77,0.0,1.0],[-0.97,2.93,0.311,0.95],[-1.82,3.36,0.59,0.808],[-2.49,4.03,0.808,0.59],[-2.92,4.88,0.95,0.311],[-3.08,5.85,0.989,0.151],[-3.17,6.47,0.96,0.281],[-3.41,6.98,0.818,0.576],[-3.8,7.37,0.576,0.818],[-4.31,7.61,0.281,0.96],[-4.93,7.7,0.043,0.999],[-6.3,7.7,-0.056,0.998],[-6.84,7.59,-0.383,0.924],[-7.29,7.29,-0.707,0.707],[-7.59,6.84,-0.924,0.383],[-7.7,6.3,-1.0,0.008],[-7.7,-6.3,-1.0,-0.008],[-7.59,-6.84,-0.924,-0.383],[-7.29,-7.29,-0.707,-0.707],[-6.84,-7.59,-0.383,-0.924]];
// [seated x, y, turn] then [scattered x, y, turn, lift]; the solve is one piece turned 0, 90, 270, 180
const T = [
  [-27, -9, 0, -27, -9, 0, 0], [-9, -9, 90, -6, -32, 38, 0], [9, -9, 0, 34, -30, -24, 3], [27, -9, 90, 46, 2, 61, 0],
  [-27, 9, 270, -46, 20, -47, 0], [-9, 9, 180, -22, 31, 22, 5], [9, 9, 270, 12, 29, -70, 0], [27, 9, 180, 40, 27, 17, 0],
];
const RISE_K = [96, 88, 80], FALL_K = 42, LAG = [0, 0, 120, 260, 300, 200, 160, 280], TH0 = [0, 0.04, 0.16, 0.3, 0.4, 0.22, 0.1, 0.34];

/** The piece about (x, y), turned a degrees, carrying its normals round. */
function piece(ring, x, y, a) {
  const c = Math.cos(rad(a)), s = Math.sin(rad(a));
  return ring.map(([u, v, nu, nv]) => ({ u: x + u * c - v * s, v: y + u * s + v * c, nu: nu * c - nv * s, nv: nu * s + nv * c }));
}

// the knob side and the socket side of OUTER: once two neighbours are both seated, the sides between them are not drawn
const HALF = 9, KNOB = OUTER.map(([u]) => u >= HALF - 0.01), SOCKET = OUTER.map(([u, v]) => v >= HALF - 0.01 || (v > 0 && Math.abs(u) < HALF * 0.75));
// which piece each one's knob goes into, and whose knob fills its socket
const INTO = [1, 5, 3, 7, 0, 4, 2, 6], FROM = [4, 0, 6, 2, 5, 1, 7, 3];

/** A solid whose lid is a concave outline: the side silhouette is the outline's own, not its hull, so the socket stays open and the knob keeps its neck. A seated piece shows no wall at its joints. */
function pieceSolid(P, front, ring, inner, z0, z1, hideKnob, hideSocket) {
  const top = ringAt(P, ring, z1), bot = ringAt(P, ring, z0), n = ring.length, side = [];
  const f = ring.map((q, i) => front(q) && !(hideKnob && KNOB[i]) && !(hideSocket && SOCKET[i]));
  for (let i = 0; i < n; i++) {
    const was = f[(i + n - 1) % n];
    if (f[i]) { if (!was) side.push(top[i]); side.push(bot[i]); } else { if (was) side.push(bot[i]); side.push(top[i]); }
  }
  return { sil: poly(side) + poly(top), crease: poly(ringAt(P, inner, z1)) };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value, q = 0;

  const C = Cam(45, 0.5, 2.55);
  fit(C, [[-PX, -PY, -PL], [PX, -PY, -PL], [PX, PY, -PL], [-PX, PY, -PL], [0, 0, 14]], 200, 160);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the plinth, painted first: a thin plate the whole solve happens on
  const [pr, pin] = rings(-PX, -PY, PX, PY, 7, 1.6);
  put(solid(g), prism(P, front, pr, pin, -PL, 0));

  const tiles = T.map((t, i) => ({
    i, t, el: solid(mk("g", {}, g)), th: TH0[i],
    sp: spring(i === 0 ? 1 : 0, { k: RISE_K[i % 3], c: 13, eps: 0.002 }),
    want: i === 0 ? 1 : 0, wait: 0, falling: false, key: "", k: 0,
  }));
  tiles[0].el.sil.classList.add("hi");

  function pose(tl) {
    const s = tl.sp.x, [sx, sy, sa, x0, y0, a0, z0] = tl.t, w = clamp(s, 0, 1), hop = 28 * w * (1 - w);
    return { x: lerp(x0, sx, s), y: lerp(y0, sy, s), a: lerp(a0, sa, s), z: Math.max(0, lerp(z0, 0, w) + hop) };
  }
  function draw(tl) {
    const p = pose(tl), seated = (t) => t.sp.x > 0.92, hk = seated(tl) && seated(tiles[INTO[tl.i]]), hs = seated(tl) && seated(tiles[FROM[tl.i]]);
    const key = [p.x, p.y, p.a, p.z, hk ? 1 : 0, hs ? 1 : 0].map((v) => v.toFixed(2)).join();
    tl.k = p.x + p.y + 6 * p.z;
    if (key === tl.key) return;
    tl.key = key;
    put(tl.el, pieceSolid(P, front, piece(OUTER, p.x, p.y, p.a), piece(INNER, p.x, p.y, p.a), p.z, p.z + TH, hk, hs));
  }

  let order = "";
  function paintOrder() {
    const seq = tiles.slice().sort((a, b) => a.k - b.k), id = seq.map((t) => t.i).join();
    if (id === order) return;
    order = id;
    for (const t of seq) g.appendChild(t.el.g);
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const tl of tiles) {
      if (tl.wait > 0) { tl.wait -= dt * 1000; m = true; if (tl.wait <= 0) tl.sp.t = tl.want; }
      if (stepS(tl.sp, dt)) m = true;
      draw(tl);
    }
    paintOrder();
    return m;
  });
  bag.add(B.unregister);

  function retarget() {
    let n = 0;
    for (const tl of tiles) {
      const s = tl.i === 0 ? 1 : clamp((q - tl.th) / 0.24, 0, 1);
      if (s > tl.want) { tl.falling = false; tl.wait = 0; tl.want = s; tl.sp.k = RISE_K[tl.i % 3]; tl.sp.c = 13; tl.sp.t = s; }
      else if (s < tl.want) {
        // the return is softer, near-critical, and the outer pieces let go first
        if (!tl.falling) { tl.falling = true; tl.wait = reducedMotion() ? 0 : LAG[tl.i]; tl.sp.k = FALL_K; tl.sp.c = 2 * Math.sqrt(FALL_K); }
        tl.want = s;
        if (tl.wait <= 0) tl.sp.t = s;
      }
      if (s > 0.5) n++;
    }
    read.textContent = q <= 0 ? "rest" : `joined ${n}·${tiles.length}`;
    B.wake();
  }

  /** How far the solve has come: 0 at the reach and beyond, 1 at the centre. */
  const resolve = (d) => { const u = clamp((reach - d) / (reach - 14), 0, 1); return u * u * (3 - 2 * u); };
  bag.add(pointer(stage, {
    move: (p) => { const [x, y] = unproj(C, p[0], p[1], 0); q = resolve(Math.hypot(x, y)); retarget(); },
    leave: () => { q = 0; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  for (const tl of tiles) draw(tl);
  paintOrder();
  read.textContent = "rest";

  return { set: (v) => { reach = v; }, destroy: bag.dispose };
}

export const MEANS = "Scattered copies of one jigsaw piece slide into a solve as the pointer nears the centre.";
export const RANGE = [48, 72, 110];
export const TOUR = [[300, 230], [200, 160], [110, 110], null];
export { mount };
