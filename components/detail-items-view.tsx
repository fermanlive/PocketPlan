"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import {
  formatCOP,
  getCategoryTotal,
  getCategoryRemaining,
  getUsagePercentage,
} from "@/lib/financial-data"
import type { BudgetCategory, ExpenseItem } from "@/lib/financial-data"
import { ItemIcon, AVAILABLE_ICONS } from "@/components/item-icon"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"

const colorMap: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

const colorText: Record<string, string> = {
  "chart-1": "text-chart-1",
  "chart-2": "text-chart-2",
  "chart-3": "text-chart-3",
  "chart-4": "text-chart-4",
  "chart-5": "text-chart-5",
}

// Inline editable row
function EditableRow({
  item,
  categoryId,
  categoryColor,
}: {
  item: ExpenseItem
  categoryId: string
  categoryColor: string
}) {
  const { removeItem, updateItem } = useFinance()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const [editAmount, setEditAmount] = useState(String(item.amount))

  function save() {
    const a = parseInt(editAmount, 10)
    if (!editName.trim() || isNaN(a)) return
    updateItem(categoryId, { ...item, name: editName.trim(), amount: a })
    setEditing(false)
  }

  function cancel() {
    setEditName(item.name)
    setEditAmount(String(item.amount))
    setEditing(false)
  }

  if (editing) {
    return (
      <tr className="border-b border-border/40 bg-secondary/30">
        <td className="py-2 pl-4 pr-2">
          <ItemIcon icon={item.icon} categoryColor={categoryColor} size="sm" />
        </td>
        <td className="py-2 pr-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-7 text-sm"
            autoFocus
          />
        </td>
        <td className="py-2 pr-2">
          <Input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className="h-7 w-32 text-right text-sm font-mono"
          />
        </td>
        <td className="py-2 pr-4">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={save}
              className="rounded-md p-1 text-accent hover:bg-accent/10"
              aria-label="Guardar"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={cancel}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              aria-label="Cancelar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="group border-b border-border/40 transition-colors hover:bg-secondary/20 last:border-0">
      <td className="py-2.5 pl-4 pr-2">
        <ItemIcon icon={item.icon} categoryColor={categoryColor} size="sm" />
      </td>
      <td className="py-2.5 pr-2 text-sm text-foreground">{item.name}</td>
      <td className="py-2.5 pr-2 text-right">
        <span
          className={cn(
            "text-sm font-mono font-medium",
            item.amount === 0 ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {formatCOP(item.amount)}
        </span>
      </td>
      <td className="py-2.5 pr-4">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setEditing(true)}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label={`Editar ${item.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => removeItem(categoryId, item.id)}
            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Eliminar ${item.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// Add item dialog per category
function AddItemDialog({ category }: { category: BudgetCategory }) {
  const { addItem } = useFinance()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [icon, setIcon] = useState("CircleDollarSign")

  function handleAdd() {
    const a = parseInt(amount, 10)
    if (!name.trim() || isNaN(a)) return
    addItem(category.id, name.trim(), a, icon)
    setName("")
    setAmount("")
    setIcon("CircleDollarSign")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center justify-center gap-1.5 rounded-b-2xl border-t border-dashed border-border/60 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
          Agregar item
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar a {category.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Icono</label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-52">
                {AVAILABLE_ICONS.map((ic) => (
                  <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Internet"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Monto</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleAdd}>Agregar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Single category table card
function CategoryTable({ category }: { category: BudgetCategory }) {
  const total = getCategoryTotal(category)
  const remaining = getCategoryRemaining(category)
  const percentage = getUsagePercentage(category)
  const isOver = remaining < 0

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("h-2.5 w-2.5 rounded-full", colorMap[category.color])} />
          <h3 className="text-sm font-bold text-foreground">{category.name}</h3>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {category.percentage}%
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs font-mono font-bold text-foreground">{formatCOP(total)}</span>
          <span className={cn("text-[10px] font-mono", isOver ? "text-destructive" : "text-accent")}>
            {isOver ? "+" : ""}{formatCOP(Math.abs(remaining))} {isOver ? "excedido" : "restante"}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-2 pb-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", isOver ? "bg-destructive" : colorMap[category.color])}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-right text-[10px] text-muted-foreground">{percentage.toFixed(0)}% de {formatCOP(category.budget)}</p>
      </div>

      {/* Table */}
      <div className="flex-1">
        {category.items.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">Sin items. Agrega uno abajo.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="w-10 py-1.5 pl-4 text-left" />
                <th className="py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Concepto
                </th>
                <th className="py-1.5 pr-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Monto
                </th>
                <th className="w-16 py-1.5 pr-4" />
              </tr>
            </thead>
            <tbody>
              {category.items.map((item) => (
                <EditableRow
                  key={item.id}
                  item={item}
                  categoryId={category.id}
                  categoryColor={category.color}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer total row */}
      {category.items.length > 0 && (
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2">
          <span className="text-xs font-semibold text-muted-foreground">Total</span>
          <span className="text-sm font-bold font-mono text-foreground">{formatCOP(total)}</span>
        </div>
      )}

      {/* Add item */}
      <AddItemDialog category={category} />
    </article>
  )
}

export function DetailItemsView() {
  const { activeMonth } = useFinance()

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {activeMonth.categories.map((cat) => (
        <CategoryTable key={cat.id} category={cat} />
      ))}
    </div>
  )
}
