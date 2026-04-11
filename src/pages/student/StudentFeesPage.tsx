import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StudentFeesPage: React.FC = () => {
  const { notifications, remove } = useNotifications();

  const fees = [
    { description: 'Tuition (Fall 2024)', amount: 5000, status: 'paid', dueDate: '2024-08-15' },
    { description: 'Library + Activities', amount: 300, status: 'paid', dueDate: '2024-08-15' },
    { description: 'Tuition (Spring 2025)', amount: 5000, status: 'pending', dueDate: '2025-01-10' },
    { description: 'Accommodation', amount: 2500, status: 'pending', dueDate: '2025-01-10' },
  ];

  const getStatusConfig = (status: string) => {
    return status === 'paid'
      ? { icon: CheckCircle, color: 'bg-green-500/20 border-green-500/40 text-green-300', label: 'Paid' }
      : { icon: AlertCircle, color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300', label: 'Pending' };
  };

  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <CreditCard size={32} className="text-emerald-400" /> My Fees
            </h1>
            <p className="text-gray-400">View and manage your student fees</p>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {[
              { label: 'Total Due', amount: `$${totalAmount}`, color: 'from-blue-500 to-cyan-500' },
              { label: 'Paid Amount', amount: `$${paidAmount}`, color: 'from-green-500 to-emerald-500' },
              { label: 'Pending Amount', amount: `$${pendingAmount}`, color: 'from-orange-500 to-red-500' },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${card.color} bg-opacity-10 backdrop-blur`}
              >
                <p className="text-gray-400 mb-2">{card.label}</p>
                <h3 className="text-3xl font-bold text-white">{card.amount}</h3>
              </motion.div>
            ))}
          </motion.div>

          {/* Fees List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {fees.map((fee, idx) => {
              const config = getStatusConfig(fee.status);
              const Icon = config.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{fee.description}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock size={16} /> Due: {new Date(fee.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white mb-2">${fee.amount}</p>
                      <div className={`px-4 py-2 rounded-lg border ${config.color} flex items-center gap-2 justify-end`}>
                        <Icon size={16} />
                        <span className="font-semibold">{config.label}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex gap-4 flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              Pay Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 md:flex-none px-8 py-3 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
            >
              Download Receipt
            </motion.button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentFeesPage;
