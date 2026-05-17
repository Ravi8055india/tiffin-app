'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Wallet, Share2, Settings, LogOut, User, Package, MapPin, CreditCard, HelpCircle, Shield, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number: string
  address: string
  city: string
  pincode: string
  profile_image_url?: string
}

interface WalletData {
  balance: number
  total_earned: number
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        if (!token) {
          router.push('/auth/login')
          return
        }

        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
        }

        const walletResponse = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (walletResponse.ok) {
          const walletData = await walletResponse.json()
          setWallet(walletData)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('nutriNestToken')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* Profile Header */}
      <div className="bg-foreground text-white pt-20 pb-16 px-6 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="max-w-xl mx-auto flex flex-col items-center text-center relative z-10 space-y-5">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative"
          >
            <div className="w-28 h-28 rounded-[2.5rem] bg-white p-1 shadow-2xl rotate-3">
              <div className="w-full h-full rounded-[2.3rem] bg-gray-100 flex items-center justify-center text-5xl overflow-hidden -rotate-3">
                {user?.profile_image_url ? (
                  <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-2xl flex items-center justify-center border-4 border-foreground text-[10px]">
              ✏️
            </div>
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight">{user?.full_name || 'Guest User'}</h1>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">{user?.email || 'Loading profile...'}</p>
          </div>

          <div className="flex gap-6 pt-2">
            <div className="text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Orders</p>
              <p className="text-xl font-black">24</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Earnings</p>
              <p className="text-xl font-black text-primary">₹{wallet?.total_earned || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-6 -mt-10 relative z-20 space-y-8">
        {/* Wallet & Referral Cards */}
        <div className="grid grid-cols-2 gap-5">
          <Link href="/wallet">
            <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white hover:scale-105 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl mb-4 group-hover:rotate-12 transition-transform">💰</div>
              <p className="font-black text-foreground text-lg">₹{Number(wallet?.balance || 0).toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">NutriWallet</p>
            </Card>
          </Link>
          <Link href="/referrals">
            <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white hover:scale-105 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mb-4 group-hover:-rotate-12 transition-transform">🎁</div>
              <p className="font-black text-foreground text-lg">Invite</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Earn Rewards</p>
            </Card>
          </Link>
        </div>

        {/* Menu Options */}
        <section className="space-y-4">
          <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.3em] ml-4">Account Settings</h3>
          <div className="space-y-3">
            {[
              { label: 'Order History', icon: <Package className="w-5 h-5" />, path: '/orders', color: 'bg-indigo-50 text-indigo-600' },
              { label: 'My Subscriptions', icon: <CreditCard className="w-5 h-5" />, path: '/subscriptions', color: 'bg-green-50 text-green-600' },
              { label: 'Saved Addresses', icon: <MapPin className="w-5 h-5" />, path: '/address', color: 'bg-orange-50 text-orange-600' },
              { label: 'Profile Settings', icon: <User className="w-5 h-5" />, path: '/profile', color: 'bg-purple-50 text-purple-600' },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={item.path}>
                  <Card className="p-4 rounded-3xl border-none shadow-sm hover:shadow-md transition-all bg-white flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <span className="font-black text-foreground tracking-tight">{item.label}</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Support Section */}
        <section className="space-y-4">
          <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.3em] ml-4">Help & Info</h3>
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white divide-y divide-gray-50">
            {[
              { label: 'Help Center', icon: <HelpCircle className="w-5 h-5" /> },
              { label: 'Privacy Policy', icon: <Shield className="w-5 h-5" /> },
            ].map((item) => (
              <div key={item.label} className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground">{item.icon}</div>
                  <span className="font-bold text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </Card>
        </section>

        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full h-16 rounded-[2rem] border-2 border-destructive/10 text-destructive font-black hover:bg-destructive hover:text-white transition-all shadow-lg hover:shadow-destructive/20"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Out Securely
        </Button>
      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-3 shadow-2xl border border-white/50 z-50">
        <nav className="flex items-center justify-around">
          {[
            { label: 'Home', icon: '🏠', path: '/' },
            { label: 'Menu', icon: '🍱', path: '/menu' },
            { label: 'Orders', icon: '📦', path: '/orders' },
            { label: 'Profile', icon: '👤', path: '/account' },
          ].map((item) => (
            <Link 
              key={item.label} 
              href={item.path} 
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                item.path === '/account' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-muted-foreground hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-tighter mt-1">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
