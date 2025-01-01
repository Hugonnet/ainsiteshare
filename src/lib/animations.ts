import { gsap } from "gsap";

export const fadeUpAnimation = (element: HTMLElement) => {
  return gsap.from(element, {
    y: 20,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out"
  });
};

export const scaleAnimation = (element: HTMLElement) => {
  return gsap.from(element, {
    scale: 0.9,
    opacity: 0,
    duration: 0.3,
    ease: "back.out(1.7)"
  });
};