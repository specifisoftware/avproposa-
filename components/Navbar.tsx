'use client'

interface NavbarProps {
  userEmail: string
  onLogout: () => void
  proposalsToday: number
}

export default function Navbar({ userEmail, onLogout, proposalsToday }: NavbarProps) {
  const limitReached = proposalsToday >= 1

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#2563EB] rounded-md flex items-center justify-center">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8" />
            </svg>
          </div>
          <span className="text-base font-bold text-[#0F172A] tracking-tight">AVProposal</span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
              limitReached
                ? 'bg-red-100 text-red-600'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {limitReached
              ? <><span className="sm:hidden">Limit reached</span><span className="hidden sm:inline">1 of 1 free used</span></>
              : <><span className="sm:hidden">1 free left</span><span className="hidden sm:inline">1 free remaining today</span></>
            }
          </span>

          <span className="hidden sm:block text-sm text-slate-400">{userEmail}</span>

          <button
            onClick={onLogout}
            className="text-sm text-slate-500 hover:text-[#0F172A] font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
