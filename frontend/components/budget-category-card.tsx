"use client"

import { useState } from "react"
import {
  formatCOP,
  getCategoryTotal,
  getCategoryRemaining,
  getUsagePercentage,
} from "@/lib/financial-data"
import type { BudgetCategory, ExpenseItem } from "@/lib/financial-data"
import { ItemIcon } from "@/components/item-icon"
import { useFinance } from "@/lib/finance-context"
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
import { Plus, Trash2, Pencil, Check, X, TrendingDown, TrendingUp } from "lucide-react"

interface BudgetCategoryCardProps {
  category: BudgetCategory
}

const colorMap: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

const colorMapText: Record<string, string> = {
  "chart-1": "text-chart-1",
  "chart-2": "text-chart-2",
  "chart-3": "text-chart-3",
  "chart-4": "text-chart-4",
  "chart-5": "text-chart-5",
}

const colorMapBgLight: Record<string, string> = {
  "chart-1": "bg-chart-1/10",
  "chart-2": "bg-chart-2/10",
  "chart-3": "bg-chart-3/10",
  "chart-4": "bg-chart-4/10",
  "chart-5": "bg-chart-5/10",
}

function InlineEditRow({
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
      <div className="flex items-center gap-2 border-b border-border/40 py-2 last:border-0">
        <ItemIcon icon={item.icon} categoryColor={categoryColor} size="sm" />
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="h-7 flex-1 text-sm"
          autoFocus
        />
        <Input
          type="number"
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
          className="h-7 w-28 text-right text-sm font-mono"
        />
        <button
          onClick={save}
          className="shrink-0 rounded p-1 text-accent hover:bg-accent/10"
          aria-label="Guardar"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={cancel}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
          aria-label="Cancelar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="group/row flex items-center gap-2.5 border-b border-border/40 py-2.5 last:border-0">
      <ItemIcon icon={item.icon} categoryColor={categoryColor} size="sm" />
      <span className="flex-1 text-sm text-foreground leading-tight">{item.name}</span>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-sm font-mono font-semibold",
            item.amount === 0 ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {formatCOP(item.amount)}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100">
          <button
            onClick={() => setEditing(true)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label={`Editar ${item.name}`}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={() => removeItem(categoryId, item.id)}
            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
            aria-label={`Eliminar ${item.name}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function BudgetCategoryCard({ category }: BudgetCategoryCardProps) {
  const { addItem, subcategories } = useFinance()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newSubcatId, setNewSubcatId] = useState("")

  const catSubs = subcategories.filter((s) => s.categoriaPadreId === category.id)

  const total = getCategoryTotal(category)
  const remaining = getCategoryRemaining(category)
  const percentage = getUsagePercentage(category)
  const isOverBudget = remaining < 0

  function handleAdd() {
    const a = parseInt(newAmount, 10)
    if (!newName.trim() || isNaN(a)) return
    const selectedSub = catSubs.find((s) => s.id === newSubcatId)
    addItem(category.id, newName.trim(), a, selectedSub?.icon)
    setNewName("")
    setNewAmount("")
    setNewSubcatId("")
    setDialogOpen(false)
  }

  return (
    <article className="group flex flex-col rounded-2xl bg-card ring-1 ring-border transition-shadow hover:shadow-md hover:shadow-border/40">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colorMapBgLight[category.color])}>
            <div className={cn("h-3 w-3 rounded-full", colorMap[category.color])} />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-bold text-foreground">{category.name}</h3>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {category.percentage}% del sueldo
            </p>
          </div>
        </div>
        <span className="rounded-xl bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground font-mono">
          {formatCOP(category.budget)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-500", isOverBudget ? "bg-destructive" : colorMap[category.color])}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{percentage.toFixed(0)}% usado</span>
          <span>{formatCOP(total)} gastado</span>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 flex-col px-5 pt-3 hidden md:flex">
        {category.items.map((item) => (
          <InlineEditRow
            key={item.id}
            item={item}
            categoryId={category.id}
            categoryColor={category.color}
          />
        ))}

        {/* Add item */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
              <Plus className="h-3 w-3" />
              Agregar item
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar a {category.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              {catSubs.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subcategoría</label>
                  <Select
                    value={newSubcatId}
                    onValueChange={(val) => {
                      setNewSubcatId(val)
                      const sub = catSubs.find((s) => s.id === val)
                      if (sub) setNewName(sub.name)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catSubs.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          <span className="flex items-center gap-2">
                            <ItemIcon icon={sub.icon} categoryColor={category.color} size="sm" />
                            {sub.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Nombre</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Internet" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Monto</label>
                <Input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="100000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAdd}>Agregar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isOverBudget ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingUp className="h-4 w-4 text-accent" />
            )}
            <span className="text-xs text-muted-foreground">Restante</span>
          </div>
          <span className={cn("text-lg font-bold font-mono", isOverBudget ? "text-destructive" : colorMapText[category.color])}>
            {formatCOP(remaining)}
          </span>
        </div>
      </div>
    </article>
  )
}
