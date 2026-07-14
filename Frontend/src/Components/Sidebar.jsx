import { PanelsTopLeft, ChartNoAxesCombined, Brain, SquareTerminal, Award } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',          end: true,  icon: PanelsTopLeft,        label: 'Dashboard'  },
  { to: '/analytics', end: false, icon: ChartNoAxesCombined,  label: 'Analytics'  },
  { to: '/challenges',end: false, icon: Brain,                label: 'Challenges' },
  { to: '/terminal',  end: false, icon: SquareTerminal,       label: 'Terminal'   },
]

function Sidebar() {
  return (
    <aside className="w-56 shrink-0 flex flex-col justify-between bg-[#090a0f] border-r border-white/5 px-4 py-6">
      {/* Top Navigation Links */}
      <nav className="flex-1">
        <ul className="flex flex-col gap-2">
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all duration-200
                  ${isActive
                    ? 'text-[#39d353] bg-[#0c1611] border border-[#39d353]/20 shadow-[0_0_12px_rgba(57,211,83,0.05)]'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                  }`
                }
              >
                <Icon size={14} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Pro Activated Card */}
      <div className="p-4 rounded-xl bg-[#0f111a] border border-white/5">
        <div className="flex items-center gap-1.5 text-blue-400 font-extrabold text-[10px] tracking-wider uppercase">
          <Award size={13} className="text-blue-400 fill-blue-400/10" />
          <span>Pro Activated</span>
        </div>
        <p className="text-[10px] text-gray-500 leading-normal mt-1.5">
          Unlimited AI debugging & advanced system architecture insights.
        </p>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
          <div className="h-full w-[70%] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full" />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar