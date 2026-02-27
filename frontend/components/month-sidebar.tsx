"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { getMonthLabel, MONTH_NAMES } from "@/lib/financial-data"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PanelLeft,
  Plus,
  CalendarDays,
  Trash2,
} from "lucide-react"

export function MonthSidebar() {
  const {
    months,
    activeMonthId,
    setActiveMonthId,
    addMonth,
    deleteMonth,
  } = useFinance()

  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newYear, setNewYear] = useState(String(new Date().getFullYear()))
  const [newMonth, setNewMonth] = useState(String(new Date().getMonth() + 1))
  const [newSalary, setNewSalary] = useState("7200000")

  function handleAdd() {
    const y = parseInt(newYear, 10)
    const m = parseInt(newMonth, 10)
    const s = parseInt(newSalary, 10)
    if (isNaN(y) || isNaN(m) || isNaN(s) || m < 1 || m > 12) return
    addMonth(y, m, s)
    setDialogOpen(false)
    setOpen(false)
  }

  // Group months by year
  const byYear = months.reduce<Record<number, typeof months>>((acc, m) => {
    if (!acc[m.year]) acc[m.year] = []
    acc[m.year].push(m)
    return acc
  }, {})

  const sortedYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-secondary"
          aria-label="Abrir historial de meses"
        >
          <PanelLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Historial</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:max-w-80 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4" />
            Mis Finanzas
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Add new month */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="mb-4 flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nuevo mes
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar nuevo mes</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Mes
                  </label>
                  <Select value={newMonth} onValueChange={setNewMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES.map((name, i) => (
                        <SelectItem key={i} value={String(i + 1)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Ano
                  </label>
                  <Input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    min={2020}
                    max={2100}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Sueldo
                  </label>
                  <Input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAdd}>Crear mes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Month list grouped by year */}
          {sortedYears.map((year) => (
            <div key={year} className="mb-4">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {year}
              </p>
              <div className="flex flex-col gap-0.5">
                {byYear[year]
                  .sort((a, b) => b.month - a.month)
                  .map((m) => {
                    const isActive = m.id === activeMonthId
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-secondary font-medium text-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        )}
                      >
                        <button
                          onClick={() => {
                            setActiveMonthId(m.id)
                            setOpen(false)
                          }}
                          className="flex-1 text-left"
                        >
                          {getMonthLabel(m.year, m.month)}
                        </button>
                        {months.length > 1 && (
                          <button
                            onClick={() => deleteMonth(m.id)}
                            className="ml-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                            aria-label={`Eliminar ${getMonthLabel(m.year, m.month)}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
