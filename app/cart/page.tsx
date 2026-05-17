'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/context/cart-context'
import { toast } from 'sonner'

export default function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="text-8xl animate-bounce">🛒</div>
          <div>
            <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">Your cart is hungry!</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">Looks like you haven't added any delicious thalis yet.</p>
          </div>
          <Link href="/">
            <Button className="h-14 px-10 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
              Browse Menu
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-40">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex-1">Your Basket</h1>
          <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-4 sm:p-5 rounded-3xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                <div className="flex gap-4 sm:gap-6">
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-inner bg-gray-50">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.thaliName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🍲</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-black text-foreground text-lg tracking-tight mb-1">{item.thaliName}</h3>
                      <p className="text-primary font-black text-lg">₹{item.price}</p>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl hover:bg-white hover:shadow-sm transition-all text-lg font-bold"
                          onClick={() => updateQuantity(item.thaliId, item.quantity - 1)}
                        >
                          −
                        </Button>
                        <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl hover:bg-white hover:shadow-sm transition-all text-lg font-bold"
                          onClick={() => updateQuantity(item.thaliId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>

                      <button
                        onClick={() => {
                          removeItem(item.thaliId);
                          toast.error('Item removed from basket');
                        }}
                        className="text-destructive/40 hover:text-destructive transition-colors p-2"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Modern Checkout Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50">
        <Card className="bg-foreground text-white p-6 rounded-[2.5rem] shadow-2xl border-none overflow-hidden relative">
          <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-primary/10 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex justify-between items-center px-2">
              <div className="space-y-1">
                <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">Basket Total</p>
                <p className="text-4xl font-black text-primary tracking-tighter">₹{total.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-green-400">FREE DELIVERY</p>
                <p className="text-[10px] text-white/30 uppercase font-bold">Applied automatically</p>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="w-full h-16 rounded-[1.5rem] bg-white text-foreground hover:bg-gray-100 text-lg font-black shadow-xl transition-transform active:scale-95 group">
                Checkout Now
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
