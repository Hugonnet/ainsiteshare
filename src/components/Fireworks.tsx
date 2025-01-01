import { useEffect, useRef } from "react";

const Fireworks = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.alpha = 1;
        this.color = color;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.alpha -= 0.01;
      }
    }

    let particles: Particle[] = [];
    const colors = ["#FF0000", "#FF00FF", "#0000FF"];

    const createFirework = (x: number, y: number) => {
      const particleCount = 50;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, color));
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter(p => p.alpha > 0);
      particles.forEach(p => {
        p.draw();
        p.update();
      });

      if (particles.length < 100 && Math.random() < 0.1) {
        createFirework(
          Math.random() * canvas.width,
          Math.random() * canvas.height * 0.5
        );
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      particles = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

export default Fireworks;
