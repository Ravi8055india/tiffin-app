'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Navigation, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'

interface DeliveryOrder {
  id: string
  thali_name: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_time: string
  delivery_status: string
  total_price: number
}

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'delivered'>('pending')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        if (!token) return

        const response = await fetch(`${API_BASE_URL}/api/delivery/orders`, {
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

  const filteredOrders = orders.filter((o) => o.delivery_status === filter)

  const handleAccept = async (orderId: string) => {
    try {
      const token = localStorage.getItem('nutriNestToken')
      const response = await fetch(`${API_BASE_URL}/api/delivery/orders/${orderId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, delivery_status: 'accepted' } : o
          )
        )
      }
    } catch (error) {
      console.error('Failed to accept order:', error)
    }
  }

  const handleDeliver = async (orderId: string) => {
    try {
      const token = localStorage.getItem('nutriNestToken')
      const response = await fetch(`${API_BASE_URL}/api/delivery/orders/${orderId}/deliver`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, delivery_status: 'delivered' } : o
          )
        )
      }
    } catch (error) {
      console.error('Failed to mark as delivered:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="max-w-screen-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/delivery/dashboard">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground flex-1">My Orders</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
          {(['pending', 'accepted', 'delivered'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="whitespace-nowrap"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-4 border-l-4 border-l-primary">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground">{order.thali_name}</h3>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">₹{order.total_price}</p>
                    <p className="text-xs text-muted-foreground capitalize">{order.delivery_status}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 py-3 border-y border-border">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="line-clamp-1">{order.delivery_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{order.delivery_time}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a href={`tel:${order.customer_phone}`}>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </a>
                  <Link href={`/delivery/tracking/${order.id}`}>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Navigation className="w-4 h-4 mr-2" />
                      Track
                    </Button>
                  </Link>
                  {order.delivery_status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleAccept(order.id)}
                      className="flex-1"
                    >
                      Accept
                    </Button>
                  )}
                  {order.delivery_status === 'accepted' && (
                    <Button
                      size="sm"
                      onClick={() => handleDeliver(order.id)}
                      className="flex-1"
                    >
                      Delivered
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No {filter} orders</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Clock({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
