"use client";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// One step per gesture, not per event: a trackpad fires a burst of small
// deltas where a mouse notch fires a single large one.
const STEP_COOLDOWN_MS = 260;
const DELTA_THRESHOLD = 8;

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const CarouselWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastStepAt = useRef(0);
  const indexRef = useRef(0);

  const [offset, setOffset] = useState(0);
  const count = React.Children.count(children);
  const lastIndex = Math.max(0, count - 1);

  // Measured rather than derived from a constant, so item width and
  // margins can change in Faction without breaking alignment here.
  const centreOn = useCallback((index: number) => {
    const viewport = viewportRef.current;
    const item = trackRef.current?.children[index] as HTMLElement | undefined;

    if (!viewport || !item) return;

    setOffset(
      viewport.clientWidth / 2 - (item.offsetLeft + item.offsetWidth / 2),
    );
  }, []);

  const step = useCallback(
    (direction: number) => {
      const next = clamp(indexRef.current + direction, lastIndex);
      if (next === indexRef.current) return;

      indexRef.current = next;
      centreOn(next);
    },
    [centreOn, lastIndex],
  );

  useIsomorphicLayoutEffect(() => {
    indexRef.current = clamp(indexRef.current, lastIndex);
    centreOn(indexRef.current);
  }, [centreOn, count, lastIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => centreOn(indexRef.current));
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [centreOn]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (Math.abs(delta) < DELTA_THRESHOLD) return;
      e.preventDefault();

      const now = Date.now();
      if (now - lastStepAt.current < STEP_COOLDOWN_MS) return;
      lastStepAt.current = now;

      step(delta > 0 ? 1 : -1);
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [step]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  return (
    // min-w-full/shrink-0: a sibling in Container is min-w-full and would
    // otherwise squash this to zero. flex: gives the track a definite
    // height so Faction's h-[90%] resolves.
    <div
      ref={viewportRef}
      className={"relative flex min-w-full shrink-0 overflow-hidden"}
    >
      <div
        ref={trackRef}
        className={
          "relative flex min-w-full will-change-transform transition-transform duration-500 ease-out"
        }
        style={{ transform: `translate3d(${offset}px, 0, 0)` }}
      >
        {children}
      </div>
    </div>
  );
};

export default CarouselWrapper;
