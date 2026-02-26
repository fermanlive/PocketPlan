"use client"

import { useFinance } from "@/lib/finance-context"
import {
  getCategoryTotal,
  getUsagePercentage,
  formatCOP,
} from "@/lib/financial-data"

const barColors: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

const dotColors: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

export function BudgetDistribution() {
  const { activeMonth } = useFinance()

  return (
    <section className="rounded-2xl bg-card ring-1 ring-border p-5 lg:p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Distribucion del presupuesto
      </h2>
      {/* Stacked bar */}
      <div className="flex h-6 w-full overflow-hidden rounded-full">
        {activeMonth.categories.map((cat) => (
          <div
            key={cat.id}
            className={`${barColors[cat.color]} transition-all`}
            style={{ width: `${cat.percentage}%` }}
            title={`${cat.name}: ${cat.percentage}%`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="mt-4 flex flex-col gap-2">
        {activeMonth.categories.map((cat) => {
          const total = getCategoryTotal(cat)
          const pct = getUsagePercentage(cat)
          return (
            <div key={cat.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${dotColors[cat.color]}`}
                />
                <span className="text-xs text-muted-foreground">
                  {cat.name} ({cat.percentage}%)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-foreground">
                  {formatCOP(total)}
                </span>
                <span className="w-10 text-right text-[10px] text-muted-foreground">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
