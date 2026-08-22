import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  color?: string;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 16,
  color = '#ffffff',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / barCount) * 0.65;
      const gap = (width / barCount) * 0.35;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4; // minimum resting height
        if (isPlaying) {
          // Dynamic procedural rhythmic wave generator
          const freq1 = Math.sin(phase * 0.08 + i * 0.5);
          const freq2 = Math.cos(phase * 0.12 - i * 0.3);
          const raw = (freq1 + freq2 + 2) / 4; // normalize 0..1
          barHeight = Math.max(4, raw * height * 0.9);
        }

        const x = i * (barWidth + gap);
        const y = height - barHeight;

        if (color === 'gradient' || !color) {
          const grad = ctx.createLinearGradient(0, height, width, 0);
          grad.addColorStop(0, '#22d3ee');
          grad.addColorStop(1, '#d946ef');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = color;
        }
        ctx.globalAlpha = isPlaying ? 0.75 + Math.sin(phase * 0.1 + i) * 0.25 : 0.35;
        
        // Draw rounded top bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }

      phase += isPlaying ? 1 : 0.2;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, barCount, color]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={28}
      className={`h-7 ${className}`}
    />
  );
};
