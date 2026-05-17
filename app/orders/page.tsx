'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Truck, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'

interface Order {
  id: string
  thali_name: string
  quantity: number
  total_price: number
  delivery_date: string
  order_status: string
  payment_status: string
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        if (!token) return

        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.order_status === filter)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-blue-500" />
      default:
        return <Clock className="w-5 h-5 text-amber-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex-1">My Orders</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto no-scrollbar">
          {(['all', 'pending', 'delivered'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === status 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'bg-white text-muted-foreground hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden p-6 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 skeleton rounded-lg" />
                  <div className="h-6 w-24 skeleton rounded-xl" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 skeleton rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 skeleton rounded-lg" />
                    <div className="h-3 w-1/2 skeleton rounded-lg" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="h-4 w-20 skeleton rounded-lg" />
                  <div className="h-8 w-24 skeleton rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white group overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-16 -mt-16 ${
                    order.order_status === 'delivered' ? 'bg-green-500' : 'bg-primary'
                  }`} />
                  
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Order #{order.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="font-black text-xl text-foreground group-hover:text-primary transition-colors">{order.thali_name}</h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Placed on {new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      order.order_status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {getStatusIcon(order.order_status)}
                      {getStatusLabel(order.order_status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-5 border-y border-gray-50 relative z-10">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Details</p>
                      <p className="font-bold text-foreground text-sm">{order.quantity}x Healthy Meals</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Total Paid</p>
                      <p className="font-black text-2xl text-foreground">₹{order.total_price}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">📅</div>
                      <p className="text-xs font-black text-foreground uppercase tracking-tighter">
                        Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" className="rounded-xl h-10 font-black text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary">
                      Track Details →
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-6">
            <div className="text-8xl">🥘</div>
            <div>
              <h2 className="text-2xl font-black text-foreground mb-2">No orders found</h2>
              <p className="text-muted-foreground italic max-w-xs mx-auto">Looks like you haven't enjoyed our delicious thalis yet.</p>
            </div>
            <Link href="/">
              <Button className="h-14 px-10 rounded-2xl text-lg font-black shadow-lg shadow-primary/20">
                Explore Menu
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
