import { useEffect, useRef } from 'react';

export default function NetworkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let raf: number;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const NODE_COUNT = 50;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas!.width,
      y: Math.random() * canvas!.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));

    function draw() {
      const W = canvas!.width, H = canvas!.height;
      ctx.clearRect(0, 0, W, H);

      const spacing = 40;
      for (let x = 0; x < W; x += spacing) {
        for (let y = 0; y < H; y += spacing) {
          const pulse = 0.1 + 0.04 * Math.sin(t * 0.02 + x * 0.01 + y * 0.01);
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${pulse})`;
          ctx.fill();
        }
      }

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(74,222,128,${(1 - d / 120) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(74,222,128,0.7)';
        ctx.fill();
      });

      t++;
      raf = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
