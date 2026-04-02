import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator,
}) => {
  const defaultSeparator = (
    <svg className="w-4 h-4 text-navy-400 dark:text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link to={item.href}>
                <motion.div
                  whileHover={{ y: -1 }}
                  className="flex items-center gap-2 text-navy-600 dark:text-navy-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                >
                  {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            ) : (
              <div className={`flex items-center gap-2 ${
                isLast 
                  ? 'text-navy-900 dark:text-white font-semibold' 
                  : 'text-navy-600 dark:text-navy-400'
              }`}>
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
            )}

            {/* Separator */}
            {!isLast && (
              <span className="flex-shrink-0">
                {separator || defaultSeparator}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
