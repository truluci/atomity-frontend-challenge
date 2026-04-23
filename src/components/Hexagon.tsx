import type { CSSProperties, ReactNode, SVGProps } from "react";

/**
 * Vertices for a regular hexagon inscribed in a unit viewBox.
 * Flat-top has horizontal top/bottom edges; pointy-top has vertices at
 * 12 and 6 o'clock. `viewBox` dimensions differ to keep the shape regular.
 */
const GEOMETRY = {
  flat: {
    viewBox: "0 0 100 86.6",
    points: "25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3",
    vbW: 100,
    vbH: 86.6,
  },
  pointy: {
    viewBox: "0 0 86.6 100",
    points: "43.3,0 86.6,25 86.6,75 43.3,100 0,75 0,25",
    vbW: 86.6,
    vbH: 100,
  },
} as const;

export type HexagonOrientation = keyof typeof GEOMETRY;

/**
 * `size` is either a number (px) or any CSS length string (e.g. `clamp(...)`,
 * `var(--hex-size)`, `60%`). The shape keeps its aspect ratio via CSS, so the
 * component accepts fluid sizing without needing to compute in JS.
 */
interface HexagonProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  orientation?: HexagonOrientation;
  size?: number | string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  children?: ReactNode;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
}

export function Hexagon({
  orientation = "flat",
  size = 120,
  stroke,
  strokeWidth = 2,
  fill = "transparent",
  children,
  wrapperClassName,
  wrapperStyle,
  ...svgProps
}: HexagonProps) {
  const geom = GEOMETRY[orientation];
  const sizeCss = typeof size === "number" ? `${size}px` : size;
  const axisStyle: CSSProperties =
    orientation === "flat" ? { inlineSize: sizeCss } : { blockSize: sizeCss };

  return (
    <div
      className={wrapperClassName}
      style={{
        position: "relative",
        aspectRatio: `${geom.vbW} / ${geom.vbH}`,
        ...axisStyle,
        ...wrapperStyle,
      }}
    >
      <svg
        viewBox={geom.viewBox}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        aria-hidden="true"
        {...svgProps}
      >
        <polygon
          points={geom.points}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {children != null && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
