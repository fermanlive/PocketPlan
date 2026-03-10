"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { MonthData, ExpenseItem, SavingsEntry, BudgetCategory, Subcategory, DebtEntry, IncomeEntry, SubItem, ExtraFund, ExtraFundItem } from "@/lib/financial-data"
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
  savings: SavingsEntry[]
  debts: DebtEntry[]
  extraFunds: ExtraFund[]
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
  addExtraFund: (fund: Omit<ExtraFund, "id" | "items">) => Promise<void>
  removeExtraFund: (fundId: string) => Promise<void>
  updateExtraFundMeta: (fund: Omit<ExtraFund, "items"> & { id: string }) => Promise<void>
  addExtraFundItem: (fundId: string, item: Omit<ExtraFundItem, "id" | "subitems">) => Promise<void>
  removeExtraFundItem: (fundId: string, itemId: string) => Promise<void>
  updateExtraFundItem: (fundId: string, item: ExtraFundItem) => Promise<void>
  updateSalary: (salary: number) => void
  updateSalaryPersisted: (salary: number) => Promise<void>
  addExtraIncome: (entry: Omit<IncomeEntry, "id">) => Promise<void>
  removeExtraIncome: (id: string) => Promise<void>
  updateExtraIncome: (entry: IncomeEntry) => Promise<void>
  addSubItem: (categoryId: string, itemId: string, subitem: Omit<SubItem, "id">) => Promise<void>
  removeSubItem: (categoryId: string, itemId: string, subitemId: string) => Promise<void>
  updateSubItem: (categoryId: string, itemId: string, subitem: SubItem) => Promise<void>
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
  const [savings, setSavings] = useState<SavingsEntry[]>([])
  const [debts, setDebts] = useState<DebtEntry[]>([])
  const [extraFunds, setExtraFunds] = useState<ExtraFund[]>([])

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

  const fetchUserData = useCallback(async () => {
    try {
      const [savingsRes, debtsRes, fundsRes] = await Promise.all([
        fetch(`${API_URL}/savings`, { headers: authHeaders() }),
        fetch(`${API_URL}/debts`, { headers: authHeaders() }),
        fetch(`${API_URL}/extra-funds`, { headers: authHeaders() }),
      ])
      if (savingsRes.ok) setSavings(await savingsRes.json())
      if (debtsRes.ok) setDebts(await debtsRes.json())
      if (fundsRes.ok) setExtraFunds(await fundsRes.json())
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }, [])

  useEffect(() => {
    fetchMonthData()
    fetchSubcategories()
    fetchUserData()
  }, [fetchMonthData, fetchSubcategories, fetchUserData])

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
      const prevActiveMonthId = activeMonthId

      // Check if month already exists before making any state changes
      let monthAlreadyExists = false
      setMonths((prev) => {
        if (prev.some((m) => m.id === optimisticMonth.id)) {
          monthAlreadyExists = true
          return prev
        }
        return [...prev, optimisticMonth].sort(
          (a, b) => a.year * 100 + a.month - (b.year * 100 + b.month)
        )
      })

      if (monthAlreadyExists) {
        setActiveMonthId(optimisticMonth.id)
        return
      }

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
        setActiveMonthId(prevActiveMonthId)
        setError(err instanceof Error ? err.message : "Failed to add month")
        console.error("Error adding month:", err)
      }
    },
    [activeMonthId]
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
            body: JSON.stringify({ name: item.name, amount: item.amount, icon: item.icon, periodic: item.periodic, paid: item.paid }),
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
      setSavings((prev) => [...prev, tempEntry])
      try {
        const res = await fetch(`${API_URL}/savings`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(entry),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverEntry: SavingsEntry = await res.json()
        setSavings((prev) => prev.map((s) => (s.id === tempId ? serverEntry : s)))
      } catch (err) {
        setSavings((prev) => prev.filter((s) => s.id !== tempId))
        setError(err instanceof Error ? err.message : "Failed to add saving")
        console.error("Error adding saving:", err)
      }
    },
    []
  )

  const removeSavingsEntry = useCallback(
    async (id: string) => {
      let removedEntry: SavingsEntry | null = null
      setSavings((prev) => {
        removedEntry = prev.find((s) => s.id === id) ?? null
        return prev.filter((s) => s.id !== id)
      })
      try {
        const res = await fetch(`${API_URL}/savings/${id}`, { method: "DELETE", headers: authHeaders() })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removedEntry) setSavings((prev) => [...prev, removedEntry!])
        setError(err instanceof Error ? err.message : "Failed to remove saving")
        console.error("Error removing saving:", err)
      }
    },
    []
  )

  const updateSavingsEntry = useCallback(
    async (entry: SavingsEntry) => {
      let previousEntry: SavingsEntry | null = null
      setSavings((prev) => {
        previousEntry = prev.find((s) => s.id === entry.id) ?? null
        return prev.map((s) => (s.id === entry.id ? entry : s))
      })
      try {
        const res = await fetch(`${API_URL}/savings/${entry.id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ name: entry.name, amount: entry.amount, date: entry.date }),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (previousEntry) setSavings((prev) => prev.map((s) => (s.id === entry.id ? previousEntry! : s)))
        setError(err instanceof Error ? err.message : "Failed to update saving")
        console.error("Error updating saving:", err)
      }
    },
    []
  )

  const addDebt = useCallback(
    async (debt: Omit<DebtEntry, "id">) => {
      const tempId = `debt-temp-${Date.now()}`
      const tempDebt: DebtEntry = { ...debt, id: tempId }
      setDebts((prev) => [...prev, tempDebt])
      try {
        const res = await fetch(`${API_URL}/debts`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(debt),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverDebt: DebtEntry = await res.json()
        setDebts((prev) => prev.map((d) => (d.id === tempId ? serverDebt : d)))
      } catch (err) {
        setDebts((prev) => prev.filter((d) => d.id !== tempId))
        setError(err instanceof Error ? err.message : "Failed to add debt")
        console.error("Error adding debt:", err)
      }
    },
    []
  )

  const removeDebt = useCallback(
    async (id: string) => {
      let removedDebt: DebtEntry | null = null
      setDebts((prev) => {
        removedDebt = prev.find((d) => d.id === id) ?? null
        return prev.filter((d) => d.id !== id)
      })
      try {
        const res = await fetch(`${API_URL}/debts/${id}`, { method: "DELETE", headers: authHeaders() })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removedDebt) setDebts((prev) => [...prev, removedDebt!])
        setError(err instanceof Error ? err.message : "Failed to remove debt")
        console.error("Error removing debt:", err)
      }
    },
    []
  )

  const updateDebt = useCallback(
    async (debt: DebtEntry) => {
      let previousDebt: DebtEntry | null = null
      setDebts((prev) => {
        previousDebt = prev.find((d) => d.id === debt.id) ?? null
        return prev.map((d) => (d.id === debt.id ? debt : d))
      })
      try {
        const res = await fetch(`${API_URL}/debts/${debt.id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(debt),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (previousDebt) setDebts((prev) => prev.map((d) => (d.id === debt.id ? previousDebt! : d)))
        setError(err instanceof Error ? err.message : "Failed to update debt")
        console.error("Error updating debt:", err)
      }
    },
    []
  )

  const addExtraFund = useCallback(
    async (fund: Omit<ExtraFund, "id" | "items">) => {
      const tempId = `fund-temp-${Date.now()}`
      const tempFund: ExtraFund = { ...fund, id: tempId, items: [] }
      setExtraFunds((prev) => [...prev, tempFund])
      try {
        const res = await fetch(`${API_URL}/extra-funds`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(fund),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverFund: ExtraFund = await res.json()
        setExtraFunds((prev) => prev.map((f) => (f.id === tempId ? serverFund : f)))
      } catch (err) {
        setExtraFunds((prev) => prev.filter((f) => f.id !== tempId))
        setError(err instanceof Error ? err.message : "Failed to add extra fund")
        console.error("Error adding extra fund:", err)
      }
    },
    []
  )

  const removeExtraFund = useCallback(
    async (fundId: string) => {
      let removed: ExtraFund | null = null
      setExtraFunds((prev) => {
        removed = prev.find((f) => f.id === fundId) ?? null
        return prev.filter((f) => f.id !== fundId)
      })
      try {
        const res = await fetch(`${API_URL}/extra-funds/${fundId}`, {
          method: "DELETE",
          headers: authHeaders(),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removed) setExtraFunds((prev) => [...prev, removed!])
        setError(err instanceof Error ? err.message : "Failed to remove extra fund")
        console.error("Error removing extra fund:", err)
      }
    },
    []
  )

  const updateExtraFundMeta = useCallback(
    async (fund: Omit<ExtraFund, "items"> & { id: string }) => {
      let prev: ExtraFund | null = null
      setExtraFunds((prevList) => {
        prev = prevList.find((f) => f.id === fund.id) ?? null
        return prevList.map((f) => f.id === fund.id ? { ...f, ...fund } : f)
      })
      try {
        const { id, ...updates } = fund
        const res = await fetch(`${API_URL}/extra-funds/${id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(updates),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (prev) setExtraFunds((prevList) => prevList.map((f) => (f.id === fund.id ? prev! : f)))
        setError(err instanceof Error ? err.message : "Failed to update extra fund")
        console.error("Error updating extra fund:", err)
      }
    },
    []
  )

  const addExtraFundItem = useCallback(
    async (fundId: string, item: Omit<ExtraFundItem, "id" | "subitems">) => {
      const tempId = `fund-item-temp-${Date.now()}`
      const tempItem: ExtraFundItem = { ...item, id: tempId, subitems: [] }
      setExtraFunds((prev) =>
        prev.map((f) => f.id === fundId ? { ...f, items: [...f.items, tempItem] } : f)
      )
      try {
        const res = await fetch(`${API_URL}/extra-funds/${fundId}/items`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(item),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverItem: ExtraFundItem = await res.json()
        setExtraFunds((prev) =>
          prev.map((f) =>
            f.id === fundId
              ? { ...f, items: f.items.map((i) => (i.id === tempId ? serverItem : i)) }
              : f
          )
        )
      } catch (err) {
        setExtraFunds((prev) =>
          prev.map((f) => f.id === fundId ? { ...f, items: f.items.filter((i) => i.id !== tempId) } : f)
        )
        setError(err instanceof Error ? err.message : "Failed to add item to extra fund")
        console.error("Error adding extra fund item:", err)
      }
    },
    []
  )

  const removeExtraFundItem = useCallback(
    async (fundId: string, itemId: string) => {
      let removedItem: ExtraFundItem | null = null
      setExtraFunds((prev) =>
        prev.map((f) => {
          if (f.id !== fundId) return f
          removedItem = f.items.find((i) => i.id === itemId) ?? null
          return { ...f, items: f.items.filter((i) => i.id !== itemId) }
        })
      )
      try {
        const res = await fetch(`${API_URL}/extra-funds/${fundId}/items/${itemId}`, {
          method: "DELETE",
          headers: authHeaders(),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removedItem)
          setExtraFunds((prev) =>
            prev.map((f) => f.id === fundId ? { ...f, items: [...f.items, removedItem!] } : f)
          )
        setError(err instanceof Error ? err.message : "Failed to remove extra fund item")
        console.error("Error removing extra fund item:", err)
      }
    },
    []
  )

  const updateExtraFundItem = useCallback(
    async (fundId: string, item: ExtraFundItem) => {
      let prevItem: ExtraFundItem | null = null
      setExtraFunds((prev) =>
        prev.map((f) => {
          if (f.id !== fundId) return f
          prevItem = f.items.find((i) => i.id === item.id) ?? null
          return { ...f, items: f.items.map((i) => (i.id === item.id ? item : i)) }
        })
      )
      try {
        const { id, ...updates } = item
        const res = await fetch(`${API_URL}/extra-funds/${fundId}/items/${id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(updates),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (prevItem)
          setExtraFunds((prev) =>
            prev.map((f) =>
              f.id === fundId
                ? { ...f, items: f.items.map((i) => (i.id === item.id ? prevItem! : i)) }
                : f
            )
          )
        setError(err instanceof Error ? err.message : "Failed to update extra fund item")
        console.error("Error updating extra fund item:", err)
      }
    },
    []
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

  const updateSalaryPersisted = useCallback(
    async (salary: number) => {
      const prevSalary = activeMonth.salary
      updateSalary(salary)
      try {
        const res = await fetch(`${API_URL}/month-data/${activeMonthId}/salary`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ salary }),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        updateSalary(prevSalary)
        setError(err instanceof Error ? err.message : "Failed to update salary")
        console.error("Error updating salary:", err)
      }
    },
    [updateSalary, activeMonth.salary, activeMonthId]
  )

  const addExtraIncome = useCallback(
    async (entry: Omit<IncomeEntry, "id">) => {
      const tempId = `income-temp-${Date.now()}`
      const tempEntry: IncomeEntry = { ...entry, id: tempId }
      updateActiveMonth((m) => ({
        ...m,
        extraIncomes: [...(m.extraIncomes ?? []), tempEntry],
      }))

      try {
        const res = await fetch(`${API_URL}/month-data/${activeMonthId}/extra-incomes`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(entry),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverEntry: IncomeEntry = await res.json()
        updateActiveMonth((m) => ({
          ...m,
          extraIncomes: (m.extraIncomes ?? []).map((e) => (e.id === tempId ? serverEntry : e)),
        }))
      } catch (err) {
        updateActiveMonth((m) => ({
          ...m,
          extraIncomes: (m.extraIncomes ?? []).filter((e) => e.id !== tempId),
        }))
        setError(err instanceof Error ? err.message : "Failed to add income")
        console.error("Error adding extra income:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const removeExtraIncome = useCallback(
    async (id: string) => {
      let removed: IncomeEntry | null = null
      updateActiveMonth((m) => {
        removed = (m.extraIncomes ?? []).find((e) => e.id === id) ?? null
        return { ...m, extraIncomes: (m.extraIncomes ?? []).filter((e) => e.id !== id) }
      })

      try {
        const res = await fetch(`${API_URL}/month-data/${activeMonthId}/extra-incomes/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removed) {
          updateActiveMonth((m) => ({
            ...m,
            extraIncomes: [...(m.extraIncomes ?? []), removed!],
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to remove income")
        console.error("Error removing extra income:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const updateExtraIncome = useCallback(
    async (entry: IncomeEntry) => {
      let previous: IncomeEntry | null = null
      updateActiveMonth((m) => {
        previous = (m.extraIncomes ?? []).find((e) => e.id === entry.id) ?? null
        return {
          ...m,
          extraIncomes: (m.extraIncomes ?? []).map((e) => (e.id === entry.id ? entry : e)),
        }
      })

      try {
        const res = await fetch(`${API_URL}/month-data/${activeMonthId}/extra-incomes/${entry.id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ name: entry.name, amount: entry.amount, date: entry.date }),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (previous) {
          updateActiveMonth((m) => ({
            ...m,
            extraIncomes: (m.extraIncomes ?? []).map((e) => (e.id === entry.id ? previous! : e)),
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to update income")
        console.error("Error updating extra income:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const addSubItem = useCallback(
    async (categoryId: string, itemId: string, subitem: Omit<SubItem, "id">) => {
      const tempId = `subitem-temp-${Date.now()}`
      const tempSub: SubItem = { ...subitem, id: tempId }
      updateActiveMonth((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: c.items.map((i) =>
                  i.id === itemId
                    ? {
                        ...i,
                        subitems: [...(i.subitems ?? []), tempSub],
                        amount: [...(i.subitems ?? []), tempSub].reduce((s, sub) => s + sub.amount, 0),
                      }
                    : i
                ),
              }
            : c
        ),
      }))

      try {
        const res = await fetch(
          `${API_URL}/month-data/${activeMonthId}/categories/${categoryId}/items/${itemId}/subitems`,
          {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(subitem),
          }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const serverSub: SubItem = await res.json()
        updateActiveMonth((m) => ({
          ...m,
          categories: m.categories.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  items: c.items.map((i) => {
                    if (i.id !== itemId) return i
                    const newSubs = (i.subitems ?? []).map((s) => (s.id === tempId ? serverSub : s))
                    return { ...i, subitems: newSubs, amount: newSubs.reduce((s, sub) => s + sub.amount, 0) }
                  }),
                }
              : c
          ),
        }))
      } catch (err) {
        updateActiveMonth((m) => ({
          ...m,
          categories: m.categories.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  items: c.items.map((i) => {
                    if (i.id !== itemId) return i
                    const newSubs = (i.subitems ?? []).filter((s) => s.id !== tempId)
                    return { ...i, subitems: newSubs, amount: newSubs.reduce((s, sub) => s + sub.amount, 0) }
                  }),
                }
              : c
          ),
        }))
        setError(err instanceof Error ? err.message : "Failed to add subitem")
        console.error("Error adding subitem:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const removeSubItem = useCallback(
    async (categoryId: string, itemId: string, subitemId: string) => {
      let removedSub: SubItem | null = null
      updateActiveMonth((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: c.items.map((i) => {
                  if (i.id !== itemId) return i
                  removedSub = (i.subitems ?? []).find((s) => s.id === subitemId) ?? null
                  const newSubs = (i.subitems ?? []).filter((s) => s.id !== subitemId)
                  return { ...i, subitems: newSubs, amount: newSubs.length > 0 ? newSubs.reduce((s, sub) => s + sub.amount, 0) : i.amount }
                }),
              }
            : c
        ),
      }))

      try {
        const res = await fetch(
          `${API_URL}/month-data/${activeMonthId}/categories/${categoryId}/items/${itemId}/subitems/${subitemId}`,
          { method: "DELETE", headers: authHeaders() }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (removedSub) {
          updateActiveMonth((m) => ({
            ...m,
            categories: m.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    items: c.items.map((i) => {
                      if (i.id !== itemId) return i
                      const newSubs = [...(i.subitems ?? []), removedSub!]
                      return { ...i, subitems: newSubs, amount: newSubs.reduce((s, sub) => s + sub.amount, 0) }
                    }),
                  }
                : c
            ),
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to remove subitem")
        console.error("Error removing subitem:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
  )

  const updateSubItem = useCallback(
    async (categoryId: string, itemId: string, subitem: SubItem) => {
      let prevSub: SubItem | null = null
      updateActiveMonth((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: c.items.map((i) => {
                  if (i.id !== itemId) return i
                  prevSub = (i.subitems ?? []).find((s) => s.id === subitem.id) ?? null
                  const newSubs = (i.subitems ?? []).map((s) => (s.id === subitem.id ? subitem : s))
                  return { ...i, subitems: newSubs, amount: newSubs.reduce((s, sub) => s + sub.amount, 0) }
                }),
              }
            : c
        ),
      }))

      try {
        const res = await fetch(
          `${API_URL}/month-data/${activeMonthId}/categories/${categoryId}/items/${itemId}/subitems/${subitem.id}`,
          {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ name: subitem.name, amount: subitem.amount, note: subitem.note, paid: subitem.paid }),
          }
        )
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      } catch (err) {
        if (prevSub) {
          updateActiveMonth((m) => ({
            ...m,
            categories: m.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    items: c.items.map((i) => {
                      if (i.id !== itemId) return i
                      const newSubs = (i.subitems ?? []).map((s) => (s.id === subitem.id ? prevSub! : s))
                      return { ...i, subitems: newSubs, amount: newSubs.reduce((s, sub) => s + sub.amount, 0) }
                    }),
                  }
                : c
            ),
          }))
        }
        setError(err instanceof Error ? err.message : "Failed to update subitem")
        console.error("Error updating subitem:", err)
      }
    },
    [updateActiveMonth, activeMonthId]
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
        savings,
        debts,
        extraFunds,
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
        addExtraFund,
        removeExtraFund,
        updateExtraFundMeta,
        addExtraFundItem,
        removeExtraFundItem,
        updateExtraFundItem,
        updateSalary,
        updateSalaryPersisted,
        addExtraIncome,
        removeExtraIncome,
        updateExtraIncome,
        addSubItem,
        removeSubItem,
        updateSubItem,
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
