const HALF_THICKNESS = 0.18;
const BOX_HALF = 0.72;
const BOX_RADIUS = 0.11;
const KNOB_X = 0.89;
const KNOB_R = 0.29;
const SOCKET_Y = -0.55;
const SOCKET_R = 0.29;
const SMOOTH_K = 0.12;
const BEVEL = 0.06;
const MAX_STEPS = 48;
const EPS = 0.004;
const MAX_DIST = 6;
const TILT = -0.55;
const TWIST = Math.PI / 4;
const RAMP = ".,-~:;=!*#$@";
const LIGHT_X = 0.35;
const LIGHT_Y = 0.6;
const LIGHT_Z = 0.72;
const VIEW_FRACTION = 0.95;
const BOUND_RADIUS = 1.2;
const CAM_DIST = 3;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function smin(a: number, b: number, k: number) {
  const h = Math.min(Math.max(0.5 + (0.5 * (b - a)) / k, 0), 1);
  return b * (1 - h) + a * h - k * h * (1 - h);
}

function sd2(x: number, y: number) {
  const qx = Math.abs(x) - (BOX_HALF - BOX_RADIUS);
  const qy = Math.abs(y) - (BOX_HALF - BOX_RADIUS);
  const box =
    Math.min(Math.max(qx, qy), 0) +
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) -
    BOX_RADIUS;
  const knob = Math.hypot(x - KNOB_X, y) - KNOB_R;
  const socket = Math.hypot(x, y - SOCKET_Y) - SOCKET_R;
  const body = smin(box, knob, SMOOTH_K);
  return -smin(-body, socket, SMOOTH_K);
}

function sdPiece(x: number, y: number, z: number) {
  const d2 = sd2(x, y);
  const wz = Math.abs(z) - HALF_THICKNESS;
  return (
    Math.min(Math.max(d2, wz), 0) +
    Math.hypot(Math.max(d2, 0), Math.max(wz, 0)) -
    BEVEL
  );
}

export function renderFrame(angle: number, cols: number, rows: number) {
  const cy = Math.cos(angle);
  const sy = Math.sin(angle);
  const cx = Math.cos(TILT);
  const sx = Math.sin(TILT);
  const cz = Math.cos(TWIST);
  const sz = Math.sin(TWIST);

  const m00 = cz * cy - sz * sx * sy;
  const m01 = -sz * cx;
  const m02 = cz * sy + sz * sx * cy;
  const m10 = sz * cy + cz * sx * sy;
  const m11 = cz * cx;
  const m12 = sz * sy - cz * sx * cy;
  const m20 = -cx * sy;
  const m21 = sx;
  const m22 = cx * cy;

  const dirX = -m20;
  const dirY = -m21;
  const dirZ = -m22;

  const step = (2 * BOUND_RADIUS) / VIEW_FRACTION / rows;
  const xStep = step * 2;
  const height = rows * step;
  const width = cols * xStep;
  const lines: string[] = new Array(rows);

  for (let row = 0; row < rows; row++) {
    const v = (0.5 - (row + 0.5) / rows) * height;
    let line = "";
    for (let col = 0; col < cols; col++) {
      const u = ((col + 0.5) / cols - 0.5) * width;

      const ox = m00 * u + m10 * v + m20 * CAM_DIST;
      const oy = m01 * u + m11 * v + m21 * CAM_DIST;
      const oz = m02 * u + m12 * v + m22 * CAM_DIST;

      let t = 0;
      let x = ox;
      let y = oy;
      let z = oz;
      let hit = false;
      for (let i = 0; i < MAX_STEPS; i++) {
        const d = sdPiece(x, y, z);
        if (d < EPS) {
          hit = true;
          break;
        }
        t += d;
        if (t > MAX_DIST) break;
        x += dirX * d;
        y += dirY * d;
        z += dirZ * d;
      }

      let ch = " ";
      if (hit) {
        const h = 0.003;
        const nx = sdPiece(x + h, y, z) - sdPiece(x - h, y, z);
        const ny = sdPiece(x, y + h, z) - sdPiece(x, y - h, z);
        const nz = sdPiece(x, y, z + h) - sdPiece(x, y, z - h);
        const nl = Math.hypot(nx, ny, nz) || 1;
        const ux = nx / nl;
        const uy = ny / nl;
        const uz = nz / nl;

        const wx = m00 * ux + m01 * uy + m02 * uz;
        const wy = m10 * ux + m11 * uy + m12 * uz;
        const wz = m20 * ux + m21 * uy + m22 * uz;

        const lambert = Math.max(
          0,
          wx * LIGHT_X + wy * LIGHT_Y + wz * LIGHT_Z,
        );
        const bayerRow = BAYER[row & 3];
        const dither = bayerRow ? (bayerRow[col & 3] ?? 0) / 16 - 0.5 : 0;
        const shade = 0.08 + 0.92 * lambert + dither * 0.12;
        const idx = Math.min(
          RAMP.length - 1,
          Math.max(0, Math.floor(shade * RAMP.length)),
        );
        ch = RAMP.charAt(idx);
      }
      line += ch;
    }
    lines[row] = line;
  }
  return lines.join("\n");
}
