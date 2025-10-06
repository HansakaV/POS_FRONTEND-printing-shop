import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.ts";
import React from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.tsx";

const Layout: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Redirect authenticated users away from login/signup
    useEffect(() => {
        if (isAuthenticated && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, location.pathname, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter">
            {isAuthenticated ? (
                <div className="flex flex-col md:flex-row relative min-h-screen">

                    {/* Sidebar */}
                    <Sidebar className={`fixed z-20 top-0 left-0 h-full md:relative md:flex transition-transform duration-300
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`} />

                    {/* Mobile hamburger */}
                    <button 
                        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded shadow"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? "✖" : "☰"}
                    </button>

                    {/* Main Content */}
                    <div className="flex-1 md:ml-72 p-4 md:p-8 relative z-10 min-h-screen">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 min-h-full relative overflow-hidden">

                            {/* Background decorations */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-100/30 to-transparent rounded-bl-full hidden sm:block"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-tr-full hidden sm:block"></div>
                            <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-lg animate-pulse hidden md:block" style={{ animationDelay: '4s' }}></div>

                            <div className="p-4 md:p-6 relative z-10">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col min-h-screen relative overflow-hidden">

                    {/* Header */}
                    <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
                        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center group">
                                <img 
                                    src="/assets/Dp_LOGO.jpg"
                                    alt="DP Logo"
                                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                                />
                                <h1 className="ml-3 text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                                    DP Communication
                                </h1>
                            </div>

                            {/* Navigation */}
                            <nav>
                                <ul className="flex space-x-2 md:space-x-6">
                                    <li>
                                        <button onClick={() => navigate('/login')} className="px-4 py-2 text-gray-700 text-sm md:text-base font-semibold hover:text-purple-600 transition-colors">
                                            Login
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={() => navigate('/signup')} className="px-4 py-2 text-white text-sm md:text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow hover:shadow-lg">
                                            Sign Up
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </header>

                    {/* Main */}
                    <main className="flex-grow relative z-10">
                        <div className="container mx-auto px-4 md:px-6 py-8 flex justify-center items-center min-h-full">
                            <div className="w-full max-w-4xl relative">
                                <Outlet />
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="relative z-10 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white overflow-hidden p-4 md:p-8">
                        <div className="relative container mx-auto flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center mb-4 md:mb-0">
                                <img src="/assets/Dp_LOGO.jpg" className="w-10 h-10 object-contain" />
                                <span className="ml-3 text-lg md:text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                                    DP Communication
                                </span>
                            </div>
                            <div className="text-center md:text-right text-sm md:text-base">
                                <p>&copy; 2025 DP Communication</p>
                                <p>All rights reserved.</p>
                            </div>
                        </div>
                    </footer>
                </div>
            )}
        </div>
    );
};

export default Layout;
