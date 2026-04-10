import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  ShieldCheck, 
  Video, 
  BarChart3, 
  Globe, 
  Users,
  Zap
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: "Real-time Chat",
      description: "Experience zero-latency messaging. Send images, files, and reactions instantly.",
      icon: <MessageSquare className="text-blue-400" size={24} />,
    },
    {
      title: "Secure Groups",
      description: "Create private spaces for your team or friends with password-protected entry.",
      icon: <ShieldCheck className="text-indigo-400" size={24} />,
    },
    {
      title: "Live Video Calls",
      description: "High-definition video and crystal-clear audio for face-to-face connections.",
      icon: <Video className="text-purple-400" size={24} />,
    },
    {
      title: "Polls & Voting",
      description: "Make decisions faster with integrated polls and real-time feedback loops.",
      icon: <BarChart3 className="text-emerald-400" size={24} />,
    },
    {
      title: "Public & Private Status",
      description: "Share your current vibe with the world or keep it strictly for your inner circle.",
      icon: <Globe className="text-blue-500" size={24} />,
    },
    {
      title: "Live Users",
      description: "Stay connected with a real-time presence indicator showing who's online.",
      icon: <Users className="text-zinc-400" size={24} />,
    },
  ];

  // Animation variants for the grid
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  };

  return (
    <section id="features" className="relative py-15 bg-[#050505] overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
         
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Powerful Features
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-lg max-w-2xl mx-auto"
          >
            Everything you need for seamless communication, built into a single, 
            high-performance dashboard.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative p-8 rounded-[32px] bg-white/[0.02] border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20 shadow-2xl"
            >
              {/* Subtle hover glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/20 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>
                
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative accent line */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;