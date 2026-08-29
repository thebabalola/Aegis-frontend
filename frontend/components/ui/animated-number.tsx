"use client";

import { useAnimatedNumber } from "@/hooks/use-animated-number";

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  format,
  duration,
  className,
}: AnimatedNumberProps) {
  const animated = useAnimatedNumber(value, duration);
  return <span className={className}>{format(animated)}</span>;
}
