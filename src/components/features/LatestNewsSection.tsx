import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useAnimation';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  author: string;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: 'University Launches New AI Research Center',
    excerpt: 'State-of-the-art facility to advance artificial intelligence and machine learning research.',
    date: '2026-02-15',
    category: 'Research',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    author: 'Dr. Sarah Johnson',
  },
  {
    id: 2,
    title: 'Students Win International Hackathon',
    excerpt: 'Team showcases innovative solutions for sustainable energy at global competition.',
    date: '2026-02-12',
    category: 'Achievement',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
    author: 'Prof. Michael Chen',
  },
  {
    id: 3,
    title: 'New Scholarship Program Announced',
    excerpt: '$2M fund established to support underprivileged students pursuing STEM degrees.',
    date: '2026-02-10',
    category: 'News',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop',
    author: 'Admin Office',
  },
  {
    id: 4,
    title: 'Campus Sustainability Initiative',
    excerpt: 'University commits to carbon neutrality by 2030 with comprehensive green plan.',
    date: '2026-02-08',
    category: 'Campus',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    author: 'Dr. Emily Parker',
  },
  {
    id: 5,
    title: 'Virtual Reality Lab Opens',
    excerpt: 'Cutting-edge VR technology available for students across all disciplines.',
    date: '2026-02-05',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&h=400&fit=crop',
    author: 'Tech Department',
  },
];

const categories = ['All', 'Research', 'Achievement', 'News', 'Campus', 'Technology'];

const LatestNewsSection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isDragging, setIsDragging] = useState(false);

  const filteredNews = activeCategory === 'All' 
    ? newsItems 
    : newsItems.filter(item => item.category === activeCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-navy-800 dark:to-navy-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h2 className="text-4xl font-bold text-navy-900 dark:text-white md:text-5xl">
            Latest News
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Stay updated with campus happenings
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap justify-center gap-3"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-full px-6 py-2 font-semibold transition-all ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-navy-700 dark:text-gray-200 dark:hover:bg-navy-600'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 dark:bg-navy-700 dark:hover:bg-navy-600 hidden md:block"
          >
            <svg className="h-6 w-6 text-navy-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 dark:bg-navy-700 dark:hover:bg-navy-600 hidden md:block"
          >
            <svg className="h-6 w-6 text-navy-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Scrollable News Cards */}
          <motion.div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            drag="x"
            dragConstraints={{ left: -1000, right: 0 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
          >
            {filteredNews.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="group relative min-w-[350px] cursor-pointer overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-navy-800 md:min-w-[400px]"
                whileHover={{ y: -10 }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 right-4 rounded-lg bg-gold-500 px-3 py-2 text-sm font-bold text-navy-900 shadow-lg">
                    {formatDate(news.date)}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy-900 backdrop-blur-sm">
                    {news.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-navy-900 dark:text-white line-clamp-2">
                    {news.title}
                  </h3>
                  
                  <p className="mb-4 text-gray-600 dark:text-gray-300 line-clamp-2">
                    {news.excerpt}
                  </p>

                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>✍️</span>
                    <span>{news.author}</span>
                  </div>

                  {/* Read More Link with Underline Animation */}
                  <motion.a
                    href="#"
                    className="group/link relative inline-block font-semibold text-primary-600 dark:text-primary-400"
                    onClick={(e) => !isDragging && e.preventDefault()}
                  >
                    Read More
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-600 dark:bg-primary-400"
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LatestNewsSection;
