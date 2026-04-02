import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import austLogo from '../../assets/AUST.png';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  logo?: React.ReactNode;
  items: NavItem[];
  rightContent?: React.ReactNode;
  hideOnScroll?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  logo,
  items,
  rightContent,
  hideOnScroll = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add background when scrolled
      setIsScrolled(currentScrollY > 20);

      // Hide on scroll down, show on scroll up
      if (hideOnScroll) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, [lastScrollY, hideOnScroll]);

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className={`
        fixed top-0 left-0 right-0 z-40
        transition-all duration-300
        ${isScrolled 
          ? 'bg-white/80 dark:bg-navy-900/80 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {logo || (
                <img
                  src={austLogo}
                  alt="AUST Logo"
                  className="h-10 w-auto md:h-12"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `${process.env.PUBLIC_URL}/logo192.png`;
                  }}
                />
              )}
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item, index) => (
              <Link key={index} to={item.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="px-4 py-2 rounded-lg text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800 hover:text-gold-600 transition-colors flex items-center gap-2"
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex items-center gap-4">
            {rightContent}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
