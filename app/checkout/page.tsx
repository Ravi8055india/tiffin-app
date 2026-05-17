'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Truck, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/context/cart-context'
import { API_BASE_URL } from '@/lib/api'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'wallet'>('razorpay')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('morning')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')

  useEffect(() => {
    // Fetch user address
    const fetchUserAddress = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          setDeliveryAddress(data.address || '')
          setCity(data.city || '')
          setPincode(data.pincode || '')
        }
      } catch (error) {
        console.error('Failed to fetch user address:', error)
      }
    }

    fetchUserAddress()
  }, [])

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Link href="/menu">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('nutriNestToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      // Create orders for each item
      for (const item of items) {
        const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            thaliId: item.thaliId,
            quantity: item.quantity,
            deliveryDate,
            deliveryTime,
            deliveryAddress,
            totalPrice: item.price * item.quantity,
            paymentMethod,
          }),
        })

        if (!orderResponse.ok) {
          throw new Error('Failed to create order')
        }

        const orderData = await orderResponse.json()

        if (paymentMethod === 'razorpay') {
          // Create Razorpay order
          const paymentResponse = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: item.price * item.quantity,
              orderId: orderData.id,
            }),
          })

          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json()
            // Store payment info for Razorpay
            localStorage.setItem('currentPayment', JSON.stringify(paymentData))
            localStorage.setItem('currentOrderId', orderData.id)
          }
        }
      }

      clearCart()

      if (paymentMethod === 'razorpay') {
        router.push('/payment')
      } else {
        router.push('/orders')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/cart">
            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Checkout</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-2xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span>⚠️</span>
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-8">
          {/* Progress Indicator (Mock) */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">1</div>
              <span className="text-sm font-bold">Details</span>
            </div>
            <div className="h-px flex-1 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-black border border-gray-200">2</div>
              <span className="text-sm font-bold text-gray-400">Payment</span>
            </div>
          </div>

          {/* Delivery Address */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-foreground flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              Delivery Location
            </h3>
            <Card className="p-6 rounded-3xl border-none shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Street Address</label>
                <Input
                  type="text"
                  placeholder="e.g. Flat 402, Sunshine Residency"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  className="h-12 bg-gray-50 border-none rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">City</label>
                  <Input
                    type="text"
                    placeholder="Noida"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="h-12 bg-gray-50 border-none rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Pincode</label>
                  <Input
                    type="text"
                    placeholder="201301"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    className="h-12 bg-gray-50 border-none rounded-xl"
                  />
                </div>
              </div>
            </Card>
          </section>

          {/* Delivery Time */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-foreground flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              Delivery Schedule
            </h3>
            <Card className="p-6 rounded-3xl border-none shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Date</label>
                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="h-12 bg-gray-50 border-none rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Preferred Slot</label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full h-12 px-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  >
                    <option value="morning">Morning (6 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 8 PM)</option>
                  </select>
                </div>
              </div>
            </Card>
          </section>

          {/* Payment Method */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-foreground flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'razorpay' 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">💳</div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-primary' : 'border-gray-200'}`}>
                    {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                </div>
                <p className="font-black text-foreground">Online Payment</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Debit/Credit/UPI</p>
              </div>

              <div 
                onClick={() => setPaymentMethod('wallet')}
                className={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'wallet' 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">💰</div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-primary' : 'border-gray-200'}`}>
                    {paymentMethod === 'wallet' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                </div>
                <p className="font-black text-foreground">NutriWallet</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Instant & Secure</p>
              </div>
            </div>
          </section>

          {/* Order Summary */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-foreground">Order Summary</h3>
            <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-foreground text-white space-y-4 overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[80px]" />
              
              <div className="space-y-3 relative z-10">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-white/70 font-medium">{item.thaliName} <span className="text-white font-black ml-1">x{item.quantity}</span></span>
                    <span className="font-black">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-white/10 flex justify-between items-end relative z-10">
                <div>
                  <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-1">Total Amount</p>
                  <p className="text-4xl font-black text-primary tracking-tighter">₹{total.toFixed(2)}</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-14 px-8 rounded-2xl bg-white text-foreground hover:bg-gray-100 font-black shadow-2xl transition-transform active:scale-95"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </Card>
          </section>
        </form>
      </main>
    </div>
  )
}
