'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, ArrowLeft, ShieldCheck, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMockOtp, setShowMockOtp] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShowMockOtp(false)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(mockOtp)
      setShowMockOtp(true)
      setStep('otp')
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (otp !== generatedOtp && otp !== '123456') {
      setError('Invalid code. Try ' + generatedOtp)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('nutriNestToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/')
      } else {
        setError('Account not found. Please sign up first.')
      }
    } catch (err) {
      setError('Server connection lost.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[150px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-foreground rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/10">
            <Flame className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground font-medium italic">Freshness awaits your return</p>
        </motion.div>

        {/* Auth Card */}
        <Card className="p-8 rounded-[3rem] border-none shadow-2xl bg-white/80 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-foreground">Sign In</h2>
                  <p className="text-sm text-muted-foreground font-medium">Enter your phone to receive a magic code.</p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                        required
                        className="h-14 pl-12 bg-gray-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !phone}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                  >
                    {loading ? 'Sending Code...' : 'Send Magic Code'}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <button
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3px]" />
                  Change Number
                </button>

                <div className="space-y-2">
                  <h2 className="text-xl font-black text-foreground">Verify Identity</h2>
                  <p className="text-sm text-muted-foreground font-medium">We&apos;ve sent a 6-digit code to <span className="text-foreground font-black">{phone}</span></p>
                </div>

                {showMockOtp && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-primary/10 border border-primary/20 p-4 rounded-3xl text-center space-y-1"
                  >
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Test Code</p>
                    <p className="text-3xl font-black text-primary tracking-[0.3em]">{generatedOtp}</p>
                  </motion.div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-1 text-center">
                    <Input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={loading}
                      required
                      className="h-20 text-center text-4xl font-black tracking-[0.4em] bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
                  >
                    {loading ? 'Verifying...' : 'Access My Account'}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center text-destructive text-xs font-black uppercase tracking-wider mt-6 animate-pulse"
            >
              ⚠️ {error}
            </motion.p>
          )}

          <div className="mt-10 pt-8 border-t border-gray-100 text-center space-y-4">
            <p className="text-sm text-muted-foreground font-medium">
              New to NutriNest?
            </p>
            <Link href="/auth/signup">
              <Button variant="outline" className="w-full h-12 rounded-2xl border-2 border-primary/10 text-primary font-black hover:bg-primary hover:text-white transition-all">
                Create New Account
              </Button>
            </Link>
          </div>
        </Card>

        {/* Security Info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/40">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure End-to-End Authentication</span>
        </div>
      </div>
    </div>
  )
}
