'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wallet, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { AuthForm } from '@/components/auth-form'
import { GoogleAuthButton } from '@/components/google-auth-button'

export default function SignupPage() {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (data: any) => {
    setServerError(null)
    setLoading(true)
    try {
      await register(data.name!, data.email, data.password)
      router.push('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">PocketPlan</span>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-card/80 backdrop-blur rounded-3xl p-8 border border-border shadow-xl">
          <div className="space-y-2 mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground">Crea tu Cuenta</h1>
            <p className="text-muted-foreground">
              Comienza a controlar tus finanzas hoy mismo
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Auth Button */}
            <GoogleAuthButton />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-card text-muted-foreground">
                  O regístrate con email
                </span>
              </div>
            </div>

            {/* Auth Form */}
            <AuthForm
              mode="signup"
              onSubmit={handleSubmit}
              serverError={serverError}
              isLoading={loading}
            />

            {/* Benefits */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Acceso ilimitado al dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Análisis de gastos en tiempo real</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Completamente gratis para empezar</span>
              </div>
            </div>

            {/* Additional Links */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-4">
              <Link href="/" className="hover:text-foreground transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🔒 Tus datos están protegidos con encriptación de nivel empresarial</p>
        </div>
      </div>
    </main>
  )
}
