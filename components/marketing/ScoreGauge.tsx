'use client';

import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score <= 40) return '#EF4444'; // red-500
  if (score <= 70) return '#F59E0B'; // amber-500
  return '#22C55E'; // green-500
}

function getScoreLabel(score: number): string {
  if (score <= 40) return 'Poor';
  if (score <= 70) return 'Needs Work';
  return 'Good';
}

export default function ScoreGauge({ score, size = 200 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Animate the score counting up
    const duration = 1200;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setAnimatedScore(current);
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // SVG circle properties
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = mounted ? (animatedScore / 100) * circumference : 0;
  const offset = circumference - progress;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1.2s ease-out',
            }}
          />
        </svg>
        {/* Score number centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold tabular-nums"
            style={{ fontSize: size * 0.28, color }}
          >
            {animatedScore}
          </span>
          <span className="text-gray-500 text-sm font-medium">out of 100</span>
        </div>
      </div>
      <div
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {label}
      </div>
    </div>
  );
}
