'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export interface CartItem {
  id: string
  thaliId: string
  thaliName: string
  price: number
  quantity: number
  image_url?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (thaliId: string) => void
  updateQuantity: (thaliId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((item: CartItem) => {
    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.thaliId === item.thaliId)
      if (existing) {
        return prevItems.map((i) =>
          i.thaliId === item.thaliId ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prevItems, item]
    })
  }, [])

  const removeItem = useCallback((thaliId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.thaliId !== thaliId))
  }, [])

  const updateQuantity = useCallback((thaliId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(thaliId)
    } else {
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.thaliId === thaliId ? { ...i, quantity } : i
        )
      )
    }
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
