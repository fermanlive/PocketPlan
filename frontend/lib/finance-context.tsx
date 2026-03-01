"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { MonthData, ExpenseItem, SavingsEntry, BudgetCategory, Subcategory, DebtEntry } from "@/lib/financial-data"
import {
  initialMonths,
  createDefaultMonth,
  generateItemId,
} from "@/lib/financial-data"

const API_URL = "http://localhost:4000/api"
const TOKEN_KEY = "pocketplan_token"

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

interface FinanceContextValue {
  months: MonthData[]
  activeMonthId: string
  activeMonth: MonthData
  isLoading: boolean
  error: string | null
  subcategories: Subcategory[]
  setActiveMonthId: (id: string) => void
  addMonth: (year: number, month: number, salary: number) => void
  deleteMonth: (id: string) => void
  addItem: (categoryId: string, name: string, amount: number, icon?: string) => Promise<void>
  removeItem: (categoryId: string, itemId: string) => Promise<void>
  updateItem: (categoryId: string, item: ExpenseItem) => Promise<void>
  addSavingsEntry: (entry: Omit<SavingsEntry, "id">) => Promise<void>
  removeSavingsEntry: (id: string) => Promise<void>
  updateSavingsEntry: (entry: SavingsEntry) => Promise<void>
  addDebt: (debt: Omit<DebtEntry, "id">) => Promise<void>
  removeDebt: (id: string) => Promise<void>
  updateDebt: (debt: DebtEntry) => Promise<void>
  updateSalary: (salary: number) => void
  updateWeeklyBudget: (index: number, amount: number) => void
  refetchData: () => Promise<void>
  addCategory: (name: string, percentage: number, color: string) => Promise<void>
  updateCategory: (category: BudgetCategory) => Promise<void>
  deleteCategory: (categoryId: string) => Promise<void>
  addSubcategory: (sub: Omit<Subcategory, "id">) => Promise<void>
  updateSubcategory: (sub: Subcategory) => Promise<void>
  deleteSubcategory: (id: string) => Promise<void>
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  const fetchMonthData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/month-data`, {
        headers: authHeaders(),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      let data: MonthData[] = await response.json()

      // Auto-create current month if missing
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      const currentId = `${currentYear}-${String(currentMonth).padStart(2, "0")}`

      if (data.length > 0 && !data.some((m) => m.id === currentId)) {
        const sorted = [...data].sort(
          (a, b) => b.year * 100 + b.month - (a.year * 100 + a.month)
        )
        const recentSalary = sorted[0].salary
        try {
          const res = await fetch(`${API_URL}/month-data`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ year: currentYear, month: currentMonth, salary: recentSalary }),
          })
          if (res.ok) {
            const newMonth: MonthData = await res.json()
            data = [...data, newMonth]
          }
        } catch (e) {
          console.error("Error auto-creating current month:", e)
        }
      }

      if (data.length > 0) {
        data.sort((a, b) => a.year * 100 + a.month - (b.year * 100 + b.month))
        setMonths(data)
        const currentExists = data.some((m) => m.id === currentId)
        setActiveMonthId(currentExists ? currentId : data[data.length - 1].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      console.error("Error fetching month data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchSubcategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/subcategories`, { headers: authHeaders() })
      if (res.ok) {
        const data: Subcategory[] = await res.json()
        setSubcategories(data)
      }
    } catch (err) {
      console.error("Error fetching subcategories:", err)
    }
  }, [])

  useEffect(() => {
    fetchMonthData()
    fetchSubcategories()
  }, [fetchMonthData, fetchSubcategories])

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
    async (year: number, month: number, salary: number) => {
      const optimisticMonth = createDefaultMonth(year, month, salary)
      setMonths((prev) => {
        if (prev.some((m) => m.id === optimisticMonth.id)) return prev
        return [...prev, optimisticMonth].sort(
          (a, b) => a.year * 100 + a.month - (b.year * 100 + b.month)
        )
      })
      setActiveMonthId(optimisticMonth.id)

      try {
        const res = await fetch(`${API_URL}/month-data`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ year, month, salary }),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverMonth: MonthData = await res.json()
        setMonths((prev) =>
          prev
            .map((m) => (m.id === optimisticMonth.id ? serverMonth : m))
            .sort((a, b) => a.year * 100 + a.month - (b.year * 100 + b.month))
        )
      } catch (err) {
        setMonths((prev) => prev.filter((m) => m.id !== optimisticMonth.id))
        setError(err instanceof Error ? err.message : "Failed to add month")
        console.error("Error adding month:", err)
      }
    },
    []
  )

  const deleteMonth = useCallback(
    async (id: string) => {
      let removedMonth: MonthData | null = null
      setMonths((prev) => {
        if (prev.length <= 1) return prev
        removedMonth = prev.find((m) => m.id === id) ?? null
        return prev.filter((m) => m.id !== id)
      })
      setActiveMonthId((prevId) => {
        if (prevId === id) {
          const remaining = months.filter((m) => m.id !== id)
          return remaining.length > 0 ? remaining[remaining.length - 1].id : prevId
        }
        return prevId
      })

      try {
        const res = await fetch(`${API_URL}/month-data/${id}`, { method: "DELETE", headers: authHeaders() })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removedMonth) {
          setMonths((prev) =>
            [...prev, removedMonth!].sort(
              (a, b) => a.year * 100 + a.month - (b.year * 100 + b.month)
            )
          )
        }
        setError(err instanceof Error ? err.message : "Failed to delete month")
        console.error("Error deleting month:", err)
      }
    },
    [months]
  )

  const addItem = useCallback(
    async (categoryId: string, name: string, amount: number, icon?: string) => {
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

      try {
        const response = await fetch(
          `${API_URL}/month-data/${activeMonthId}/categories/${categoryId}/items`,
          {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ name, amount, icon }),
          }
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const serverItem: ExpenseItem = await response.json()
        updateActiveMonth((m) => ({
          ...m,
          categories: m.categories.map((c) =>
            c.id === categoryId
              ? { ...c, items: c.items.map((i) => (i.id === newItem.id ? serverItem : i)) }
              : c
          ),
        }))
      } catch (err) {
        updateActiveMonth((m) => ({
          ...m,
          categories: m.categories.map((c) =>
            c.id === categoryId
              ? { ...c, items: c.items.filter((i) => i.id !== newItem.id) }
              : c
          ),
        }))
        setError(err instanceof Error ? err.message : "Failed to add item")
        console.error("Error adding item:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const removeItem = useCallback(
    async (categoryId: string, itemId: string) => {
      let removedItem: ExpenseItem | null = null
      updateActiveMonth((m) => {
        const category = m.categories.find((c) => c.id === categoryId)
        removedItem = category?.items.find((i) => i.id === itemId) ?? null
        return {
          ...m,
          categories: m.categories.map((c) =>
            c.id === categoryId
              ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
              : c
          ),
        }
      })

      try {
        const response = await fetch(
          `${API_URL}/month-data/${activeMonthId}/categories/${categoryId}/items/${itemId}`,
          { method: "DELETE", headers: authHeaders() }
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (err) {
        if (removedItem) {
          updateActiveMonth((m) => ({
            ...m,
            categories: m.categories.map((c) =>
              c.id === categoryId
                ? { ...c, items: [...c.items, removedItem!] }
                : c
            ),
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to remove item")
        console.error("Error removing item:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const updateItem = useCallback(
    async (categoryId: string, item: ExpenseItem) => {
      let previousItem: ExpenseItem | null = null
      updateActiveMonth((m) => {
        const category = m.categories.find((c) => c.id === categoryId)
        previousItem = category?.items.find((i) => i.id === item.id) ?? null
        return {
          ...m,
          categories: m.categories.map((c) =>
            c.id === categoryId
              ? { ...c, items: c.items.map((i) => (i.id === item.id ? item : i)) }
              : c
          ),
        }
      })

      try {
        const response = await fetch(
          `${API_URL}/month-data/${activeMonthId}/categories/${categoryId}/items/${item.id}`,
          {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ name: item.name, amount: item.amount, icon: item.icon, periodic: item.periodic }),
          }
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (err) {
        if (previousItem) {
          updateActiveMonth((m) => ({
            ...m,
            categories: m.categories.map((c) =>
              c.id === categoryId
                ? { ...c, items: c.items.map((i) => (i.id === item.id ? previousItem! : i)) }
                : c
            ),
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to update item")
        console.error("Error updating item:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const addSavingsEntry = useCallback(
    async (entry: Omit<SavingsEntry, "id">) => {
      const tempId = `saving-temp-${Date.now()}`
      const tempEntry: SavingsEntry = { ...entry, id: tempId }
      updateActiveMonth((m) => ({
        ...m,
        savings: [...m.savings, tempEntry],
      }))

      try {
        const res = await fetch(`${API_URL}/month-data/${activeMonthId}/savings`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(entry),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverEntry: SavingsEntry = await res.json()
        updateActiveMonth((m) => ({
          ...m,
          savings: m.savings.map((s) => (s.id === tempId ? serverEntry : s)),
        }))
      } catch (err) {
        updateActiveMonth((m) => ({
          ...m,
          savings: m.savings.filter((s) => s.id !== tempId),
        }))
        setError(err instanceof Error ? err.message : "Failed to add saving")
        console.error("Error adding saving:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const removeSavingsEntry = useCallback(
    async (id: string) => {
      let removedEntry: SavingsEntry | null = null
      updateActiveMonth((m) => {
        removedEntry = m.savings.find((s) => s.id === id) ?? null
        return { ...m, savings: m.savings.filter((s) => s.id !== id) }
      })

      try {
        const res = await fetch(
          `${API_URL}/month-data/${activeMonthId}/savings/${id}`,
          { method: "DELETE", headers: authHeaders() }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removedEntry) {
          updateActiveMonth((m) => ({
            ...m,
            savings: [...m.savings, removedEntry!],
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to remove saving")
        console.error("Error removing saving:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const updateSavingsEntry = useCallback(
    async (entry: SavingsEntry) => {
      let previousEntry: SavingsEntry | null = null
      updateActiveMonth((m) => {
        previousEntry = m.savings.find((s) => s.id === entry.id) ?? null
        return {
          ...m,
          savings: m.savings.map((s) => (s.id === entry.id ? entry : s)),
        }
      })

      try {
        const res = await fetch(
          `${API_URL}/month-data/${activeMonthId}/savings/${entry.id}`,
          {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ name: entry.name, amount: entry.amount, date: entry.date }),
          }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (previousEntry) {
          updateActiveMonth((m) => ({
            ...m,
            savings: m.savings.map((s) => (s.id === entry.id ? previousEntry! : s)),
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to update saving")
        console.error("Error updating saving:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const addDebt = useCallback(
    async (debt: Omit<DebtEntry, "id">) => {
      const tempId = `debt-temp-${Date.now()}`
      const tempDebt: DebtEntry = { ...debt, id: tempId }
      updateActiveMonth((m) => ({
        ...m,
        debts: [...(m.debts ?? []), tempDebt],
      }))

      try {
        const res = await fetch(`${API_URL}/month-data/${activeMonthId}/debts`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(debt),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverDebt: DebtEntry = await res.json()
        updateActiveMonth((m) => ({
          ...m,
          debts: (m.debts ?? []).map((d) => (d.id === tempId ? serverDebt : d)),
        }))
      } catch (err) {
        updateActiveMonth((m) => ({
          ...m,
          debts: (m.debts ?? []).filter((d) => d.id !== tempId),
        }))
        setError(err instanceof Error ? err.message : "Failed to add debt")
        console.error("Error adding debt:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const removeDebt = useCallback(
    async (id: string) => {
      let removedDebt: DebtEntry | null = null
      updateActiveMonth((m) => {
        removedDebt = (m.debts ?? []).find((d) => d.id === id) ?? null
        return { ...m, debts: (m.debts ?? []).filter((d) => d.id !== id) }
      })

      try {
        const res = await fetch(
          `${API_URL}/month-data/${activeMonthId}/debts/${id}`,
          { method: "DELETE", headers: authHeaders() }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removedDebt) {
          updateActiveMonth((m) => ({
            ...m,
            debts: [...(m.debts ?? []), removedDebt!],
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to remove debt")
        console.error("Error removing debt:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const updateDebt = useCallback(
    async (debt: DebtEntry) => {
      let previousDebt: DebtEntry | null = null
      updateActiveMonth((m) => {
        previousDebt = (m.debts ?? []).find((d) => d.id === debt.id) ?? null
        return {
          ...m,
          debts: (m.debts ?? []).map((d) => (d.id === debt.id ? debt : d)),
        }
      })

      try {
        const res = await fetch(
          `${API_URL}/month-data/${activeMonthId}/debts/${debt.id}`,
          {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(debt),
          }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (previousDebt) {
          updateActiveMonth((m) => ({
            ...m,
            debts: (m.debts ?? []).map((d) => (d.id === debt.id ? previousDebt! : d)),
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to update debt")
        console.error("Error updating debt:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
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

  const addCategory = useCallback(
    async (name: string, percentage: number, color: string) => {
      const tempId = `cat-temp-${Date.now()}`
      const tempCategory: BudgetCategory = {
        id: tempId,
        name,
        percentage,
        budget: Math.round((activeMonth.salary * percentage) / 100),
        color,
        items: [],
      }
      updateActiveMonth((m) => ({ ...m, categories: [...m.categories, tempCategory] }))

      try {
        const res = await fetch(`${API_URL}/month-data/${activeMonthId}/categories`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ name, percentage, color }),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverCategory: BudgetCategory = await res.json()
        updateActiveMonth((m) => ({
          ...m,
          categories: m.categories.map((c) => (c.id === tempId ? serverCategory : c)),
        }))
      } catch (err) {
        updateActiveMonth((m) => ({
          ...m,
          categories: m.categories.filter((c) => c.id !== tempId),
        }))
        setError(err instanceof Error ? err.message : "Failed to add category")
        console.error("Error adding category:", err)
      }
    },
    [updateActiveMonth, activeMonthId, activeMonth.salary]
  )

  const updateCategory = useCallback(
    async (category: BudgetCategory) => {
      let previousCategory: BudgetCategory | null = null
      updateActiveMonth((m) => {
        previousCategory = m.categories.find((c) => c.id === category.id) ?? null
        return {
          ...m,
          categories: m.categories.map((c) => (c.id === category.id ? category : c)),
        }
      })

      try {
        const res = await fetch(
          `${API_URL}/month-data/${activeMonthId}/categories/${category.id}`,
          {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({
              name: category.name,
              percentage: category.percentage,
              color: category.color,
            }),
          }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (previousCategory) {
          updateActiveMonth((m) => ({
            ...m,
            categories: m.categories.map((c) =>
              c.id === category.id ? previousCategory! : c
            ),
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to update category")
        console.error("Error updating category:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      let removedCategory: BudgetCategory | null = null
      updateActiveMonth((m) => {
        removedCategory = m.categories.find((c) => c.id === categoryId) ?? null
        return {
          ...m,
          categories: m.categories.filter((c) => c.id !== categoryId),
        }
      })

      try {
        const res = await fetch(
          `${API_URL}/month-data/${activeMonthId}/categories/${categoryId}`,
          { method: "DELETE", headers: authHeaders() }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removedCategory) {
          updateActiveMonth((m) => ({
            ...m,
            categories: [...m.categories, removedCategory!],
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to delete category")
        console.error("Error deleting category:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const addSubcategory = useCallback(
    async (sub: Omit<Subcategory, "id">) => {
      const newSub: Subcategory = { ...sub, id: `sub-${Date.now()}` }
      try {
        const res = await fetch(`${API_URL}/subcategories`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(newSub),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverSub: Subcategory = await res.json()
        setSubcategories((prev) => [...prev, serverSub])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add subcategory")
        console.error("Error adding subcategory:", err)
      }
    },
    []
  )

  const updateSubcategory = useCallback(
    async (sub: Subcategory) => {
      try {
        const res = await fetch(`${API_URL}/subcategories/${sub.id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(sub),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        setSubcategories((prev) => prev.map((s) => (s.id === sub.id ? sub : s)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update subcategory")
        console.error("Error updating subcategory:", err)
      }
    },
    []
  )

  const deleteSubcategory = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/subcategories/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        setSubcategories((prev) => prev.filter((s) => s.id !== id))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete subcategory")
        console.error("Error deleting subcategory:", err)
      }
    },
    []
  )

  return (
    <FinanceContext.Provider
      value={{
        months,
        activeMonthId,
        activeMonth,
        isLoading,
        error,
        subcategories,
        setActiveMonthId,
        addMonth,
        deleteMonth,
        addItem,
        removeItem,
        updateItem,
        addSavingsEntry,
        removeSavingsEntry,
        updateSavingsEntry,
        addDebt,
        removeDebt,
        updateDebt,
        updateSalary,
        updateWeeklyBudget,
        refetchData: fetchMonthData,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}
