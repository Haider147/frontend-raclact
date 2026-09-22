"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/format"
import { es } from "date-fns/locale"

const PRESETS = [
  { label: "Últimos 7 días", days: 7 },
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 90 días", days: 90 },
]

function rangeFromDays(days: number): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  return { from, to }
}

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}) {
  const [open, setOpen] = useState(false)

  const label =
    value?.from && value?.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : "Seleccionar rango"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <CalendarRange className="size-3.5" strokeWidth={1.75} />
        {label}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <div className="flex">
          <div className="flex flex-col gap-1 border-r border-border p-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.days}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onChange(rangeFromDays(preset.days))
                  setOpen(false)
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div>
            <Calendar
              mode="range"
              locale={es}
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
              defaultMonth={value?.from}
            />
            <Separator />
            <div className="flex justify-end p-2">
              <Button size="sm" onClick={() => setOpen(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
