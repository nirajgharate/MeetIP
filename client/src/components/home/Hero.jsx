import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, MessageCircle, ShieldCheck } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  // Balanced entrance animation
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: i * 0.1, 
        duration: 0.7, 
        ease: [0.21, 0.45, 0.32, 0.9] 
      }
    }),
  };

  return (
    <div className="relative bg-[#050505] min-h-screen w-full flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      
      {/* Background: Soft Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10 w-full">
        
        {/* LEFT SIDE: Refined Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          
          

          {/* REFINED HEADING SIZE: Smaller, balanced, and sharp */}
          <motion.h1 
            custom={1} initial="hidden" animate="visible" variants={fadeInUp}
            className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.15]"
          >
            Connect. Chat. <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Meet Instantly.
            </span>
          </motion.h1>

          <motion.p 
            custom={2} initial="hidden" animate="visible" variants={fadeInUp}
            className="text-base md:text-lg text-zinc-400 max-w-lg leading-relaxed font-medium"
          >
            MeetIP is a modern platform where users can chat, join groups, 
            share status, and connect through real-time communication.
          </motion.p>

          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeInUp} className="pt-4">
            <button 
              onClick={() => navigate('/meetip')}
              className="group relative flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Clean Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative hidden lg:block"
        >
          <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden group">
            
            {/* Mock UI Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40">M</div>
                <span className="text-sm font-bold text-white tracking-tight">MeetIP Messenger</span>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
            </div>

            {/* Mock Content Rows */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-blue-400"><MessageCircle size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-white">Direct Messaging</p>
                  <p className="text-[10px] text-zinc-500 font-medium">Encrypted & Real-time</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl translate-x-4 transition-transform group-hover:translate-x-6">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-indigo-400"><Zap size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-white">Group Channels</p>
                  <p className="text-[10px] text-zinc-500 font-medium">Unlimited Members</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400"><ShieldCheck size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-white">Privacy Focused</p>
                  <p className="text-[10px] text-zinc-500 font-medium">No Data Tracking</p>
                </div>
              </div>
            </div>
            
            {/* Subtle light sweep */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-1000" />
          </div>

          {/* Card Ambient Glow */}
          <div className="absolute -z-10 -inset-4 bg-blue-600/5 blur-3xl rounded-full" />
        </motion.div>

      </div>
    </div>
  );
};

export default Hero;