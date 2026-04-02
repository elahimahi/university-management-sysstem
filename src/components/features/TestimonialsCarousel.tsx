import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useAnimation';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  program: string;
  image: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Emma Thompson',
    role: 'Graduate Student',
    program: 'Computer Science',
    image: 'https://i.pravatar.cc/150?img=1',
    quote: 'The university provided me with world-class education and opportunities that shaped my career. The faculty support and research facilities are exceptional.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Alumni',
    program: 'Business Administration',
    image: 'https://i.pravatar.cc/150?img=13',
    quote: 'My time here was transformative. The diverse community and innovative teaching methods prepared me for real-world challenges in the business world.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Sarah Chen',
    role: 'Undergraduate',
    program: 'Engineering',
    image: 'https://i.pravatar.cc/150?img=5',
    quote: 'The hands-on learning approach and industry connections helped me land my dream internship. This university truly invests in student success.',
    rating: 5,
  },
  {
    id: 4,
    name: 'James Wilson',
    role: 'PhD Candidate',
    program: 'Research Studies',
    image: 'https://i.pravatar.cc/150?img=12',
    quote: 'Outstanding research facilities and mentorship. The collaborative environment here fosters innovation and academic excellence.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Priya Patel',
    role: 'Recent Graduate',
    program: 'Data Science',
    image: 'https://i.pravatar.cc/150?img=9',
    quote: 'The curriculum is cutting-edge and the professors are industry experts. I felt prepared from day one of my career.',
    rating: 5,
  },
];

const TestimonialsCarousel: React.FC = () => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-navy-800 dark:to-navy-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold text-navy-900 dark:text-white md:text-5xl">
            Student Testimonials
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Hear from our amazing community
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative mx-auto max-w-4xl">
          {/* Animated Quote Marks */}
          <motion.div
            className="absolute -left-8 -top-8 text-8xl text-primary-200 dark:text-primary-900 opacity-50"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            "
          </motion.div>

          <motion.div
            className="absolute -right-8 -bottom-8 text-8xl text-primary-200 dark:text-primary-900 opacity-50 rotate-180"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [175, 185, 175],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          >
            "
          </motion.div>

          {/* Main Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl dark:bg-navy-800 md:p-12">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {/* Profile Section */}
                <div className="mb-8 flex flex-col items-center gap-6 md:flex-row">
                  {/* Animated Profile Picture */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-gold-500"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="relative h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg dark:border-navy-700"
                    />
                  </motion.div>

                  {/* Name and Role */}
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-navy-900 dark:text-white">
                      {testimonials[currentIndex].name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {testimonials[currentIndex].role}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {testimonials[currentIndex].program}
                    </p>
                  </div>

                  {/* Star Rating */}
                  <div className="ml-auto flex gap-1">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-2xl text-gold-500"
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <motion.p
                  className="text-lg leading-relaxed text-gray-700 dark:text-gray-200 md:text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {testimonials[currentIndex].quote}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <div className="mt-8 flex items-center justify-between">
              <motion.button
                onClick={goToPrevious}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              {/* Dot Indicators */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => goToSlide(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-3 w-3 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-primary-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                onClick={goToNext}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Background Decoration */}
          <motion.div
            className="absolute -z-10 -right-12 top-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-primary-400/20 to-gold-400/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
