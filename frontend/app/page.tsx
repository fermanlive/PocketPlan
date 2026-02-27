"use client"

import { FinanceProvider, useFinance } from "@/lib/finance-context"
import { SalaryHeader } from "@/components/salary-header"
import { BudgetCategoryCard } from "@/components/budget-category-card"
import { SummaryOverview } from "@/components/summary-overview"
import { MobileBudgetList } from "@/components/mobile-budget-list"
import { BudgetDistribution } from "@/components/budget-distribution"
import { SavingsView } from "@/components/savings-view"
import { DetailItemsView } from "@/components/detail-items-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, ListTodo, PiggyBank } from "lucide-react"

function Dashboard() {
  const { activeMonth } = useFinance()

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header: sidebar trigger + salary + weekly budgets */}
        <SalaryHeader />

        {/* Main tabs: Resumen / Detalle / Ahorros */}
        <Tabs defaultValue="resumen" className="mt-6">
          <TabsList className="w-fit rounded-full bg-secondary p-1 gap-0.5">
            <TabsTrigger
              value="resumen"
              className="gap-2 rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Resumen
            </TabsTrigger>
            {/* <TabsTrigger
              value="detalle"
              className="gap-2 rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              <ListTodo className="h-3.5 w-3.5" />
              Detalle
            </TabsTrigger> */}
            <TabsTrigger
              value="ahorros"
              className="gap-2 rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              <PiggyBank className="h-3.5 w-3.5" />
              Ahorros
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 — Resumen General */}
          <TabsContent value="resumen" className="mt-6">
            {/* Mobile */}
            <div className="md:hidden">
              <MobileBudgetList />
              <div className="mt-4">
                <SummaryOverview />
              </div>
            </div>

            {/* Desktop: category cards grid + right sidebar */}
            <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
              {activeMonth.categories.map((cat) => (
                <BudgetCategoryCard key={cat.id} category={cat} />
              ))}
              <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-1">
                <SummaryOverview />
                <BudgetDistribution />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2 — Detalle de Items */}
          <TabsContent value="detalle" className="mt-6">
            <DetailItemsView />
          </TabsContent>

          {/* TAB 3 — Ahorros */}
          <TabsContent value="ahorros" className="mt-6">
            <SavingsView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <FinanceProvider>
      <Dashboard />
    </FinanceProvider>
  )
}
