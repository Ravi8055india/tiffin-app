'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

import { API_BASE_URL } from '@/lib/api'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const paymentData = localStorage.getItem('currentPayment')
        const orderId = localStorage.getItem('currentOrderId')
        const token = localStorage.getItem('nutriNestToken')

        if (!paymentData || !orderId || !token) {
          router.push('/orders')
          return
        }

        const payment = JSON.parse(paymentData)

        if (!window.Razorpay) {
          throw new Error('Razorpay script not loaded')
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: payment.razorpayOrderId,
          amount: payment.amount * 100,
          currency: payment.currency,
          name: 'NutriNest',
          description: 'Fresh Meal Delivery',
          handler: async (response: any) => {
            try {
              // Verify payment with backend
              const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/verify-payment`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId,
                }),
              })

              if (verifyResponse.ok) {
                localStorage.removeItem('currentPayment')
                localStorage.removeItem('currentOrderId')
                router.push('/orders?status=success')
              } else {
                alert('Payment verification failed')
              }
            } catch (error) {
              console.error('Verification error:', error)
              alert('Payment verification failed')
            }
          },
          prefill: {
            name: 'Customer',
            email: 'customer@example.com',
            contact: '9876543210',
          },
          theme: {
            color: 'var(--color-primary)',
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()

        setLoading(false)
      } catch (error) {
        console.error('Payment error:', error)
        router.push('/checkout')
      }
    }

    initializePayment()
  }, [router])

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        {loading ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-medium italic animate-pulse">Connecting to secure gateway...</p>
          </div>
        ) : (
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-4xl">
              💳
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground mb-2">Payment Required</h2>
              <p className="text-muted-foreground">The secure payment gateway is ready. For testing purposes, you can simulate a successful transaction.</p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={async () => {
                  setLoading(true);
                  const token = localStorage.getItem('nutriNestToken');
                  const orderId = localStorage.getItem('currentOrderId');
                  
                  // Simulate verification
                  setTimeout(async () => {
                    localStorage.removeItem('currentPayment');
                    localStorage.removeItem('currentOrderId');
                    router.push('/orders?status=success');
                  }, 1500);
                }}
                className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20"
              >
                Mock Success Payment (Test)
              </Button>
              <Button variant="outline" onClick={() => router.push('/checkout')} className="w-full h-12 rounded-xl">
                Cancel & Go Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
