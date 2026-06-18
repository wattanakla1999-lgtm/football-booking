"use client";

import { useState } from "react";

import type {
  DashboardChartPoint,
  DashboardTrend,
} from "../types/adminBooking";
import { formatPrice } from "../utils/adminBooking";

type RevenueGrowthChartProps = {
  data: DashboardChartPoint[];
  trend: DashboardTrend;
  weeklyTotal: number;
};

function buildAreaPath(points: DashboardChartPoint[]) {
  if (points.length === 0) {
    return "";
  }

  const maxValue = Math.max(
    ...points.map((point) => point.value),
    1,
  );

  const coordinates = points.map(
    (point, index) => {
      const x =
        points.length === 1
          ? 50
          : (index / (points.length - 1)) * 100;
      const y =
        100 -
        (point.value / maxValue) * 72 -
        8;

      return {
        x,
        y,
      };
    },
  );

  const line = coordinates
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  const lastPoint =
    coordinates[coordinates.length - 1];
  const firstPoint = coordinates[0];

  const area = `${line} L ${lastPoint.x} 100 L ${firstPoint.x} 100 Z`;

  return {
    line,
    area,
    coordinates,
  };
}

export function RevenueGrowthChart({
  data,
  trend,
  weeklyTotal,
}: RevenueGrowthChartProps) {
  const chart = buildAreaPath(data);
  const [hoveredPointKey, setHoveredPointKey] =
    useState<string | null>(null);
  const trendLabel =
    trend.direction === "flat"
      ? "คงที่"
      : `${trend.direction === "up" ? "+" : "-"}${trend.value}%`;

  return (
    <div className="glass-card flex-1 rounded-xl p-md">
      <div className="mb-md flex items-start justify-between gap-3">
        <div>
          <h3 className="text-headline-md font-headline-md">
          การเติบโตรายได้
          </h3>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            ฿{formatPrice(weeklyTotal)} ใน 7 วันล่าสุด
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-label-sm font-bold ${
            trend.direction === "down"
              ? "bg-error/10 text-error"
              : trend.direction === "flat"
                ? "bg-surface-container-high text-on-surface-variant"
                : "bg-primary/10 text-primary"
          }`}
        >
          {trendLabel}
        </span>
      </div>

      <div className="relative mt-4 h-52 w-full overflow-hidden rounded-xl border border-outline-variant/10 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 grid grid-rows-4">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="border-b border-outline-variant/10 last:border-b-0"
            />
          ))}
        </div>

        <div className="relative h-full w-full">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient
                id="lineGrad"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#4be277"
                  stopOpacity="0.42"
                />

                <stop
                  offset="100%"
                  stopColor="#4be277"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {chart && (
              <>
                <path
                  d={chart.area}
                  fill="url(#lineGrad)"
                />

                <path
                  d={chart.line}
                  fill="none"
                  stroke="#4be277"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {chart.coordinates.map(
                  (point, index) => (
                    <circle
                      key={data[index]?.dateKey}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="#4be277"
                      stroke="#061327"
                      strokeWidth="1"
                    />
                  ),
                )}
              </>
            )}
          </svg>

          {chart &&
            chart.coordinates.map(
              (point, index) => {
                const item = data[index];
                const isHovered =
                  hoveredPointKey ===
                  item.dateKey;

                return (
                  <button
                    key={item.dateKey}
                    type="button"
                    aria-label={`${item.label} รายได้ ${formatPrice(item.value)} บาท`}
                    className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                    }}
                    onMouseEnter={() =>
                      setHoveredPointKey(
                        item.dateKey,
                      )
                    }
                    onMouseLeave={() =>
                      setHoveredPointKey(
                        null,
                      )
                    }
                    onFocus={() =>
                      setHoveredPointKey(
                        item.dateKey,
                      )
                    }
                    onBlur={() =>
                      setHoveredPointKey(
                        null,
                      )
                    }
                  >
                    <span className="sr-only">
                      {item.label}
                    </span>

                    {isHovered && (
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-lg border border-outline-variant/20 bg-surface px-2.5 py-1.5 text-left text-[11px] font-semibold text-on-surface shadow-lg shadow-black/20">
                        <span className="block">
                          {item.label}
                        </span>
                        <span className="block text-on-surface-variant">
                          ฿
                          {formatPrice(
                            item.value,
                          )}
                        </span>
                      </span>
                    )}
                  </button>
                );
              },
            )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center">
        {data.map((point) => (
            <span
              key={point.dateKey}
              className="text-label-sm text-on-surface-variant"
              title={`${point.label}: ฿${formatPrice(point.value)}`}
            >
              {point.shortLabel}
            </span>
          ))}
      </div>
    </div>
  );
}
