import Navigation from "./Components/Navigation"
import Footer from "./Components/Footer"
import { Outlet } from "react-router-dom"
import Sidebar from "./Components/Sidebar"

function Layout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#090a0f]">
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Layout