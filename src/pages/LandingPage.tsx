import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Users, Infinity as InfinityIcon, Sparkles, Layout } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function LandingPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!isLoading && currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#030712] font-sans selection:bg-brand selection:text-white overflow-hidden text-slate-300">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 w-[1000px] h-[500px] bg-brand/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen animate-blob" />
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] -translate-x-1/2 pointer-events-none mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] translate-x-1/4 translate-y-1/4 pointer-events-none mix-blend-screen animate-blob" style={{ animationDelay: '4s' }} />

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 bg-[#030712]/50 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center shadow-lg shadow-brand/20">
            <span className="text-white font-bold text-2xl">Z</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Zeno</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#collaboration" className="hover:text-white transition-colors">Collaboration</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/register" className="relative group text-sm font-semibold text-white px-5 py-2.5 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand to-purple-600 transition-transform group-hover:scale-105" />
            <div className="relative flex items-center gap-2">
              Sign up free
            </div>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
             <Sparkles size={16} className="text-brand" />
             <span className="text-sm font-medium text-slate-300">The next generation visual workspace</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-8">
            Where infinite ideas <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-purple-400 to-emerald-400">
              take shape together
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Zeno is your team's intelligent whiteboard. Brainstorm, plan, and collaborate on an infinite canvas—unleash creativity without boundaries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register" className="group relative flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Start creating for free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg text-white border border-white/10 hover:bg-white/5 transition-all">
              Explore features
            </a>
          </div>

          {/* Hero Image Mockup */}
          <div className="mt-24 relative w-full max-w-6xl mx-auto animate-float">
             <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#030712] via-[#030712]/50 to-transparent z-10" />
             <div className="absolute inset-0 bg-brand/20 blur-[100px] -z-10 rounded-full" />
             <img 
               src="/hero_mockup.png" 
               alt="Zeno Infinite Canvas Mockup" 
               className="w-full h-auto rounded-2xl border border-white/10 shadow-2xl relative z-0 object-cover object-center bg-gray-900"
               style={{ minHeight: '400px' }}
             />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 relative z-10 border-t border-white/5 bg-[#030712]/50 backdrop-blur-3xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Designed for modern teams</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to turn chaotic brainstorming into structured, actionable plans.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(66,98,255,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[50px] group-hover:bg-brand/20 transition-all rounded-full" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center mb-8 border border-brand/20 text-brand group-hover:scale-110 transition-transform">
                  <InfinityIcon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Infinite Canvas</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Never run out of space. Zoom, pan, and build out your biggest ideas without any borders holding you back.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] group-hover:bg-purple-500/20 transition-all rounded-full" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center mb-8 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                  <Users size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-time Sync</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  See your team's cursors fly across the screen as you all work together at the exact same time with zero latency.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] group-hover:bg-emerald-500/20 transition-all rounded-full" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center mb-8 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Layout size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Templates</h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Jumpstart your workflow with pre-built mind maps, flowcharts, and agile frameworks.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030712] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-6 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center opacity-80">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-bold text-xl text-white opacity-80">Zeno</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Zeno Interactive Whiteboard. Built for the modern web.
          </p>
        </div>
      </footer>
    </div>
  );
}
