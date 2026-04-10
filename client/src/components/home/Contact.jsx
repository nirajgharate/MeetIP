import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Globe, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const contactDetails = [
    { icon: <Mail size={20} />, label: "Email", value: "support@meetip.com", color: "text-blue-400" },
    { icon: <Globe size={20} />, label: "Website", value: "www.meetip.com", color: "text-indigo-400" },
    { icon: <MapPin size={20} />, label: "Location", value: "Global / Remote", color: "text-emerald-400" },
  ];

  return (
    <section id="contact" className="relative py-24 bg-[#050505] overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center lg:text-left mb-16">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            Contact <span className="text-indigo-500">Us</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl"
          >
            If you have questions, suggestions, or need help with MeetIP, 
            feel free to reach out to us. Our team is here to support you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Glassmorphism Contact Form (8 Columns) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white/[0.02] border border-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-[40px] shadow-2xl"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">Email</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">Message</label>
                <textarea 
                  rows="5"
                  placeholder="How can we help you?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700 resize-none"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
              >
                Send Message
                <Send size={18} />
              </motion.button>
            </form>
          </motion.div>

          {/* RIGHT: Contact Info (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
            {contactDetails.map((detail, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                className="flex items-center gap-6 p-6 bg-white/[0.01] border border-white/5 rounded-[32px] hover:bg-white/[0.03] transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${detail.color} group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                  {detail.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">{detail.label}</p>
                  <p className="text-white font-bold tracking-tight">{detail.value}</p>
                </div>
              </motion.div>
            ))}

            {/* Support Message */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20"
            >
              <div className="flex items-center gap-3 text-indigo-400 mb-3">
                <MessageCircle size={20} />
                <span className="font-bold text-sm">Live Support</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Our support team is typically online 24/7. Average response time is under 2 hours.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;