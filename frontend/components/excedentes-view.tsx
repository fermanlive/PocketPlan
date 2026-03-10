"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import {
  formatCOP,
  getExtraFundAllocated,
  getExtraFundRemaining,
  SOURCE_LABELS,
} from "@/lib/financial-data"
import type { ExtraFund, ExtraFundItem, SubItem } from "@/lib/financial-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Layers,
  CircleCheck,
  Sparkles,
  Banknote,
} from "lucide-react"

// ─── Source badge ──────────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<ExtraFund["source"], string> = {
  cesantias: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  prima: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  venta: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  bono: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  otro: "bg-muted text-muted-foreground",
}

// ─── SubItemRow dentro de ExtraFundItem ───────────────────────────────────────

function FundSubItemRow({
  subitem,
  fundId,
  itemId,
  onUpdate,
  onRemove,
}: {
  subitem: SubItem
  fundId: string
  itemId: string
  onUpdate: (sub: SubItem) => void
  onRemove: (subId: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(subitem.name)
  const [editAmount, setEditAmount] = useState(String(subitem.amount))

  function save() {
    const a = parseInt(editAmount, 10)
    if (!editName.trim() || isNaN(a)) return
    onUpdate({ ...subitem, name: editName.trim(), amount: a })
    setEditing(false)
  }

  function cancel() {
    setEditName(subitem.name)
    setEditAmount(String(subitem.amount))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 py-1">
        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-6 flex-1 text-xs" autoFocus />
        <Input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="h-6 w-24 text-right text-xs font-mono" />
        <button onClick={save} className="shrink-0 rounded p-0.5 text-accent hover:bg-accent/10"><Check className="h-3 w-3" /></button>
        <button onClick={cancel} className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted"><X className="h-3 w-3" /></button>
      </div>
    )
  }

  return (
    <div className="group/sub flex items-center gap-2 py-1">
      <button
        onClick={() => onUpdate({ ...subitem, paid: !subitem.paid })}
        className={cn(
          "shrink-0 transition-opacity",
          subitem.paid ? "opacity-100 text-accent" : "opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-accent"
        )}
      >
        <CircleCheck className="h-3 w-3" />
      </button>
      <span className={cn("flex-1 text-xs text-foreground leading-tight", subitem.paid && "line-through text-muted-foreground")}>
        {subitem.name}
      </span>
      <span className="text-xs font-mono text-muted-foreground shrink-0">{formatCOP(subitem.amount)}</span>
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/sub:opacity-100 shrink-0">
        <button onClick={() => setEditing(true)} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
          <Pencil className="h-2.5 w-2.5" />
        </button>
        <button onClick={() => onRemove(subitem.id)} className="rounded p-0.5 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  )
}

// ─── AddSubItemForm dentro de FundItemRow ────────────────────────────────────

function AddFundSubItemForm({ onAdd }: { onAdd: (name: string, amount: number) => void }) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")

  function handle() {
    const a = parseInt(amount, 10)
    if (!name.trim() || isNaN(a) || a < 0) return
    onAdd(name.trim(), a)
    setName("")
    setAmount("")
  }

  return (
    <div className="flex items-center gap-1.5 pt-1 border-t border-border/30">
      <Input value={name} onChange={(e) => setName(e.target.value)} className="h-6 flex-1 text-xs" placeholder="Sub-item" onKeyDown={(e) => { if (e.key === "Enter") handle() }} />
      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-6 w-24 text-right text-xs font-mono" placeholder="0" onKeyDown={(e) => { if (e.key === "Enter") handle() }} />
      <button onClick={handle} className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"><Plus className="h-3 w-3" /></button>
    </div>
  )
}

// ─── FundItemRow ──────────────────────────────────────────────────────────────

function FundItemRow({
  item,
  fundId,
  onUpdate,
  onRemove,
}: {
  item: ExtraFundItem
  fundId: string
  onUpdate: (updated: ExtraFundItem) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const [editAmount, setEditAmount] = useState(String(item.amount))
  const [editNote, setEditNote] = useState(item.note ?? "")
  const [expanded, setExpanded] = useState(false)

  const subitems = item.subitems ?? []
  const hasSubitems = subitems.length > 0
  const effectiveAmount = hasSubitems
    ? subitems.reduce((s, sub) => s + sub.amount, 0)
    : item.amount

  function save() {
    const a = parseInt(editAmount, 10)
    if (!editName.trim() || isNaN(a)) return
    onUpdate({ ...item, name: editName.trim(), amount: a, note: editNote || undefined })
    setEditing(false)
  }

  function cancel() {
    setEditName(item.name)
    setEditAmount(String(item.amount))
    setEditNote(item.note ?? "")
    setEditing(false)
  }

  function handleSubUpdate(sub: SubItem) {
    const newSubs = subitems.map((s) => (s.id === sub.id ? sub : s))
    onUpdate({ ...item, subitems: newSubs, amount: newSubs.reduce((s, x) => s + x.amount, 0) })
  }

  function handleSubRemove(subId: string) {
    const newSubs = subitems.filter((s) => s.id !== subId)
    onUpdate({
      ...item,
      subitems: newSubs,
      amount: newSubs.length > 0 ? newSubs.reduce((s, x) => s + x.amount, 0) : item.amount,
    })
  }

  function handleSubAdd(name: string, amount: number) {
    const newSub: SubItem = { id: `fsub-${Date.now()}`, name, amount }
    const newSubs = [...subitems, newSub]
    onUpdate({ ...item, subitems: newSubs, amount: newSubs.reduce((s, x) => s + x.amount, 0) })
  }

  // Panel de subitems
  const subTotal = subitems.reduce((s, sub) => s + sub.amount, 0)
  const overBudget = subTotal > item.amount
  const remaining = item.amount - subTotal
  const progress = item.amount > 0 ? Math.min((subTotal / item.amount) * 100, 100) : 0

  return (
    <div className="border-b border-border/40 last:border-0">
      {editing ? (
        <div className="flex items-center gap-2 py-2">
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 flex-1 text-sm" autoFocus />
          <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} className="h-7 w-24 text-xs text-muted-foreground" placeholder="Nota" />
          <div className="relative">
            <Input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className={cn("h-7 w-28 text-right text-sm font-mono", hasSubitems && "opacity-50 cursor-not-allowed")}
              disabled={hasSubitems}
              title={hasSubitems ? "Calculado desde sub-items" : undefined}
            />
            {hasSubitems && <Layers className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            title="Desglosar en sub-items"
            className={cn("shrink-0 rounded p-1 transition-colors", (hasSubitems || expanded) ? "text-blue-500" : "text-muted-foreground hover:text-foreground")}
          >
            <Layers className="h-3.5 w-3.5" />
          </button>
          <button onClick={save} className="shrink-0 rounded p-1 text-accent hover:bg-accent/10"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={cancel} className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <div className="group/row flex items-center gap-2.5 py-2.5">
          {hasSubitems && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          )}
          {!hasSubitems && <div className="w-4 shrink-0" />}
          <span className={cn("flex-1 text-sm text-foreground leading-tight", item.note && "flex flex-col gap-0")}>
            {item.name}
            {item.note && <span className="text-[10px] text-muted-foreground italic">{item.note}</span>}
          </span>
          <div className="flex items-center gap-1.5">
            {hasSubitems && <Layers className="h-3 w-3 text-muted-foreground shrink-0" />}
            <span className={cn("text-sm font-mono font-semibold", effectiveAmount === 0 ? "text-muted-foreground" : "text-foreground")}>
              {formatCOP(effectiveAmount)}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100">
              <button onClick={() => setEditing(true)} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
                <Pencil className="h-3 w-3" />
              </button>
              <button onClick={() => onRemove(item.id)} className="rounded p-0.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {expanded && (editing || hasSubitems) && (
        <div className="ml-8 border-l-2 border-border/40 pl-3 pb-3">
          {hasSubitems && (
            <div className="pt-1.5 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Desglose</span>
                <span className="text-[10px] font-mono text-muted-foreground">{formatCOP(subTotal)} de {formatCOP(item.amount)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-300", overBudget ? "bg-destructive" : "bg-accent")}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className={cn("mt-1 text-[10px] font-mono text-right", remaining >= 0 ? "text-accent" : "text-destructive")}>
                Restante: {formatCOP(remaining)}
              </p>
            </div>
          )}
          {subitems.map((sub) => (
            <FundSubItemRow
              key={sub.id}
              subitem={sub}
              fundId={fundId}
              itemId={item.id}
              onUpdate={handleSubUpdate}
              onRemove={handleSubRemove}
            />
          ))}
          <AddFundSubItemForm onAdd={handleSubAdd} />
        </div>
      )}
    </div>
  )
}

// ─── AddFundItemForm ─────────────────────────────────────────────────────────

function AddFundItemForm({ onAdd }: { onAdd: (name: string, amount: number, note?: string) => void }) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")

  function handle() {
    const a = parseInt(amount, 10)
    if (!name.trim() || isNaN(a) || a < 0) return
    onAdd(name.trim(), a, note || undefined)
    setName("")
    setAmount("")
    setNote("")
  }

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} className="h-7 flex-1 text-sm" placeholder="Ej: Pagar deuda" onKeyDown={(e) => { if (e.key === "Enter") handle() }} />
      <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-7 w-20 text-xs" placeholder="Nota" />
      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-7 w-28 text-right text-sm font-mono" placeholder="0" onKeyDown={(e) => { if (e.key === "Enter") handle() }} />
      <button onClick={handle} className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground border border-border/60 hover:border-primary/40 transition-colors">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── FundCard ─────────────────────────────────────────────────────────────────

function FundCard({ fund }: { fund: ExtraFund }) {
  const { removeExtraFund, updateExtraFundMeta, addExtraFundItem, removeExtraFundItem, updateExtraFundItem } = useFinance()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(fund.name)
  const [editAmount, setEditAmount] = useState(String(fund.totalAmount))
  const [editSource, setEditSource] = useState(fund.source)

  const allocated = getExtraFundAllocated(fund)
  const remaining = getExtraFundRemaining(fund)
  const progress = fund.totalAmount > 0 ? Math.min((allocated / fund.totalAmount) * 100, 100) : 0
  const isOver = remaining < 0

  function saveEdit() {
    const a = parseInt(editAmount, 10)
    if (!editName.trim() || isNaN(a)) return
    updateExtraFundMeta({ id: fund.id, name: editName.trim(), totalAmount: a, source: editSource, date: fund.date })
    setEditing(false)
  }

  function cancelEdit() {
    setEditName(fund.name)
    setEditAmount(String(fund.totalAmount))
    setEditSource(fund.source)
    setEditing(false)
  }

  function handleAddItem(name: string, amount: number, note?: string) {
    addExtraFundItem(fund.id, { name, amount, note })
  }

  function handleUpdateItem(item: ExtraFundItem) {
    updateExtraFundItem(fund.id, item)
  }

  function handleRemoveItem(itemId: string) {
    removeExtraFundItem(fund.id, itemId)
  }

  return (
    <article className="flex flex-col rounded-2xl bg-card ring-1 ring-border transition-shadow hover:shadow-md hover:shadow-border/40">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        {editing ? (
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex gap-2">
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 flex-1 text-sm font-bold" autoFocus />
              <Input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="h-8 w-36 text-right font-mono text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Select value={editSource} onValueChange={(v) => setEditSource(v as ExtraFund["source"])}>
                <SelectTrigger className="h-7 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SOURCE_LABELS) as ExtraFund["source"][]).map((k) => (
                    <SelectItem key={k} value={k} className="text-xs">{SOURCE_LABELS[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button onClick={saveEdit} className="rounded p-1.5 text-accent hover:bg-accent/10"><Check className="h-4 w-4" /></button>
              <button onClick={cancelEdit} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", SOURCE_COLORS[fund.source])}>
                  {SOURCE_LABELS[fund.source]}
                </span>
                <span className="text-[10px] text-muted-foreground">{fund.date}</span>
              </div>
              <h3 className="text-base font-bold text-foreground">{fund.name}</h3>
            </div>
            <div className="flex items-center gap-1 ml-3 shrink-0">
              <button onClick={() => setEditing(true)} className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => removeExtraFund(fund.id)} className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Totals + progress */}
      <div className="px-5 pb-3">
        <div className="flex items-end justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Total</span>
            <span className="text-xl font-bold font-mono text-foreground">{formatCOP(fund.totalAmount)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {isOver ? "Excedido" : "Disponible"}
            </span>
            <span className={cn("text-lg font-bold font-mono", isOver ? "text-destructive" : "text-accent")}>
              {formatCOP(Math.abs(remaining))}
            </span>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-500", isOver ? "bg-destructive" : "bg-accent")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{progress.toFixed(0)}% asignado</span>
          <span>{formatCOP(allocated)} asignado</span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-5 pt-1">
        {fund.items.map((item) => (
          <FundItemRow
            key={item.id}
            item={item}
            fundId={fund.id}
            onUpdate={handleUpdateItem}
            onRemove={handleRemoveItem}
          />
        ))}
        <AddFundItemForm onAdd={handleAddItem} />
      </div>

      <div className="h-4" />
    </article>
  )
}

// ─── Nueva asignación dialog ──────────────────────────────────────────────────

function NewFundDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addExtraFund } = useFinance()
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [source, setSource] = useState<ExtraFund["source"]>("otro")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  function handleAdd() {
    const a = parseInt(amount, 10)
    if (!name.trim() || isNaN(a) || a <= 0) return
    addExtraFund({ name: name.trim(), totalAmount: a, source, date })
    setName("")
    setAmount("")
    setSource("otro")
    setDate(new Date().toISOString().split("T")[0])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Excedente</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Cesantías 2025" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Tipo de ingreso</label>
            <Select value={source} onValueChange={(v) => setSource(v as ExtraFund["source"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SOURCE_LABELS) as ExtraFund["source"][]).map((k) => (
                  <SelectItem key={k} value={k}>{SOURCE_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Monto recibido</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000000" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Fecha</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAdd}>Crear Excedente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── ExcedentesView (main) ────────────────────────────────────────────────────

export function ExcedentesView() {
  const { extraFunds: funds } = useFinance()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-bold text-foreground">Excedentes</h2>
          <p className="text-sm text-muted-foreground">
            Distribuye tus ingresos adicionales (cesantías, primas, ventas, bonos)
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Excedente
        </Button>
      </div>

      {/* Resumen global si hay fondos */}
      {funds.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-card ring-1 ring-border px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Total recibido</p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatCOP(funds.reduce((s, f) => s + f.totalAmount, 0))}
            </p>
          </div>
          <div className="rounded-2xl bg-card ring-1 ring-border px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Total asignado</p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatCOP(funds.reduce((s, f) => s + getExtraFundAllocated(f), 0))}
            </p>
          </div>
          <div className="rounded-2xl bg-card ring-1 ring-border px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Sin asignar</p>
            <p className={cn("text-lg font-bold font-mono", funds.reduce((s, f) => s + getExtraFundRemaining(f), 0) >= 0 ? "text-accent" : "text-destructive")}>
              {formatCOP(funds.reduce((s, f) => s + getExtraFundRemaining(f), 0))}
            </p>
          </div>
          <div className="rounded-2xl bg-card ring-1 ring-border px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Fondos activos</p>
            <p className="text-lg font-bold font-mono text-foreground">{funds.length}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {funds.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-foreground">Sin excedentes registrados</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Registra un ingreso adicional (cesantías, prima, venta) y decide cómo distribuirlo.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar primer excedente
          </Button>
        </div>
      )}

      {/* Funds grid */}
      {funds.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {funds.map((fund) => (
            <FundCard key={fund.id} fund={fund} />
          ))}
        </div>
      )}

      <NewFundDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
