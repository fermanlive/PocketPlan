"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { calculateProjection, getTotalInterest, formatCOP } from "@/lib/financial-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Trash2, Plus, TrendingDown } from "lucide-react"

export function ProjectionsView() {
  const { activeMonth, addDebt, removeDebt, updateDebt } = useFinance()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    principal: "",
    monthlyPayment: "",
    installments: "",
    interestRate: "",
    timeline: "mediano" as "corto" | "mediano" | "largo",
  })

  const handleAddDebt = () => {
    const principal = parseFloat(formData.principal)
    const monthlyPayment = parseFloat(formData.monthlyPayment)
    const installments = parseInt(formData.installments, 10)
    const interestRate = parseFloat(formData.interestRate) || 0

    if (!formData.name.trim() || isNaN(principal) || isNaN(monthlyPayment) || isNaN(installments)) {
      return
    }

    addDebt({
      name: formData.name,
      principal,
      monthlyPayment,
      installments,
      interestRate,
      startDate: new Date().toISOString().split("T")[0],
      timeline: formData.timeline,
    })

    setFormData({
      name: "",
      principal: "",
      monthlyPayment: "",
      installments: "",
      interestRate: "",
      timeline: "mediano",
    })
    setOpenDialog(false)
  }

  const timelineLabels = {
    corto: "Corto plazo (<1 año)",
    mediano: "Mediano plazo (1-5 años)",
    largo: "Largo plazo (>5 años)",
  }

  const debts = activeMonth.debts ?? []
  const debtsByTimeline = {
    corto: debts.filter((d) => d.timeline === "corto"),
    mediano: debts.filter((d) => d.timeline === "mediano"),
    largo: debts.filter((d) => d.timeline === "largo"),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proyecciones de Deuda</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza el impacto de tus deudas e inversiones en el tiempo
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full">
              <Plus className="h-4 w-4" />
              Nueva Deuda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Deuda</DialogTitle>
              <DialogDescription>
                Define una nueva deuda con cuotas, tasa de interés y plazo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre de la deuda</Label>
                <Input
                  placeholder="Ej: Tarjeta de crédito"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monto principal</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.principal}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, principal: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Cuota mensual</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.monthlyPayment}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyPayment: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número de cuotas</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={formData.installments}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        installments: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Tasa de interés (%)</Label>
                  <Input
                    type="number"
                    placeholder="3.5"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        interestRate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Plazo</Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      timeline: val as "corto" | "mediano" | "largo",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corto">Corto plazo (&lt;1 año)</SelectItem>
                    <SelectItem value="mediano">Mediano plazo (1-5 años)</SelectItem>
                    <SelectItem value="largo">Largo plazo (&gt;5 años)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddDebt} className="w-full rounded-full">
                Agregar Deuda
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline tabs */}
      <Tabs defaultValue="mediano" className="w-full">
        <TabsList className="w-fit rounded-full bg-secondary p-1 gap-0.5">
          <TabsTrigger
            value="corto"
            className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-foreground data-[state=active]:text-background"
          >
            Corto Plazo
          </TabsTrigger>
          <TabsTrigger
            value="mediano"
            className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-foreground data-[state=active]:text-background"
          >
            Mediano Plazo
          </TabsTrigger>
          <TabsTrigger
            value="largo"
            className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-foreground data-[state=active]:text-background"
          >
            Largo Plazo
          </TabsTrigger>
        </TabsList>

        {(Object.entries(debtsByTimeline) as [string, typeof activeMonth.debts][]).map(
          ([timelineKey, debts]) => (
            <TabsContent key={timelineKey} value={timelineKey} className="mt-6 space-y-6">
              {debts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <TrendingDown className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground text-center">
                      No hay deudas en este plazo. Agrega una nueva deuda para ver proyecciones.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                debts.map((debt) => {
                  const projection = calculateProjection(debt)
                  const totalInterest = getTotalInterest(debt)
                  const totalPayment = debt.monthlyPayment * debt.installments

                  return (
                    <div key={debt.id} className="space-y-4">
                      {/* Summary cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              Monto Principal
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatCOP(debt.principal)}</div>
                            <p className="text-xs text-muted-foreground mt-1">{debt.name}</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              Interés Total
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                              {formatCOP(totalInterest)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {debt.interestRate}% tasa anual
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              Pago Total
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{formatCOP(totalPayment)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {debt.installments} cuotas
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              Cuota Mensual
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {formatCOP(debt.monthlyPayment)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDebt(debt.id)}
                              className="mt-2 w-full h-7 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Projection Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Proyección de Saldo</CardTitle>
                          <CardDescription>
                            Evolución del saldo adeudado en el tiempo
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={projection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`grad-${debt.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis
                                dataKey="month"
                                label={{ value: "Mes", position: "insideBottomRight", offset: -5 }}
                              />
                              <YAxis
                                label={{ value: "Saldo COP", angle: -90, position: "insideLeft" }}
                              />
                              <Tooltip
                                formatter={(value) => formatCOP(value as number)}
                                labelFormatter={(label) => `Mes ${label}`}
                              />
                              <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="hsl(var(--chart-1))"
                                fill={`url(#grad-${debt.id})`}
                                name="Saldo"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Amortization Table */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Tabla de Amortización</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-2 font-semibold">Mes</th>
                                  <th className="text-right py-2 px-2 font-semibold">Saldo</th>
                                  <th className="text-right py-2 px-2 font-semibold">Pago</th>
                                  <th className="text-right py-2 px-2 font-semibold">Principal</th>
                                  <th className="text-right py-2 px-2 font-semibold">Interés</th>
                                </tr>
                              </thead>
                              <tbody>
                                {projection.slice(0, 12).map((month) => (
                                  <tr key={month.month} className="border-b hover:bg-secondary/50">
                                    <td className="py-2 px-2 font-medium">{month.month}</td>
                                    <td className="text-right py-2 px-2">
                                      {formatCOP(month.balance)}
                                    </td>
                                    <td className="text-right py-2 px-2">
                                      {formatCOP(month.payment)}
                                    </td>
                                    <td className="text-right py-2 px-2">
                                      {formatCOP(month.principal)}
                                    </td>
                                    <td className="text-right py-2 px-2 text-destructive">
                                      {formatCOP(month.interest)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {projection.length > 12 && (
                              <p className="text-xs text-muted-foreground mt-2 text-center">
                                Mostrando primeros 12 meses. Total: {projection.length} meses
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })
              )}
            </TabsContent>
          )
        )}
      </Tabs>

      {/* Overall salary impact */}
      {debts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Impacto en Sueldo</CardTitle>
            <CardDescription>
              Carga de deuda total versus sueldo mensual
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Sueldo mensual</span>
                  <span className="font-semibold">{formatCOP(activeMonth.salary)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Total pagos mensuales</span>
                  <span className="font-semibold text-destructive">
                    {formatCOP(debts.reduce((sum, d) => sum + d.monthlyPayment, 0))}
                  </span>
                </div>
                <div className="h-2 bg-destructive rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive"
                    style={{
                      width: `${Math.min(
                        (debts.reduce((sum, d) => sum + d.monthlyPayment, 0) /
                          activeMonth.salary) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Porcentaje de sueldo</span>
                  <span className="font-semibold">
                    {(
                      (debts.reduce((sum, d) => sum + d.monthlyPayment, 0) /
                        activeMonth.salary) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
