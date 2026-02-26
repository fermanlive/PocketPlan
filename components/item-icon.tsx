"use client"

import {
  ShoppingCart, PawPrint, Shirt, User, UtensilsCrossed, CalendarDays,
  Heart, Dumbbell, Trophy, Fuel, Car,
  Stethoscope, Wrench, Bus, Pill, PackageOpen,
  Home, Zap, CreditCard, Banknote, PiggyBank,
  CircleDollarSign, Wallet, TrendingUp, ReceiptText, HelpCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  PawPrint,
  Shirt,
  User,
  UtensilsCrossed,
  CalendarDays,
  Heart,
  Dumbbell,
  Trophy,
  Fuel,
  Car,
  Stethoscope,
  Wrench,
  Bus,
  Pill,
  PackageOpen,
  Home,
  Zap,
  CreditCard,
  Banknote,
  PiggyBank,
  CircleDollarSign,
  Wallet,
  TrendingUp,
  ReceiptText,
}

const COLOR_ICON_BG: Record<string, string> = {
  "chart-1": "bg-chart-1/10 text-chart-1",
  "chart-2": "bg-chart-2/10 text-chart-2",
  "chart-3": "bg-chart-3/10 text-chart-3",
  "chart-4": "bg-chart-4/10 text-chart-4",
  "chart-5": "bg-chart-5/10 text-chart-5",
}

interface ItemIconProps {
  icon?: string
  categoryColor?: string
  size?: "sm" | "md"
}

export function ItemIcon({ icon, categoryColor = "chart-1", size = "sm" }: ItemIconProps) {
  const Icon = (icon && ICON_MAP[icon]) ?? HelpCircle
  const sizeClass = size === "sm"
    ? "h-7 w-7 rounded-lg"
    : "h-9 w-9 rounded-xl"
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5"
  const colorClass = COLOR_ICON_BG[categoryColor] ?? "bg-muted text-muted-foreground"

  return (
    <span className={`flex shrink-0 items-center justify-center ${sizeClass} ${colorClass}`}>
      <Icon className={iconSize} />
    </span>
  )
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP)
