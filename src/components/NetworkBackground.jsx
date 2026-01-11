import { useEffect, useRef } from "react";

export default function NetworkBackground({ isDark }) {
  const canvasRef = useRef(null);

  const lerp = (a, b, t) => a + (b - a) * t;

  const colorFromDepth = (zNorm, isDark) => {
    // zNorm: 0 (far) → 1 (near)
    const palette = isDark
      ? [
          [99, 102, 241],   // indigo
          [168, 85, 247],   // purple
          [236, 72, 153],   // pink
          [251, 146, 60],   // orange
          [253, 224, 71],   // yellow
        ]
      : [
          [79, 70, 229],
          [147, 51, 234],
          [219, 39, 119],
          [249, 115, 22],
          [234, 179, 8],
        ];

    const n = palette.length - 1;
    const t = zNorm * n;
    const i = Math.floor(t);
    const f = t - i;

    const c0 = palette[i];
    const c1 = palette[Math.min(i + 1, n)];

    const r = Math.round(lerp(c0[0], c1[0], f));
    const g = Math.round(lerp(c0[1], c1[1], f));
    const b = Math.round(lerp(c0[2], c1[2], f));

    return `rgb(${r},${g},${b})`;
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) return;

    // Detect touch device (mobile/tablet)
    const isTouchDevice =
      "ontouchstart" in window || (navigator?.maxTouchPoints ?? 0) > 0;

    let w = 0, h = 0, dpr = 1;

    // Mouse normalized (desktop only)
    const mouse = { x: 0.5, y: 0.35 };
    const smooth = { x: 0.5, y: 0.35 };

    // Rotation state
    let yaw = 0;
    let pitch = 0;
    const target = { yaw: 0, pitch: 0 };

    const N = 60;
    const nodes = [];
    let edges = [];

    const palette = isDark
      ? {
          bg: "#0B1220",
          node: "rgba(226,232,240,0.32)",
          edge: "rgba(255,255,255,0.22)",
          edgeNear: "rgba(255,255,255,0.45)",
        }
      : {
          bg: "#FFFFFF",
          node: "rgba(15,23,42,0.18)",
          edge: "rgba(15,23,42,0.12)",
          edgeNear: "rgba(37,99,235,0.18)",
        };

    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      nodes.length = 0;
      edges = [];

      const r = Math.min(w, h) * 0.42;
      for (let i = 0; i < N; i++) {
        const u = Math.random();
        const theta = rand(0, Math.PI * 2);
        const phi = Math.acos(rand(-1, 1));

        const radius = r * Math.pow(u, 0.55);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi) * 0.9;

        nodes.push({ x, y, z });
      }

      const maxD = r * 0.62;
      const maxD2 = maxD * maxD;

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i],
            b = nodes[j];
          const dx = a.x - b.x,
            dy = a.y - b.y,
            dz = a.z - b.z;
          const d2 = dx * dx + dy * dy + dz * dz;

          if (d2 < maxD2) {
            const d = Math.sqrt(d2);
            const t = 1 - d / maxD;
            const baseAlpha = 0.18 + t * 0.55;
            edges.push([i, j, baseAlpha]);
          }
        }
      }
    };

    // Desktop mouse move only (ignore touch)
    const onPointerMove = (e) => {
      if (isTouchDevice) return;
      mouse.x = e.clientX / Math.max(1, w);
      mouse.y = e.clientY / Math.max(1, h);
    };

    const onResize = () => {
      resize();
      init();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);

    resize();
    init();

    let rafId = 0;

    const rotate = (p, ax, ay) => {
      const cosY = Math.cos(ay),
        sinY = Math.sin(ay);
      let x = p.x * cosY + p.z * sinY;
      let z = -p.x * sinY + p.z * cosY;

      const cosX = Math.cos(ax),
        sinX = Math.sin(ax);
      let y = p.y * cosX - z * sinX;
      z = p.y * sinX + z * cosX;

      return { x, y, z };
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const now = performance.now() * 0.001;

      // Desktop: smooth-follow mouse
      if (!isTouchDevice) {
        const ease = 0.08;
        smooth.x += (mouse.x - smooth.x) * ease;
        smooth.y += (mouse.y - smooth.y) * ease;

        const dx = smooth.x - 0.5;
        const dy = smooth.y - 0.5;

        target.yaw = dx * 0.9;
        target.pitch = -dy * 0.7;
      } else {
        // Mobile: premium idle orbit
        target.yaw = Math.sin(now * 0.35) * 0.35;
        target.pitch = Math.cos(now * 0.28) * 0.18;
      }

      // Clamp + smooth rotation to prevent spikes
      target.yaw = clamp(target.yaw, -0.75, 0.75);
      target.pitch = clamp(target.pitch, -0.55, 0.55);

      yaw += (target.yaw - yaw) * 0.045;
      pitch += (target.pitch - pitch) * 0.045;

      const ay = yaw;
      const ax = pitch;

      // Center of screen
      const cx = w * 0.5;
      const cy = h * 0.5;

      const perspective = Math.min(w, h) * 0.85;
      const nodeSize = 3.2;

      const proj = new Array(N);
      for (let i = 0; i < N; i++) {
        const t = rotate(nodes[i], ax, ay);

        const z = t.z + perspective * 0.85;
        const s = perspective / z;
        proj[i] = {
          x: cx + t.x * s,
          y: cy + t.y * s,
          z: t.z,
          s,
        };
      }

      // Clear & paint base bg
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);

      // Cursor highlight: desktop uses cursor, mobile uses center
      const mx = isTouchDevice ? cx : smooth.x * w;
      const my = isTouchDevice ? cy : smooth.y * h;

      // Draw edges
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const [i, j, baseA] of edges) {
        const a = proj[i],
          b = proj[j];

        const depthFade = 0.65 + 0.35 * ((a.s + b.s) * 0.5);

        const hx = (a.x + b.x) * 0.5 - mx;
        const hy = (a.y + b.y) * 0.5 - my;
        const hd = Math.sqrt(hx * hx + hy * hy);
        const near = Math.max(0, 1 - hd / (Math.min(w, h) * 0.45));

        ctx.strokeStyle = near > 0.22 ? palette.edgeNear : palette.edge;
        ctx.globalAlpha = baseA * depthFade * (0.55 + near * 0.85);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw nodes
      ctx.globalAlpha = 1;
      for (let i = 0; i < N; i++) {
        const p = proj[i];

        const r = nodeSize * (1.4 + p.s * 1.1);

        const zNorm = Math.min(1, Math.max(0, (p.s - 0.6) / 0.9));
        ctx.fillStyle = colorFromDepth(zNorm, isDark);

        ctx.shadowBlur = 8;
        ctx.shadowColor = ctx.fillStyle;

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}