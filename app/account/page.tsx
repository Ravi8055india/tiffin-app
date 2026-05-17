'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Wallet, Share2, Settings, LogOut, User, Package, MapPin, CreditCard, HelpCircle, Shield, ChevronRight, Activity, Calendar } from 'lucide-react'
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

interface Order {
  id: string
  thali_name: string
  thali_price: number
  quantity: number
  total_price: number
  order_status: string
  payment_status: string
  delivery_date: string
  delivery_time: string
}

interface Subscription {
  id: string
  thali_name: string
  frequency: string
  status: string
  end_date: string
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('nutriNestToken')
        if (!token) {
          router.push('/auth/login')
          return
        }

        // Fetch profile info
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
        }

        // Fetch wallet data
        const walletResponse = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (walletResponse.ok) {
          const walletData = await walletResponse.json()
          setWallet(walletData)
        }

        // Fetch orders for history and stats
        const ordersResponse = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData)
        }

        // Fetch subscriptions to display active ones
        const subResponse = await fetch(`${API_BASE_URL}/api/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (subResponse.ok) {
          const subData = await subResponse.json()
          setSubscriptions(subData)
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
    localStorage.removeItem('nutriNestAppliedCoupon')
    router.push('/auth/login')
  }

  const activeSubCount = subscriptions.filter(s => s.status === 'active').length
  const deliveredOrdersCount = orders.filter(o => o.order_status === 'delivered').length

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
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight">{user?.full_name || 'Guest User'}</h1>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">{user?.email || 'Loading profile...'}</p>
          </div>

          <div className="flex gap-6 pt-2">
            <div className="text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-xl font-black">{orders.length}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Active Plans</p>
              <p className="text-xl font-black text-primary">{activeSubCount}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Earnings</p>
              <p className="text-xl font-black text-green-400">₹{wallet?.total_earned || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-6 -mt-10 relative z-20 space-y-8">
        {/* Wallet & Referral Cards */}
        <div className="grid grid-cols-2 gap-5">
          <Link href="/wallet">
            <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white hover:scale-[1.03] transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl mb-4 group-hover:rotate-12 transition-transform">💰</div>
              <p className="font-black text-foreground text-lg">₹{Number(wallet?.balance || 0).toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">NutriWallet</p>
            </Card>
          </Link>
          <Link href="/referrals">
            <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white hover:scale-[1.03] transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mb-4 group-hover:-rotate-12 transition-transform">🎁</div>
              <p className="font-black text-foreground text-lg">Invite</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Earn ₹100 Reward</p>
            </Card>
          </Link>
        </div>

        {/* Live Active Subscription Widget */}
        {subscriptions.filter(s => s.status === 'active').map((sub) => (
          <motion.div 
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/subscriptions">
              <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/10 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="bg-green-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-block">Active Plan</span>
                    <h4 className="font-black text-lg text-foreground pt-1.5">{sub.thali_name}</h4>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{sub.frequency} subscription</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Expires</span>
                    <p className="text-xs font-black text-foreground">{new Date(sub.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}

        {/* Recent Order Widget */}
        {orders.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center ml-4">
              <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Recent Orders</h3>
              <Link href="/orders" className="text-xs text-primary font-black uppercase tracking-widest hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 2).map((order) => (
                <Card key={order.id} className="p-5 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                      order.order_status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      🍲
                    </div>
                    <div>
                      <h4 className="font-black text-foreground text-sm leading-tight">{order.thali_name}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                        {new Date(order.delivery_date).toLocaleDateString()} • Qty: {order.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-foreground text-sm">₹{Number(order.total_price).toFixed(0)}</p>
                    <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                      order.order_status === 'delivered' 
                        ? 'bg-green-50 text-green-600' 
                        : order.order_status === 'pending'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-primary/10 text-primary'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

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
                transition={{ delay: idx * 0.05 }}
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
