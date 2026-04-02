import React from 'react';
import { motion } from 'framer-motion';
import {
  fadeInUpVariants,
  slideInLeftVariants,
  slideInRightVariants,
  scaleInVariants,
  floatingVariants,
  pulseVariants,
  cardHoverVariants,
  buttonHoverVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from '../constants/animations.constants';

/**
 * Demo component showcasing all theming features
 * This component demonstrates the complete theming system including:
 * - Colors (Navy and Gold palette)
 * - Typography
 * - Animations
 * - Components
 * - Dark/Light mode compatibility
 */

const ThemeDemo: React.FC = () => {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          className="text-center mb-16"
        >
          <h1 className="section-heading gradient-text mb-4">
            Theme System Demo
          </h1>
          <p className="section-subheading">
            Explore all the theming features and components
          </p>
        </motion.div>

        {/* Color Palette Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 text-navy-900 dark:text-white">
            Color Palette
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Navy Colors */}
            <motion.div
              variants={slideInLeftVariants}
              initial="hidden"
              animate="visible"
              className="card"
            >
              <h3 className="text-xl font-bold mb-4">Navy (Primary)</h3>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 300, 500, 900].map((shade) => (
                  <div key={shade} className="text-center">
                    <div
                      className={`h-16 rounded-lg mb-2 bg-navy-${shade}`}
                    />
                    <span className="text-xs">{shade}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Gold Colors */}
            <motion.div
              variants={slideInRightVariants}
              initial="hidden"
              animate="visible"
              className="card"
            >
              <h3 className="text-xl font-bold mb-4">Gold (Secondary)</h3>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 300, 500, 900].map((shade) => (
                  <div key={shade} className="text-center">
                    <div
                      className={`h-16 rounded-lg mb-2 bg-gold-${shade}`}
                    />
                    <span className="text-xs">{shade}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 text-navy-900 dark:text-white">
            Typography
          </h2>
          <motion.div
            variants={scaleInVariants}
            initial="hidden"
            animate="visible"
            className="card space-y-4"
          >
            <h1 className="text-navy-900 dark:text-white">Heading 1 - Display Font</h1>
            <h2 className="text-navy-900 dark:text-white">Heading 2 - Display Font</h2>
            <h3 className="text-navy-900 dark:text-white">Heading 3 - Display Font</h3>
            <p className="text-base">
              Body text using Inter font family. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. This is the default paragraph text.
            </p>
            <p className="text-sm text-navy-600 dark:text-navy-300">
              Small text for captions and helper text.
            </p>
          </motion.div>
        </section>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 text-navy-900 dark:text-white">
            Buttons
          </h2>
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="card"
          >
            <div className="flex flex-wrap gap-4">
              <motion.button
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="btn-primary"
              >
                Primary Button
              </motion.button>
              <motion.button
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="btn-secondary"
              >
                Secondary Button
              </motion.button>
              <motion.button
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="btn-outline"
              >
                Outline Button
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* Badges Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 text-navy-900 dark:text-white">
            Badges
          </h2>
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            className="card"
          >
            <div className="flex flex-wrap gap-3">
              <span className="badge-primary">Primary</span>
              <span className="badge-secondary">Secondary</span>
              <span className="badge-success">Success</span>
              <span className="badge-warning">Warning</span>
              <span className="badge-error">Error</span>
            </div>
          </motion.div>
        </section>

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 text-navy-900 dark:text-white">
            Cards & Hover Effects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="card-hover"
            >
              <h3 className="text-xl font-bold mb-2">Hover Card</h3>
              <p>Hover over me for a lift effect!</p>
            </motion.div>

            <motion.div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Glass Effect</h3>
              <p>Light glass morphism</p>
            </motion.div>

            <motion.div className="glass-dark p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Dark Glass</h3>
              <p>Dark glass morphism</p>
            </motion.div>
          </div>
        </section>

        {/* Gradients Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 text-navy-900 dark:text-white">
            Gradients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-university-gradient rounded-xl flex items-center justify-center shadow-glow-navy">
              <span className="text-white font-bold text-2xl">University Gradient</span>
            </div>
            <div className="h-32 bg-gold-gradient rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-navy-900 font-bold text-2xl">Gold Gradient</span>
            </div>
          </div>
        </section>

        {/* Animations Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 text-navy-900 dark:text-white">
            Animations
          </h2>
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div
              variants={staggerItemVariants}
              className="card text-center"
            >
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="text-5xl mb-4"
              >
                🎈
              </motion.div>
              <h4 className="font-bold">Floating Animation</h4>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="card text-center"
            >
              <motion.div
                variants={pulseVariants}
                animate="animate"
                className="text-5xl mb-4"
              >
                💓
              </motion.div>
              <h4 className="font-bold">Pulse Animation</h4>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="card text-center"
            >
              <div className="text-5xl mb-4 animate-spin-slow">⚙️</div>
              <h4 className="font-bold">Spin Animation</h4>
            </motion.div>
          </motion.div>
        </section>

        {/* Shadows Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 text-navy-900 dark:text-white">
            Shadows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-soft">
              <h4 className="font-bold mb-2">Soft Shadow</h4>
              <p className="text-sm">Subtle elevation</p>
            </div>
            <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-soft-lg">
              <h4 className="font-bold mb-2">Large Soft Shadow</h4>
              <p className="text-sm">More elevation</p>
            </div>
            <div className="bg-gold-500 p-6 rounded-xl shadow-glow">
              <h4 className="font-bold mb-2">Glow Effect</h4>
              <p className="text-sm">Glowing shadow</p>
            </div>
          </div>
        </section>

        {/* Text Effects */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 text-navy-900 dark:text-white">
            Text Effects
          </h2>
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            className="card space-y-6"
          >
            <div>
              <h3 className="text-4xl font-display gradient-text">
                Navy Gradient Text
              </h3>
            </div>
            <div>
              <h3 className="text-4xl font-display gradient-text-gold">
                Gold Gradient Text
              </h3>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default ThemeDemo;
