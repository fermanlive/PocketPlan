"use client"

import { useFinance } from "@/lib/finance-context"
import {
  formatCOP,
  getCategoryTotal,
  getCategoryRemaining,
  getTotalIncome,
  getMoneyToDate,
} from "@/lib/financial-data"
import { cn } from "@/lib/utils"

export function SummaryOverview() {
  const { activeMonth } = useFinance()

  const totalSpent = activeMonth.categories.reduce(
    (sum, cat) => sum + getCategoryTotal(cat),
    0
  )
  const totalIncome = getTotalIncome(activeMonth)
  const moneyToDate = getMoneyToDate(activeMonth)
  const totalRemaining = totalIncome - totalSpent

  return (
    <section className="rounded-2xl bg-card ring-1 ring-border p-5 lg:p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Resumen General
      </h2>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Sueldo</span>
          <span className="text-sm font-bold text-foreground font-mono">
            {formatCOP(totalIncome)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Gastado</span>
          <span className="text-sm font-bold text-foreground font-mono">
            {formatCOP(totalSpent)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Dinero a la fecha</span>
            <span className="text-[10px] text-muted-foreground/60">según gastos realizados</span>
          </div>
          <span className={cn("text-sm font-bold font-mono",
            moneyToDate >= 0 ? "text-accent" : "text-destructive")}>
            {formatCOP(moneyToDate)}
          </span>
        </div>
        <div className="my-1 h-px bg-border" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Balance</span>
          <span
            className={cn(
              "text-base font-bold font-mono",
              totalRemaining >= 0 ? "text-accent" : "text-destructive"
            )}
          >
            {formatCOP(totalRemaining)}
          </span>
        </div>
      </div>

      {/* Per-category breakdown */}
      <div className="mt-6 flex flex-col gap-2">
        {activeMonth.categories.map((cat) => {
          const remaining = getCategoryRemaining(cat)
          const isOver = remaining < 0
          return (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">
                  {cat.percentage}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {cat.name}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-bold font-mono",
                  isOver ? "text-destructive" : "text-accent"
                )}
              >
                {formatCOP(remaining)}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
