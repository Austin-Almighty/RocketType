"use client";
import { CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { useGameContext } from "../_lib/gameContext";

    

const chartConfig = {
  raw: {
    label: "Raw",
    color: "hsl(var(--chart-1))",
  },
  wpm: {
    label: "WPM",
    color: "hsl(var(--chart-2))",
  },
  mistakes: {
    label: "Errors",
    color: "hsl(var(--chart-3))"
  },
  elapsedSeconds: {
    label: "Time",
    color: "hsl(var(--chart-4))"
  }

} satisfies ChartConfig

const today = new Date();
const month = (today.getMonth()+1).toString();
const date = today.getDate().toString();

type TrackRecord = {
  keyCount: number;
  wpm: number;
  raw: number;
  mistakes: number;
  elapsedSeconds: number;
};

type ResultProp = {
  trackBySecond: TrackRecord[]; 
};


export default function ResultChart({trackBySecond}:ResultProp) {
  const { gameMode } = useGameContext();
  const latest = trackBySecond[trackBySecond.length - 1];

  const averageRaw =
  trackBySecond.length > 0
    ? (
        trackBySecond.reduce((sum, entry) => sum + (entry.raw ?? 0), 0) /
        trackBySecond.length
      ).toFixed(1)
    : "0.0";

  return (
    
      <Card className="h-full bg-transparent border-none shadow-none text-blue-950">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>{`${month}/${date}`}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[32vh] w-full">
            <AreaChart
              // accessibilityLayer
              data={trackBySecond}
              margin={{
                left: 12,
                right: 12,
                top: 20,
                bottom: 30
              }}
            >
              <CartesianGrid vertical={true} />
              <XAxis
                dataKey="elapsedSeconds"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => value }
                label={ {value: "Time (seconds)", position: "bottom", offset: 20} }
              />
              <YAxis
                  label={ {value: "Words Per Minute", position:"insideLeft", dx:-10, dy: 20, angle:-90} }
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                  dataKey="raw"
                  type="monotone"
                  fill="rgba(128,128,128, 0.3)"   // semi-transparent green fill
                  stroke="grey"
                  strokeWidth={2}
              />

              <Area
                  dataKey="wpm"
                  type="monotone"
                  fill="rgba(136, 23, 39, 0.3)"
                  strokeWidth={2}
              />
              <Area
                  dataKey="mistakes"
                  type="monotone"
                  fill="red"
                  stroke="red"

                  strokeWidth={2}
              />
              
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full justify-evenly text-center align-center text-l">
            <div>
              <div>Raw</div>
              <div>{averageRaw}</div>
            </div>
            <div>
              <div>Characters</div>
              <div>{`${latest.keyCount}/${latest.mistakes}`}</div>
            </div>
            <div>
              <div>Time</div>
              <div>{gameMode.time}</div>
            </div>
          </div>
        </CardFooter>
      </Card>

  )
}
