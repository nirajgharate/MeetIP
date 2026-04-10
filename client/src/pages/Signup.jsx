import React, { useState, useContext } from 'react'; // Added useContext
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, 
  ShieldCheck, ArrowRight, Fingerprint 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
// ✅ Import the AuthContext
import { AuthContext } from '../context/AuthContext';

const InputGroup = ({ icon, type, name, placeholder, value, onChange, disabled }) => (
  <div className="space-y-2">
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-600 disabled:opacity-50"
      />
    </div>
  </div>
);

export default function Signup() {
  const navigate = useNavigate();
  // ✅ Access the global state setter
  const { setUser } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        username: formData.name,
        email: formData.email,
        mobileNumber: formData.mobile,
        password: formData.password,
      });

      if (result.token) {
        // ✅ 1. Store the new identity in Global State immediately
        setUser(result); 
        
        // ✅ 2. Move to the main dashboard
        navigate('/meetip'); 
      }
    } catch (err) {
      setError(err || "Initialization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-2xl shadow-indigo-600/20 mb-4">
            <Fingerprint size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter">MEETIP_NODE</h1>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Initialize New Identity</p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[40px] p-8 md:p-10 shadow-2xl">
          {error && (
            <div className="mb-4 text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 px-3">
              Error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup icon={<User size={18} />} type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} disabled={loading} />
              <InputGroup icon={<Phone size={18} />} type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} disabled={loading} />
            </div>

            <InputGroup icon={<Mail size={18} />} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} disabled={loading} />

            <div className="relative">
              <InputGroup 
                icon={<Lock size={18} />} 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Secure Password" 
                value={formData.password} 
                onChange={handleChange}
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <InputGroup 
              icon={<ShieldCheck size={18} />} 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              value={formData.confirmPassword} 
              onChange={handleChange}
              disabled={loading}
            />

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    INITIALIZING...
                  </span>
                ) : (
                  <>
                    Create Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-xs font-bold">
              ALREADY REGISTERED?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors tracking-widest ml-1 uppercase">
                Login_Node
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-[9px] text-zinc-700 font-bold uppercase tracking-widest leading-relaxed">
          By initializing, you agree to the <span className="text-zinc-500">End-to-End Encryption Protocol</span> <br /> 
          and decentralized data storage standards.
        </p>
      </motion.div>
    </div>
  );
}