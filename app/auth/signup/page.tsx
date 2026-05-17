'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, ArrowLeft, Smartphone, User, Mail, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    referralCode: '',
  })
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMockOtp, setShowMockOtp] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(mockOtp)
      setShowMockOtp(true)
      setStep('otp')
    } catch (err) {
      setError('Failed to process. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (otp !== generatedOtp && otp !== '123456') {
      setError('Invalid code. Try ' + generatedOtp)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('nutriNestToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.error || 'Registration failed.')
      }
    } catch (err) {
      setError('Server connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[150px]" />

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-foreground rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Flame className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Create Account</h1>
          <p className="text-muted-foreground font-medium italic">Join the NutriNest community</p>
        </motion.div>

        <Card className="p-8 rounded-[3rem] border-none shadow-2xl bg-white/80 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16 blur-2xl" />
          
          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                        className="h-14 pl-12 bg-gray-50 border-none rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="h-14 pl-12 bg-gray-50 border-none rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                        className="h-14 pl-12 bg-gray-50 border-none rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Referral Code (Optional)</label>
                    <div className="relative">
                      <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="NUTRI123"
                        value={formData.referralCode}
                        onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                        className="h-14 pl-12 bg-gray-50 border-none rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4"
                  >
                    {loading ? 'Processing...' : 'Get Magic Code'}
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
                <button onClick={() => setStep('details')} className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                  <ArrowLeft className="w-4 h-4 stroke-[3px]" /> Back to Details
                </button>

                <div className="space-y-2">
                  <h2 className="text-xl font-black text-foreground">Verify Phone</h2>
                  <p className="text-sm text-muted-foreground font-medium">Magic code sent to <span className="text-foreground font-black">{formData.phone}</span></p>
                </div>

                {showMockOtp && (
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-3xl text-center">
                    <p className="text-3xl font-black text-primary tracking-[0.3em]">{generatedOtp}</p>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="h-20 text-center text-4xl font-black tracking-[0.4em] bg-gray-50 border-none rounded-[2rem]"
                  />
                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20"
                  >
                    {loading ? 'Creating Account...' : 'Complete Sign Up'}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="text-center text-destructive text-xs font-black uppercase tracking-wider mt-6 animate-pulse">⚠️ {error}</p>}

          <div className="mt-10 pt-8 border-t border-gray-100 text-center space-y-4">
            <p className="text-sm text-muted-foreground font-medium">Already have an account?</p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full h-12 rounded-2xl border-2 border-primary/10 text-primary font-black">
                Sign In Instead
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
