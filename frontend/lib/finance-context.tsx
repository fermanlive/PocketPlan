"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { MonthData, ExpenseItem, SavingsEntry, BudgetCategory, Subcategory } from "@/lib/financial-data"
import {
  initialMonths,
  createDefaultMonth,
  generateItemId,
} from "@/lib/financial-data"

const API_URL = "http://localhost:4000/api"

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
  addSavingsEntry: (entry: Omit<SavingsEntry, "id">) => void
  removeSavingsEntry: (id: string) => void
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
      const response = await fetch(`${API_URL}/month-data`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: MonthData[] = await response.json()
      if (data.length > 0) {
        setMonths(data)
        setActiveMonthId(data[0].id)
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
      const res = await fetch(`${API_URL}/subcategories`)
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
            headers: { "Content-Type": "application/json" },
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
          { method: "DELETE" }
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: item.name, amount: item.amount, icon: item.icon }),
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
          headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
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
          { method: "DELETE" }
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
          headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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
