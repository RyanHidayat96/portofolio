export const motionDurations = {
  micro: 90,
  short: 160,
  medium: 260,
  scene: 640
} as const;

export const motionEasings = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
} as const;

export type MotionDuration = keyof typeof motionDurations;
export type MotionEasing = keyof typeof motionEasings;

export function getMotionDuration(duration: MotionDuration): number {
  return motionDurations[duration];
}

export function getMotionEasing(easing: MotionEasing): string {
  return motionEasings[easing];
}

export function isReducedMotionPreferred(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function supportsFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
