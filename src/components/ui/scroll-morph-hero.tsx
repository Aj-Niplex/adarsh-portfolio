"use client";

import { animate, motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

// Scroll-morph hero. Cards scatter in, line up, form a circle, then settle into an arc along the
// bottom as the page scrolls. The page scrolls normally (nothing captures the wheel or touch
// events); a sticky stage simply stays in view while the section passes by.

export type MorphItem = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  href: string;
  count?: string;
  countLabel?: string;
  logo?: { src: string; alt: string };
};

type Props = {
  items: MorphItem[];
  intro: string;
  hint?: string;
  heading: string;
  blurb: string;
  skipHref?: string;
};

const CARD_W = 100;
const CARD_H = 138;

type Frame = { x: number; y: number; r: number; s: number; o: number };

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

// Same scatter every render, so the server and the browser agree on the first frame.
function scatter(i: number) {
  const rand = (seed: number) => {
    const v = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  return { x: (rand(1) - 0.5) * 1500, y: (rand(2) - 0.5) * 1000, r: (rand(3) - 0.5) * 180 };
}

function place(i: number, n: number, w: number, h: number, intro: number, morph: number, rotate: number, parallax: number): Frame {
  const mobile = w < 768;
  const sc = scatter(i);

  // 1. line
  const spacing = CARD_W + 10;
  const fit = Math.min(1, Math.max(0.3, (w - 24) / (n * spacing)));
  const line: Frame = { x: (i - (n - 1) / 2) * spacing * fit, y: 0, r: 0, s: fit, o: 1 };

  // 2. circle
  const circleRadius = Math.min(Math.min(w, h) * 0.35, 350);
  const angle = (i / n) * 360;
  const rad = (angle * Math.PI) / 180;
  const circleScale = Math.min(1, ((2 * Math.PI * circleRadius) / n) / (CARD_W + 4));
  const circle = { x: Math.cos(rad) * circleRadius, y: Math.sin(rad) * circleRadius, r: angle + 90, s: circleScale };

  // 3. arc along the bottom, a "rainbow" with its highest point in the middle
  const arcRadius = Math.min(w, h * 1.5) * (mobile ? 1.4 : 1.1);
  const apexY = h * (mobile ? 0.35 : 0.25);
  const centerY = apexY + arcRadius;
  const spread = mobile ? Math.min(100, (n - 1) * 7) : Math.min(130, (n - 1) * 8.5);
  const step = spread / Math.max(n - 1, 1);
  // Scrolling slides the arc along until the last card is just past the middle.
  const arcAngle = -90 - spread / 2 + i * step - rotate * spread * 0.42;
  const arcRad = (arcAngle * Math.PI) / 180;
  const arc = {
    x: Math.cos(arcRad) * arcRadius + parallax,
    y: Math.sin(arcRad) * arcRadius + centerY,
    r: arcAngle + 90,
    s: mobile ? 1.3 : 1.6
  };

  const settled: Frame = {
    x: lerp(circle.x, arc.x, morph),
    y: lerp(circle.y, arc.y, morph),
    r: lerp(circle.r, arc.r, morph),
    s: lerp(circle.s, arc.s, morph),
    o: 1
  };

  if (intro <= 1) {
    const k = clamp01(intro);
    return { x: lerp(sc.x, line.x, k), y: lerp(sc.y, line.y, k), r: lerp(sc.r, 0, k), s: lerp(0.6, line.s, k), o: k };
  }
  const k = clamp01(intro - 1);
  return {
    x: lerp(line.x, settled.x, k),
    y: lerp(line.y, settled.y, k),
    r: lerp(line.r, settled.r, k),
    s: lerp(line.s, settled.s, k),
    o: 1
  };
}

function Face({ item }: { item: MorphItem }) {
  return (
    <>
      <span className="morph-front">
        <span className="morph-kicker">{item.kicker}</span>
        {item.count ? (
          <span className="morph-count">
            {item.count}
            <small>{item.countLabel}</small>
          </span>
        ) : item.logo ? (
          <Image src={item.logo.src} alt="" width={30} height={30} className="morph-logo" />
        ) : (
          <span className="morph-mark" aria-hidden="true">{item.title.slice(0, 1)}</span>
        )}
        <span className="morph-title">{item.title}</span>
      </span>
      <span className="morph-back">
        <span className="morph-text">{item.text}</span>
        <span className="morph-open">Open →</span>
      </span>
    </>
  );
}

function MorphCard({
  item,
  index,
  total,
  geo,
  intro,
  morph,
  rotate,
  parallax,
  tick
}: {
  item: MorphItem;
  index: number;
  total: number;
  geo: React.RefObject<{ w: number; h: number }>;
  intro: MotionValue<number>;
  morph: MotionValue<number>;
  rotate: MotionValue<number>;
  parallax: MotionValue<number>;
  tick: MotionValue<number>;
}) {
  const frame = useTransform([intro, morph, rotate, parallax, tick], ([t, m, r, p]: number[]) => {
    const g = geo.current ?? { w: 1000, h: 700 };
    return place(index, total, g.w, g.h, t, m, r, p);
  });
  const x = useTransform(frame, (f) => f.x);
  const y = useTransform(frame, (f) => f.y);
  const rot = useTransform(frame, (f) => f.r);
  const scale = useTransform(frame, (f) => f.s);
  const opacity = useTransform(frame, (f) => f.o);

  // suppressHydrationWarning: the browser rounds these numbers differently from the server, and they change right away anyway.
  return (
    <motion.div className="morph-slot" style={{ x, y, rotate: rot, scale, opacity }} suppressHydrationWarning>
      <Link href={item.href} className="morph-card" tabIndex={-1} aria-label={item.title + ": " + item.text}>
        <span className="morph-flip">
          <Face item={item} />
        </span>
      </Link>
    </motion.div>
  );
}

export default function ScrollMorphHero({ items, intro: introText, hint = "Scroll to explore", heading, blurb, skipHref = "#core" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const geo = useRef({ w: 0, h: 0 });

  // Where the page scroll is inside this section: 0 at the top, 1 at the end.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const introPhase = useMotionValue(0); // 0 scattered, 1 in a line, 2 in a circle
  const tick = useMotionValue(0); // bumps when the stage is resized
  const mouseX = useMotionValue(0);

  const morphRaw = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const rotateRaw = useTransform(scrollYProgress, [0.2, 1], [0, 1]);
  const morph = useSpring(morphRaw, { stiffness: 40, damping: 20 });
  const rotate = useSpring(rotateRaw, { stiffness: 40, damping: 20 });
  const parallax = useSpring(mouseX, { stiffness: 30, damping: 20 });

  // Stage size: the card layout depends on it.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      geo.current = { w: stage.offsetWidth, h: stage.offsetHeight };
      tick.set(tick.get() + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [tick]);

  // Intro: scatter -> line -> circle.
  useEffect(() => {
    let line: { stop: () => void } | undefined;
    let circle: { stop: () => void } | undefined;
    const a = setTimeout(() => (line = animate(introPhase, 1, { type: "spring", stiffness: 40, damping: 15 })), 500);
    const b = setTimeout(() => (circle = animate(introPhase, 2, { type: "spring", stiffness: 40, damping: 15 })), 2500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      line?.stop();
      circle?.stop();
    };
  }, [introPhase]);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(((event.clientX - rect.left) / rect.width) * 2 * 100 - 100);
  };

  const introOpacity = useTransform([introPhase, morph], ([t, m]: number[]) => (t < 1.6 ? 0 : clamp01((t - 1.6) / 0.4) * clamp01(1 - m * 2)));
  const introY = useTransform(introOpacity, [0, 1], [16, 0]);
  const hintOpacity = useTransform(introOpacity, (o) => o * 0.6);
  const headOpacity = useTransform(morph, [0.8, 1], [0, 1]);
  const headY = useTransform(morph, [0.8, 1], [20, 0]);

  return (
    <section className="morph" aria-label={heading}>
      <noscript>
        <style>{".morph-pinned{display:none!important}.morph-static{display:block!important}"}</style>
      </noscript>

      <div className="morph-pinned" ref={trackRef}>
        <a className="morph-skip" href={skipHref}>Skip the animation</a>
        <div className="morph-stage" ref={stageRef} onMouseMove={onMove}>
          <div className="morph-intro">
            <motion.h2 style={{ opacity: introOpacity, y: introY }}>{introText}</motion.h2>
            <motion.p style={{ opacity: hintOpacity }}>{hint}</motion.p>
          </div>

          <motion.div className="morph-head" style={{ opacity: headOpacity, y: headY }}>
            <h2>{heading}</h2>
            <p>{blurb}</p>
          </motion.div>

          <div className="morph-cards">
            {items.map((item, i) => (
              <MorphCard
                key={item.id}
                item={item}
                index={i}
                total={items.length}
                geo={geo}
                intro={introPhase}
                morph={morph}
                rotate={rotate}
                parallax={parallax}
                tick={tick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Shown instead of the animation when the visitor prefers less motion (or has no JavaScript). */}
      <div className="morph-static">
        <div className="container">
          <div className="section-head">
            <h2>{heading}</h2>
            <p>{blurb}</p>
          </div>
          <div className="morph-grid">
            {items.map((item) => (
              <Link href={item.href} className="morph-tile" key={item.id}>
                <span className="morph-kicker">{item.kicker}</span>
                <strong>
                  {item.title}
                  {item.count ? " · " + item.count + " " + item.countLabel : ""}
                </strong>
                <span>{item.text}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
