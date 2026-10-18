"use client";
import { CartesianGrid, XAxis, YAxis, Area, ComposedChart, Scatter } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import type { TrackRecord } from "../_lib/gameContext";
import { errorsPerSecond } from "../_lib/typing/stats";



const chartConfig = {
  raw: {
    label: "Raw",
    color: "hsl(var(--chart-1))",
  },
  wpm: {
    label: "WPM",
    color: "hsl(var(--chart-2))",
  },
  errors: {
    label: "Errors",
    color: "hsl(var(--chart-3))"
  },
  elapsedSeconds: {
    label: "Time",
    color: "hsl(var(--chart-4))"
  }

} satisfies ChartConfig


type ResultProp = {
  trackBySecond: TrackRecord[];
  completedAt?: number;
};

type ErrorDotProps = { cx?: number; cy?: number; payload?: { errors: number } };

// A red cross on each second with mistakes; seconds without any show nothing.
function ErrorDot({ cx, cy, payload }: ErrorDotProps) {
  if (!payload?.errors || cx === undefined || cy === undefined) return <g />;
  const size = 4;
  return (
    <path
      d={`M${cx - size},${cy - size}L${cx + size},${cy + size}M${cx + size},${cy - size}L${cx - size},${cy + size}`}
      stroke="var(--color-error)"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  );
}

export default function ResultChart({trackBySecond, completedAt}:ResultProp) {
  const errors = errorsPerSecond(trackBySecond);
  const data = trackBySecond.map((record, i) => ({ ...record, errors: errors[i] }));

  return (

      <Card className="h-full bg-transparent border-none shadow-none text-base-content gap-2 py-0">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>{completedAt ? new Date(completedAt).toLocaleDateString() : "Speed and errors over time"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p aria-label="Chart legend" className="flex flex-wrap gap-4 text-xs text-base-content mb-3">
            <span className="inline-flex items-center gap-1.5"><span aria-hidden className="w-2 h-2 rounded-full bg-info" />WPM</span>
            <span className="inline-flex items-center gap-1.5"><span aria-hidden className="w-2 h-2 rounded-full bg-accent" />Raw</span>
            <span className="inline-flex items-center gap-1.5"><span aria-hidden className="w-2 h-2 rounded-full bg-error" />Errors</span>
          </p>
          <ChartContainer config={chartConfig} className="h-64 sm:h-80 w-full">
            <ComposedChart
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 20,
                bottom: 30
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="elapsedSeconds"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                type="number"
                domain={[0, "dataMax"]}
                tickFormatter={(value: number) => Number(value.toPrecision(3)).toString()}
                tick={{fill: "var(--color-base-content)"}}
                label={ {value: "Time (seconds)", position: "bottom", offset: 20, fill:"var(--color-base-content)"} }
              />
              <YAxis
                  yAxisId="speed"
                  label={ {value: "Words Per Minute", position:"insideLeft", dx:-10, dy: 20, angle:-90, fill:"var(--color-base-content)"} }
                  tick={{fill: "var(--color-base-content)"}}
              />
              <YAxis
                  yAxisId="errors"
                  orientation="right"
                  allowDecimals={false}
                  domain={[0, (max: number) => Math.max(max, 3)]}
                  label={ {value: "Errors", position:"insideRight", dx:10, angle:90, fill:"var(--color-base-content)"} }
                  tick={{fill: "var(--color-base-content)"}}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent className="bg-base-200 text-base-content" labelFormatter={(value) => Number(Number(value).toPrecision(3)) + " s"}/>} />
              <Area
                  yAxisId="speed"
                  dataKey="raw"
                  isAnimationActive={false}
                  type="monotone"
                  fillOpacity={0.08}
                  fill="var(--color-accent)"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
              />

              <Area
                  yAxisId="speed"
                  dataKey="wpm"
                  isAnimationActive={false}
                  type="monotone"
                  fillOpacity={0.15}
                  fill="var(--color-info)"
                  stroke="var(--color-info)"
                  strokeWidth={2}
              />
              <Scatter
                  yAxisId="errors"
                  dataKey="errors"
                  isAnimationActive={false}
                  fill="var(--color-error)"
                  shape={<ErrorDot />}
              />

            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

  )
}
