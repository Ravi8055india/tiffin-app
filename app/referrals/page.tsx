'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Copy, Share2, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'

interface ReferralStats {
  total_referrals: string
  successful_referrals: string
  unique_referrals: string
}

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState('')
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        if (!token) return

        // Get referral code
        const codeResponse = await fetch(`${API_BASE_URL}/api/referrals/code`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (codeResponse.ok) {
          const codeData = await codeResponse.json()
          setReferralCode(codeData.referral_code)
        } else {
          // Generate new code if doesn't exist
          const genResponse = await fetch(`${API_BASE_URL}/api/referrals/generate-code`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
          if (genResponse.ok) {
            const genData = await genResponse.json()
            setReferralCode(genData.referralCode)
          }
        }

        // Get stats
        const statsResponse = await fetch(`${API_BASE_URL}/api/referrals/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Failed to fetch referral data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = () => {
    const text = `Join NutriNest and get ₹100 bonus! Use my referral code: ${referralCode}`
    if (navigator.share) {
      navigator.share({
        title: 'NutriNest',
        text,
      })
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/account">
            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Refer & Earn</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 rounded-[3rem] border-none shadow-2xl bg-foreground text-white overflow-hidden relative">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[80px]" />
            
            <div className="relative z-10 text-center space-y-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto text-4xl shadow-2xl">
                🎁
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Gift Freshness</h2>
                <p className="text-white/50 text-sm font-medium italic">Share the love, earn the rewards</p>
              </div>
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">You Get</p>
                  <p className="text-2xl font-black text-primary">₹100</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">They Get</p>
                  <p className="text-2xl font-black text-primary">₹100</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Referral Code */}
        <section className="space-y-4">
          <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.3em] ml-4">Your Unique Code</h3>
          <Card className="p-2 rounded-[2rem] border-none shadow-xl bg-white flex items-center justify-between group overflow-hidden">
            <div className="px-6 py-4">
              <code className="text-3xl font-black text-foreground tracking-[0.2em]">{referralCode || '-------'}</code>
            </div>
            <div className="flex gap-2 pr-2">
              <Button 
                onClick={handleCopy} 
                className={`h-14 w-14 rounded-2xl transition-all duration-300 ${copied ? 'bg-green-500' : 'bg-primary'}`}
              >
                {copied ? '✓' : <Copy className="w-5 h-5 stroke-[3px]" />}
              </Button>
              <Button 
                onClick={handleShare}
                variant="outline"
                className="h-14 w-14 rounded-2xl border-2 border-gray-50 hover:bg-gray-50"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white rounded-3xl skeleton" />
              ))}
            </>
          ) : (
            <>
              <Card className="p-4 rounded-3xl border-none shadow-sm bg-white text-center space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Invites</p>
                <p className="text-xl font-black text-foreground">{stats?.total_referrals || 0}</p>
              </Card>
              <Card className="p-4 rounded-3xl border-none shadow-sm bg-white text-center space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Joined</p>
                <p className="text-xl font-black text-green-600">{stats?.successful_referrals || 0}</p>
              </Card>
              <Card className="p-4 rounded-3xl border-none shadow-sm bg-white text-center space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Earned</p>
                <p className="text-xl font-black text-primary">₹{(parseInt(stats?.successful_referrals || '0') * 100)}</p>
              </Card>
            </>
          )}
        </div>

        {/* How It Works */}
        <section className="space-y-4">
          <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.3em] ml-4">How It Works</h3>
          <div className="space-y-4">
            {[
              { icon: '📱', title: 'Share Link', desc: 'Send your magic code to friends' },
              { icon: '🥑', title: 'They Sign Up', desc: 'Friend joins with your code' },
              { icon: '💸', title: 'Get Reward', desc: 'Both get ₹100 in NutriWallet' },
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-5 rounded-[2rem] border-none shadow-sm bg-white flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-foreground tracking-tight">{step.title}</h4>
                    <p className="text-xs text-muted-foreground font-medium">{step.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Card */}
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-primary/5 text-primary">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-2">Unlimited Potential</h4>
              <p className="text-xs font-medium leading-relaxed opacity-80">
                There&apos;s no limit to how many friends you can invite. The more people you bring to the healthy side, the more you earn!
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
