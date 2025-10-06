import {useEffect} from "react";
import {useAuth} from "../context/useAuth.ts";
import React from 'react'
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import Sidebar from "../components/Sidebar.tsx";

const Layout: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // If authenticated and trying to access login/signup, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, location.pathname, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter">
            {isAuthenticated ? (
                <div className="flex relative min-h-screen">
                    {/* Authenticated Background Art */}
                    <div className="fixed inset-0 pointer-events-none">
                        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
                    </div>
                    
                    {/* Fixed Sidebar */}
                    <Sidebar />
                    
                    {/* Main Content Area with left margin to account for fixed sidebar */}
                    <div className="flex-1 ml-72 p-8 relative z-10 min-h-screen">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 min-h-full relative overflow-hidden">
                            {/* Content area decoration */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-100/30 to-transparent rounded-bl-full"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-tr-full"></div>
                            
                            <div className="p-6 relative z-10">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col min-h-screen relative overflow-hidden">
                    {/* Enhanced Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Primary floating orbs */}
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
                        
                        {/* Additional floating elements */}
                        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full mix-blend-multiply filter blur-lg opacity-15 animate-bounce" style={{animationDuration: '3s', animationDelay: '1s'}}></div>
                        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full mix-blend-multiply filter blur-md opacity-20 animate-bounce" style={{animationDuration: '4s', animationDelay: '3s'}}></div>
                        <div className="absolute top-3/4 right-1/3 w-20 h-20 bg-gradient-to-br from-violet-300 to-purple-400 rounded-full mix-blend-multiply filter blur-lg opacity-25 animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
                        
                        {/* Geometric shapes */}
                        <div className="absolute top-1/6 left-1/6 w-16 h-16 bg-gradient-to-br from-teal-300/20 to-cyan-400/20 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
                        <div className="absolute bottom-1/6 right-1/5 w-12 h-12 bg-gradient-to-br from-indigo-300/25 to-blue-400/25 rotate-12 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
                        
                        {/* Flowing lines */}
                        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-purple-200/30 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
                        <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-blue-200/30 to-transparent animate-pulse" style={{animationDelay: '3s'}}></div>
                        
                        {/* Starry effect */}
                        <div className="absolute top-1/5 left-1/5 w-2 h-2 bg-white rounded-full opacity-40 animate-ping" style={{animationDelay: '2s'}}></div>
                        <div className="absolute top-2/5 right-1/4 w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-60 animate-ping" style={{animationDelay: '4s'}}></div>
                        <div className="absolute bottom-1/3 left-2/5 w-2.5 h-2.5 bg-purple-200 rounded-full opacity-30 animate-ping" style={{animationDelay: '6s'}}></div>
                        <div className="absolute top-3/5 left-3/4 w-1 h-1 bg-blue-200 rounded-full opacity-50 animate-ping" style={{animationDelay: '1.5s'}}></div>
                        <div className="absolute bottom-2/5 right-1/6 w-2 h-2 bg-emerald-200 rounded-full opacity-45 animate-ping" style={{animationDelay: '5s'}}></div>
                        
                        {/* Subtle mesh pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="mesh" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                                        <circle cx="30" cy="30" r="1" fill="currentColor" className="text-purple-400"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#mesh)"/>
                            </svg>
                        </div>
                    </div>

                    <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
                        <div className="container mx-auto px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center group">
                                    <div className="relative">
                                        <img 
                                            src="/assets/Dp_LOGO.jpg" 
                                            alt="DP Communication Logo" 
                                            className="w-12 h-12 object-contain transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                                        />
                                        <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                                    </div>
                                    <h1 className="ml-4 text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                                        DP Communication
                                    </h1>
                                </div>
                                
                                <nav>
                                    <ul className="flex items-center space-x-6">
                                        <li>
                                            <button 
                                                onClick={() => navigate('/login')} 
                                                className="relative px-6 py-2 text-gray-700 font-semibold hover:text-purple-600 transition-colors duration-300 group"
                                            >
                                                <span className="relative z-10">Login</span>
                                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
                                            </button>
                                        </li>
                                        <li>
                                            <button 
                                                onClick={() => navigate('/signup')} 
                                                className="relative px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                                            >
                                                <span className="relative z-10">Sign Up</span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </header>
                    
                    <main className="flex-grow relative z-10">
                        <div className="container mx-auto px-6 py-16 flex justify-center items-center min-h-full">
                            <div className="w-full max-w-4xl relative">
                                {/* Content area subtle decoration */}
                                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-sm animate-pulse"></div>
                                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-sm animate-pulse" style={{animationDelay: '2s'}}></div>
                                <Outlet />
                            </div>
                        </div>
                    </main>
                    
                    <footer className="relative z-10 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white overflow-hidden">
                        {/* Footer background art */}
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 right-1/3 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
                        
                        <div className="relative container mx-auto px-6 py-8">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center group">
                                    <img 
                                        src="/assets/Dp_LOGO.jpg" 
                                        alt="DP Communication Logo" 
                                        className="w-10 h-10 object-contain transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                                    />
                                    <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                                        DP Communication
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-300 mb-1">
                                        &copy; 2025 DP Communication
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            )}
        </div>
    );
};

export default Layout;
