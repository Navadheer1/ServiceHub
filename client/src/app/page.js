import Link from 'next/link';
import { ShieldCheck, Clock, Zap, Star, Wrench, MapPin, Smartphone, Tv, Cpu, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-dark">Service Hub</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="rounded-full px-5 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/register" 
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white shadow-lg shadow-primary/20 hover:bg-primary-dark hover:shadow-xl transition-all active:scale-95"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Verified Professionals Available Now
              </div>
              <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-primary-dark sm:text-6xl lg:text-7xl">
                Help is just <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">minutes away</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-text-muted sm:text-xl">
                The most trusted platform for home services and roadside emergencies. Fast, safe, and reliable.
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="group flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary-dark hover:scale-105 active:scale-95"
                >
                  Book a Service
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="flex h-14 min-w-[200px] items-center justify-center rounded-full border-2 border-gray-200 bg-white px-8 text-lg font-bold text-gray-700 transition-all hover:border-primary/50 hover:bg-gray-50 hover:text-primary active:scale-95"
                >
                  Log In
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12">
                {[
                  { icon: ShieldCheck, text: "Verified Agents" },
                  { icon: Clock, text: "Fast Response" },
                  { icon: Zap, text: "Warranty Included" },
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-600">
                    <badge.icon className="h-6 w-6 text-primary" />
                    <span className="font-medium">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden opacity-20">
            <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-primary/30 blur-[100px]"></div>
            <div className="absolute top-[20%] right-[0%] h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]"></div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-surface-alt py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-primary-dark sm:text-4xl">Everything you need</h2>
              <p className="mt-4 text-lg text-text-muted">Expert repairs and emergency assistance at your fingertips.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Mobile Repair', icon: Smartphone, desc: 'Screen, battery, and software fixes' },
                { title: 'Laptop Service', icon: Cpu, desc: 'Hardware upgrades and diagnostics' },
                { title: 'TV & Audio', icon: Tv, desc: 'Installation and complex repairs' },
                { title: 'Roadside Assist', icon: MapPin, desc: 'Mechanics for breakdown help', highlight: true }
              ].map((service, idx) => (
                <div 
                  key={idx} 
                  className={`group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${service.highlight ? 'ring-2 ring-accent/20' : ''}`}
                >
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${service.highlight ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'} transition-colors group-hover:scale-110`}>
                    <service.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{service.title}</h3>
                  <p className="text-gray-500">{service.desc}</p>
                  
                  {service.highlight && (
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      Emergency
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews/Trust Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-12 text-3xl font-bold text-primary-dark">Trusted by thousands</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="mb-4 flex justify-center text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                  </div>
                  <p className="mb-6 italic text-gray-600">"The mechanic arrived in 10 minutes. The tracking feature is amazing! Highly recommended."</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900">Alex D.</div>
                      <div className="text-sm text-gray-500">Verified User</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-4 text-center text-gray-500 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-primary-dark">
            <Wrench className="h-6 w-6 text-primary" />
            <span>Service Hub</span>
          </div>
          <p>© 2026 Service Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
