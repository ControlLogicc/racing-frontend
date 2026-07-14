import { useEffect, useRef } from 'react';
import './AmbientGoldParticles.css';

const GOLD = '226, 183, 20';

const getParticleCount = (width) => {
  if (width < 640) return 50;
  if (width < 1024) return 64;
  return 80;
};

const createParticle = (width, height, startAnywhere = true) => ({
  x: Math.random() * width,
  y: startAnywhere ? Math.random() * height : height + Math.random() * 30,
  radius: 0.5 + Math.random(),
  opacity: 0.2 + Math.random() * 0.4,
  speed: 0.28 + Math.random() * 0.42,
  drift: (Math.random() - 0.5) * 0.08,
  phase: Math.random() * Math.PI * 2,
  phaseSpeed: 0.004 + Math.random() * 0.008,
});

export default function AmbientGoldParticles({ excludeSelector = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];
    let animationFrame = 0;
    let isVisible = !document.hidden;
    let excludedRect = null;
    const excludedElement = excludeSelector ? document.querySelector(excludeSelector) : null;

    const updateExcludedRect = () => {
      excludedRect = excludedElement?.getBoundingClientRect() ?? null;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const desiredCount = getParticleCount(width);
      particles = Array.from({ length: desiredCount }, (_, index) => (
        particles[index] ?? createParticle(width, height)
      ));
      updateExcludedRect();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        const edgeFade = Math.min(1, particle.y / 90, (height - particle.y) / 90);
        const shimmer = 0.82 + Math.sin(particle.phase) * 0.18;
        let sectionFade = 1;

        if (excludedRect) {
          const fadeDistance = 55;
          const insideSection = particle.y >= excludedRect.top && particle.y <= excludedRect.bottom;
          const approachingTop = particle.y < excludedRect.top && particle.y > excludedRect.top - fadeDistance;
          const leavingBottom = particle.y > excludedRect.bottom && particle.y < excludedRect.bottom + fadeDistance;

          if (insideSection) sectionFade = 0;
          else if (approachingTop) sectionFade = (excludedRect.top - particle.y) / fadeDistance;
          else if (leavingBottom) sectionFade = (particle.y - excludedRect.bottom) / fadeDistance;
        }

        const alpha = Math.max(0, particle.opacity * edgeFade * shimmer * sectionFade);

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${GOLD}, ${alpha})`;
        context.shadowColor = `rgba(${GOLD}, ${alpha * 0.7})`;
        context.shadowBlur = particle.radius * 2.2;
        context.fill();
        context.shadowBlur = 0;

        if (!reducedMotion) {
          particle.y -= particle.speed;
          particle.x += particle.drift + Math.sin(particle.phase) * 0.025;
          particle.phase += particle.phaseSpeed;

          if (particle.y < -10 || particle.x < -15 || particle.x > width + 15) {
            Object.assign(particle, createParticle(width, height, false));
          }
        }
      });
    };

    const animate = () => {
      draw();
      if (isVisible && !reducedMotion) animationFrame = window.requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      window.cancelAnimationFrame(animationFrame);
      if (isVisible && !reducedMotion) animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    draw();
    if (!reducedMotion) animationFrame = window.requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateExcludedRect, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateExcludedRect);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [excludeSelector]);

  return <canvas ref={canvasRef} className="ambient-gold-particles" aria-hidden="true" />;
}
