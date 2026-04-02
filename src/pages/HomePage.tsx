import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/features/HeroSection';
import StatsCounterSection from '../components/features/StatsCounterSection';
import FeaturedProgramsSection from '../components/features/FeaturedProgramsSection';
import LatestNewsSection from '../components/features/LatestNewsSection';
import UpcomingEventsSection from '../components/features/UpcomingEventsSection';
import TestimonialsCarousel from '../components/features/TestimonialsCarousel';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'faculty') {
      navigate('/faculty/dashboard', { replace: true });
    } else {
      navigate('/student/dashboard', { replace: true });
    }
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Programs', href: '/programs' },
    { label: 'News', href: '/news' },
    { label: 'Events', href: '/events' },
    { label: 'About', href: '/about' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      {/* Navigation */}
      <Navbar
        items={navItems}
        rightContent={
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <motion.button
                  onClick={handleGoToDashboard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg shadow-primary-500/20 transition-all font-bold"
                >
                  Go to Dashboard →
                </motion.button>
                <button
                  onClick={logout}
                  className="px-4 py-2 border border-gray-300 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 border border-gray-300 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Register
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        }
      />

      {/* Main Content */}
      <main className="overflow-hidden">
        {/* Hero Section */}
        <HeroSection />

        {/* Stats Counter Section */}
        <StatsCounterSection />

        {/* Featured Programs Section */}
        <FeaturedProgramsSection />

        {/* Latest News Section */}
        <LatestNewsSection />

        {/* Upcoming Events Section */}
        <UpcomingEventsSection />

        {/* Testimonials Carousel */}
        <TestimonialsCarousel />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
