import React from 'react';
import { DailyProjectionPoint } from '../types/finance';

interface TrajectoryChartProps {
  baselineProjections: DailyProjectionPoint[];
  simulatedProjections?: DailyProjectionPoint[] | null;
  currentDay: number;
  height?: number;
  onSelectDay?: (day: number) => void;
  selectedDay?: number | null;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({
  baselineProjections,
  simulatedProjections,
  currentDay,
  height = 260,
  onSelectDay,
  selectedDay,
}) => {
  const width = 840;
  const padLeft = 58;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 34;
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;

  const allValues = [
    ...baselineProjections.map(p => p.actualOrProjectedBalance),
    ...(simulatedProjections ? simulatedProjections.map(p => p.actualOrProjectedBalance) : []),
    0,
    10000,
  ];

  const minVal = Math.min(-500, ...allValues);
  const maxVal = Math.max(10500, ...allValues);
  const range = Math.max(1, maxVal - minVal);

  const getX = (day: number) => padLeft + ((day - 1) / 29) * innerWidth;
  const getY = (val: number) => padTop + innerHeight - ((val - minVal) / range) * innerHeight;

  const zeroY = getY(0);

  const buildPath = (points: DailyProjectionPoint[]) =>
    points
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(pt.day).toFixed(1)} ${getY(pt.actualOrProjectedBalance).toFixed(1)}`)
      .join(' ');

  const actualPoints = baselineProjections.filter(p => p.day <= currentDay);
  const projectedPoints = baselineProjections.filter(p => p.day >= currentDay);

  const actualPath = buildPath(actualPoints);
  const projectedPath = buildPath(projectedPoints);
  const simPath = simulatedProjections ? buildPath(simulatedProjections.filter(p => p.day >= currentDay)) : '';

  const yTicks = [10000, 7500, 5000, 2500, 0];
  if (minVal < -200) {
    yTicks.push(-1500);
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label="30-Day Financial Runway Trajectory Chart"
      >
        <defs>
          <linearGradient id="actualAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="simAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Danger Overdraft Zone below ₹0 */}
        {zeroY < padTop + innerHeight && (
          <rect
            x={padLeft}
            y={zeroY}
            width={innerWidth}
            height={Math.max(0, padTop + innerHeight - zeroY)}
            fill="#EF4444"
            fillOpacity="0.08"
          />
        )}

        {/* Horizontal Grid Lines & Y-Axis Labels */}
        {yTicks.map(tick => {
          const y = getY(tick);
          if (y < padTop - 6 || y > height - padBottom + 10) return null;
          const isZero = tick === 0;
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke={isZero ? '#EF4444' : '#1E293B'}
                strokeWidth={isZero ? 1.5 : 1}
                strokeDasharray={isZero ? '4 4' : undefined}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-mono tabular-nums"
              >
                {tick < 0 ? `-₹${Math.abs(tick)}` : `₹${tick.toLocaleString('en-IN')}`}
              </text>
            </g>
          );
        })}

        {/* Current Day Vertical Marker */}
        <line
          x1={getX(currentDay)}
          y1={padTop}
          x2={getX(currentDay)}
          y2={height - padBottom}
          stroke="#38BDF8"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <text
          x={getX(currentDay)}
          y={padTop - 8}
          textAnchor="middle"
          className="fill-sky-400 text-[10px] font-mono font-semibold"
        >
          DAY {currentDay} (TODAY)
        </text>

        {/* Area under actual curve */}
        {actualPoints.length > 1 && (
          <path
            d={`${actualPath} L ${getX(currentDay).toFixed(1)} ${zeroY.toFixed(1)} L ${getX(1).toFixed(1)} ${zeroY.toFixed(1)} Z`}
            fill="url(#actualAreaGrad)"
          />
        )}

        {/* Actual Path (Days 1..currentDay) */}
        {actualPath && (
          <path
            d={actualPath}
            fill="none"
            stroke="#10B981"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Baseline Projected Path (currentDay..30) */}
        {projectedPath && (
          <path
            d={projectedPath}
            fill="none"
            stroke="#94A3B8"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* What-If Simulated Path (currentDay..30) */}
        {simPath && (
          <path
            d={simPath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Interactive Day Nodes */}
        {baselineProjections.map(pt => {
          const cx = getX(pt.day);
          const cy = getY(pt.actualOrProjectedBalance);
          const hasBillOrSub = pt.commitmentSettled > 0 || pt.subscriptionSettled > 0;
          const isCurrent = pt.day === currentDay;
          const isSelected = pt.day === selectedDay;
          const isNegative = pt.actualOrProjectedBalance < 0;

          return (
            <g
              key={pt.day}
              className="cursor-pointer group"
              onClick={() => onSelectDay && onSelectDay(pt.day)}
            >
              {/* Invisible larger hit target */}
              <circle cx={cx} cy={cy} r={10} fill="transparent" />

              {(isCurrent || isSelected || hasBillOrSub || pt.day === 1 || pt.day === 30 || pt.day % 5 === 0) && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isCurrent || isSelected ? 5 : hasBillOrSub ? 3.8 : 2.5}
                  fill={
                    isNegative
                      ? '#EF4444'
                      : isCurrent
                      ? '#38BDF8'
                      : hasBillOrSub
                      ? '#F59E0B'
                      : pt.isProjected
                      ? '#64748B'
                      : '#10B981'
                  }
                  stroke="#090D16"
                  strokeWidth={1.5}
                />
              )}

              {/* X-Axis Day labels */}
              {(pt.day === 1 || pt.day % 5 === 0 || pt.day === currentDay) && (
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-mono tabular-nums ${
                    isCurrent ? 'fill-sky-400 font-bold' : 'fill-slate-500'
                  }`}
                >
                  D{pt.day}
                </text>
              )}
            </g>
          );
        })}

        {/* Simulated End Point Node */}
        {simulatedProjections && simulatedProjections.length === 30 && (
          <g>
            <circle
              cx={getX(30)}
              cy={getY(simulatedProjections[29].actualOrProjectedBalance)}
              r={4.5}
              fill="#38BDF8"
              stroke="#090D16"
              strokeWidth={1.5}
            />
          </g>
        )}
      </svg>
    </div>
  );
};
