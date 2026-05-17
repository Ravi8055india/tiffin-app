'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'

interface TrackingData {
  id: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  current_latitude: number
  current_longitude: number
  estimated_arrival: string
  delivery_status: string
}

export default function DeliveryTrackingPage() {
  const params = useParams()
  const orderId = params.id as string
  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        if (!token) return

        const response = await fetch(`${API_BASE_URL}/api/delivery/tracking/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setTracking(data)
        }
      } catch (error) {
        console.error('Failed to fetch tracking:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTracking()
    // Poll every 10 seconds
    const interval = setInterval(fetchTracking, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  const handleOpenMap = () => {
    if (tracking) {
      const mapsUrl = `https://www.google.com/maps/dir/${tracking.current_latitude},${tracking.current_longitude}/${encodeURIComponent(tracking.delivery_address)}`
      window.open(mapsUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="max-w-screen-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/delivery/orders">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground flex-1">Live Tracking</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        ) : tracking ? (
          <>
            {/* Map Placeholder */}
            <Card className="overflow-hidden">
              <div className="h-72 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                <div className="text-center">
                  <Navigation className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Live Map View</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Coordinates: {tracking.current_latitude.toFixed(4)}, {tracking.current_longitude.toFixed(4)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleOpenMap}
                  className="absolute top-4 right-4"
                >
                  Open Map
                </Button>
              </div>
            </Card>

            {/* Delivery Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Delivery Status</h3>
                <span className="text-sm font-semibold text-green-600 capitalize">
                  {tracking.delivery_status}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Order Accepted</p>
                    <p className="text-xs text-muted-foreground">We&apos;re on our way</p>
                  </div>
                </div>
                <div className="ml-5 w-0.5 h-8 bg-border" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Out for Delivery</p>
                    <p className="text-xs text-muted-foreground">ETA {tracking.estimated_arrival}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card className="p-4">
              <h3 className="font-bold text-foreground mb-4">Customer</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{tracking.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <a href={`tel:${tracking.customer_phone}`} className="text-primary hover:underline">
                    {tracking.customer_phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Address</p>
                  <p className="text-sm text-foreground">{tracking.delivery_address}</p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${tracking.customer_phone}`}>
                <Button className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </a>
              <Button onClick={handleOpenMap} variant="outline" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Navigate
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-12">Order not found</p>
        )}
      </div>
    </div>
  )
}
