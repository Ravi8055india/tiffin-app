'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, MapPin, Bell, Flame, Plus, Search, Filter, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/context/cart-context'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE_URL } from '@/lib/api'

interface Thali {
  id: string
  name: string
  description: string
  price: number
  cuisine_type: string
  image_url: string
  rating?: number
}

const CATEGORIES = ['All', 'North Indian', 'South Indian', 'Healthy', 'Continental', 'Chinese']

export default function Home() {
  const [thalis, setThalis] = useState<Thali[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const { items: cartItems, addItem } = useCart()

  useEffect(() => {
    const token = localStorage.getItem('nutriNestToken')
    setIsLoggedIn(!!token)

    const fetchThalis = async () => {
      try {
        // Add artificial delay for shimmer visibility
        await new Promise(resolve => setTimeout(resolve, 1500));
        const response = await fetch(`${API_BASE_URL}/api/thalis`)
        const data = await response.json()
        setThalis(data)
      } catch (error) {
        console.error('Failed to fetch thalis:', error)
        toast.error('Could not load meals. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchThalis()
  }, [])

  const filteredThalis = thalis.filter(thali => {
    const matchesSearch = thali.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thali.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' || thali.cuisine_type === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleAddToCart = (e: React.MouseEvent, thali: Thali) => {
    e.preventDefault()
    addItem({
      id: thali.id,
      thaliId: thali.id,
      thaliName: thali.name,
      price: thali.price,
      quantity: 1,
      image_url: thali.image_url,
    })
    toast.success(`${thali.name} added to cart!`, {
      description: 'You can view it in your cart anytime.',
      duration: 2000,
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative">
        {/* Background shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 w-full max-w-lg z-10"
        >
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
            <Flame className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight mb-3">NutriNest</h1>
          <p className="text-muted-foreground text-lg sm:text-xl font-medium mb-2">Ghar Jaisa Khana, Daily!</p>
          <p className="text-muted-foreground/80 text-sm sm:text-base max-w-sm mx-auto">Fresh, healthy, and premium meal boxes delivered straight to your door.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 w-full max-w-sm mb-12 z-10"
        >
          <Link href="/auth/login" className="block">
            <Button className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95">
              Sign In to Your Kitchen
            </Button>
          </Link>
          <Link href="/auth/signup" className="block">
            <Button variant="outline" className="w-full h-14 text-lg font-bold border-2 transition-transform active:scale-95">
              Join NutriNest
            </Button>
          </Link>
        </motion.div>

        {/* Features with motion */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-lg bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-xl border border-white/50 space-y-6 z-10"
        >
          <h3 className="text-xl font-bold text-foreground text-center">The NutriNest Experience</h3>
          <div className="grid gap-6">
            {[
              { icon: '🥗', title: 'Farm Fresh', desc: 'Handpicked organic ingredients daily' },
              { icon: '👨‍🍳', title: 'Chef Crafted', desc: 'Balanced nutrition by professional chefs' },
              { icon: '🚀', title: 'Flash Delivery', desc: 'Piping hot meals in record time' }
            ].map((f, i) => (
              <div key={i} className="flex gap-5 items-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl shadow-inner">
                  {f.icon}
                </div>
                <div>
                  <p className="font-bold text-foreground">{f.title}</p>
                  <p className="text-muted-foreground text-sm leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28 sm:pb-32">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-none mb-1">NutriNest</h1>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-primary font-bold uppercase tracking-wider">
                <MapPin className="w-3 h-3" />
                <span>Sector 62, Noida</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex relative w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search your favorite thali..." 
                className="pl-9 h-11 bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button size="icon" variant="ghost" className="relative h-11 w-11 rounded-xl bg-gray-50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
            </Button>
            
            <Link href="/cart">
              <Button size="icon" variant="ghost" className="relative h-11 w-11 rounded-xl bg-gray-50">
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartItems.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                    >
                      {cartItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Mobile Search */}
        <div className="md:hidden relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="What would you like to eat today?" 
            className="pl-9 h-12 bg-white border-none shadow-sm rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                  : 'bg-white text-muted-foreground hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Hero Banner */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative h-48 sm:h-64 rounded-3xl overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover"
            alt="Promotion"
          />
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center max-w-lg">
            <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">Limited Offer</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 leading-tight">UP TO 50% OFF</h2>
            <p className="text-white/80 text-sm sm:text-lg mb-6 font-medium">On your first week subscription. Healthy meals, happy wallet!</p>
            <Button className="w-fit h-12 px-8 rounded-xl font-bold bg-white text-primary hover:bg-gray-100">Claim Now</Button>
          </div>
        </motion.div>

        {/* Section: Today's Picks */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">Today&apos;s Special</h2>
              <p className="text-sm text-muted-foreground">Handpicked by our lead nutritionists</p>
            </div>
            <Link href="/menu" className="flex items-center gap-1 text-primary font-bold text-sm hover:gap-2 transition-all">
              See All Menu <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden h-96 flex flex-col">
                  <div className="h-56 skeleton" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-3/4 skeleton rounded-lg" />
                    <div className="h-3 w-1/2 skeleton rounded-lg" />
                    <div className="flex justify-between items-center pt-8">
                      <div className="h-8 w-20 skeleton rounded-lg" />
                      <div className="h-12 w-12 skeleton rounded-2xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              layout
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode='popLayout'>
                {filteredThalis.map((thali) => (
                  <motion.div
                    key={thali.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      onClick={() => window.location.href = '/menu'}
                      className="overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col group bg-white rounded-[2rem]"
                    >
                      <div className="relative h-60 overflow-hidden block">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
                        <motion.img 
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          src={thali.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop'} 
                          alt={thali.name} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-5 left-5 z-20 flex gap-2">
                          <span className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest shadow-xl">
                            {thali.cuisine_type}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toast.info('Saved to favorites') }}
                          className="absolute top-5 right-5 z-20 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl hover:bg-primary hover:text-white transition-all duration-300"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                        
                        <div className="absolute bottom-5 left-5 z-20">
                          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-black border border-white/20">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>4.8 (120+)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-7 flex-1 flex flex-col space-y-4">
                        <div>
                          <h3 className="font-black text-xl text-foreground tracking-tight group-hover:text-primary transition-colors mb-1">{thali.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">&quot;{thali.description}&quot;</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Price</span>
                            <span className="text-3xl font-black text-foreground">₹{thali.price}</span>
                          </div>
                          <motion.div
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(e, thali);
                              }}
                              className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 p-0 bg-primary"
                            >
                              <Plus className="w-8 h-8" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
          
          {!loading && filteredThalis.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="text-5xl mb-4">🍱</div>
              <h3 className="text-xl font-bold text-foreground mb-1">No meals found</h3>
              <p className="text-muted-foreground text-sm">Try searching for something else or change the category.</p>
              <Button variant="link" onClick={() => {setSearchQuery(''); setActiveCategory('All')}} className="mt-4 font-bold">Clear Filters</Button>
            </div>
          )}
        </section>
      </main>

      {/* Premium Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-3 z-50 flex items-center justify-around gap-1">
        {[
          { icon: '🏠', label: 'Home', path: '/' },
          { icon: '🍽️', label: 'Menu', path: '/menu' },
          { icon: '📋', label: 'Orders', path: '/orders' },
          { icon: '👤', label: 'Account', path: '/account' }
        ].map((item) => (
          <Link 
            key={item.label} 
            href={item.path} 
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
              item.path === '/' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-muted-foreground hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-tighter mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
