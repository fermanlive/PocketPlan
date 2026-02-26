"use client"

import { useFinance } from "@/lib/finance-context"
import { formatCOP, getMonthLabel } from "@/lib/financial-data"
import { MonthSidebar } from "@/components/month-sidebar"
import { Banknote, ShoppingCart } from "lucide-react"

export function SalaryHeader() {
  const { activeMonth } = useFinance()

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex items-center gap-3">
        <MonthSidebar />
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Presupuesto Mensual
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl text-balance">
            {getMonthLabel(activeMonth.year, activeMonth.month)}
          </h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Banknote className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Sueldo
            </span>
            <span className="text-base font-bold text-foreground font-mono">
              {formatCOP(activeMonth.salary)}
            </span>
          </div>
        </div>
        {activeMonth.weeklyBudgets.map((week) => (
          <div
            key={week.label}
            className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10">
              <ShoppingCart className="h-4 w-4 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {week.label}
              </span>
              <span className="text-base font-bold text-foreground font-mono">
                {formatCOP(week.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </header>
  )
}
