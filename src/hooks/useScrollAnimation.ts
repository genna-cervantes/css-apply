import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.35,
    rootMargin = "0px 0px -15% 0px",
    delay = 0,
  } = options;

  const aboutRef = useRef<HTMLElement>(null);
  const perksRef = useRef<HTMLElement>(null);
  const expectRefMobile = useRef<HTMLElement>(null);
  const expectRefDesktop = useRef<HTMLElement>(null);
  const joinRef = useRef<HTMLElement>(null);

  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isPerksVisible, setIsPerksVisible] = useState(false);
  const [isExpectVisible, setIsExpectVisible] = useState(false);
  const [isJoinVisible, setIsJoinVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observerOptions = {
        root: null,
        rootMargin,
        threshold,
      };

      const observerCallback = (
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver
      ) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === "about-css-section") {
              setIsAboutVisible(true);
              observer.unobserve(entry.target);
            }
            if (entry.target.id === "perks-section") {
              setIsPerksVisible(true);
              observer.unobserve(entry.target);
            }
            if (
              entry.target.id === "expect-section" ||
              entry.target.id === "expect-section-desktop"
            ) {
              setIsExpectVisible(true);
              observer.unobserve(entry.target);
            }
            if (entry.target.id === "join-section") {
              setIsJoinVisible(true);
              observer.unobserve(entry.target);
            }
          }
        });
      };

      const observer = new IntersectionObserver(
        observerCallback,
        observerOptions
      );

      const refs = [
        { ref: aboutRef, id: "about-css-section" },
        { ref: perksRef, id: "perks-section" },
        { ref: expectRefMobile, id: "expect-section" },
        { ref: expectRefDesktop, id: "expect-section-desktop" },
        { ref: joinRef, id: "join-section" },
      ];

      refs.forEach(({ ref }) => {
        if (ref.current) {
          observer.observe(ref.current);
        }
      });

      return () => {
        refs.forEach(({ ref }) => {
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        });
      };
    }, delay);

    return () => clearTimeout(timer);
  }, [
    threshold,
    rootMargin,
    delay,
    isAboutVisible,
    isPerksVisible,
    isExpectVisible,
    isJoinVisible,
  ]);

  return {
    refs: {
      aboutRef,
      perksRef,
      expectRefMobile,
      expectRefDesktop,
      joinRef,
    },
    visibility: {
      isAboutVisible,
      isPerksVisible,
      isExpectVisible,
      isJoinVisible,
    },
  };
};
