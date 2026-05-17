'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, TrendingUp, Users, LogOut, Package, Clock, DollarSign, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'

interface DeliveryStats {
  total_deliveries: number
  earnings_today: number
  pending_orders: number
  total_earnings: number
}

export default function DeliveryDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DeliveryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        if (!token) {
          router.push('/auth/login')
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/delivery/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('nutriNestToken')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-32">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-primary">NutriDelivery</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Partner Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleLogout}
              className="rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Status Section */}
      <div className="px-6 py-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/10 blur-[100px] -z-10" />
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-xl mx-auto"
        >
          <Card className="p-8 rounded-[3rem] border-none shadow-2xl bg-slate-900 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 ${isOnline ? 'bg-green-500' : 'bg-slate-500'}`} />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner ${
                isOnline ? 'bg-green-500/20 text-green-500 animate-pulse' : 'bg-slate-800 text-slate-500'
              }`}>
                <Power className="w-10 h-10 stroke-[3px]" />
              </div>
              
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">
                  {isOnline ? 'Active & Online' : 'You are Offline'}
                </h2>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                  {isOnline ? 'Orders will appear here shortly' : 'Switch online to start earning'}
                </p>
              </div>

              <Button
                onClick={() => setIsOnline(!isOnline)}
                className={`w-full h-16 rounded-2xl font-black text-lg transition-all duration-500 ${
                  isOnline 
                    ? 'bg-slate-800 text-white hover:bg-destructive shadow-xl' 
                    : 'bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-105'
                }`}
              >
                {isOnline ? 'Go Offline' : 'Go Online Now'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <main className="max-w-xl mx-auto px-6 space-y-8">
        <div className="grid grid-cols-2 gap-5">
          <Card className="p-6 rounded-[2rem] border-none bg-slate-900 shadow-xl space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Today&apos;s Pay</p>
              <p className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                ₹{Number(stats?.earnings_today || 0).toFixed(0)}
              </p>
            </div>
          </Card>
          <Card className="p-6 rounded-[2rem] border-none bg-slate-900 shadow-xl space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pending</p>
              <p className="text-2xl font-black tracking-tight group-hover:text-orange-500 transition-colors">
                {stats ? stats.pending_orders : '0'}
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Links */}
        <section className="space-y-4">
          <h3 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.3em] ml-4">Management</h3>
          <div className="space-y-3">
            {[
              { label: 'Active Deliveries', icon: <MapPin />, path: '/delivery/orders', color: 'text-blue-500 bg-blue-500/10' },
              { label: 'Earnings Report', icon: <TrendingUp />, path: '/delivery/earnings', color: 'text-green-500 bg-green-500/10' },
              { label: 'Account Profile', icon: <Users />, path: '/delivery/profile', color: 'text-purple-500 bg-purple-500/10' },
            ].map((link, idx) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={link.path}>
                  <Card className="p-5 rounded-[2rem] border-none bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${link.color} group-hover:scale-110 transition-transform`}>
                        {link.icon}
                      </div>
                      <span className="font-black tracking-tight text-lg">{link.label}</span>
                    </div>
                    <span className="text-slate-600 font-black tracking-widest group-hover:translate-x-1 transition-transform">→</span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Activity Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.3em]">Recent Activity</h3>
            <Clock className="w-4 h-4 text-slate-700" />
          </div>
          <Card className="rounded-[2.5rem] border-none bg-slate-900 overflow-hidden divide-y divide-slate-800">
            {[
              { msg: 'Order #902 delivered', time: '12:30 PM', price: '+₹45' },
              { msg: 'Assigned Order #903', time: '01:15 PM', price: 'Pending' },
            ].map((activity) => (
              <div key={activity.msg} className="p-6 flex items-center justify-between hover:bg-slate-800 transition-colors">
                <div className="space-y-1">
                  <p className="font-bold tracking-tight">{activity.msg}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activity.time}</p>
                </div>
                <span className={`text-sm font-black ${activity.price.includes('+') ? 'text-green-500' : 'text-slate-400'}`}>
                  {activity.price}
                </span>
              </div>
            ))}
          </Card>
        </section>
      </main>

      {/* Global Earnings Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-fit px-8 h-14 bg-primary rounded-2xl flex items-center gap-3 shadow-2xl shadow-primary/40 z-50">
        <TrendingUp className="w-5 h-5 text-white" />
        <span className="font-black text-white whitespace-nowrap">₹{Number(stats?.total_earnings || 0).toFixed(0)} LIFETIME</span>
      </div>
    </div>
  )
}
