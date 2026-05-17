'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, ShoppingBag, Sparkles, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/context/cart-context'
import { API_BASE_URL } from '@/lib/api'
import { toast } from 'sonner'

export default function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    discountPercent?: number
  } | null>(null)
  const [applying, setApplying] = useState(false)

  // Load existing coupon if any
  useEffect(() => {
    const saved = localStorage.getItem('nutriNestAppliedCoupon')
    if (saved) {
      try {
        setAppliedCoupon(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Re-calculate coupon discount if cart total changes
  useEffect(() => {
    if (appliedCoupon && items.length > 0) {
      // Validate coupon again dynamically or adjust discount amount
      const code = appliedCoupon.code;
      
      const checkAndAdjustCoupon = async () => {
        try {
          const token = localStorage.getItem('nutriNestToken');
          const response = await fetch(`${API_BASE_URL}/api/coupons/apply`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code, cartTotal: total })
          });

          if (response.ok) {
            const data = await response.json();
            const updatedCoupon = {
              code: data.code,
              discountAmount: data.discountAmount,
              discountPercent: data.discountValue
            };
            setAppliedCoupon(updatedCoupon);
            localStorage.setItem('nutriNestAppliedCoupon', JSON.stringify(updatedCoupon));
          } else {
            // Remove coupon if cart total no longer qualifies
            setAppliedCoupon(null);
            localStorage.removeItem('nutriNestAppliedCoupon');
            toast.info('Applied promo code removed because basket total doesn\'t meet the criteria anymore.');
          }
        } catch (err) {
          console.error(err);
        }
      };

      checkAndAdjustCoupon();
    }
  }, [total, items.length])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplying(true);
    try {
      const token = localStorage.getItem('nutriNestToken');
      const response = await fetch(`${API_BASE_URL}/api/coupons/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartTotal: total
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newCoupon = {
          code: data.code,
          discountAmount: data.discountAmount,
          discountPercent: data.discountValue
        };
        setAppliedCoupon(newCoupon);
        localStorage.setItem('nutriNestAppliedCoupon', JSON.stringify(newCoupon));
        toast.success(`Coupon "${data.code}" applied! You saved ₹${data.discountAmount}`);
        setCouponCode('');
      } else {
        toast.error(data.error || 'Failed to apply coupon');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to apply coupon. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('nutriNestAppliedCoupon');
    toast.success('Promo code removed');
  };

  const discountedTotal = appliedCoupon ? Math.max(0, total - appliedCoupon.discountAmount) : total;

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
    <div className="min-h-screen bg-[#F8F9FA] pb-48 sm:pb-52">
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
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
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

        {/* Promo / Coupon Box */}
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white space-y-4">
          <div>
            <h4 className="font-black text-sm text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Apply Promo Code
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">Use "10OFF" on cart orders above ₹500 for a 10% discount!</p>
          </div>

          <AnimatePresence mode="wait">
            {appliedCoupon ? (
              <motion.div
                key="applied"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-black text-green-800 text-sm">Coupon: {appliedCoupon.code}</p>
                    <p className="text-xs text-green-600 font-bold">Discount Applied: -₹{appliedCoupon.discountAmount.toFixed(2)} ({appliedCoupon.discountPercent}%)</p>
                  </div>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  className="w-8 h-8 rounded-xl hover:bg-green-100 flex items-center justify-center text-green-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <Input
                  placeholder="Enter code (e.g. 10OFF)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="h-12 bg-gray-50 border-none rounded-xl font-bold uppercase"
                />
                <Button 
                  onClick={handleApplyCoupon}
                  disabled={applying}
                  className="rounded-xl h-12 px-6 font-black uppercase tracking-wider text-xs shadow-md bg-primary text-white"
                >
                  Apply
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </main>

      {/* Modern Checkout Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50">
        <Card className="bg-foreground text-white p-6 rounded-[2.5rem] shadow-2xl border-none overflow-hidden relative">
          <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-primary/10 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex justify-between items-center px-2">
              <div className="space-y-1">
                <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">Basket Total</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-primary tracking-tighter">₹{discountedTotal.toFixed(0)}</p>
                  {appliedCoupon && (
                    <span className="text-xs text-white/50 line-through">₹{total.toFixed(0)}</span>
                  )}
                </div>
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

