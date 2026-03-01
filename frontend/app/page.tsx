'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Wallet, BarChart3, Lock } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">PocketPlan</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Button asChild className="gradient-button text-white">
              <Link href="/signup">Registrarse</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8 fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Toma Control de Tus
            <br />
            <span className="gradient-text">Finanzas Personales</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            PocketPlan te ayuda a gestionar, analizar y optimizar tu dinero de forma inteligente y sencilla.
            Con una interfaz minimalista y datos en tiempo real, tendrás el control total.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gradient-button text-white text-lg px-8">
              <Link href="/signup">Comenzar Ahora</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 border-border hover:bg-muted/50"
            >
              <Link href="#features">Ver Características</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 gradient-secondary opacity-20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 dark:bg-card rounded-3xl p-8 shadow-2xl border border-border backdrop-blur">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <BarChart3 className="w-16 h-16 text-primary mx-auto" />
                <p className="text-foreground font-semibold">Tu Dashboard Personalizado</p>
                <p className="text-muted-foreground text-sm">Visualiza todos tus datos financieros en un solo lugar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Características Principales</h2>
            <p className="text-muted-foreground text-lg">Todo lo que necesitas para manejar tus finanzas</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="card-hover p-6 bg-white/50 dark:bg-card/50 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Análisis Inteligente</h3>
              <p className="text-muted-foreground text-sm">
                Gráficos detallados y análisis de tendencias para entender tu situación financiera
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-hover p-6 bg-white/50 dark:bg-card/50 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Gestión de Gastos</h3>
              <p className="text-muted-foreground text-sm">
                Categoriza y rastrea todos tus gastos de manera automática y eficiente
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-hover p-6 bg-white/50 dark:bg-card/50 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Presupuestos</h3>
              <p className="text-muted-foreground text-sm">
                Crea y monitorea presupuestos personalizados para cada categoría
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-hover p-6 bg-white/50 dark:bg-card/50 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Seguro y Privado</h3>
              <p className="text-muted-foreground text-sm">
                Tus datos están protegidos con encriptación de nivel empresarial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">Comienza Hoy Mismo</h2>
          <p className="text-xl text-muted-foreground">
            Únete a miles de personas que ya están controlando sus finanzas con PocketPlan
          </p>
          <Button asChild size="lg" className="gradient-button text-white text-lg px-8">
            <Link href="/signup">
              Crear Cuenta Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">PocketPlan</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Términos
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contacto
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2026 PocketPlan. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
