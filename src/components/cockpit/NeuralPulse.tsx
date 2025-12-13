import { useEffect, useRef } from "react";

interface NeuralPulseProps {
  className?: string;
  color?: string;
  nodeCount?: number;
}

export const NeuralPulse = ({ 
  className = "", 
  color = "hsl(var(--secondary))",
  nodeCount = 8
}: NeuralPulseProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let animationFrame: number;
    let time = 0;

    // Generate stable node positions
    const nodes = [...Array(nodeCount)].map((_, i) => ({
      x: 15 + (i % 4) * 25 + (Math.random() - 0.5) * 10,
      y: 15 + Math.floor(i / 4) * 35 + (Math.random() - 0.5) * 10,
      phase: Math.random() * Math.PI * 2,
      connections: [] as number[],
    }));

    // Create connections
    nodes.forEach((node, i) => {
      nodes.forEach((_, j) => {
        if (i !== j && Math.random() > 0.6) {
          node.connections.push(j);
        }
      });
    });

    const animate = () => {
      time += 0.015;

      // Animate nodes
      const nodeElements = svg.querySelectorAll('.neural-node');
      nodeElements.forEach((node, i) => {
        const pulse = 0.5 + Math.sin(time * 2 + nodes[i].phase) * 0.5;
        node.setAttribute('opacity', (0.4 + pulse * 0.6).toString());
        node.setAttribute('r', (2 + pulse * 1.5).toString());
      });

      // Animate connections
      const connections = svg.querySelectorAll('.neural-connection');
      connections.forEach((conn, i) => {
        const pulse = 0.2 + Math.sin(time * 3 + i * 0.5) * 0.3;
        conn.setAttribute('opacity', pulse.toString());
      });

      animationFrame = requestAnimationFrame(animate);
    };

    // Generate connection paths
    const connectionGroup = svg.querySelector('.connections-group');
    if (connectionGroup) {
      connectionGroup.innerHTML = '';
      nodes.forEach((node, i) => {
        node.connections.forEach(j => {
          if (j > i) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.classList.add('neural-connection');
            line.setAttribute('x1', node.x.toString());
            line.setAttribute('y1', node.y.toString());
            line.setAttribute('x2', nodes[j].x.toString());
            line.setAttribute('y2', nodes[j].y.toString());
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '0.5');
            line.setAttribute('opacity', '0.3');
            connectionGroup.appendChild(line);
          }
        });
      });
    }

    // Generate nodes
    const nodesGroup = svg.querySelector('.nodes-group');
    if (nodesGroup) {
      nodesGroup.innerHTML = '';
      nodes.forEach((node) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.classList.add('neural-node');
        circle.setAttribute('cx', node.x.toString());
        circle.setAttribute('cy', node.y.toString());
        circle.setAttribute('r', '2');
        circle.setAttribute('fill', color);
        circle.setAttribute('opacity', '0.7');
        nodesGroup.appendChild(circle);
      });
    }

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [color, nodeCount]);

  return (
    <svg 
      ref={svgRef}
      className={`${className}`}
      viewBox="0 0 100 80"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="neuralGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#neuralGlow)">
        <g className="connections-group" />
        <g className="nodes-group" />
      </g>
    </svg>
  );
};
