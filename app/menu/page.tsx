'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowLeft, Search, Filter, ShoppingBag, Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/context/cart-context'
import { API_BASE_URL } from '@/lib/api'
import { toast } from 'sonner'

interface Thali {
  id: string
  name: string
  description: string
  price: number
  cuisine_type: string
  image_url: string
  rating?: number
}

export default function MenuPage() {
  const [thalis, setThalis] = useState<Thali[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { items: cartItems, addItem } = useCart()

  useEffect(() => {
    const fetchThalis = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/thalis`)
        const data = await response.json()
        setThalis(data)
      } catch (error) {
        console.error('Failed to fetch thalis:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchThalis()
  }, [])

  const filteredThalis = thalis.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.cuisine_type?.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddToCart = (e: React.MouseEvent, thali: Thali) => {
    e.stopPropagation()
    addItem({
      id: thali.id,
      thaliId: thali.id,
      thaliName: thali.name,
      price: thali.price,
      quantity: 1,
      image_url: thali.image_url,
    })
    toast.success(`${thali.name} added to cart!`, {
      style: { borderRadius: '20px', fontWeight: 'bold' }
    })
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* Header Section */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button size="icon" variant="ghost" className="rounded-xl hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Our Kitchen</h1>
          </div>
          <Link href="/cart" className="relative">
            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/5 hover:text-primary">
              <ShoppingBag className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                  {cartItems.length}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="px-4 sm:px-6 pb-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none stroke-[3px]" />
            <Input
              type="text"
              placeholder="Search flavors, cuisines, diets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 bg-gray-50 border-none rounded-2xl text-base font-bold shadow-inner focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl text-primary">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-black text-muted-foreground uppercase tracking-[0.3em]">
            Available Today ({filteredThalis.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden h-96 flex flex-col">
                <div className="h-60 skeleton" />
                <div className="p-6 space-y-3 flex-1 flex flex-col">
                  <div className="h-5 w-3/4 skeleton rounded-lg" />
                  <div className="h-3 w-1/2 skeleton rounded-lg" />
                  <div className="mt-auto flex justify-between items-center pt-4">
                    <div className="space-y-2">
                      <div className="h-2 w-8 skeleton rounded-lg" />
                      <div className="h-6 w-16 skeleton rounded-lg" />
                    </div>
                    <div className="h-12 w-12 skeleton rounded-2xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredThalis.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredThalis.map((thali, idx) => (
              <motion.div
                key={thali.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-[2.5rem] flex flex-col group h-full relative">
                  <div className="relative h-60 overflow-hidden">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
                    <img 
                      src={thali.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop'} 
                      alt={thali.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                    <div className="absolute top-5 left-5 z-20 flex gap-2">
                      <span className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest shadow-xl">
                        {thali.cuisine_type || 'Nutritious'}
                      </span>
                    </div>
                    <button className="absolute top-5 right-5 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                      <Heart className="w-4 h-4 stroke-[3px]" />
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-black text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{thali.name}</h3>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-black text-yellow-600">4.8</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed flex-1 italic">{thali.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Price</p>
                        <p className="text-2xl font-black text-foreground">₹{thali.price}</p>
                      </div>
                      <Button 
                        onClick={(e) => handleAddToCart(e, thali)}
                        className="h-12 w-12 rounded-2xl bg-foreground text-white shadow-xl hover:bg-primary hover:scale-110 transition-all group-hover:bg-primary"
                      >
                        <Plus className="w-5 h-5 stroke-[3px]" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 space-y-6">
            <div className="text-8xl">🥘</div>
            <div>
              <h2 className="text-2xl font-black text-foreground mb-2">No flavors found</h2>
              <p className="text-muted-foreground italic max-w-xs mx-auto">Try searching for something else or explore our categories.</p>
            </div>
            <Button onClick={() => setSearch('')} variant="outline" className="h-14 px-10 rounded-2xl font-black">
              Clear All Search
            </Button>
          </div>
        )}
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
                item.path === '/menu' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-muted-foreground hover:bg-gray-100'
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
