"use client"

import { useState } from "react"
import {
  formatCOP,
  getCategoryTotal,
  getCategoryRemaining,
  getUsagePercentage,
} from "@/lib/financial-data"
import type { BudgetCategory, ExpenseItem } from "@/lib/financial-data"
import { ItemIcon, AVAILABLE_ICONS } from "@/components/item-icon"
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
import { ChevronDown, Plus, Trash2, Pencil, Check, X } from "lucide-react"

const colorMap: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

function InlineItemRow({
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
      <div className="flex items-center gap-2 py-2">
        <ItemIcon icon={item.icon} categoryColor={categoryColor} size="sm" />
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="h-7 flex-1 text-xs"
          autoFocus
        />
        <Input
          type="number"
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
          className="h-7 w-24 text-right text-xs font-mono"
        />
        <button onClick={save} className="rounded p-1 text-accent" aria-label="Guardar">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={cancel} className="rounded p-1 text-muted-foreground" aria-label="Cancelar">
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2.5 py-1.5">
      <ItemIcon icon={item.icon} categoryColor={categoryColor} size="sm" />
      <span className="flex-1 text-xs text-muted-foreground">{item.name}</span>
      <span className={cn("text-xs font-mono font-medium", item.amount === 0 ? "text-muted-foreground" : "text-foreground")}>
        {formatCOP(item.amount)}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        aria-label={`Editar ${item.name}`}
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        onClick={() => removeItem(categoryId, item.id)}
        className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        aria-label={`Eliminar ${item.name}`}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}

function MobileCategoryRow({ category }: { category: BudgetCategory }) {
  const { addItem } = useFinance()
  const [expanded, setExpanded] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newIcon, setNewIcon] = useState("CircleDollarSign")

  const remaining = getCategoryRemaining(category)
  const percentage = getUsagePercentage(category)
  const isOver = remaining < 0

  function handleAdd() {
    const a = parseInt(newAmount, 10)
    if (!newName.trim() || isNaN(a)) return
    addItem(category.id, newName.trim(), a, newIcon)
    setNewName("")
    setNewAmount("")
    setNewIcon("CircleDollarSign")
    setDialogOpen(false)
  }

  return (
    <div className="rounded-2xl bg-card ring-1 ring-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4"
        aria-expanded={expanded}
      >
        <div className={cn("h-3 w-3 shrink-0 rounded-full", colorMap[category.color])} />
        <div className="flex flex-1 flex-col items-start gap-1">
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-bold text-foreground">{category.name}</span>
            <span className={cn("text-sm font-bold font-mono", isOver ? "text-destructive" : "text-accent")}>
              {formatCOP(remaining)}
            </span>
          </div>
          <div className="w-full">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", isOver ? "bg-destructive" : colorMap[category.color])}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{category.percentage}% - {formatCOP(category.budget)}</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-2">
          {category.items.map((item) => (
            <InlineItemRow
              key={item.id}
              item={item}
              categoryId={category.id}
              categoryColor={category.color}
            />
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs font-semibold text-foreground">Total</span>
            <span className="text-xs font-bold font-mono text-foreground">{formatCOP(getCategoryTotal(category))}</span>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground">
                <Plus className="h-3 w-3" />
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
                  <Select value={newIcon} onValueChange={setNewIcon}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-52">
                      {AVAILABLE_ICONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
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
      )}
    </div>
  )
}

export function MobileBudgetList() {
  const { activeMonth } = useFinance()

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {activeMonth.categories.map((cat) => (
        <MobileCategoryRow key={cat.id} category={cat} />
      ))}
    </div>
  )
}
