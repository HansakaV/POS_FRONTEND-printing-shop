import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.ts';
import { LogOut, BookOpen, Users, Home, Bell, ArrowRightLeft, User } from 'lucide-react';
import { getLoggedInUser } from '../services/authService.ts';
import axios from 'axios';


 //remove props

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [user, setUser] = useState<any>(null);

  
  // Simulated real-time updates (replace with actual API calls)
  useEffect(() => {
    const loggedUser = getLoggedInUser();
    setUser(loggedUser);
    
  }, []);

    useEffect(() => {
    if (user?.email) {
      sendVerification(user.email);
    }
  }, [user]); 
 
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, color: 'from-blue-400 to-blue-600' },
    { name: 'Customers', path: '/dashboard/customers', icon: Users, color: 'from-purple-400 to-purple-600' },
    { name: 'Items', path: '/dashboard/items', icon: BookOpen, color: 'from-green-400 to-green-600' },
    { name: 'Orders', path: '/dashboard/orders', icon: ArrowRightLeft, color: 'from-orange-400 to-orange-600' },
    //{ name: 'Management', path: '/dashboard/management', icon: Bell, color: 'from-pink-400 to-pink-600' },
  ];

  if (user?.role === "admin") {
  navItems.push({
    name: 'Management',
    path: '/dashboard/management',
    icon: Bell,
    color: 'from-pink-400 to-pink-600'
  });
}

  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sendVerification = async(email: string) =>{
     const message = `Dear Admin,
    We have Detected Login from ${email}.
    This is a verification message.`;

    const res = await axios.post("https://pos-backend-dp.onrender.com/api/sms/send-sms", {
      phone: "0713856863",
      message,
    });
    if(res.status === 200){
      console.log("SMS sent successfully");
    }
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl z-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content wrapper with scroll */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-black-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold">DP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DP Communication
              </h1>
              <p className="text-xs text-slate-400">Golden Mark Of Printing</p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* User Profile Section */}
          <div className="p-4 mx-4 mt-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slideIn">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={24} />
              </div>
              
              <div className="flex-1">
                 <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-slate-300">{user?.email}</p>
                <p className="text-xs text-slate-400">{user?.branch}</p> 
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-6 space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  className={`relative flex items-center w-full px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 group overflow-hidden animate-slideIn
                    ${isActive 
                      ? 'bg-white/10 text-white shadow-lg' 
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20 rounded-xl`} />
                  )}
                  
                  {/* Icon with gradient background */}
                  <div className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color}` 
                      : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                    <Icon size={18} />
                  </div>
                  
                  <span className="relative z-10">{item.name}</span>
                  
                  {/* Hover effect */}
                  {!isActive && (
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="px-4 pb-4 animate-slideIn" style={{ animationDelay: '0.5s' }}>
  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
    Developed & Maintained by H-Code Innovations
  </h3>
  
  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 animate-scaleIn">
    <p className="text-sm text-slate-200 mb-2">
      <strong>Developer:</strong> Mahesh Hansaka
    </p>
    <p className="text-sm text-slate-200 mb-2">
      <strong>Email:</strong> <a href="mailto:hasamahesh01@gmail.com" className="underline hover:text-blue-400">hasamahesh01@gmail.com</a>
    </p>
    <p className="text-sm text-slate-200 mb-2">
      <strong>Phone:</strong> <a href="tel:+94710356244" className="underline hover:text-blue-400">+94 71 035 6244</a>
    </p>
    <p className="text-sm text-slate-200">
      <strong>Website:</strong> <a href="https://neon-mahesh-portfolio.vercel.app" target="_blank" className="underline hover:text-blue-400">Mahesh Hansaka</a>
    </p>
  </div>
</div>

          
        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-sm animate-fadeIn" style={{ animationDelay: '0.8s' }}>
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;

