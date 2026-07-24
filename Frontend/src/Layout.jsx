import { Outlet } from "react-router-dom";
import Navigation from "./Components/Navigation";
import Sidebar from "./Components/Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-ink">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navigation />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
