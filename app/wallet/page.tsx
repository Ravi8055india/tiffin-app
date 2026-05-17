'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'

interface Transaction {
  id: string
  transaction_type: string
  amount: number
  description: string
  created_at: string
}

interface Wallet {
  id: string
  balance: number
  total_earned: number
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [addAmount, setAddAmount] = useState('')

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        if (!token) return

        const walletResponse = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (walletResponse.ok) {
          const walletData = await walletResponse.json()
          setWallet(walletData)
        }

        const transResponse = await fetch(`${API_BASE_URL}/api/wallet/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (transResponse.ok) {
          const transData = await transResponse.json()
          setTransactions(transData)
        }
      } catch (error) {
        console.error('Failed to fetch wallet data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addAmount) return

    try {
      const token = localStorage.getItem('nutriNestToken')
      const response = await fetch(`${API_BASE_URL}/api/wallet/add-money`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(addAmount) }),
      })

      if (response.ok) {
        const data = await response.json()
        setWallet(data.wallet)
        setAddAmount('')
        setShowAddMoney(false)
      }
    } catch (error) {
      console.error('Failed to add money:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/account">
            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">NutriWallet</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-foreground text-white overflow-hidden relative">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[60px]" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-1">Available Balance</p>
                  <h2 className="text-5xl font-black text-primary tracking-tighter">
                    ₹{Number(wallet?.balance || 0).toFixed(2)}
                  </h2>
                </div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">
                  💰
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowAddMoney(!showAddMoney)}
                  className="flex-1 h-14 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5 mr-2 stroke-[3px]" />
                  Add Funds
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl bg-white/5 border-white/10 text-white font-black backdrop-blur-md hover:bg-white/10"
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Add Money Form */}
        <AnimatePresence>
          {showAddMoney && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="p-6 rounded-3xl border-none shadow-xl bg-white space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Enter Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground">₹</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="w-full h-16 pl-10 pr-4 bg-gray-50 border-none rounded-2xl text-2xl font-black focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      step="10"
                      min="10"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAddMoney} className="flex-1 h-12 rounded-xl font-bold">Confirm Deposit</Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAddMoney(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">Total Earned</p>
              <p className="text-xl font-black text-foreground">₹{Number(wallet?.total_earned || 0).toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </Card>
          <Card className="p-6 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">Cashback</p>
              <p className="text-xl font-black text-foreground">₹0.00</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
              ✨
            </div>
          </Card>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-xl text-foreground tracking-tight">Activity History</h3>
            <button className="text-primary text-xs font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-50 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 skeleton rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 skeleton rounded-lg" />
                    <div className="h-3 w-1/4 skeleton rounded-lg" />
                  </div>
                  <div className="h-6 w-16 skeleton rounded-lg" />
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((trans, idx) => (
                <motion.div
                  key={trans.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-4 rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                        trans.transaction_type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {trans.transaction_type === 'credit' ? '↓' : '↑'}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-foreground group-hover:text-primary transition-colors">{trans.description}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {new Date(trans.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <p className={`font-black text-lg ${trans.transaction_type === 'credit' ? 'text-green-600' : 'text-foreground'}`}>
                        {trans.transaction_type === 'credit' ? '+' : '-'}₹{trans.amount.toFixed(0)}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 rounded-[2rem] border-none shadow-sm bg-white text-center space-y-4">
              <div className="text-5xl">📄</div>
              <p className="text-muted-foreground font-medium italic">No activity recorded yet</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
