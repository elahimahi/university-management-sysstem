import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

interface SidebarProps {
  items: MenuItem[];
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  items,
  isCollapsed = false,
  onToggle,
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    return href && location.pathname === href;
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.href);

    return (
      <div key={item.label}>
        {item.href ? (
          <Link to={item.href}>
            <motion.div
              whileHover={{ x: 4 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                transition-colors
                ${active 
                  ? 'bg-gold-100 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400' 
                  : 'text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-800'
                }
                ${depth > 0 ? 'ml-4' : ''}
              `}
            >
              <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
              {!isCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </motion.div>
          </Link>
        ) : (
          <motion.div
            whileHover={{ x: 4 }}
            onClick={() => hasChildren && toggleItem(item.label)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
              transition-colors text-navy-700 dark:text-navy-200
              hover:bg-navy-100 dark:hover:bg-navy-800
              ${depth > 0 ? 'ml-4' : ''}
            `}
          >
            <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="flex-1 font-medium truncate">{item.label}</span>
                {hasChildren && (
                  <motion.svg
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Submenu */}
        {hasChildren && !isCollapsed && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 mt-1">
                  {item.children?.map(child => renderMenuItem(child, depth + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-16 bottom-0 bg-white dark:bg-navy-900 border-r border-navy-200 dark:border-navy-800 overflow-y-auto"
    >
      <div className="p-4">
        {/* Toggle Button */}
        {onToggle && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="w-full mb-4 p-2 rounded-lg bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-200 hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors flex items-center justify-center"
          >
            <motion.svg
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </motion.svg>
          </motion.button>
        )}

        {/* Menu Items */}
        <motion.div
          variants={{
            show: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          initial="hidden"
          animate="show"
          className="space-y-1"
        >
          {items.map(item => renderMenuItem(item))}
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
