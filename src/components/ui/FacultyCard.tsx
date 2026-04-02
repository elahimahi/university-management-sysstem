import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FacultyCardProps {
  name: string;
  designation: string;
  department: string;
  email: string;
  phone?: string;
  image?: string;
  specialization?: string[];
  onClick?: () => void;
}

const FacultyCard: React.FC<FacultyCardProps> = ({
  name,
  designation,
  department,
  email,
  phone,
  image,
  specialization = [],
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="card-hover cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Image Container with Reveal Effect */}
      <div className="relative h-64 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-navy-200 to-gold-200 dark:from-navy-700 dark:to-navy-800">
        {image ? (
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-navy-900 dark:bg-gold-500 flex items-center justify-center text-white dark:text-navy-900">
              <span className="text-5xl font-bold">
                {name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
        )}
        
        {/* Overlay on Hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-navy-900/80 flex items-center justify-center"
        >
          <span className="text-white font-semibold">View Profile</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-display font-bold text-navy-900 dark:text-white">
            {name}
          </h3>
          <p className="text-gold-600 dark:text-gold-500 font-semibold">{designation}</p>
          <p className="text-sm text-navy-600 dark:text-navy-400">{department}</p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 pt-3 border-t border-navy-200 dark:border-navy-700">
          <div className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{email}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{phone}</span>
            </div>
          )}
        </div>

        {/* Specialization Tags */}
        {specialization.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3">
            {specialization.map((spec, index) => (
              <span key={index} className="badge-primary text-xs">
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyCard;
