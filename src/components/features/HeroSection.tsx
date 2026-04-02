import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedButton } from '../ui';
import austLogo from '../../assets/AUST.png';

const HeroSection: React.FC = () => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Empowering Excellence in Higher Education';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const floatingShapes = [
    { size: 80, x: '10%', y: '20%', delay: 0 },
    { size: 60, x: '85%', y: '15%', delay: 0.2 },
    { size: 100, x: '75%', y: '70%', delay: 0.4 },
    { size: 70, x: '15%', y: '80%', delay: 0.6 },
  ];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-navy-900 via-primary-800 to-navy-900">
      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-gold-500/20 to-primary-500/20"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />

      {/* Floating 3D Shapes */}
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-gradient-to-br from-gold-400/30 to-primary-400/30 backdrop-blur-sm"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6 + index,
            repeat: Infinity,
            delay: shape.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.img
            src={austLogo}
            alt="AUST Logo"
            className="mb-2 h-28 w-auto md:h-36"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `${process.env.PUBLIC_URL}/logo512.png`;
            }}
          />
          <h1 className="mb-8 text-5xl font-bold text-white md:text-7xl">
            <span className="block bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              AUST
            </span>
          </h1>
        </motion.div>

        {/* Typewriter Effect */}
        <motion.p
          className="mb-12 min-h-[2em] text-xl text-gray-200 md:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {displayedText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="ml-1"
          >
            |
          </motion.span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <AnimatedButton
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-900 font-semibold px-8 py-4 rounded-full shadow-lg"
            >
              Explore Programs
            </AnimatedButton>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-navy-900 px-8 py-4 rounded-full shadow-lg"
            >
              Take a Tour
            </AnimatedButton>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <p className="text-sm text-gray-300">Scroll to explore</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex h-10 w-6 items-center justify-center rounded-full border-2 border-white/50"
          >
            <motion.div className="h-2 w-2 rounded-full bg-white" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
