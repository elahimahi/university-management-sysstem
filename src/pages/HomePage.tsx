import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Trophy, Lightbulb, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';
import { useNotifications } from '../hooks/useNotifications';
import NotificationContainer from '../components/ui/NotificationContainer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HomePage: React.FC = () => {
  const { notifications, remove } = useNotifications();

  const features = [
    { icon: BookOpen, title: 'Smart Courses', desc: 'Manage and enroll in courses seamlessly' },
    { icon: Users, title: 'Community', desc: 'Connect with students and faculty' },
    { icon: Trophy, title: 'Track Progress', desc: 'Monitor grades and academic achievements' },
    { icon: Lightbulb, title: 'Interactive Learning', desc: 'Engage with modern educational tools' },
  ];

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 md:px-8 py-6 border-b border-white/10 backdrop-blur bg-white/5"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                UniManage
              </h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl"
              >
                <Link to="/login">Sign In</Link>
              </motion.button>
            </div>
          </motion.header>

          {/* Hero */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center"
          >
            <motion.h2 variants={itemVariants} className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              Welcome to Your <span className="text-blue-400">Academic Hub</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Manage your academic journey with advanced tools for course registration, grades tracking, and more.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Get Started →
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.section>

          {/* Features */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4 md:px-8 py-20"
          >
            <motion.h3 variants={itemVariants} className="text-4xl font-bold text-white text-center mb-12">
              Powerful Features
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-white/20 transition-all"
                  >
                    <Icon size={32} className="text-blue-400 mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                    <p className="text-gray-400">{feature.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Stats */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4 md:px-8 py-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { number: '5000+', label: 'Active Students' },
                { number: '200+', label: 'Courses' },
                { number: '100+', label: 'Faculty' },
                { number: '99.9%', label: 'Uptime' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 backdrop-blur text-center"
                >
                  <h4 className="text-4xl font-black text-blue-400 mb-2">{stat.number}</h4>
                  <p className="text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4 md:px-8 py-20"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border border-blue-500/30 rounded-3xl p-12 text-center backdrop-blur">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Academic Experience?</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of students managing their education more effectively.
              </p>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20"
                >
                  Create Your Account Now
                </motion.button>
              </Link>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-t border-white/10 backdrop-blur bg-white/5 py-12 px-4 md:px-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">UniManage</h4>
                  <p className="text-gray-400">Your complete academic management platform.</p>
                </div>
                <div>
                  <h5 className="font-bold text-white mb-4">Quick Links</h5>
                  <ul className="space-y-2 text-gray-400">
                    <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                    <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-white mb-4">Contact</h5>
                  <div className="space-y-2 text-gray-400 text-sm">
                    <p className="flex items-center gap-2"><Mail size={16} /> info@university.edu</p>
                    <p className="flex items-center gap-2"><Phone size={16} /> +1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
                <p>&copy; 2025 University Management System. All rights reserved.</p>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </PageTransition>
  );
};

export default HomePage;
