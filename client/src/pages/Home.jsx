import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import About from '../components/home/About';
import UserStatsBar from '../components/home/UserStatsBar';
import Contact from '../components/home/Contact';

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen overflow-x-hidden">
      {/* Global Navigation */}
      <Navbar />
      
      {/* 1. Hero Section: The First Impression */}
      <Hero />
      
      {/* 2. Features Section: What MeetIP can do */}
      <Features />
      
      {/* 3. About Section: Our Identity and Mission */}
      <About />
      
      {/* 4. User Stats: Social Proof & Trust */}
      <UserStatsBar />
      
      {/* 5. Contact Section: Engagement & Support */}
      <Contact />
    </main>
  );
}