"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFinance } from "@/lib/finance-context"
import { formatCOP, getTotalIncome } from "@/lib/financial-data"
import type { IncomeEntry } from "@/lib/financial-data"
import { Pencil, Trash2, Check, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface IncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ExtraIncomeRow({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: IncomeEntry
  onUpdate: (e: IncomeEntry) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(entry.name)
  const [editAmount, setEditAmount] = useState(String(entry.amount))
  const [editDate, setEditDate] = useState(entry.date)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function save() {
    const a = parseInt(editAmount, 10)
    if (!editName.trim() || isNaN(a)) return
    onUpdate({ ...entry, name: editName.trim(), amount: a, date: editDate })
    setEditing(false)
  }

  function cancel() {
    setEditName(entry.name)
    setEditAmount(String(entry.amount))
    setEditDate(entry.date)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 border-b border-border/40 py-2 last:border-0">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="h-7 flex-1 text-sm"
          autoFocus
          placeholder="Nombre"
        />
        <Input
          type="number"
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
          className="h-7 w-28 text-right text-sm font-mono"
          placeholder="Monto"
        />
        <Input
          type="date"
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
          className="h-7 w-32 text-sm"
        />
        <button onClick={save} className="shrink-0 rounded p-1 text-accent hover:bg-accent/10" aria-label="Guardar">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button onClick={cancel} className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Cancelar">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="group/row flex items-center gap-2.5 border-b border-border/40 py-2 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{entry.name}</p>
        <p className="text-[10px] text-muted-foreground">{entry.date}</p>
      </div>
      <span className="text-sm font-mono font-semibold text-foreground shrink-0">
        {formatCOP(entry.amount)}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Editar"
        >
          <Pencil className="h-3 w-3" />
        </button>
        {confirmDelete ? (
          <>
            <button
              onClick={() => onDelete(entry.id)}
              className="rounded px-1 py-0.5 text-xs text-destructive hover:bg-destructive/10"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
            aria-label="Eliminar"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export function IncomeDialog({ open, onOpenChange }: IncomeDialogProps) {
  const { activeMonth, updateSalaryPersisted, addExtraIncome, removeExtraIncome, updateExtraIncome } = useFinance()

  const [salaryInput, setSalaryInput] = useState(String(activeMonth.salary))
  const [confirmReset, setConfirmReset] = useState(false)
  const [newName, setNewName] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0])

  function handleSalaryBlur() {
    const val = parseInt(salaryInput, 10)
    if (!isNaN(val) && val !== activeMonth.salary) {
      updateSalaryPersisted(val)
    }
  }

  function handleReset() {
    if (confirmReset) {
      updateSalaryPersisted(0)
      setSalaryInput("0")
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
    }
  }

  function handleAddIncome() {
    const a = parseInt(newAmount, 10)
    if (!newName.trim() || isNaN(a) || a < 0) return
    addExtraIncome({ name: newName.trim(), amount: a, date: newDate })
    setNewName("")
    setNewAmount("")
    setNewDate(new Date().toISOString().split("T")[0])
  }

  const totalIncome = getTotalIncome(activeMonth)
  const extraIncomes = activeMonth.extraIncomes ?? []

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setConfirmReset(false) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gestión de Ingresos</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Salary section */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Salario Base
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                onBlur={handleSalaryBlur}
                onKeyDown={(e) => { if (e.key === "Enter") handleSalaryBlur() }}
                className="flex-1 font-mono"
                placeholder="0"
              />
              {confirmReset ? (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="destructive" onClick={handleReset}>
                    Confirmar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmReset(false)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={handleReset} className="text-destructive hover:text-destructive shrink-0">
                  Restablecer a 0
                </Button>
              )}
            </div>
          </div>

          {/* Extra incomes */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ingresos Extra
            </p>
            {extraIncomes.length > 0 ? (
              <div className="rounded-xl border border-border/60 px-3 py-1">
                {extraIncomes.map((entry) => (
                  <ExtraIncomeRow
                    key={entry.id}
                    entry={entry}
                    onUpdate={updateExtraIncome}
                    onDelete={removeExtraIncome}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Sin ingresos extra este mes.</p>
            )}

            {/* Add form */}
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre"
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => { if (e.key === "Enter") handleAddIncome() }}
              />
              <Input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Monto"
                className="w-28 h-8 text-sm font-mono text-right"
                onKeyDown={(e) => { if (e.key === "Enter") handleAddIncome() }}
              />
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-32 h-8 text-sm"
              />
              <Button size="sm" onClick={handleAddIncome} className="shrink-0 h-8 px-2">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Ingreso Total:</span>
            <span className={cn("font-mono font-bold text-foreground", totalIncome > 0 && "text-accent")}>
              {formatCOP(totalIncome)}
            </span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
