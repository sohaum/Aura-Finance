import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function createPageUrl(pageName) {
  const routes = {
    'Dashboard': '/',
    'AddExpense': '/add-expense',
    'Analytics': '/analytics'
  }
  return routes[pageName] || '/'
}