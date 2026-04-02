import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'bordered';
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'underline',
}) => {
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultTab || tabs[0]?.id);
  
  // Use controlled tab if provided, otherwise use uncontrolled
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : uncontrolledActiveTab;

  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      // Uncontrolled mode
      setUncontrolledActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className={`
        flex gap-2
        ${variant === 'underline' ? 'border-b-2 border-navy-200 dark:border-navy-700' : ''}
        ${variant === 'bordered' ? 'border-2 border-navy-200 dark:border-navy-700 rounded-lg p-1 bg-navy-50 dark:bg-navy-800' : ''}
      `}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              whileHover={!tab.disabled ? { y: -2 } : {}}
              whileTap={!tab.disabled ? { scale: 0.98 } : {}}
              className={`
                relative px-4 py-2 rounded-lg font-medium transition-colors
                flex items-center gap-2
                ${
                  variant === 'underline'
                    ? isActive
                      ? 'text-gold-600 dark:text-gold-400'
                      : 'text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white'
                    : variant === 'pills'
                    ? isActive
                      ? 'bg-gold-500 text-white'
                      : 'text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-700'
                    : variant === 'bordered'
                    ? isActive
                      ? 'bg-white dark:bg-navy-900 text-gold-600 dark:text-gold-400 shadow-md'
                      : 'text-navy-700 dark:text-navy-200 hover:text-navy-900 dark:hover:text-white'
                    : ''
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
              <span>{tab.label}</span>

              {/* Underline Animation */}
              {variant === 'underline' && isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="mt-4"
      >
        {activeTabData?.content}
      </motion.div>
    </div>
  );
};

export default Tabs;
