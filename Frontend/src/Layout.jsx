import Navigation from "./Components/Navigation"
import Footer from "./Components/Footer"
import { Outlet } from "react-router-dom"
import Sidebar from "./Components/Sidebar"

function Layout() {
  return (
    <>
      <Navigation/>
      <div className="flex h-[calc(100vh-5rem)]">
        <Sidebar/>
        <main className="flex-1">
          <Outlet/>
        </main>
      </div>
      <Footer/>
    </>
  )
}

export default Layout