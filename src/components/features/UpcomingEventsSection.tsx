import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useAnimation';

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  category: string;
  attendees: number;
}

const events: Event[] = [
  {
    id: 1,
    title: 'Annual Tech Summit 2026',
    description: 'Join us for a day of innovation, networking, and inspiring talks from industry leaders.',
    date: new Date('2026-03-15T09:00:00'),
    location: 'Main Auditorium',
    category: 'Conference',
    attendees: 500,
  },
  {
    id: 2,
    title: 'Spring Career Fair',
    description: 'Connect with top employers and explore career opportunities across various industries.',
    date: new Date('2026-03-25T10:00:00'),
    location: 'Sports Complex',
    category: 'Career',
    attendees: 1200,
  },
  {
    id: 3,
    title: 'Research Symposium',
    description: 'Showcase of groundbreaking research projects by faculty and graduate students.',
    date: new Date('2026-04-10T13:00:00'),
    location: 'Science Building',
    category: 'Academic',
    attendees: 300,
  },
  {
    id: 4,
    title: 'Cultural Festival',
    description: 'Celebrate diversity with performances, food, and exhibitions from around the world.',
    date: new Date('2026-04-22T11:00:00'),
    location: 'Campus Green',
    category: 'Cultural',
    attendees: 2000,
  },
];

interface CountdownProps {
  targetDate: Date;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <motion.div
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 text-lg font-bold text-white shadow-lg"
          >
            {String(value).padStart(2, '0')}
          </motion.div>
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400 capitalize">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

const UpcomingEventsSection: React.FC = () => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

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
            Upcoming Events
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Don't miss out on exciting campus activities
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-primary-500 to-gold-500 md:left-1/2" />

          {/* Events */}
          <div className="space-y-12">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <motion.div
                  className="absolute left-8 z-10 h-4 w-4 rounded-full bg-gold-500 shadow-lg md:left-1/2 md:-translate-x-1/2"
                  animate={{
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(255, 179, 71, 0.7)',
                      '0 0 0 10px rgba(255, 179, 71, 0)',
                      '0 0 0 0 rgba(255, 179, 71, 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />

                {/* Event Card */}
                <motion.div
                  className={`ml-20 w-full md:ml-0 md:w-5/12 ${
                    index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="group overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-xl dark:from-navy-800 dark:to-navy-700">
                    {/* Category Badge */}
                    <div className="mb-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                      {event.category}
                    </div>

                    {/* Event Title */}
                    <h3 className="mb-2 text-2xl font-bold text-navy-900 dark:text-white">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="mb-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{event.date.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{event.attendees} Expected Attendees</span>
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Starts in:
                      </p>
                      <Countdown targetDate={event.date} />
                    </div>

                    {/* Register Button */}
                    <motion.button
                      onClick={() => handleRegister(event)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full rounded-full bg-gradient-to-r from-gold-500 to-gold-600 py-3 font-semibold text-navy-900 shadow-lg hover:from-gold-600 hover:to-gold-700"
                    >
                      Register Now
                    </motion.button>

                    {/* Decorative Corner */}
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary-400/10 to-gold-400/10" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Events Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-navy-900 px-8 py-4 font-semibold text-white shadow-lg hover:bg-navy-800 dark:bg-white dark:text-navy-900 dark:hover:bg-gray-100"
          >
            View Calendar
          </motion.button>
        </motion.div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full rounded-2xl bg-white p-8 shadow-2xl dark:bg-navy-800"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-2xl font-bold text-navy-900 dark:text-white">
                Register for {selectedEvent.title}
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Complete registration form will be implemented here.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border-2 border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 py-3 font-semibold text-white hover:from-primary-700 hover:to-primary-800"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default UpcomingEventsSection;
