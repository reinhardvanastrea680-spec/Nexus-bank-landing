import { useEffect, useRef } from "react";

/**
 * Custom cursor — uses DOM manipulation directly instead of React state
 * so it never triggers re-renders and can't cause a blank page crash.
 */
export default function CustomCursor() {
  const cursorRef    = useRef<HTMLDivElement>(null);
  const followerRef  = useRef<HTMLDivElement>(null);
  const trailsRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor   = cursorRef.current;
    const follower = followerRef.current;
    const trails   = trailsRef.current;
    if (!cursor || !follower || !trails) return;

    let mx = -100, my = -100;
    let fx = -100, fy = -100;
    let isHovered = false;
    let lastTrailX = -100, lastTrailY = -100;
    let animId: number;
    let trailId = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;

      // Spawn trail particle if moved enough
      const dist = Math.hypot(mx - lastTrailX, my - lastTrailY);
      if (dist > 10 && trails) {
        lastTrailX = mx;
        lastTrailY = my;

        const p = document.createElement("div");
        const size = Math.random() * 8 + 4;
        const color = isHovered ? "#ff00ff" : "#00d4ff";
        p.style.cssText = `
          position:fixed;pointer-events:none;z-index:9997;border-radius:50%;
          left:${mx - size / 2}px;top:${my - size / 2}px;
          width:${size}px;height:${size}px;
          background:${color};box-shadow:0 0 8px ${color};
          opacity:1;transition:opacity 0.4s,transform 0.4s;
        `;
        p.dataset.id = String(trailId++);
        trails.appendChild(p);

        // Fade out and remove
        requestAnimationFrame(() => {
          p.style.opacity = "0";
          p.style.transform = "scale(0.2)";
        });
        setTimeout(() => p.remove(), 450);

        // Cap DOM nodes
        while (trails.children.length > 30) {
          trails.removeChild(trails.firstChild!);
        }
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "A" || t.tagName === "BUTTON" || t.closest("a,button")) {
        isHovered = true;
        cursor.classList.add("hovered");
        follower.classList.add("hovered");
      }
    };

    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "A" || t.tagName === "BUTTON" || t.closest("a,button")) {
        isHovered = false;
        cursor.classList.remove("hovered");
        follower.classList.remove("hovered");
      }
    };

    const tick = () => {
      // Main cursor — instant
      cursor.style.transform = `translate3d(${mx - 12}px,${my - 12}px,0)`;

      // Follower — lerp
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.transform = `translate3d(${fx - 24}px,${fy - 24}px,0)`;

      animId = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout",  onOut,  { passive: true });
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout",  onOut);
    };
  }, []);

  return (
    <>
      {/* Trail particles container — manipulated via DOM, no React state */}
      <div ref={trailsRef} aria-hidden="true" />
      <div ref={cursorRef}   className="cursor"          aria-hidden="true" />
      <div ref={followerRef} className="cursor-follower" aria-hidden="true" />
    </>
  );
}
