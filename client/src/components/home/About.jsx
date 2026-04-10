import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe, MessageSquare, Video, Users } from 'lucide-react';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const highlights = [
    { icon: <MessageSquare size={18} />, text: "Real-time Chat", color: "text-blue-400" },
    { icon: <ShieldCheck size={18} />, text: "Secure Groups", color: "text-emerald-400" },
    { icon: <Video size={18} />, text: "Live Video Calls", color: "text-purple-400" },
    { icon: <Globe size={18} />, text: "Public & Private Status", color: "text-amber-400" },
    { icon: <Users size={18} />, text: "Live Users", color: "text-rose-400" },
  ];

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: Content & Mission */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
              Our Identity
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              About <span className="text-indigo-500">MeetIP</span>
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-lg text-zinc-400 leading-relaxed max-w-xl font-medium">
              MeetIP is a modern communication platform where users can chat in real time, 
              create secure groups, share public or private status updates, and connect 
              with others through voice and video calls.
            </motion.p>

            <motion.p variants={itemVariants} className="text-zinc-500 leading-relaxed max-w-xl">
              Our mission is to bridge the gap between instant connectivity and high-level 
              privacy. We believe your conversations should be as fast as thought and as 
              secure as a vault.
            </motion.p>
          </motion.div>

          {/* RIGHT: Visual Feature Highlights (The Glass Stack) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="space-y-4">
              {highlights.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl transition-all cursor-default group"
                >
                  <div className={`p-2 rounded-lg bg-white/5 ${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <span className="text-white font-bold tracking-tight">{item.text}</span>
                  <Zap size={14} className="ml-auto text-zinc-700 group-hover:text-blue-500 transition-colors" />
                </motion.div>
              ))}
            </div>

            {/* Decorative element to make it stand out */}
            <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;