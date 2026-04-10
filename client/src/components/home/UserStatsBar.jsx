import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { Users, Zap, MessageSquare, ShieldCheck } from 'lucide-react';

// Optimized Count-up Animation
const Counter = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 90,
  });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(latest.toFixed(0)) + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} />;
};

const UserStatsBar = () => {
  const stats = [
    {
      label: "Total Users",
      value: 12000,
      suffix: "+",
      icon: <Users size={20} className="text-blue-300" />,
      accent: "from-blue-500/20"
    },
    {
      label: "Active Now",
      value: 1200,
      suffix: "+",
      icon: <Zap size={20} className="text-amber-300" />,
      accent: "from-amber-500/20"
    },
    {
      label: "Messages Sent",
      value: 50000,
      suffix: "+",
      icon: <MessageSquare size={20} className="text-fuchsia-300" />,
      accent: "from-fuchsia-500/20"
    },
    {
      label: "Groups Created",
      value: 3000,
      suffix: "+",
      icon: <ShieldCheck size={20} className="text-emerald-300" />,
      accent: "from-emerald-500/20"
    },
  ];

  return (
    <section className="relative py-15 bg-[#050505] overflow-hidden">
      
      {/* Structural Glow behind the bar to separate it from the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-32 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden p-[1px] rounded-[40px] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-blue-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Main Glass Surface with Indigo Tint */}
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-2 p-4 rounded-[39px] bg-gradient-to-br from-indigo-900/40 via-[#0d0d0d]/90 to-blue-900/40 backdrop-blur-3xl">
            
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -5 }}
                className="group relative flex flex-col items-center justify-center py-10 px-4 rounded-[32px] transition-all duration-500 hover:bg-white/5 border border-transparent hover:border-white/10"
              >
                {/* Individual Stat Glow on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-b ${stat.accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px]`} />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-1 drop-shadow-sm">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </h3>
                  
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200/50 group-hover:text-white transition-colors">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Subtle Inner Highlight Line */}
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UserStatsBar;