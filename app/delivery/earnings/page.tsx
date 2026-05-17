'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'

interface Earning {
  id: string
  order_id: string
  amount: number
  payment_date: string
  status: string
}

export default function DeliveryEarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        if (!token) return

        const response = await fetch(`${API_BASE_URL}/api/delivery/earnings?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setEarnings(data.earnings)
          setTotalEarnings(data.totalEarnings)
        }
      } catch (error) {
        console.error('Failed to fetch earnings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [period])

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
          <h1 className="text-xl font-bold text-foreground flex-1">Earnings</h1>
          <Button size="icon" variant="ghost">
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-6">
        {/* Total Earnings Card */}
        <Card className="p-6 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Total Earnings ({period})</h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-4xl font-bold text-primary mb-2">₹{totalEarnings.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">From {earnings.length} deliveries</p>
        </Card>

        {/* Period Filter */}
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="flex-1"
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>

        {/* Earnings List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : earnings.length > 0 ? (
          <div className="space-y-3">
            {earnings.map((earning) => (
              <Card key={earning.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Order #{earning.order_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(earning.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">₹{earning.amount.toFixed(2)}</p>
                    <p className="text-xs text-green-600 capitalize">{earning.status}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">No earnings in this period</p>
        )}
      </div>
    </div>
  )
}
