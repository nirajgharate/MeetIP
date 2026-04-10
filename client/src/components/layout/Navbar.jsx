import React, { useState, useContext } from 'react'; // Added useContext
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.svg'; // Ensure this path is correct
import { 
  Home, MessageSquare, Users, Menu, X, 
  LogIn, UserPlus, LogOut, User as UserIcon 
} from 'lucide-react';
// ✅ Import the AuthContext
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // ✅ Consume global auth state
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null); // Clear global state
    setIsMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={18} /> },
    { name: 'Live Users', path: '/live-users', icon: <Users size={18} /> },
  ];

  // Modern Minimal Logo Component (Unchanged)
  // Modern Minimal Logo Component (Updated to use logo.svg)
// Updated Logo Component
const Logo = () => (
  <div className="flex items-center gap-3 group">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full group-hover:bg-blue-500/40 transition-all duration-500" />
      
      {/* Use a direct string path. 
         Vite automatically looks in the 'public' folder for anything starting with '/' 
      */}
      <img 
        src={logo} 
        alt="MeetIP Logo" 
        className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] object-contain" 
      />
    </div>
    
    <div className="flex flex-col">
      <span className="text-2xl font-black tracking-tighter text-white drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] leading-none">
        Meet<span className="text-blue-400">IP</span>
      </span>
      <span className="text-[7px] font-black text-blue-500 uppercase tracking-[0.4em] ml-0.5 mt-1 opacity-80">
        Hyperlink
      </span>
    </div>
  </div>
);

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-4 py-6 sm:px-10 pointer-events-none">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] pointer-events-auto"
      >
        <div className="px-6 h-18 py-3 flex justify-between items-center">
          
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <Logo />
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="relative px-4 py-2 text-sm font-bold text-zinc-200 transition-all hover:text-white group"
              >
                <div className="flex items-center gap-2 drop-shadow-sm">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                <motion.span className="absolute inset-0 bg-white/10 rounded-xl -z-10" initial={{ opacity: 0, scale: 0.9 }} whileHover={{ opacity: 1, scale: 1 }} />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue-500 group-hover:w-1/2 transition-all duration-300 rounded-full shadow-[0_0_10px_#3b82f6]" />
              </Link>
            ))}
          </div>

          {/* Right Section: DYNAMIC Auth Buttons using global 'user' state */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-2 group"
                >
                  <LogIn size={16} className="group-hover:text-blue-400 transition-colors" />
                  <span>Login</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 rounded-xl bg-blue-600 border border-blue-500/50 text-white text-sm font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  <span>Sign Up</span>
                </motion.button>
              </>
            ) : (
              <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                {/* User Identity Display */}
                <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Verified_Node</span>
                  <span className="text-sm font-bold text-white truncate max-w-[100px]">{user.username}</span>
                </div>

                <button 
                  onClick={() => navigate('/profile')}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-blue-400 hover:bg-white/10 hover:text-white transition-all group overflow-hidden"
                  title="Profile Node"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="PFP" className="w-5 h-5 rounded-md object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <UserIcon size={20} className="group-hover:scale-110 transition-transform" />
                  )}
                </button>

                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-bold text-red-400 hover:text-red-300 transition-all flex items-center gap-2 group"
                >
                  <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-blue-400 transition-colors p-2">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden rounded-b-2xl"
            >
              <div className="px-6 py-8 space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 text-xl font-bold text-zinc-100 hover:text-blue-400 transition-colors"
                  >
                    <span className="text-blue-400">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-white/10">
                  {!user ? (
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-center">Login</button>
                      <button onClick={() => { navigate('/signup'); setIsMenuOpen(false); }} className="py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-center">Sign Up</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                         <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black overflow-hidden">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username?.[0].toUpperCase()}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-white font-bold">{user.username}</span>
                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Active Session</span>
                         </div>
                      </div>
                      <button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-3">
                        <UserIcon size={18} /> Profile_Node
                      </button>
                      <button onClick={handleLogout} className="w-full py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-3">
                        <LogOut size={18} /> Terminal_Exit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;