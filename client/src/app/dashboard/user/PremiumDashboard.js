'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Bell,
  Search,
  User,
  LogOut,
  Zap,
  Droplets,
  Truck,
  Snowflake,
  Sparkles,
  Hammer,
  Brush,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Mic,
  Image as ImageIcon,
  MessageSquare,
  Heart,
  Plus,
  Sun,
  Moon,
  ArrowRight,
  Navigation
} from 'lucide-react';

const serviceCategories = [
  { name: 'Electrician', icon: Zap, gradient: 'from-yellow-400 to-orange-500', description: 'Wiring, sockets, repairs' },
  { name: 'Plumber', icon: Droplets, gradient: 'from-blue-400 to-cyan-500', description: 'Leaks, pipes, fixtures' },
  { name: 'Mechanic', icon: Truck, gradient: 'from-orange-400 to-red-500', description: 'Vehicle repairs & service' },
  { name: 'AC Repair', icon: Snowflake, gradient: 'from-cyan-400 to-blue-500', description: 'Cooling, servicing' },
  { name: 'Cleaning', icon: Sparkles, gradient: 'from-emerald-400 to-teal-500', description: 'Deep cleaning services' },
  { name: 'Carpenter', icon: Hammer, gradient: 'from-amber-400 to-yellow-500', description: 'Furniture, woodwork' },
  { name: 'Painter', icon: Brush, gradient: 'from-pink-400 to-purple-500', description: 'Wall painting & finishes' }
];

const nearbyProfessionals = [
  { id: 1, name: 'Rajesh Kumar', rating: 4.9, jobs: 324, distance: '1.2 km', online: true, verified: true, specialization: 'Electrician' },
  { id: 2, name: 'Priya Sharma', rating: 4.8, jobs: 287, distance: '2.1 km', online: true, verified: true, specialization: 'Plumber' },
  { id: 3, name: 'Amit Patel', rating: 4.7, jobs: 198, distance: '3.0 km', online: false, verified: true, specialization: 'AC Repair' }
];

const favoriteProfessionals = [
  { id: 1, name: 'Rajesh Kumar', specialization: 'Electrician', rating: 4.9 },
  { id: 2, name: 'Suresh Menon', specialization: 'Mechanic', rating: 4.8 }
];

const activeRequests = [
  {
    id: 'REQ-2024-001',
    category: 'Electrician',
    status: 'OnTheWay',
    description: 'Socket replacement in bedroom',
    technician: { name: 'Rajesh Kumar', rating: 4.9 },
    eta: '15 mins',
    timeline: [
      { step: 'Request placed', completed: true },
      { step: 'Technician assigned', completed: true },
      { step: 'On the way', completed: false, active: true },
      { step: 'Arrived', completed: false },
      { step: 'Completed', completed: false }
    ]
  }
];

