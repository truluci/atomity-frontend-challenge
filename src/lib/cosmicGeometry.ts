import type { Cluster, ProviderId } from "./types";

/**
 * All positions live in a normalized 0..100 coordinate space. The cosmic
 * web SVG uses `viewBox="0 0 100 100"` with `preserveAspectRatio="none"`,
 * and HTML overlay elements are placed with percentage top/left, so both
 * layers always agree on a given (x, y) pair.
 */
export type Point = { x: number; y: number };

export const CORE_POSITION: Point = { x: 50, y: 50 };

/** Provider hubs arranged slightly off the cardinal axes for organic feel. */
export const PROVIDER_POSITION: Record<ProviderId, Point> = {
  aws: { x: 22, y: 26 },
  azure: { x: 78, y: 22 },
  gcp: { x: 18, y: 76 },
  "on-prem": { x: 82, y: 72 },
};

/**
 * Quick deterministic hash → 32-bit integer. We only need stable pseudo-
 * randomness keyed to cluster IDs so star positions don't jitter on
 * re-render.
 */
function hash32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(input: string, salt: number): number {
  const h = hash32(`${input}:${salt}`);
  return (h % 100000) / 100000;
}

/**
 * Place a cluster around its hub. Clusters are spread evenly on an arc
 * that faces the core, with alternating inner/outer radii so adjacent
 * dots don't stack perfectly on a single circle. A tiny seeded jitter
 * keeps each provider's constellation from looking mechanically
 * identical.
 */
export function clusterPosition(
  cluster: Cluster,
  hub: Point,
  index: number,
  total: number,
): Point {
  const toCore = Math.atan2(CORE_POSITION.y - hub.y, CORE_POSITION.x - hub.x);
  const spread = Math.PI * 0.9; // ~160° arc facing core

  const t = total <= 1 ? 0.5 : index / (total - 1);
  const jitter = (seeded(cluster.id, 1) - 0.5) * 0.06;
  const angle = toCore - spread / 2 + (t + jitter) * spread;

  // Alternate radius so stars form two shallow orbital bands.
  const radius = index % 2 === 0 ? 9 : 13.5;

  return {
    x: hub.x + radius * Math.cos(angle),
    y: hub.y + radius * Math.sin(angle),
  };
}

/**
 * Quadratic Bézier from `from` to `to` with a control point pushed
 * perpendicular to the midpoint. `curve` is the perpendicular offset in
 * viewBox units (positive = right of travel direction).
 */
export function bezierPath(from: Point, to: Point, curve = 4): string {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  // Perpendicular unit vector, rotated 90° clockwise.
  const px = dy / len;
  const py = -dx / len;
  const cx = mx + px * curve;
  const cy = my + py * curve;
  return `M ${from.x.toFixed(3)} ${from.y.toFixed(3)} Q ${cx.toFixed(3)} ${cy.toFixed(3)} ${to.x.toFixed(3)} ${to.y.toFixed(3)}`;
}

/** Polar → cartesian around a center, with 0° at 12 o'clock. */
export function polarPoint(cx: number, cy: number, radius: number, angleDeg: number): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

/**
 * SVG arc path from `startAngle` to `endAngle`, drawn clockwise along a
 * circle of the given radius. Angles are in degrees, 0° = top.
 */
export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

/** Seeded twinkle timing for stars — stable across renders. */
export function twinkleDelay(id: string): number {
  return seeded(id, 7) * 4;
}
