import { useMemo } from "react";

/**
 * Seeded starfield rendered as HTML dots (not SVG) so the circles stay
 * perfectly round regardless of viewport aspect ratio. Positions are
 * percentages; sizes are pixels.
 */
function generateStars(count: number, seed: number) {
  const stars = [];
  let h = seed;
  for (let i = 0; i < count; i++) {
    h = (h * 9301 + 49297) % 233280;
    const x = (h / 233280) * 100;
    h = (h * 9301 + 49297) % 233280;
    const y = (h / 233280) * 100;
    h = (h * 9301 + 49297) % 233280;
    const size = 0.8 + (h / 233280) * 1.6;
    h = (h * 9301 + 49297) % 233280;
    const base = 0.1 + (h / 233280) * 0.28;
    stars.push({ id: `s-${i}`, x, y, size, base });
  }
  return stars;
}

export function CosmicBackdrop() {
  const stars = useMemo(() => generateStars(110, 17), []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 50% 38%, var(--color-cosmic-nebula) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 80%, color-mix(in oklab, var(--color-cosmic-accent) 6%, transparent) 0%, transparent 45%),
          linear-gradient(180deg, var(--color-cosmic-deep) 0%, var(--color-cosmic-void) 100%)
        `,
      }}
    >
      {stars.map((s) => {
        const dur = 4 + (s.x % 3);
        const delay = (s.y % 5).toFixed(1);
        return (
          <span
            key={s.id}
            aria-hidden
            className="absolute rounded-full"
            style={{
              top: `${s.y}%`,
              left: `${s.x}%`,
              inlineSize: `${s.size}px`,
              blockSize: `${s.size}px`,
              backgroundColor: "var(--color-cosmic-star)",
              opacity: s.base,
              animation: `cosmic-twinkle ${dur}s ease-in-out ${delay}s infinite`,
              // @ts-expect-error -- CSS custom props through inline style
              "--twinkle-from": (s.base * 0.35).toFixed(2),
              "--twinkle-to": s.base.toFixed(2),
            }}
          />
        );
      })}

      {/* Vignette so the corners feel deeper than the center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, color-mix(in oklab, var(--color-cosmic-void) 70%, transparent) 100%)",
        }}
      />
    </div>
  );
}
