import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useAnimation';

interface Program {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  students: string;
  category: string;
}

const programs: Program[] = [
  {
    id: 1,
    title: 'Computer Science',
    description: 'Cutting-edge curriculum covering AI, machine learning, and software development.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
    duration: '4 Years',
    students: '2,500+',
    category: 'Technology',
  },
  {
    id: 2,
    title: 'Business Administration',
    description: 'Comprehensive business education with focus on leadership and entrepreneurship.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    duration: '4 Years',
    students: '3,200+',
    category: 'Business',
  },
  {
    id: 3,
    title: 'Engineering',
    description: 'World-class engineering programs with state-of-the-art labs and research facilities.',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
    duration: '4 Years',
    students: '4,100+',
    category: 'Engineering',
  },
];

const FeaturedProgramsSection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 bg-white dark:bg-navy-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold text-navy-900 dark:text-white md:text-5xl">
            Featured Programs
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Explore our most popular academic programs
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-navy-800"
            >
              {/* Image Container with Zoom Effect */}
              <div className="relative h-64 overflow-hidden">
                <motion.img
                  src={program.image}
                  alt={program.title}
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900">
                  {program.category}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content with Slide-up Animation */}
              <div className="p-6">
                <h3 className="mb-3 text-2xl font-bold text-navy-900 dark:text-white">
                  {program.title}
                </h3>

                {/* Description that slides up on hover */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  whileHover={{ height: 'auto', opacity: 1 }}
                  className="overflow-hidden"
                >
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {program.description}
                  </p>
                </motion.div>

                {/* Program Details */}
                <div className="mb-4 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{program.students} Students</span>
                  </div>
                </div>

                {/* Learn More Link with Arrow Animation */}
                <motion.a
                  href="#"
                  className="group/link inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold"
                  whileHover={{ x: 5 }}
                >
                  Learn More
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    →
                  </motion.span>
                </motion.a>
              </div>

              {/* Decorative Element */}
              <motion.div
                className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary-400/20 to-gold-400/20"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* View All Programs Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4 font-semibold text-white shadow-lg hover:from-primary-700 hover:to-primary-800"
          >
            View All Programs
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProgramsSection;
