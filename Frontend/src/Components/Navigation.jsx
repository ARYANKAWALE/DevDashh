import React from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search, LayoutGrid, Zap } from 'lucide-react'
import { useEffect, useRef } from 'react'

function Navigation() {
  const inputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeEl = document.activeElement;
      if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable) {
        return;
      }
      const isK = event.key.toLowerCase() === 'k';
      const isCtrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (isK || isCtrlK) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090a0f] border-b border-white/5">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/40">
            <Zap className="w-4.5 h-4.5 text-blue-400 fill-blue-400/20" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center">
            Dev<span className="text-[#a5b4fc]">Pulse</span>
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-500 w-4.5 h-4.5" />
            <input
              ref={inputRef}
              type="search"
              className="w-full pl-9 pr-14 py-1.5 text-sm rounded-lg bg-[#0f111a] border border-white/5 text-gray-200 outline-none placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              placeholder="Type a command or search..."
            />
            <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#161a29] border border-white/10 text-[10px] text-gray-400 font-mono select-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Bell Icon with notification dot */}
          <button className="relative p-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-green-500"></span>
          </button>

          {/* Grid Layout Icon */}
          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors">
            <LayoutGrid className="w-5 h-5" />
          </button>

          {/* User Profile Avatar */}
          <Link to="/settings" className="flex items-center cursor-pointer ml-1" title="LeetCode Settings">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
              alt="Developer Avatar"
              className="w-8 h-8 rounded-full border border-white/10 object-cover hover:border-blue-500/50 transition-colors"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navigation