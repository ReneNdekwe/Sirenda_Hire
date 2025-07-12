import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Users, Zap, Heart, Globe, Coffee, Sparkles, Code2, Megaphone, LineChart, Palette, Wrench, BookOpen } from 'lucide-react';
import WorkableWidget from '@/components/WorkableWidget';

const WorkCultureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </motion.div>
);

const Careers: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden pt-20 pb-16 bg-white">
          <div className="absolute inset-0 -z-10 bg-white/60 backdrop-blur-xl"></div>
          {/* Bottom SVG separator */}
          <div className="absolute left-0 right-0 bottom-0 -mb-1 overflow-hidden leading-none" aria-hidden="true">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12">
              <path fill="url(#hero-sep)" d="M0,0 C480,60 960,0 1440,60 L1440,60 L0,60 Z" />
              <defs>
                <linearGradient id="hero-sep" x1="0" y1="0" x2="1440" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffd6e0" />
                  <stop offset="1" stopColor="#9089fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 drop-shadow-lg">
                Join Our Journey at Sirenda
              </h1>
              <p className="text-base text-gray-700 max-w-2xl mx-auto bg-white/60 rounded-lg px-4 py-2 shadow-sm">
                Be part of a team that's revolutionizing the car rental industry in Rwanda. 
                We're not just building a company – we're creating experiences.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Work Culture Section */}
        <section className="relative py-20 bg-white">
          {/* Top SVG separator */}
          <div className="absolute left-0 right-0 top-0 -mt-1 overflow-hidden leading-none" aria-hidden="true">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 rotate-180">
              <path fill="url(#work-sep-top)" d="M0,0 C480,60 960,0 1440,60 L1440,60 L0,60 Z" />
              <defs>
                <linearGradient id="work-sep-top" x1="0" y1="0" x2="1440" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffd6e0" />
                  <stop offset="1" stopColor="#9089fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-primary mb-4 drop-shadow">
                Why Work With Us?
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto bg-white/60 rounded-lg px-4 py-2 shadow-sm">
                At Sirenda, we believe in creating an environment where innovation meets passion, 
                and where every team member can thrive and grow.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <WorkCultureCard
                icon={Zap}
                title="Innovation First"
                description="We're constantly pushing boundaries and exploring new technologies to revolutionize the car rental experience."
              />
              <WorkCultureCard
                icon={Users}
                title="Collaborative Spirit"
                description="Work with brilliant minds in a supportive environment where ideas are valued and teamwork is celebrated."
              />
              <WorkCultureCard
                icon={Heart}
                title="Work-Life Balance"
                description="We believe in flexible schedules, remote work options, and ensuring our team has time for what matters most."
              />
              <WorkCultureCard
                icon={Globe}
                title="Global Impact"
                description="Join us in our mission to transform transportation across Rwanda and beyond."
              />
              <WorkCultureCard
                icon={Coffee}
                title="Great Perks"
                description="Enjoy competitive benefits, regular team events, and a vibrant office culture that makes work enjoyable."
              />
              <WorkCultureCard
                icon={Sparkles}
                title="Growth Opportunities"
                description="Continuous learning and development opportunities to help you reach your full potential."
              />
            </div>
          </div>
        </section>

        {/* Job Listings Section */}
        <section className="relative py-20 bg-white">
          {/* Top SVG separator */}
          <div className="absolute left-0 right-0 top-0 -mt-1 overflow-hidden leading-none" aria-hidden="true">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 rotate-180">
              <path fill="url(#work-sep-bottom)" d="M0,0 C480,60 960,0 1440,60 L1440,60 L0,60 Z" />
              <defs>
                <linearGradient id="work-sep-bottom" x1="0" y1="0" x2="1440" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f0f4ff" />
                  <stop offset="1" stopColor="#ffe0f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-primary mb-4 drop-shadow">
                Open Positions
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto bg-white/60 rounded-lg px-4 py-2 shadow-sm">
                Ready to join our team? Check out our current openings and find your perfect role.
              </p>
            </motion.div>

            {/* Workable Widget */}
            <div className="mb-12">
              <WorkableWidget />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers; 