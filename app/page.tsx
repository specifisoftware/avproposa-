import Link from 'next/link'

const features = [
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'PDF-Ready Proposals',
    desc: 'One click to export a polished, client-ready PDF. No design skills needed.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Generation',
    desc: 'Fill in your project details and get a complete, itemized AV proposal in minutes.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Multi-Room Support',
    desc: 'Add unlimited rooms, each with its own equipment list and pricing breakdown.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Brand Customization',
    desc: 'Upload your company logo and details to make every proposal look uniquely yours.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v13a1 1 0 001 1z" />
      </svg>
    ),
    title: 'Automatic Pricing',
    desc: 'Equipment costs, labor, and totals calculated automatically as you build.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Free to Start',
    desc: 'No credit card required. Create your first proposal completely free today.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create a free account',
    desc: 'Sign up in seconds — just your email and a password. No credit card needed.',
  },
  {
    number: '02',
    title: 'Fill in your project',
    desc: 'Enter client info, add rooms, and build your equipment list with quantities and prices.',
  },
  {
    number: '03',
    title: 'Download your proposal',
    desc: 'Export a professional PDF instantly. Send it to your client and win the job.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#0F172A] tracking-tight group-hover:text-[#2563EB] transition-colors">
              AVProposal
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-500 font-medium">
            <a href="#features" className="hover:text-[#0F172A] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#0F172A] transition-colors">How it works</a>
            <Link href="/blog" className="hover:text-[#0F172A] transition-colors">Blog</Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/auth?tab=login"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors rounded-lg hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              href="/auth?tab=register"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] rounded-full bg-[#2563EB] opacity-10 blur-3xl" />
          <div className="absolute bottom-[-60px] left-[-60px] w-[360px] h-[360px] rounded-full bg-indigo-500 opacity-10 blur-3xl" />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-36 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-700/40 text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Free — no credit card required
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Win More AV Contracts
            <span className="block text-[#2563EB] mt-1">With Polished Proposals</span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed mb-10">
            Generate professional, itemized audio/visual project proposals in minutes.
            Add rooms, equipment, pricing — download a client-ready PDF instantly.
          </p>

          {/* Main CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth?tab=register"
              className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-base px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-900/40"
            >
              Make Free Proposal for Your AV Project
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/auth?tab=login"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-base px-6 py-4 rounded-xl transition-all"
            >
              Sign in to my account
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-slate-500 text-sm">
            Trusted by AV integrators, consultants & installers
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
              Everything you need to close the deal
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Built specifically for AV professionals who need proposals fast, without the overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white rounded-xl flex items-center justify-center mb-4 transition-all">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
              From zero to proposal in 3 steps
            </h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto">
              No learning curve, no templates to configure. Just open and build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100" />

            {steps.map((s) => (
              <div key={s.number} className="relative text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0F172A] text-white rounded-2xl text-2xl font-black mb-5 relative z-10">
                  {s.number}
                </div>
                <h3 className="font-semibold text-[#0F172A] text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA below steps */}
          <div className="text-center mt-16">
            <Link
              href="/auth?tab=register"
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-md shadow-blue-200 text-base"
            >
              Make Free Proposal for Your AV Project
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-slate-400 text-sm mt-3">No credit card required · Free forever</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2563EB] rounded-md flex items-center justify-center">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#0F172A]">AVProposal</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} AVProposal. Built for AV professionals.
          </p>
          <div className="flex gap-5 text-xs text-slate-400">
            <Link href="/auth?tab=login" className="hover:text-slate-600 transition-colors">Sign In</Link>
            <Link href="/auth?tab=register" className="hover:text-slate-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
