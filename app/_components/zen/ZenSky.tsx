"use client";
import { Ref, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

export type ZenSkyHandle = {
  keystroke: () => void;
  word: () => void;
};

const SVG_NS = "http://www.w3.org/2000/svg";
const STAR_LAYERS = [
  { count: 60, size: 0.12, speed: 0.6, opacity: 0.45 },
  { count: 35, size: 0.2, speed: 1.4, opacity: 0.7 },
  { count: 15, size: 0.3, speed: 2.6, opacity: 0.95 },
];
const MAX_SPARKLES = 40;
const MAX_BODIES = 3;
const WORDS_PER_BODY = 8;

type Star = { x: number; y: number; r: number; delay: number };

function randomStars(count: number, size: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: size * (0.6 + Math.random() * 0.8),
    delay: Math.random() * 4,
  }));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

function planetColor() {
  const colors = ["var(--color-primary)", "var(--color-secondary)", "var(--color-accent)", "var(--color-info)"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// A ringed planet, a cratered moon or a comet, built as an SVG group.
function makeBody(): SVGGElement {
  const g = el("g", {});
  const kind = Math.floor(Math.random() * 3);
  const color = planetColor();
  if (kind === 0) {
    const r = 3 + Math.random() * 3;
    g.append(
      el("circle", { r, fill: color, opacity: 0.85 }),
      el("ellipse", { rx: r * 1.9, ry: r * 0.45, fill: "none", stroke: "var(--color-base-content)", "stroke-width": 0.35, opacity: 0.6, transform: "rotate(-18)" })
    );
  } else if (kind === 1) {
    const r = 2 + Math.random() * 2;
    g.append(
      el("circle", { r, fill: "var(--color-base-content)", opacity: 0.75 }),
      el("circle", { cx: -r * 0.35, cy: -r * 0.2, r: r * 0.25, fill: "var(--color-base-300)", opacity: 0.6 }),
      el("circle", { cx: r * 0.3, cy: r * 0.35, r: r * 0.18, fill: "var(--color-base-300)", opacity: 0.6 })
    );
  } else {
    g.append(
      el("line", { x1: 0, y1: 0, x2: 9, y2: -3, stroke: color, "stroke-width": 0.6, "stroke-linecap": "round", opacity: 0.5 }),
      el("circle", { r: 0.9, fill: "var(--color-base-content)" })
    );
  }
  return g;
}

// Full-screen night sky for Zen mode. Stars drift and speed up as you type,
// each keystroke leaves a sparkle, each word fires a shooting star, and
// every few words a planet, moon or comet crosses the screen.
// Animated nodes are created imperatively so typing never re-renders React.
export default function ZenSky({ ref }: { ref?: Ref<ZenSkyHandle> }) {
  const layersRef = useRef<(SVGGElement | null)[]>([]);
  const effectsRef = useRef<SVGGElement>(null);
  const speedRef = useRef(0);
  const wordsRef = useRef(0);
  const bodiesRef = useRef(0);

  const layers = useMemo(() => STAR_LAYERS.map((l) => randomStars(l.count, l.size)), []);

  // The sky is 100 units tall and as wide as the screen's aspect ratio,
  // so stars stay round and fill the whole window.
  const [width, setWidth] = useState(100);
  const widthRef = useRef(width);
  useEffect(() => {
    function resize() {
      const next = (100 * window.innerWidth) / Math.max(window.innerHeight, 1);
      widthRef.current = next;
      setWidth(next);
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Parallax drift; typing adds speed that decays back to a slow cruise.
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const offsets = STAR_LAYERS.map(() => 0);
    let last = performance.now();
    let frame: number | undefined;
    function tick(now: number) {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      speedRef.current *= Math.pow(0.35, dt);
      const boost = 1 + speedRef.current;
      STAR_LAYERS.forEach((layer, i) => {
        offsets[i] = (offsets[i] + layer.speed * boost * dt) % 100;
        const shift = (offsets[i] / 100) * widthRef.current;
        layersRef.current[i]?.setAttribute("transform", `translate(${-shift} 0)`);
      });
      frame = requestAnimationFrame(tick);
    }
    function stop() {
      if (frame !== undefined) cancelAnimationFrame(frame);
      effectsRef.current?.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
      effectsRef.current?.replaceChildren();
      bodiesRef.current = 0;
      speedRef.current = 0;
    }
    function syncPreference() {
      stop();
      if (!preference.matches) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => { stop(); preference.removeEventListener("change", syncPreference); };
  }, []);

  useImperativeHandle(ref, () => ({
    keystroke() {
      if (prefersReducedMotion()) return;
      speedRef.current = Math.min(speedRef.current + 0.6, 12);
      const effects = effectsRef.current;
      if (!effects || effects.childElementCount >= MAX_SPARKLES) return;
      const size = 0.6 + Math.random() * 0.8;
      const sparkle = el("path", {
        d: `M0 ${-size} L${size * 0.25} ${-size * 0.25} L${size} 0 L${size * 0.25} ${size * 0.25} L0 ${size} L${-size * 0.25} ${size * 0.25} L${-size} 0 L${-size * 0.25} ${-size * 0.25} Z`,
        fill: Math.random() < 0.3 ? planetColor() : "var(--color-base-content)",
      });
      const holder = el("g", { transform: `translate(${Math.random() * widthRef.current} ${Math.random() * 100})` });
      holder.append(sparkle);
      effects.append(holder);
      const anim = sparkle.animate(
        [
          { transform: "scale(0) rotate(0deg)", opacity: 0 },
          { transform: "scale(1) rotate(45deg)", opacity: 1, offset: 0.25 },
          { transform: "scale(0.2) rotate(90deg)", opacity: 0 },
        ],
        { duration: 1100, easing: "ease-out" }
      );
      anim.onfinish = () => holder.remove();
    },

    word() {
      wordsRef.current += 1;
      const effects = effectsRef.current;
      if (!effects || prefersReducedMotion()) return;

      const x = widthRef.current * (0.2 + Math.random() * 0.8);
      const y = Math.random() * 40;
      const streak = el("line", {
        x1: 0, y1: 0, x2: 6, y2: -2.5,
        stroke: "var(--color-base-content)", "stroke-width": 0.25, "stroke-linecap": "round",
      });
      const holder = el("g", { transform: `translate(${x} ${y})` });
      holder.append(streak);
      effects.append(holder);
      streak.animate(
        [
          { transform: "translate(0px, 0px)", opacity: 0 },
          { opacity: 1, offset: 0.2 },
          { transform: "translate(-22px, 9px)", opacity: 0 },
        ],
        { duration: 750, easing: "ease-in" }
      ).onfinish = () => holder.remove();

      if (wordsRef.current % WORDS_PER_BODY !== 0 || bodiesRef.current >= MAX_BODIES) return;
      bodiesRef.current += 1;
      const body = makeBody();
      const startY = 10 + Math.random() * 70;
      const drift = (Math.random() - 0.5) * 20;
      const travel = el("g", {});
      travel.append(body);
      effects.prepend(travel);
      travel.animate(
        [
          { transform: `translate(${widthRef.current + 12}px, ${startY}px)` },
          { transform: `translate(-12px, ${startY + drift}px)` },
        ],
        { duration: 14000 + Math.random() * 8000, easing: "linear" }
      ).onfinish = () => {
        travel.remove();
        bodiesRef.current -= 1;
      };
      body.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(25deg)" }], {
        duration: 9000, iterations: Infinity, direction: "alternate", easing: "ease-in-out",
      });
    },
  }));

  return (
    <svg
      aria-hidden
      className="zen-sky fixed inset-0 w-full h-full pointer-events-none -z-0"
      viewBox={`0 0 ${width} 100`}
      preserveAspectRatio="none"
    >
      {layers.map((stars, i) => (
        <g key={i} ref={(node) => { layersRef.current[i] = node; }} opacity={STAR_LAYERS[i].opacity}>
          {/* Two copies side by side so the drift wraps seamlessly. */}
          {[0, 100].map((shift) =>
            stars.map((s, j) => (
              <circle
                key={`${shift}-${j}`}
                className="zen-star"
                cx={((s.x + shift) / 100) * width}
                cy={s.y}
                r={s.r}
                fill="var(--color-base-content)"
                style={{ animationDelay: `${s.delay}s` }}
              />
            ))
          )}
        </g>
      ))}
      <g ref={effectsRef} />
    </svg>
  );
}
