import { useEffect, useRef } from "react";

interface DNAHelixProps {
  className?: string;
  color1?: string;
  color2?: string;
}

export const DNAHelix = ({ 
  className = "", 
  color1 = "hsl(var(--primary))",
  color2 = "hsl(var(--secondary))"
}: DNAHelixProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      
      const paths = svg.querySelectorAll('.dna-strand');
      paths.forEach((path, index) => {
        const offset = index * Math.PI;
        const d = generateHelixPath(time + offset, index === 0 ? 1 : -1);
        path.setAttribute('d', d);
      });

      const rungs = svg.querySelectorAll('.dna-rung');
      rungs.forEach((rung, index) => {
        const y = 10 + (index * 15);
        const phase = time + (index * 0.3);
        const opacity = 0.3 + Math.abs(Math.sin(phase)) * 0.7;
        rung.setAttribute('opacity', opacity.toString());
      });

      animationFrame = requestAnimationFrame(animate);
    };

    const generateHelixPath = (phase: number, direction: number) => {
      const points: string[] = [];
      const amplitude = 15;
      const segments = 20;

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = t * 100;
        const x = 50 + Math.sin(t * Math.PI * 4 + phase) * amplitude * direction;
        
        if (i === 0) {
          points.push(`M ${x} ${y}`);
        } else {
          points.push(`L ${x} ${y}`);
        }
      }

      return points.join(' ');
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <svg 
      ref={svgRef}
      className={`${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="strand1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color1} stopOpacity="0.8" />
          <stop offset="50%" stopColor={color1} stopOpacity="1" />
          <stop offset="100%" stopColor={color1} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="strand2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color2} stopOpacity="0.8" />
          <stop offset="50%" stopColor={color2} stopOpacity="1" />
          <stop offset="100%" stopColor={color2} stopOpacity="0.8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* DNA rungs (base pairs) */}
      {[...Array(6)].map((_, i) => (
        <line
          key={i}
          className="dna-rung"
          x1="35"
          y1={10 + i * 15}
          x2="65"
          y2={10 + i * 15}
          stroke={color1}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      ))}

      {/* DNA strands */}
      <path
        className="dna-strand"
        d="M 35 0 L 35 100"
        stroke="url(#strand1Gradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      <path
        className="dna-strand"
        d="M 65 0 L 65 100"
        stroke="url(#strand2Gradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
      />
    </svg>
  );
};
