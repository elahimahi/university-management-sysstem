import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ForgotPasswordPage: React.FC = () => {
  const { notifications, remove } = useNotifications();
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-md w-full z-10"
        >
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] p-10">
            <div className="text-center mb-10">
              <motion.h2 variants={itemVariants} className="text-4xl font-black text-white tracking-tight">
                Reset Password
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-400 mt-3 font-medium">
                {submitted ? 'Check your email' : 'Enter your email to reset your password'}
              </motion.p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={itemVariants} className="relative">
                  <label className="text-xs text-gray-400 font-semibold mb-2 block">Email Address</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <Mail size={18} className="text-gray-500" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="your@university.edu"
                      className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-black rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </motion.button>

                <motion.div variants={itemVariants} className="pt-6 border-t border-white/10">
                  <Link to="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} /> Back to Login
                  </Link>
                </motion.div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center mb-6"
                >
                  <CheckCircle size={64} className="text-emerald-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">Email Sent!</h3>
                <p className="text-gray-400 mb-6">
                  Check your email for a link to reset your password. If you don't see it, check your spam folder.
                </p>
                <p className="text-sm text-gray-500">Redirecting to login...</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordPage;
