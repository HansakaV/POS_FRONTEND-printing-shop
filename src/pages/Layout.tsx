import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth.ts";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.tsx";
import { Menu, X } from "lucide-react";

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect authenticated users away from login/signup
  useEffect(() => {
    if (
      isAuthenticated &&
      (location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/signup")
    ) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Toggle sidebar for mobile
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter flex flex-col md:flex-row">
      {isAuthenticated && (
        <>
          {/* Sidebar overlay for mobile */}
          <div
            className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
              sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={toggleSidebar}
          ></div>

          {/* Sidebar */}
          <div
            className={`fixed z-50 left-0 top-0 h-full transition-transform transform ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 md:relative md:flex`}
          >
            <Sidebar />
          </div>

          {/* Mobile Header with hamburger */}
          <header className="md:hidden w-full bg-white/70 backdrop-blur-sm border-b border-white/20 flex items-center justify-between px-4 py-3 shadow-lg z-50">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              DP Communication
            </h1>
            <button onClick={toggleSidebar}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </header>
        </>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 relative z-10 p-6 md:p-8 transition-all duration-300 ${
          isAuthenticated ? "md:ml-72" : ""
        }`}
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 min-h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-100/30 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-tr-full"></div>

          <div className="p-6 relative z-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
