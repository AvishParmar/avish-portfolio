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

    let w = 0, h = 0, dpr = 1;
    const mouse = { x: 0.5, y: 0.35 };   // normalized
    const smooth = { x: 0.5, y: 0.35 };  // smoothed normalized

    const N = 60;
    const nodes = []; // {x,y,z}
    let edges = [];   // [i,j,baseAlpha]

    const palette = isDark
    ? {
        bg: "#0B1220",
        node: "rgba(226,232,240,0.32)",
        edge: "rgba(255,255,255,0.22)",     // ← whiter
        edgeNear: "rgba(255,255,255,0.45)", // ← brighter on hover
      }
    : {
        bg: "#FFFFFF",
        node: "rgba(15,23,42,0.18)",
        edge: "rgba(15,23,42,0.12)",
        edgeNear: "rgba(37,99,235,0.18)",
      };

    const rand = (a, b) => a + Math.random() * (b - a);

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

      const r = Math.min(w, h) * 0.42; // cluster radius
      // Create a 3D-ish blob: dense center, some outliers
      for (let i = 0; i < N; i++) {
        const u = Math.random();
        const theta = rand(0, Math.PI * 2);
        const phi = Math.acos(rand(-1, 1));

        // Bias toward center (cubic-ish)
        const radius = r * Math.pow(u, 0.55);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi) * 0.9;

        nodes.push({ x, y, z });
      }

      // Precompute edges by distance in 3D
      const maxD = r * 0.62;
      const maxD2 = maxD * maxD;

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < maxD2) {
            const d = Math.sqrt(d2);
            const t = 1 - d / maxD; // 0..1
            const baseAlpha = 0.18 + t * 0.55;
            edges.push([i, j, baseAlpha]);
          }
        }
      }
    };

    const onMove = (e) => {
      mouse.x = e.clientX / Math.max(1, w);
      mouse.y = e.clientY / Math.max(1, h);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", () => {
      resize();
      init();
    });

    resize();
    init();

    let rafId = 0;

    const rotate = (p, ax, ay) => {
      // Rotate around Y (left-right) then X (up-down)
      const cosY = Math.cos(ay), sinY = Math.sin(ay);
      let x = p.x * cosY + p.z * sinY;
      let z = -p.x * sinY + p.z * cosY;

      const cosX = Math.cos(ax), sinX = Math.sin(ax);
      let y = p.y * cosX - z * sinX;
      z = p.y * sinX + z * cosX;

      return { x, y, z };
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      // Smooth mouse (avoid jitter)
      const ease = 0.08;
      smooth.x += (mouse.x - smooth.x) * ease;
      smooth.y += (mouse.y - smooth.y) * ease;

      // Cursor offset from center => rotation
      const dx = smooth.x - 0.5; // -0.5..0.5
      const dy = smooth.y - 0.5;

      // Rotation angles (tune these)
      const ay = dx * 0.9;      // rotate around Y with horizontal cursor
      const ax = -dy * 0.7;     // rotate around X with vertical cursor

      // Center of screen
      const cx = w * 0.5;
      const cy = h * 0.50;

      // Projection
      const perspective = Math.min(w, h) * 0.85;
      const nodeSize = 3.2;

      // Precompute transformed + projected positions
      const proj = new Array(N);
      for (let i = 0; i < N; i++) {
        const t = rotate(nodes[i], ax, ay);

        // simple perspective projection
        const z = t.z + perspective * 0.85;
        const s = perspective / z; // scale
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

      // Optional: slight brighten near cursor
      const mx = smooth.x * w;
      const my = smooth.y * h;

      // Draw edges
      ctx.lineWidth = 1;
      for (const [i, j, baseA] of edges) {
        const a = proj[i], b = proj[j];

        // Fade edges if both are "behind"
        const depthFade = 0.65 + 0.35 * ((a.s + b.s) * 0.5);

        // Cursor proximity highlight (midpoint distance)
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

      // Draw nodes (slightly bigger when closer)
      ctx.globalAlpha = 1;
      for (let i = 0; i < N; i++) {
        const p = proj[i];

        // Bigger nodes
        const r = nodeSize * (1.4 + p.s * 1.1);

        const zNorm = Math.min(
          1,
          Math.max(0, (p.s - 0.6) / 0.9)
        );

        ctx.fillStyle = colorFromDepth(zNorm, isDark);

        // Optional glow (looks great)
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
      window.removeEventListener("mousemove", onMove);
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