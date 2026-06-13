import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, 
  Fingerprint, ArrowRight, ShieldCheck, Loader2, AlertCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService'; 
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  
  // ✅ Extracting context
  const { setUser } = useContext(AuthContext);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  
  const [formData, setFormData] = useState({
    identifier: '', 
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Hit the auth service
      const result = await login({
        email: formData.identifier,
        password: formData.password
      });

      // ✅ result contains { user, token }
      if (result.token) {
        setUser(result.user);
        navigate('/messages');
      }
    } catch (err) {
      // Better error parsing for backend responses
      const errorMsg = err.message || "Authorization failed.";
      setError(errorMsg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/5 blur-[140px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mt-10 mb-10">
          
          <h1 className="text-4xl font-black tracking-tighter">Connect to MeetIP</h1>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck size={12} className="text-emerald-500" />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Secure Login Gateway</p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[48px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Email or Mobile Number"
                  autoComplete="username"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-4">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700 disabled:opacity-50"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Login <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-zinc-600 text-xs font-bold">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-500 hover:text-indigo-400 transition-colors tracking-widest ml-1 uppercase">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-30">
          <div className="flex items-center gap-2 text-[8px] font-black text-zinc-500 uppercase tracking-widest">
            <div className="w-1 h-1 rounded-full bg-emerald-500" /> AES-256
          </div>
          <div className="flex items-center gap-2 text-[8px] font-black text-zinc-500 uppercase tracking-widest">
            <div className="w-1 h-1 rounded-full bg-emerald-500" /> SSL_ACTIVE
          </div>
          <div className="flex items-center gap-2 text-[8px] font-black text-zinc-500 uppercase tracking-widest">
            <div className="w-1 h-1 rounded-full bg-emerald-500" /> E2E_READY
          </div>
        </div>
      </motion.div>
    </div>
  );
}
