import { useEffect } from "react";
import { useAuth } from "../context/useAuth.ts";
import React from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.tsx";

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter">
      {isAuthenticated ? (
        <div className="flex flex-col md:flex-row relative min-h-screen">
          {/* Authenticated Background */}
          <div className="fixed inset-0 pointer-events-none hidden md:block">
            <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>

          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <div className="flex-1 p-4 md:ml-72 relative z-10 min-h-screen">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 min-h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-100/30 to-transparent rounded-bl-full hidden md:block"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-tr-full hidden md:block"></div>

              <div className="p-4 md:p-6 relative z-10">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
          {/* Animated Background (hide heavy shapes on small screens) */}
          <div className="absolute inset-0 overflow-hidden hidden sm:block">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>

          <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
            <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
              <div className="flex items-center group">
                <img
                  src="/assets/Dp_LOGO.jpg"
                  alt="DP Communication Logo"
                  className="w-10 h-10 md:w-12 md:h-12 object-contain transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                />
                <h1 className="ml-3 md:ml-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  DP Communication
                </h1>
              </div>

              <nav>
                <ul className="flex items-center space-x-4 md:space-x-6">
                  <li>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 text-gray-700 font-semibold hover:text-purple-600 transition-colors duration-300"
                    >
                      Login
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/signup')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all duration-300"
                    >
                      Sign Up
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </header>

          <main className="flex-grow relative z-10">
            <div className="container mx-auto px-4 md:px-6 py-16 flex justify-center items-center min-h-full">
              <div className="w-full max-w-4xl relative">
                <Outlet />
              </div>
            </div>
          </main>

          <footer className="relative z-10 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white py-6">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src="/assets/Dp_LOGO.jpg"
                  alt="DP Communication Logo"
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
                <span className="ml-2 md:ml-3 text-lg md:text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  DP Communication
                </span>
              </div>
              <div className="text-right text-sm md:text-base">
                <p className="text-gray-300">&copy; 2025 DP Communication</p>
                <p className="text-gray-400">All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Layout;
 //fixed response