"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { formatCOP } from "@/lib/financial-data"
import type { BudgetCategory, Subcategory } from "@/lib/financial-data"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ItemIcon, AVAILABLE_ICONS } from "@/components/item-icon"
import {
  Settings,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Repeat,
} from "lucide-react"


// ── Color options ──────────────────────────────────────────────────────────────
const CATEGORY_COLORS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]

const COLOR_LABEL: Record<string, string> = {
  "chart-1": "Rojo",
  "chart-2": "Naranja",
  "chart-3": "Verde",
  "chart-4": "Azul",
  "chart-5": "Púrpura",
}

const COLOR_DOT: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SubcategoryRow({
  sub,
  categoryColor,
  onUpdate,
  onDelete,
}: {
  sub: Subcategory
  categoryColor: string
  onUpdate: (sub: Subcategory) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(sub.name)
  const [icon, setIcon] = useState(sub.icon ?? "")

  function handleSave() {
    onUpdate({ ...sub, name, icon: icon || undefined })
    setEditing(false)
  }

  function handleCancel() {
    setName(sub.name)
    setIcon(sub.icon ?? "")
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
        <Select value={icon} onValueChange={setIcon}>
          <SelectTrigger className="h-7 w-36 text-xs">
            <SelectValue placeholder="Icono" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ICONS.map((ic) => (
              <SelectItem key={ic} value={ic}>
                <span className="flex items-center gap-2">
                  <ItemIcon icon={ic} categoryColor={categoryColor} size="sm" />
                  <span className="text-xs">{ic}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="h-7 flex-1 text-xs"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave()
            if (e.key === "Escape") handleCancel()
          }}
          autoFocus
        />
        <button
          onClick={handleSave}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleCancel}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-secondary/40">
      <ItemIcon icon={sub.icon} categoryColor={categoryColor} size="sm" />
      <span className="flex-1 text-sm text-foreground">{sub.name}</span>
      <button
        onClick={() => setEditing(true)}
        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onDelete(sub.id)}
        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function AddSubcategoryForm({
  categoryId,
  categoryColor,
  onAdd,
  onCancel,
}: {
  categoryId: string
  categoryColor: string
  onAdd: (sub: Omit<Subcategory, "id">) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("")

  function handleSubmit() {
    if (!name.trim()) return
    onAdd({ name: name.trim(), icon: icon || undefined, categoriaPadreId: categoryId })
    setName("")
    setIcon("")
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
      <Select value={icon} onValueChange={setIcon}>
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue placeholder="Icono" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_ICONS.map((ic) => (
            <SelectItem key={ic} value={ic}>
              <span className="flex items-center gap-2">
                <ItemIcon icon={ic} categoryColor={categoryColor} size="sm" />
                <span className="text-xs">{ic}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="h-7 flex-1 text-xs"
        placeholder="Nombre subcategoría"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit()
          if (e.key === "Escape") onCancel()
        }}
        autoFocus
      />
      <button
        onClick={handleSubmit}
        className="rounded p-1 text-muted-foreground hover:text-foreground"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onCancel}
        className="rounded p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function CategoryAccordionItem({
  category,
  subcategories,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
}: {
  category: BudgetCategory
  subcategories: Subcategory[]
  onUpdateCategory: (cat: BudgetCategory) => void
  onDeleteCategory: (id: string) => void
  onAddSubcategory: (sub: Omit<Subcategory, "id">) => void
  onUpdateSubcategory: (sub: Subcategory) => void
  onDeleteSubcategory: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [editPct, setEditPct] = useState(String(category.percentage))
  const [editColor, setEditColor] = useState(category.color)
  const [addingSubcat, setAddingSubcat] = useState(false)

  function handleSaveCategory() {
    const pct = parseFloat(editPct)
    if (!editName.trim() || isNaN(pct) || pct < 0 || pct > 100) return
    onUpdateCategory({ ...category, name: editName.trim(), percentage: pct, color: editColor })
    setEditing(false)
  }

  function handleCancelEdit() {
    setEditName(category.name)
    setEditPct(String(category.percentage))
    setEditColor(category.color)
    setEditing(false)
  }

  const catSubs = subcategories.filter((s) => s.categoriaPadreId === category.id)

  return (
    <AccordionItem value={category.id} className="border-b border-border last:border-0">
      <div className="flex items-center gap-2 py-1">
        {editing ? (
          // ── Edit mode header ──────────────────────────────────────────────
          <div className="flex flex-1 items-center gap-2">
            {/* Color picker */}
            <Select value={editColor} onValueChange={setEditColor}>
              <SelectTrigger className="h-7 w-[110px] text-xs">
                <SelectValue>
                  <span className="flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", COLOR_DOT[editColor])} />
                    {COLOR_LABEL[editColor]}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_COLORS.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-1.5">
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", COLOR_DOT[c])} />
                      {COLOR_LABEL[c]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="h-7 flex-1 text-xs"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveCategory()
                if (e.key === "Escape") handleCancelEdit()
              }}
              autoFocus
            />
            <Input
              className="h-7 w-16 text-xs"
              type="number"
              min={0}
              max={100}
              value={editPct}
              onChange={(e) => setEditPct(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveCategory()
                if (e.key === "Escape") handleCancelEdit()
              }}
            />
            <button
              onClick={handleSaveCategory}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          // ── View mode header ──────────────────────────────────────────────
          <>
            <AccordionTrigger className="flex flex-1 items-center gap-2 py-0 hover:no-underline [&>svg]:ml-auto [&>svg]:shrink-0">
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", COLOR_DOT[category.color])} />
              <span className="flex-1 text-left text-sm font-medium">{category.name}</span>
              <Badge variant="secondary" className="mr-1 text-xs font-normal">
                {category.percentage}%
              </Badge>
            </AccordionTrigger>
            <div className="group flex shrink-0 items-center gap-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(true) }}
                className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteCategory(category.id) }}
                className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      <AccordionContent className="pb-2 pl-4">
        <div className="flex flex-col gap-0.5">
          {catSubs.map((sub) => (
            <SubcategoryRow
              key={sub.id}
              sub={sub}
              categoryColor={category.color}
              onUpdate={onUpdateSubcategory}
              onDelete={onDeleteSubcategory}
            />
          ))}
          {addingSubcat ? (
            <AddSubcategoryForm
              categoryId={category.id}
              categoryColor={category.color}
              onAdd={(sub) => {
                onAddSubcategory(sub)
                setAddingSubcat(false)
              }}
              onCancel={() => setAddingSubcat(false)}
            />
          ) : (
            <button
              onClick={() => setAddingSubcat(true)}
              className="mt-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
              Añadir subcategoría
            </button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function SettingsPanel() {
  const {
    activeMonth,
    subcategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    updateItem,
  } = useFinance()

  const [open, setOpen] = useState(false)

  // Category dialog state
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatPct, setNewCatPct] = useState("10")
  const [newCatColor, setNewCatColor] = useState("chart-1")

  function handleAddCategory() {
    const pct = parseFloat(newCatPct)
    if (!newCatName.trim() || isNaN(pct) || pct < 0 || pct > 100) return
    addCategory(newCatName.trim(), pct, newCatColor)
    setNewCatName("")
    setNewCatPct("10")
    setNewCatColor("chart-1")
    setCatDialogOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-secondary"
          aria-label="Abrir configuración"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Configuración</span>
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[440px] sm:max-w-[440px] p-0 flex flex-col">
        <SheetHeader className="border-b border-border px-5 py-4 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Configuración
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="categories" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-5 mt-4 shrink-0">
            <TabsTrigger value="categories" className="flex-1">Categorías</TabsTrigger>
            <TabsTrigger value="periodicos" className="flex-1 flex items-center gap-1.5">
              <Repeat className="h-3.5 w-3.5" />
              Periódicos
            </TabsTrigger>
          </TabsList>

          {/* ── Periódicos Tab ─────────────────────────────────────────────── */}
          <TabsContent value="periodicos" className="flex-1 overflow-y-auto px-3 py-4 mt-0">
            {(() => {
              const periodicCats = activeMonth.categories
                .map((cat) => ({ ...cat, items: cat.items.filter((i) => i.periodic) }))
                .filter((cat) => cat.items.length > 0)

              if (periodicCats.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <Repeat className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Sin items periódicos</p>
                    <p className="text-xs text-muted-foreground/70">
                      Edita un item y activa el botón <Repeat className="inline h-3 w-3" /> para marcarlo como periódico.
                    </p>
                  </div>
                )
              }

              return (
                <div className="flex flex-col gap-4">
                  {periodicCats.map((cat) => (
                    <div key={cat.id} className="rounded-lg bg-card ring-1 ring-border overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
                        <span className={cn("h-2 w-2 rounded-full", COLOR_DOT[cat.color])} />
                        <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {cat.items.length} item{cat.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex flex-col divide-y divide-border/40">
                        {cat.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 px-3 py-2">
                            <Repeat className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="flex-1 text-sm text-foreground">{item.name}</span>
                            <span className="text-sm font-mono font-medium text-foreground">
                              {formatCOP(item.amount)}
                            </span>
                            <button
                              onClick={() =>
                                updateItem(cat.id, { ...item, periodic: false })
                              }
                              className="rounded p-1 text-muted-foreground hover:text-destructive"
                              aria-label={`Desmarcar ${item.name} como periódico`}
                              title="Desmarcar como periódico"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </TabsContent>

          {/* ── Categorías Tab ─────────────────────────────────────────────── */}
          <TabsContent value="categories" className="flex-1 overflow-y-auto px-3 py-4 mt-0">
            {/* Add category button */}
            <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
              <DialogTrigger asChild>
                <button className="mb-4 flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Nueva categoría
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva categoría</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                    <Input
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Ej: Transporte"
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory() }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Porcentaje del sueldo (%)
                    </label>
                    <Input
                      type="number"
                      value={newCatPct}
                      onChange={(e) => setNewCatPct(e.target.value)}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Color</label>
                    <Select value={newCatColor} onValueChange={setNewCatColor}>
                      <SelectTrigger>
                        <SelectValue>
                          <span className="flex items-center gap-2">
                            <span className={cn("h-3 w-3 rounded-full", COLOR_DOT[newCatColor])} />
                            {COLOR_LABEL[newCatColor]}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_COLORS.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="flex items-center gap-2">
                              <span className={cn("h-3 w-3 rounded-full", COLOR_DOT[c])} />
                              {COLOR_LABEL[c]}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCatDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCategory}>Crear categoría</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Category list */}
            <Accordion type="multiple" className="w-full">
              {activeMonth.categories.map((cat) => (
                <CategoryAccordionItem
                  key={cat.id}
                  category={cat}
                  subcategories={subcategories}
                  onUpdateCategory={updateCategory}
                  onDeleteCategory={deleteCategory}
                  onAddSubcategory={addSubcategory}
                  onUpdateSubcategory={updateSubcategory}
                  onDeleteSubcategory={deleteSubcategory}
                />
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
