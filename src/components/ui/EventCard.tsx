import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface EventCardProps {
  title: string;
  description: string;
  date: Date;
  location: string;
  category: string;
  attendees?: number;
  image?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  description,
  date,
  location,
  category,
  attendees,
  image,
  status = 'upcoming',
  onClick,
}) => {
  const statusColors = {
    upcoming: 'bg-info-100 text-info-700 dark:bg-info-900 dark:text-info-100',
    ongoing: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-100',
    completed: 'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-100',
  };

  const day = format(date, 'd');
  const month = format(date, 'MMM');
  const time = format(date, 'h:mm a');

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card-hover cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Date Badge */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg flex flex-col items-center justify-center text-white shadow-glow"
        >
          <span className="text-2xl font-bold">{day}</span>
          <span className="text-xs uppercase font-semibold">{month}</span>
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-display font-bold text-navy-900 dark:text-white group-hover:text-gold-600 transition-colors">
              {title}
            </h3>
            <span className={`badge ${statusColors[status]} text-xs whitespace-nowrap`}>
              {status}
            </span>
          </div>

          <p className="text-sm text-navy-600 dark:text-navy-300 mb-3 line-clamp-2">
            {description}
          </p>

          {/* Event Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-400">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{time}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-400">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{location}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="badge-primary text-xs">{category}</span>
              {attendees !== undefined && (
                <div className="flex items-center gap-1 text-sm text-navy-600 dark:text-navy-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{attendees}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Optional Image */}
      {image && (
        <div className="mt-4 h-32 rounded-lg overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </motion.div>
  );
};

export default EventCard;
