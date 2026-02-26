"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { MonthData, ExpenseItem, SavingsEntry } from "@/lib/financial-data"
import {
  initialMonths,
  createDefaultMonth,
  generateItemId,
} from "@/lib/financial-data"

interface FinanceContextValue {
  months: MonthData[]
  activeMonthId: string
  activeMonth: MonthData
  setActiveMonthId: (id: string) => void
  addMonth: (year: number, month: number, salary: number) => void
  deleteMonth: (id: string) => void
  addItem: (categoryId: string, name: string, amount: number, icon?: string) => void
  removeItem: (categoryId: string, itemId: string) => void
  updateItem: (categoryId: string, item: ExpenseItem) => void
  addSavingsEntry: (entry: Omit<SavingsEntry, "id">) => void
  removeSavingsEntry: (id: string) => void
  updateSalary: (salary: number) => void
  updateWeeklyBudget: (index: number, amount: number) => void
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error("useFinance must be inside FinanceProvider")
  return ctx
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [months, setMonths] = useState<MonthData[]>(initialMonths)
  const [activeMonthId, setActiveMonthId] = useState(initialMonths[0].id)

  const activeMonth = months.find((m) => m.id === activeMonthId) ?? months[0]

  const updateActiveMonth = useCallback(
    (updater: (m: MonthData) => MonthData) => {
      setMonths((prev) =>
        prev.map((m) => (m.id === activeMonthId ? updater(m) : m))
      )
    },
    [activeMonthId]
  )

  const addMonth = useCallback(
    (year: number, month: number, salary: number) => {
      const newMonth = createDefaultMonth(year, month, salary)
      setMonths((prev) => {
        if (prev.some((m) => m.id === newMonth.id)) return prev
        return [...prev, newMonth].sort(
          (a, b) => a.year * 100 + a.month - (b.year * 100 + b.month)
        )
      })
      setActiveMonthId(newMonth.id)
    },
    []
  )

  const deleteMonth = useCallback(
    (id: string) => {
      setMonths((prev) => {
        const next = prev.filter((m) => m.id !== id)
        if (next.length === 0) return prev
        return next
      })
      setActiveMonthId((prevId) => {
        if (prevId === id) {
          const remaining = months.filter((m) => m.id !== id)
          return remaining.length > 0 ? remaining[0].id : prevId
        }
        return prevId
      })
    },
    [months]
  )

  const addItem = useCallback(
    (categoryId: string, name: string, amount: number, icon?: string) => {
      const newItem: ExpenseItem = {
        id: generateItemId(),
        name,
        amount,
        ...(icon ? { icon } : {}),
      }
      updateActiveMonth((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c
        ),
      }))
    },
    [updateActiveMonth]
  )

  const removeItem = useCallback(
    (categoryId: string, itemId: string) => {
      updateActiveMonth((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId
            ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
            : c
        ),
      }))
    },
    [updateActiveMonth]
  )

  const updateItem = useCallback(
    (categoryId: string, item: ExpenseItem) => {
      updateActiveMonth((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId
            ? { ...c, items: c.items.map((i) => (i.id === item.id ? item : i)) }
            : c
        ),
      }))
    },
    [updateActiveMonth]
  )

  const addSavingsEntry = useCallback(
    (entry: Omit<SavingsEntry, "id">) => {
      updateActiveMonth((m) => ({
        ...m,
        savings: [...m.savings, { ...entry, id: generateItemId() }],
      }))
    },
    [updateActiveMonth]
  )

  const removeSavingsEntry = useCallback(
    (id: string) => {
      updateActiveMonth((m) => ({
        ...m,
        savings: m.savings.filter((s) => s.id !== id),
      }))
    },
    [updateActiveMonth]
  )

  const updateSalary = useCallback(
    (salary: number) => {
      updateActiveMonth((m) => {
        const newCategories = m.categories.map((c) => ({
          ...c,
          budget: Math.round((salary * c.percentage) / 100),
        }))
        return { ...m, salary, categories: newCategories }
      })
    },
    [updateActiveMonth]
  )

  const updateWeeklyBudget = useCallback(
    (index: number, amount: number) => {
      updateActiveMonth((m) => ({
        ...m,
        weeklyBudgets: m.weeklyBudgets.map((w, i) =>
          i === index ? { ...w, amount } : w
        ),
      }))
    },
    [updateActiveMonth]
  )

  return (
    <FinanceContext.Provider
      value={{
        months,
        activeMonthId,
        activeMonth,
        setActiveMonthId,
        addMonth,
        deleteMonth,
        addItem,
        removeItem,
        updateItem,
        addSavingsEntry,
        removeSavingsEntry,
        updateSalary,
        updateWeeklyBudget,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}
