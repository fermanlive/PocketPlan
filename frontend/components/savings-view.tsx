"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { formatCOP } from "@/lib/financial-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, PiggyBank, TrendingUp } from "lucide-react"

export function SavingsView() {
  const { activeMonth, addSavingsEntry, removeSavingsEntry } = useFinance()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")

  const totalSavings = activeMonth.savings.reduce((s, e) => s + e.amount, 0)

  function handleAdd() {
    const a = parseInt(amount, 10)
    if (!name.trim() || isNaN(a) || a <= 0) return
    addSavingsEntry({
      name: name.trim(),
      amount: a,
      date: new Date().toISOString().split("T")[0],
    })
    setName("")
    setAmount("")
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <PiggyBank className="h-5 w-5 text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">
              Total Ahorros del Mes
            </span>
            <span className="text-xl font-bold text-foreground font-mono">
              {formatCOP(totalSavings)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">
              Entradas
            </span>
            <span className="text-xl font-bold text-foreground font-mono">
              {activeMonth.savings.length}
            </span>
          </div>
        </div>
      </div>

      {/* Add button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-fit gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Agregar ahorro
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo ahorro</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Nombre
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Fondo emergencia"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Monto
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Savings list */}
      <div className="flex flex-col gap-2">
        {activeMonth.savings.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
            <PiggyBank className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No hay ahorros registrados este mes
            </p>
          </div>
        )}
        {activeMonth.savings.map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-border transition-colors hover:bg-secondary/40"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {entry.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {entry.date}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-sm font-bold font-mono",
                  entry.amount >= 0 ? "text-accent" : "text-destructive"
                )}
              >
                {formatCOP(entry.amount)}
              </span>
              <button
                onClick={() => removeSavingsEntry(entry.id)}
                className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                aria-label={`Eliminar ${entry.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
