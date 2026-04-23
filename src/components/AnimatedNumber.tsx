import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { tokens } from "@/tokens";

interface AnimatedNumberProps {
  value: number;
  /** Formatter for the rendered string — defaults to rounded integer. */
  format?: (v: number) => string;
  /** Seconds. Ignored when the user prefers reduced motion. */
  duration?: number;
  className?: string;
}

const defaultFormat = (v: number) => Math.round(v).toString();

export function AnimatedNumber({
  value,
  format = defaultFormat,
  duration = 1.2,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const motionValue = useMotionValue(0);
  const formatted = useTransform(motionValue, (v) => format(v));

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: tokens.ease.outSoft,
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced, motionValue]);

  return (
    <motion.span ref={ref} className={className}>
      {formatted}
    </motion.span>
  );
}