export default function PremiumDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [greeting, setGreeting] = useState('Good Evening');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 pb-20 transition-all duration-500 ${darkMode ? 'dark' : ''}`}>
      {/* Floating Background Particles - Client Only */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
        {[...Array(20)].map((_, i) => {
          const width = 50 + (i * 13) % 100;
          const height = 50 + ((i * 17) % 100);
          const left = (i * 5) % 100;
          const top = (i * 7) % 100;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-teal-200/30"
              style={{
                width,
                height,
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
                x: [0, 20, 0]
              }}
              transition={{
                duration: 10 + (i % 10),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </div>

      {/* Top Glassmorphism Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-white/20 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl shadow-teal-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Wrench className="h-6 w-6" />
            </motion.div>
            <span className="hidden text-2xl font-bold tracking-tight gradient-text sm:block">Service Hub</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-white/60 rounded-2xl px-4 py-2 soft-shadow">
              <Search className="h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search services..." 
                className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 w-64"
              />
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-slate-600 soft-shadow hover:bg-white/80 transition-all"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-slate-600 soft-shadow hover:bg-white/80 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">3</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{isMounted ? greeting : 'Good Evening'}, Navadheer</p>
                <p className="text-xs text-slate-500">Premium Member</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-bold text-lg soft-shadow">
                N
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Hero Section */}
          <motion.section variants={itemVariants}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 p-8 md:p-12 soft-shadow-lg animate-gradient">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
                  >
                    Relax, help is here.
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-teal-100 mb-8"
                  >
                    Book trusted professionals instantly.
                  </motion.p>

                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex items-center gap-3 bg-white text-teal-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-white/30 transition-all"
                    >
                      Book Now
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3 bg-red-500/90 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-red-500/30 transition-all hover:bg-red-600"
                    >
                      Emergency Help
                    </motion.button>
                  </div>
                </div>

                <div className="hidden md:block">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    {[Zap, Droplets, Hammer, Sparkles].map((Icon, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white"
                        style={{
                          top: Math.sin(i * Math.PI / 2) * 60,
                          left: Math.cos(i * Math.PI / 2) * 60,
                        }}
                        animate={{
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.2,
                          repeat: Infinity,
                        }}
                      >
                        <Icon className="h-8 w-8" />
                      </motion.div>
                    ))}
                    <div className="h-32 w-32 bg-white/30 backdrop-blur-md rounded-3xl flex items-center justify-center">
                      <Wrench className="h-16 w-16 text-white" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Service Categories */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">What do you need?</h2>
                <p className="text-slate-500">Choose from our premium services</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {serviceCategories.map((cat, index) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-white p-6 soft-shadow hover:shadow-xl transition-all duration-300 border border-slate-100">
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                    
                    <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                      <cat.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-center font-semibold text-slate-800 mb-1">{cat.name}</h3>
                    <p className="text-center text-xs text-slate-500">{cat.description}</p>
                    
                    <div className="mt-4 flex items-center justify-center">
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Available
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Stats & Active Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Requests */}
            <motion.section variants={itemVariants} className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 soft-shadow border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Active Request</h2>
                    <p className="text-slate-500 text-sm">Track your service in real-time</p>
                  </div>
                  <button className="flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-xl font-medium text-sm">
                    View All
                  </button>
                </div>

                {activeRequests.map((req) => (
                  <div key={req.id} className="space-y-6">
                    {/* Request Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Zap className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{req.category} Service</h3>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                              {req.eta}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{req.description}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-teal-600 transition-colors">
                        <Navigation className="h-4 w-4" />
                        Track
                      </button>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      {req.timeline.map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 ${
                              step.completed
                                ? 'bg-emerald-500 text-white'
                                : step.active
                                ? 'bg-teal-500 text-white animate-pulse'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              {step.completed ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <span className="text-sm font-semibold">{index + 1}</span>
                              )}
                            </div>
                            {index < req.timeline.length - 1 && (
                              <div className={`w-0.5 h-12 -mt-1 ${
                                step.completed ? 'bg-emerald-400' : 'bg-slate-200'
                              }`}></div>
                            )}
                          </div>
                          <div className="pt-2">
                            <p className={`font-semibold ${
                              step.completed ? 'text-emerald-700' :
                              step.active ? 'text-teal-700' : 'text-slate-500'
                            }`}>
                              {step.step}
                            </p>
                            {step.active && (
                              <p className="text-xs text-teal-500 mt-1">In progress...</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Technician Info */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-14 w-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                            RK
                          </div>
                          <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white"></span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{req.technician.name}</p>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{req.technician.rating}</span>
                          </div>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-slate-300 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Sidebar - Stats & AI Assistant */}
            <div className="space-y-6">
              {/* Wallet Stats */}
              <motion.section variants={itemVariants}>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white soft-shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-300">Wallet Balance</h3>
                    <div className="h-10 w-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-teal-400" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-4xl font-bold">₹4,250</p>
                    <p className="text-slate-400 text-sm mt-1">+₹250 cashback this month</p>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>₹0</span>
                    <span>₹5,000 limit</span>
                  </div>
                </div>
              </motion.section>

              {/* AI Smart Assistant */}
              <motion.section variants={itemVariants}>
                <div className="bg-white rounded-3xl p-6 soft-shadow border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">AI Assistant</h3>
                      <p className="text-xs text-slate-500">Smart diagnostics</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      placeholder="Describe your issue..."
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none resize-none text-slate-700 placeholder:text-slate-400 text-sm"
                      rows={3}
                    ></textarea>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 p-3 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors">
                        <Mic className="h-4 w-4" />
                        Voice
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 p-3 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors">
                        <ImageIcon className="h-4 w-4" />
                        Image
                      </button>
                    </div>
                    <button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/30">
                      Get AI Suggestions
                    </button>
                  </div>
                </div>
              </motion.section>
            </div>
          </div>

          {/* Nearby Professionals */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Nearby Professionals</h2>
                <p className="text-slate-500">Verified experts in your area</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nearbyProfessionals.map((pro, index) => (
                <motion.div
                  key={pro.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-6 soft-shadow border border-slate-100 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-16 w-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                          {pro.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${
                          pro.online ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{pro.name}</h3>
                          {pro.verified && (
                            <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{pro.specialization}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{pro.rating}</span>
                      <span className="text-slate-400 text-sm">({pro.jobs} jobs)</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <MapPin className="h-4 w-4" />
                      {pro.distance}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-3 rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg shadow-teal-500/30">
                      Book Now
                    </button>
                    <button className="p-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Favorites Section */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                <h2 className="text-2xl font-bold text-slate-900">Your Favorites</h2>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {favoriteProfessionals.map((pro, index) => (
                <motion.div
                  key={pro.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-72 bg-white rounded-3xl p-5 soft-shadow border border-slate-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                      {pro.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{pro.name}</h3>
                      <p className="text-sm text-slate-500">{pro.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-slate-700">{pro.rating}</span>
                  </div>
                  <button className="w-full bg-slate-100 text-slate-700 p-3 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
                    Book Again
                  </button>
                </motion.div>
              ))}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex-shrink-0 w-72 border-2 border-dashed border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center text-slate-400"
              >
                <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <p className="font-medium">Add More</p>
              </motion.div>
            </div>
          </motion.section>
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-50 h-16 w-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-teal-500/40 animate-pulse-glow"
      >
        <Plus className="h-8 w-8" />
      </motion.button>
    </div>
  );
}
