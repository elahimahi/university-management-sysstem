import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useAnimation';

interface StatData {
  icon: string;
  value: number;
  label: string;
  suffix?: string;
}

const stats: StatData[] = [
  { icon: '🎓', value: 15000, label: 'Students Enrolled', suffix: '+' },
  { icon: '👨‍🏫', value: 500, label: 'Expert Faculty', suffix: '+' },
  { icon: '📚', value: 120, label: 'Programs Offered', suffix: '+' },
  { icon: '🏆', value: 95, label: 'Satisfaction Rate', suffix: '%' },
];

interface CountUpProps {
  end: number;
  duration?: number;
  isInView: boolean;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 2, isInView, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const StatsCounterSection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-navy-900 dark:to-navy-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold text-navy-900 dark:text-white md:text-5xl">
            Our Impact in Numbers
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Transforming lives through quality education
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg dark:bg-navy-800"
            >
              {/* Gradient Border on Hover */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 to-gold-500 opacity-0 group-hover:opacity-100"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '2px' }}
              >
                <div className="h-full w-full rounded-2xl bg-white dark:bg-navy-800" />
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                {/* Animated Icon */}
                <motion.div
                  className="mb-4 text-6xl"
                  animate={{
                    scale: isInView ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: index * 0.2,
                  }}
                >
                  {stat.icon}
                </motion.div>

                {/* Animated Counter */}
                <div className="mb-2 text-4xl font-bold text-navy-900 dark:text-white">
                  <CountUp end={stat.value} isInView={isInView} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>

                {/* Pulse Effect */}
                <motion.div
                  className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-r from-primary-400/20 to-gold-400/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounterSection;
