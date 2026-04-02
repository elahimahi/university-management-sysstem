import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import TestimonialsCarousel from '../components/features/TestimonialsCarousel';

const AboutPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="min-h-screen bg-white dark:bg-navy-900 p-8"
  >
    <h1 className="text-3xl font-bold mb-4">About Encrypt University</h1>
    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Encrypt University is dedicated to excellence in teaching, learning, and research. Hear from our students and faculty below.</p>
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl shadow-lg bg-gradient-to-br from-gold-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 flex flex-col gap-4 border border-gold-100 dark:border-navy-700">
          <div className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-200">
            <Mail className="w-5 h-5 text-primary-600" />
            <span>Email:</span>
            <a href="mailto:info@encryptuniversity.edu" className="text-primary-600 hover:underline font-semibold">info@encryptuniversity.edu</a>
          </div>
          <div className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-200">
            <Phone className="w-5 h-5 text-primary-600" />
            <span>Phone:</span>
            <a href="tel:+1234567890" className="text-primary-600 hover:underline font-semibold">+1 (234) 567-890</a>
          </div>
          <div className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-200">
            <MapPin className="w-5 h-5 text-primary-600" />
            <span>Address:</span>
            <span className="font-semibold">123 University Ave, City, Country</span>
          </div>
          <div className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-200">
            <Clock className="w-5 h-5 text-primary-600" />
            <span>Office Hours:</span>
            <span className="font-semibold">Mon-Fri, 9:00 AM - 5:00 PM</span>
          </div>
        </div>
        <div className="rounded-xl shadow-lg bg-gradient-to-br from-primary-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-primary-100 dark:border-navy-700 flex flex-col justify-center">
          <h3 className="text-xl font-semibold mb-2 text-primary-700 dark:text-primary-300">We're here to help!</h3>
          <p className="text-md text-gray-600 dark:text-gray-300">Reach out to us for admissions, support, or any questions about Encrypt University. Our team is ready to assist you.</p>
        </div>
      </div>
    </div>
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-2">Other Information</h2>
      <ul className="list-disc pl-6 text-md text-gray-700 dark:text-gray-200">
        <li>Accredited by the National Education Board</li>
        <li>Over 10,000 students enrolled</li>
        <li>Modern campus with state-of-the-art facilities</li>
        <li>Active student clubs and organizations</li>
        <li>International exchange programs available</li>
      </ul>
    </div>
    <TestimonialsCarousel />
  </motion.div>
);

export default AboutPage;
