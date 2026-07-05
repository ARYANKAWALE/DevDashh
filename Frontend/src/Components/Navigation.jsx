import React from 'react'
import {Bell, Search,LayoutGrid, LayoutGridIcon} from 'lucide-react'
import { useEffect,useRef } from 'react'

function Navigation() {

  const inputRef = useRef(null)

  useEffect(()=>{
    const handleKeyDown = (event)=>{
      const activeE1 = document.activeElement;
      if(activeE1.tagName === 'INPUT' || activeE1.tagName === 'TEXTAREA' || activeE1.isContentEditable){
        return;
      }
      const isK = event.key.toLowerCase() === 'k';
      const isCtrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (isK || isCtrlK) {
        event.preventDefault(); // Stop native browser action (like browser search)
        inputRef.current?.focus(); // Focus the search input
        inputRef.current?.select(); // Optional: Select existing text for easy re-typing
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listener on unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  },[])


  return (
    <header>
      <div className='flex items-center justify-between px-6 py-4 bg-[--color-background] shadow-sm border-b-2 border-gray-800'>
        <div>
          <h1 className='text-2xl font-bold text-[--color-primary] tracking-tight'>DevDash</h1>
        </div>

        <div className='flex items-center'>
          <div className='relative flex items-center'>
            <Search className='absolute left-3 text-[--color-outline] pointer-events-none' size={18}/>
            <input
              ref={inputRef}
              type="search"
              accessKey='k'
              className='pl-9 pr-4 py-2 w-90 rounded-full border border-[--color-outline-variant] bg-[--color-surface-container-low] text-[--color-on-surface] text-sm outline-none focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary-muted] transition-all placeholder:text-[--color-outline]'
              placeholder='Search'
            />
            <p className='absolute right-3 px-2 py-1 bg-[--color-surface-container] text-xs font-bold text-[--color-on-surface-variant] rounded-md'>Ctrl + K</p>
          </div>
        </div>

        <div>
          <div className='flex items-center gap-4'>
            <button className='relative p-2 text-[--color-on-surface-variant] hover:text-[--color-on-surface] hover:bg-[--color-surface-container] rounded-full transition-colors'>
              <Bell/>
              <span className='absolute top-2 right-2 block h-2 w-2 rounded-full bg-error'></span>
            </button>

            <button className='relative p-2 text-[--color-on-surface-variant] hover:text-[--color-on-surface] hover:bg-[--color-surface-container] rounded-full transition-colors'>
              <LayoutGridIcon/>
            </button>

            <div className='flex items-center gap-2 cursor-pointer'>
              <div className='h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm'>JD</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navigation