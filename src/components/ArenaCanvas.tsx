"use client";

import { useEffect, useRef, useState } from "react";
import { Agent, beltColors, mockAgents, mockSenseis } from "@/lib/mock-data";

interface ArenaCanvasProps {
  onSelectAgent?: (agent: Agent) => void;
  selectedAgent?: Agent | null;
}

interface AgentNode {
  agent: Agent;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetX: number;
  targetY: number;
}

export default function ArenaCanvas({ onSelectAgent, selectedAgent }: ArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<AgentNode[]>([]);
  const animRef = useRef<number>(0);
  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize nodes
    const allAgents = [...mockAgents, ...mockSenseis];
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const centerX = w / 2;
    const centerY = h / 2;

    nodesRef.current = allAgents.map((agent, i) => {
      const angle = (i / allAgents.length) * Math.PI * 2;
      const dist = agent.isSensei ? 80 : 120 + Math.random() * 100;
      const radius = agent.isSensei ? 35 : 18 + (agent.totalXP / 10000) * 22;
      return {
        agent,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius,
        targetX: centerX + Math.cos(angle) * dist,
        targetY: centerY + Math.sin(angle) * dist,
      };
    });

    // Active sparring pairs (animated connections)
    const sparringPairs = [
      [0, 6], // Zoe vs Sensei Kira
      [2, 7], // Nexus vs Sensei Byte
    ];

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = "rgba(255,255,255,0.02)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const nodes = nodesRef.current;

      // Update positions (gentle floating)
      nodes.forEach((node) => {
        node.x += Math.sin(t * 0.5 + node.agent.totalXP) * 0.3;
        node.y += Math.cos(t * 0.4 + node.agent.totalXP * 0.5) * 0.3;

        // Soft boundary
        if (node.x < node.radius + 20) node.x = node.radius + 20;
        if (node.x > w - node.radius - 20) node.x = w - node.radius - 20;
        if (node.y < node.radius + 20) node.y = node.radius + 20;
        if (node.y > h - node.radius - 20) node.y = h - node.radius - 20;
      });

      // Draw proximity connections (faint)
      nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
          if (j <= i) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.08;
            ctx.strokeStyle = `rgba(196, 255, 60, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });

      // Draw sparring connections (bright, animated)
      sparringPairs.forEach(([ai, bi]) => {
        const a = nodes[ai];
        const b = nodes[bi];
        if (!a || !b) return;

        const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        gradient.addColorStop(0, a.agent.color);
        gradient.addColorStop(1, b.agent.color);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -t * 30;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // "SPARRING" label
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        ctx.fillStyle = "rgba(196, 255, 60, 0.6)";
        ctx.font = "600 9px 'JetBrains Mono'";
        ctx.textAlign = "center";
        ctx.fillText("⚔ SPARRING", mx, my - 5);
      });

      // Draw nodes
      nodes.forEach((node) => {
        const isHovered = hoveredAgent?.id === node.agent.id;
        const isSelected = selectedAgent?.id === node.agent.id;
        const isSparring = sparringPairs.some(
          ([a, b]) => nodes[a]?.agent.id === node.agent.id || nodes[b]?.agent.id === node.agent.id
        );

        // Outer glow
        if (isSparring || isSelected) {
          const glow = ctx.createRadialGradient(
            node.x, node.y, node.radius,
            node.x, node.y, node.radius * 2
          );
          glow.addColorStop(0, `${node.agent.color}33`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pulse ring for sparring agents
        if (isSparring) {
          const pulseScale = 1 + Math.sin(t * 3) * 0.15;
          ctx.strokeStyle = `${node.agent.color}44`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * pulseScale * 1.3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Belt ring
        const beltColor = beltColors[node.agent.belt];
        ctx.strokeStyle = isHovered ? "#fff" : beltColor;
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Fill
        ctx.fillStyle = isHovered ? `${node.agent.color}44` : `${node.agent.color}22`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // XP progress ring
        const xpProgress = Math.min(node.agent.totalXP / 10000, 1);
        ctx.strokeStyle = node.agent.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4, -Math.PI / 2, -Math.PI / 2 + xpProgress * Math.PI * 2);
        ctx.stroke();

        // Avatar emoji
        ctx.font = `${node.radius * 0.8}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.agent.avatar, node.x, node.y);

        // Name label
        ctx.fillStyle = isHovered ? "#fff" : "rgba(255,255,255,0.7)";
        ctx.font = `${isHovered ? "600" : "400"} ${node.agent.isSensei ? 11 : 9}px 'JetBrains Mono'`;
        ctx.textAlign = "center";
        ctx.fillText(node.agent.name, node.x, node.y + node.radius + 14);

        // XP label
        if (isHovered) {
          ctx.fillStyle = node.agent.color;
          ctx.font = "500 8px 'JetBrains Mono'";
          ctx.fillText(`${node.agent.totalXP.toLocaleString()} XP`, node.x, node.y + node.radius + 26);
          ctx.fillText(node.agent.rank, node.x, node.y + node.radius + 38);
        }

        // Sensei badge
        if (node.agent.isSensei) {
          ctx.fillStyle = "#FFD700";
          ctx.font = "700 8px 'JetBrains Mono'";
          ctx.fillText("SENSEI", node.x, node.y - node.radius - 8);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    // Mouse handling
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const found = nodesRef.current.find((node) => {
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        return Math.sqrt(dx * dx + dy * dy) < node.radius + 5;
      });
      setHoveredAgent(found?.agent || null);
      canvas.style.cursor = found ? "pointer" : "default";
    };

    const handleClick = () => {
      if (hoveredAgent && onSelectAgent) {
        onSelectAgent(hoveredAgent);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [hoveredAgent, selectedAgent, onSelectAgent]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: "transparent" }}
      />
      <div className="absolute inset-0 scanlines" />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] text-[var(--muted)]">
        <span>⬜ White</span>
        <span>🟨 Yellow</span>
        <span>🟩 Green</span>
        <span>🟦 Blue</span>
        <span>⬛ Black</span>
      </div>
      <div className="absolute top-4 left-4 text-[10px] text-[var(--muted)] uppercase tracking-widest">
        Live Arena • {mockAgents.length + mockSenseis.length} agents online
      </div>
    </div>
  );
}
