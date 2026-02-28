export interface ExpenseItem {
  id: string
  name: string
  amount: number
  icon?: string
  periodic?: boolean
}

export interface BudgetCategory {
  id: string
  name: string
  percentage: number
  budget: number
  items: ExpenseItem[]
  color: string
}

export interface WeeklyBudget {
  label: string
  amount: number
}

export interface Subcategory {
  id: string
  name: string
  icon?: string
  categoriaPadreId: string
}

export interface SavingsEntry {
  id: string
  name: string
  amount: number
  date: string
}

export interface MonthData {
  id: string
  year: number
  month: number
  salary: number
  categories: BudgetCategory[]
  weeklyBudgets: WeeklyBudget[]
  savings: SavingsEntry[]
}

export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export function getMonthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

export function createMonthId(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`
}

let itemIdCounter = 100

export function generateItemId(): string {
  return `item-${Date.now()}-${itemIdCounter++}`
}

export function createDefaultMonth(year: number, month: number, salary: number): MonthData {
  const p = (pct: number) => Math.round((salary * pct) / 100)
  return {
    id: createMonthId(year, month),
    year,
    month,
    salary,
    categories: [
      {
        id: "vivienda",
        name: "Vivienda",
        percentage: 25,
        budget: p(25),
        color: "chart-1",
        items: [],
      },
      {
        id: "gastos-personales",
        name: "Gastos Personales",
        percentage: 30,
        budget: p(30),
        color: "chart-2",
        items: [],
      },
      {
        id: "ahorros-inv",
        name: "Ahorros e Inversiones",
        percentage: 30,
        budget: p(30),
        color: "chart-3",
        items: [],
      },
      {
        id: "diversion",
        name: "Diversi\u00f3n",
        percentage: 10,
        budget: p(10),
        color: "chart-4",
        items: [],
      },
      {
        id: "imprevistos",
        name: "Imprevistos",
        percentage: 5,
        budget: p(5),
        color: "chart-5",
        items: [],
      },
    ],
    weeklyBudgets: [
      { label: "Semana 1", amount: 150000 },
      { label: "Semana 2", amount: 150000 },
    ],
    savings: [],
  }
}

// Seed data for November 2025
export const initialMonths: MonthData[] = [
  {
    id: "2025-11",
    year: 2025,
    month: 11,
    salary: 7200000,
    categories: [
      {
        id: "vivienda",
        name: "Vivienda",
        percentage: 25,
        budget: 1800000,
        color: "chart-1",
        items: [
          { id: "v1", name: "Arriendo", amount: 700000 },
          { id: "v2", name: "Servicios", amount: 300000 },
          { id: "v3", name: "Prestamo Nov", amount: 1000000 },
        ],
      },
      {
        id: "gastos-personales",
        name: "Gastos Personales",
        percentage: 30,
        budget: 2160000,
        color: "chart-2",
        items: [
          { id: "g1", name: "Mercado", amount: 700000, icon: "ShoppingCart" },
          { id: "g2", name: "Las Panas (Mascotas)", amount: 300000, icon: "PawPrint" },
          { id: "g3", name: "Ropa", amount: 0, icon: "Shirt" },
          { id: "g4", name: "Lucero (Empleada)", amount: 275000, icon: "User" },
          { id: "g5", name: "Comidas por fuera", amount: 350000, icon: "UtensilsCrossed" },
          { id: "g6", name: "Semanal", amount: 600000, icon: "CalendarDays" },
        ],
      },
      {
        id: "ahorros-inv",
        name: "Ahorros e Inversiones",
        percentage: 30,
        budget: 2160000,
        color: "chart-3",
        items: [
          { id: "a1", name: "Itau CC 92", amount: 700000 },
          { id: "a2", name: "Bancolombia CC", amount: 300000 },
          { id: "a3", name: "Prestamo Itau", amount: 0 },
          { id: "a4", name: "Itau CC 97", amount: 275000 },
        ],
      },
      {
        id: "diversion",
        name: "Diversi\u00f3n",
        percentage: 10,
        budget: 720000,
        color: "chart-4",
        items: [
          { id: "d1", name: "Apoyo", amount: 200000, icon: "Heart" },
          { id: "d2", name: "Gimnasio", amount: 1890000, icon: "Dumbbell" },
          { id: "d3", name: "Partner (Clases de tennis)", amount: 500000, icon: "Trophy" },
          { id: "d4", name: "Gasolina (Carro)", amount: 100000, icon: "Fuel" },
          { id: "d5", name: "Lavado (Carro)", amount: 0, icon: "Car" },
        ],
      },
      {
        id: "imprevistos",
        name: "Imprevistos",
        percentage: 5,
        budget: 360000,
        color: "chart-5",
        items: [
          { id: "i1", name: "Emergencia medica", amount: 100000, icon: "Stethoscope" },
          { id: "i2", name: "Reparaciones", amount: 30000, icon: "Wrench" },
          { id: "i3", name: "Transporte extra", amount: 160000, icon: "Bus" },
          { id: "i4", name: "Farmacia", amount: 140000, icon: "Pill" },
          { id: "i5", name: "Otros", amount: 30000, icon: "PackageOpen" },
        ],
      },
    ],
    weeklyBudgets: [
      { label: "Semana 1", amount: 150000 },
      { label: "Semana 2", amount: 150000 },
    ],
    savings: [
      { id: "s1", name: "Fondo emergencia", amount: 500000, date: "2025-11-01" },
      { id: "s2", name: "Vacaciones", amount: 300000, date: "2025-11-15" },
    ],
  },
]

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getCategoryTotal(category: BudgetCategory): number {
  return category.items.reduce((sum, item) => sum + item.amount, 0)
}

export function getCategoryRemaining(category: BudgetCategory): number {
  return category.budget - getCategoryTotal(category)
}

export function getUsagePercentage(category: BudgetCategory): number {
  const total = getCategoryTotal(category)
  if (category.budget === 0) return 0
  return Math.min((total / category.budget) * 100, 100)
}
