"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { formatCOP, getMonthLabel, getTotalIncome } from "@/lib/financial-data"
import { MonthSidebar } from "@/components/month-sidebar"
import { SettingsPanel } from "@/components/settings-panel"
import { UserSessionPanel } from "@/components/user-session-panel"
import { IncomeDialog } from "@/components/income-dialog"
import { Banknote, Pencil } from "lucide-react"

export function SalaryHeader() {
  const { activeMonth } = useFinance()
  const [incomeOpen, setIncomeOpen] = useState(false)
  const totalIncome = getTotalIncome(activeMonth)
  const extraCount = (activeMonth.extraIncomes ?? []).length

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
              Ingresos{extraCount > 0 && <span className="ml-1 rounded bg-primary/10 px-1 text-primary">{extraCount} extra</span>}
            </span>
            <span className="text-base font-bold text-foreground font-mono">
              {formatCOP(totalIncome)}
            </span>
          </div>
          <button
            onClick={() => setIncomeOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Editar ingresos"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        <SettingsPanel />
        <UserSessionPanel />
        <IncomeDialog open={incomeOpen} onOpenChange={setIncomeOpen} />
      </div>
    </header>
  )
}
