"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

type SeriesPoint = { date: string; users: number; events: number }

const chartConfig: ChartConfig = {
  users: {
    label: "Inscriptions",
    theme: {
      light: "hsl(221.2 83.2% 53.3%)", // bleu
      dark: "hsl(217.2 91.2% 59.8%)",
    },
  },
  events: {
    label: "Événements",
    theme: {
      light: "hsl(0 72.2% 50.6%)", // rouge
      dark: "hsl(0 62.8% 57.6%)",
    },
  },
}

export function ChartAreaInteractive({
  data,
  title = "Activité",
  description = "Derniers mois",
}: {
  data: SeriesPoint[]
  title?: string
  description?: string
}) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("12m")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("6m")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (!Array.isArray(data)) return []
    const months = timeRange === "12m" ? 12 : timeRange === "6m" ? 6 : 3
    return data.slice(-months)
  }, [data, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            {description}
          </span>
          <span className="@[540px]/card:hidden">{description}</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="12m" className="h-8 px-2.5">
              12 mois
            </ToggleGroupItem>
            <ToggleGroupItem value="6m" className="h-8 px-2.5">
              6 mois
            </ToggleGroupItem>
            <ToggleGroupItem value="3m" className="h-8 px-2.5">
              3 mois
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="12m" className="rounded-lg">
                12 mois
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                6 mois
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                3 mois
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-users)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-events)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-events)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="users"
              type="natural"
              fill="url(#fillUsers)"
              stroke="var(--color-users)"
              stackId="a"
            />
            <Area
              dataKey="events"
              type="natural"
              fill="url(#fillEvents)"
              stroke="var(--color-events)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
