import { PanelsTopLeft,ChartNoAxesCombined,Brain, SquareTerminal } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',          end: true,  icon: PanelsTopLeft,        label: 'Dashboard'  },
  { to: '/analytics', end: false, icon: ChartNoAxesCombined,  label: 'Analytics'  },
  { to: '/challenges',end: false, icon: Brain,                label: 'Challenges' },
  { to: '/terminal',  end: false, icon: SquareTerminal,       label: 'Terminal'   },
]

function Sidebar() {
  return (
    <aside className='h-full w-56 shrink-0 flex flex-col bg-[--color-surface-container-low] border-r border-[--color-separator]'>
      <nav className='flex-1 px-3 py-6'>
        <ul className='flex flex-col gap-1'>
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-gray-300 text-[--color-on-primary-container]'
                    : 'text-[--color-on-surface-variant] hover:bg-[--color-surface-container] hover:text-[--color-on-surface]'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar