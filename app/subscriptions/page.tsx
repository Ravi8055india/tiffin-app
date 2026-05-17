'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CreditCard, Calendar, RefreshCw, AlertCircle, Sparkles, CheckCircle2, ChevronRight, Pause, Play, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'
import { toast } from 'sonner'

interface Thali {
  id: string
  name: string
  price: number
  cuisine_type: string
  image_url: string
}

interface Subscription {
  id: string
  thali_id: string
  thali_name: string
  thali_price: number
  start_date: string
  end_date: string
  frequency: string
  quantity: number
  total_price: number
  status: string
  created_at: string
}

interface Plan {
  id: string
  name: string
  description: string
  durationDays: number
  discountPercent: number
  badge: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [thalis, setThalis] = useState<Thali[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  
  // Subscription Creation State
  const [showCreator, setShowCreator] = useState(false)
  const [selectedThaliId, setSelectedThaliId] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('weekly')
  const [startDate, setStartDate] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [walletBalance, setWalletBalance] = useState(0)
  const [creating, setCreating] = useState(false)

  const fetchSubscriptionsAndData = async () => {
    try {
      const token = localStorage.getItem('nutriNestToken')
      if (!token) return

      // Fetch Subscriptions
      const subRes = await fetch(`${API_BASE_URL}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (subRes.ok) {
        const subData = await subRes.json()
        setSubscriptions(subData)
      }

      // Fetch Thalis
      const thaliRes = await fetch(`${API_BASE_URL}/api/thalis`)
      if (thaliRes.ok) {
        const thaliData = await thaliRes.json()
        setThalis(thaliData)
        if (thaliData.length > 0) setSelectedThaliId(thaliData[0].id)
      }

      // Fetch Plans
      const planRes = await fetch(`${API_BASE_URL}/api/subscriptions/plans`)
      if (planRes.ok) {
        const planData = await planRes.json()
        setPlans(planData)
      }

      // Fetch Wallet Balance
      const walletRes = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (walletRes.ok) {
        const walletData = await walletRes.json()
        setWalletBalance(Number(walletData.balance))
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions data:', error)
      toast.error('Failed to load subscriptions. Please check your network.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionsAndData()
    // Set default start date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setStartDate(tomorrow.toISOString().split('T')[0])
  }, [])

  const selectedThali = thalis.find(t => t.id === selectedThaliId)
  const selectedPlan = plans.find(p => p.id === selectedPlanId)

  // Calculations
  const basePricePerDay = selectedThali ? Number(selectedThali.price) : 0
  const discountPercent = selectedPlan ? selectedPlan.discountPercent : 0
  const discountedPricePerDay = basePricePerDay * (1 - discountPercent / 100)
  const durationDays = selectedPlan ? selectedPlan.durationDays : 7
  const calculatedTotal = discountedPricePerDay * durationDays * quantity

  const handleCreateSubscription = async () => {
    if (!selectedThaliId || !selectedPlanId || !startDate) {
      toast.error('Please fill out all fields')
      return
    }

    if (walletBalance < calculatedTotal) {
      toast.error('Insufficient wallet balance!', {
        description: `Your balance is ₹${walletBalance.toFixed(0)}, but this subscription costs ₹${calculatedTotal.toFixed(0)}. Please add money to your wallet.`
      })
      return
    }

    setCreating(true)
    try {
      const token = localStorage.getItem('nutriNestToken')
      
      // 1. Deduct money from wallet
      const deductRes = await fetch(`${API_BASE_URL}/api/wallet/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: calculatedTotal,
          description: `Subscription payment: ${selectedPlan?.name} for ${selectedThali?.name}`
        })
      })

      if (!deductRes.ok) {
        const errData = await deductRes.json()
        throw new Error(errData.error || 'Failed to deduct wallet amount')
      }

      // 2. Calculate End Date
      const sDate = new Date(startDate)
      const eDate = new Date(sDate)
      eDate.setDate(sDate.getDate() + durationDays)
      const endDateString = eDate.toISOString().split('T')[0]

      // 3. Create Subscription Record
      const subRes = await fetch(`${API_BASE_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          thaliId: selectedThaliId,
          startDate: startDate,
          endDate: endDateString,
          frequency: selectedPlanId,
          quantity: quantity,
          totalPrice: calculatedTotal
        })
      })

      if (subRes.ok) {
        toast.success('Subscription created successfully!', {
          description: `Enjoy fresh meals starting ${new Date(startDate).toLocaleDateString()}`
        })
        setShowCreator(false)
        fetchSubscriptionsAndData()
      } else {
        toast.error('Failed to create subscription record')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'An error occurred during subscription creation')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateStatus = async (subId: string, newStatus: 'active' | 'paused' | 'cancelled') => {
    try {
      const token = localStorage.getItem('nutriNestToken')
      
      let endpoint = '';
      if (newStatus === 'paused') endpoint = `/api/subscriptions/${subId}/pause`;
      else if (newStatus === 'cancelled') endpoint = `/api/subscriptions/${subId}/cancel`;
      else {
        // Fallback or generic status update
        toast.error('Operation not supported');
        return;
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success(`Subscription ${newStatus} successfully!`)
        fetchSubscriptionsAndData()
      } else {
        toast.error('Failed to update subscription status')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update subscription')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/account">
              <Button size="icon" variant="ghost" className="rounded-xl hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Subscriptions</h1>
          </div>
          {!showCreator && (
            <Button 
              onClick={() => setShowCreator(true)}
              className="rounded-2xl font-black text-xs uppercase tracking-widest px-6 shadow-lg shadow-primary/20 bg-primary text-white"
            >
              New Plan
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-[2rem] p-6 border border-gray-100 overflow-hidden space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-32 skeleton rounded-lg" />
                    <div className="h-6 w-20 skeleton rounded-lg" />
                  </div>
                  <div className="h-4 w-3/4 skeleton rounded-lg" />
                  <div className="h-10 w-full skeleton rounded-xl" />
                </div>
              ))}
            </motion.div>
          ) : showCreator ? (
            // SUBSCRIPTION CREATOR PANEL
            <motion.div
              key="creator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 bg-primary rounded-full -mr-10 -mt-10" />
                
                <div className="flex justify-between items-center border-b border-gray-100 pb-5">
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Select Premium Plan</h2>
                    <p className="text-xs text-muted-foreground">Tailor your nutrition commitment</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowCreator(false)}
                    className="rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </Button>
                </div>

                {/* 1. Select Thali */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block ml-1">Select Thali Meal</label>
                  <div className="grid grid-cols-2 gap-3">
                    {thalis.map((thali) => (
                      <button
                        key={thali.id}
                        onClick={() => setSelectedThaliId(thali.id)}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all relative overflow-hidden group ${
                          selectedThaliId === thali.id 
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        <img 
                          src={thali.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop'} 
                          alt={thali.name}
                          className="w-12 h-12 rounded-xl object-cover mb-2 border border-gray-50"
                        />
                        <div>
                          <p className="font-black text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{thali.name}</p>
                          <p className="text-xs font-bold text-muted-foreground">₹{thali.price}/day</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Select Plan Frequency */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block ml-1">Choose Plan Duration (Tiered Discount)</label>
                  <div className="space-y-3">
                    {plans.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          selectedPlanId === p.id 
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex gap-4 items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                            selectedPlanId === p.id ? 'bg-primary text-white' : 'bg-gray-100 text-muted-foreground'
                          }`}>
                            🗓️
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-foreground">{p.name}</p>
                              <span className="bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                {p.badge}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5 italic">{p.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-foreground">{p.durationDays} Days</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {p.discountPercent}% Off
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Setup Start Date */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block ml-1">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-14 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block ml-1">Quantity</label>
                    <div className="flex items-center justify-between h-14 bg-gray-50 rounded-2xl px-4">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black shadow-sm"
                      >-</button>
                      <span className="font-black text-foreground">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black shadow-sm"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pricing Breakup</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Original daily price ({quantity}x)</span>
                      <span className="font-bold text-foreground">₹{basePricePerDay * quantity}/day</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600 font-bold">
                      <span>Tier discount ({discountPercent}%)</span>
                      <span>-₹{(basePricePerDay * (discountPercent / 100) * quantity).toFixed(1)}/day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discounted daily rate</span>
                      <span className="font-black text-foreground">₹{discountedPricePerDay * quantity}/day</span>
                    </div>
                    <div className="w-full h-px bg-gray-200/50 my-2" />
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Grand Total ({durationDays} Days)</span>
                        <p className="text-3xl font-black text-foreground leading-none mt-1">₹{calculatedTotal.toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Your Wallet</span>
                        <p className={`font-black text-sm mt-1 ${walletBalance >= calculatedTotal ? 'text-green-600' : 'text-destructive'}`}>
                          ₹{walletBalance.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCreateSubscription}
                  disabled={creating}
                  className="w-full h-16 rounded-[2rem] text-lg font-black bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-3"
                >
                  {creating ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Subscribe Using Wallet
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          ) : (
            // SUBSCRIPTIONS LIST VIEW
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {subscriptions.length > 0 ? (
                <div className="space-y-6">
                  {subscriptions.map((sub, idx) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="p-6 rounded-[2.2rem] border-none shadow-md bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                        {/* Status ribbon blur */}
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-16 -mt-16 ${
                          sub.status === 'active' ? 'bg-green-500' : sub.status === 'paused' ? 'bg-orange-500' : 'bg-red-500'
                        }`} />
                        
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">Plan ID: #{sub.id.slice(0,8)}</span>
                            <h3 className="font-black text-xl text-foreground group-hover:text-primary transition-colors">{sub.thali_name}</h3>
                          </div>
                          
                          <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            sub.status === 'active' 
                              ? 'bg-green-50 text-green-600' 
                              : sub.status === 'paused' 
                                ? 'bg-orange-50 text-orange-600' 
                                : 'bg-red-50 text-red-600'
                          }`}>
                            {sub.status}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 text-sm">
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest block">Duration</span>
                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-1">
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest block">Sub Total</span>
                            <p className="font-black text-xl text-foreground">₹{Number(sub.total_price).toFixed(0)}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex justify-between items-center">
                          <p className="text-xs text-muted-foreground italic font-medium">
                            Plan: <span className="font-bold text-foreground uppercase">{sub.frequency}</span> • Qty: {sub.quantity}
                          </p>
                          
                          <div className="flex gap-2">
                            {sub.status === 'active' && (
                              <>
                                <Button 
                                  onClick={() => handleUpdateStatus(sub.id, 'paused')}
                                  variant="outline" 
                                  size="sm" 
                                  className="h-10 rounded-xl px-4 font-black text-xs uppercase tracking-wider text-orange-600 border-orange-100 hover:bg-orange-50 hover:text-orange-700"
                                >
                                  <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
                                </Button>
                                <Button 
                                  onClick={() => handleUpdateStatus(sub.id, 'cancelled')}
                                  variant="outline" 
                                  size="sm" 
                                  className="h-10 rounded-xl px-4 font-black text-xs uppercase tracking-wider text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
                                </Button>
                              </>
                            )}
                            {sub.status === 'paused' && (
                              <Button 
                                onClick={() => handleUpdateStatus(sub.id, 'active')}
                                variant="outline" 
                                size="sm" 
                                className="h-10 rounded-xl px-4 font-black text-xs uppercase tracking-wider text-green-600 border-green-100 hover:bg-green-50 hover:text-green-700"
                              >
                                <Play className="w-3.5 h-3.5 mr-1.5" /> Resume
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // NO ACTIVE SUBSCRIPTIONS PROMO
                <div className="space-y-6 text-center py-12">
                  <div className="text-8xl animate-bounce">🥗</div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-2">No Active Subscriptions</h2>
                    <p className="text-muted-foreground italic max-w-sm mx-auto">Subscribe to our weekly/monthly plans and secure piping hot premium meals with great tiered discounts!</p>
                  </div>

                  <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-accent text-white border-none shadow-xl text-left relative overflow-hidden mt-8">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-2xl" />
                    
                    <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 inline-block">Best Offer</span>
                    <h3 className="text-3xl font-black mb-1">Tiered Discounts</h3>
                    <p className="text-white/80 text-sm mb-6 font-medium">Weekly (10% Off) • Monthly (15% Off) • 3-Months (20% Off)</p>
                    
                    <Button 
                      onClick={() => setShowCreator(true)}
                      className="h-14 px-8 rounded-2xl font-black bg-white text-primary hover:bg-gray-50 shadow-lg text-sm uppercase tracking-wider transition-all"
                    >
                      Subscribe Now & Save →
                    </Button>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
