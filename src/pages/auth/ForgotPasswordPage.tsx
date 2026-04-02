import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} from '../../services/auth.service';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Handle Email Submission
  const handleEmailSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      await requestPasswordReset({ email: data.email });
      setEmail(data.email);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP({ email, otp: otpString });
      if (result.valid) {
        toast.success('OTP verified successfully!');
        setStep(3);
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    try {
      await resetPassword({
        email,
        otp: otp.join(''),
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Password reset successfully!');
      setStep(4);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-primary-800 to-navy-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 -right-40 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full"
      >
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block p-3 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full mb-4"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white">
              {step === 1 && 'Forgot Password?'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'Reset Password'}
              {step === 4 && 'Success!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {step === 1 && "Enter your email and we'll send you an OTP"}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Create a new password for your account'}
              {step === 4 && 'Your password has been reset successfully'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Email Input */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                className="space-y-6"
              >
                <div>
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 border-2 rounded-lg ${
                      emailForm.formState.errors.email
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:border-primary-500 dark:bg-navy-700 dark:text-white`}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          const prevInput = document.getElementById(`otp-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      maxLength={1}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-navy-700 dark:text-white"
                    />
                  ))}
                </div>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  OTP sent to <span className="font-semibold">{email}</span>
                </p>

                <motion.button
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => handleEmailSubmit({ email })}
                  className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold"
                >
                  Resend OTP
                </button>
              </motion.div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={passwordForm.handleSubmit(handlePasswordReset)}
                className="space-y-6"
              >
                <div>
                  <input
                    {...passwordForm.register('newPassword')}
                    type="password"
                    placeholder="New Password"
                    className={`w-full px-4 py-3 border-2 rounded-lg ${
                      passwordForm.formState.errors.newPassword
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:border-primary-500 dark:bg-navy-700 dark:text-white`}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    {...passwordForm.register('confirmPassword')}
                    type="password"
                    placeholder="Confirm New Password"
                    className={`w-full px-4 py-3 border-2 rounded-lg ${
                      passwordForm.formState.errors.confirmPassword
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:border-primary-500 dark:bg-navy-700 dark:text-white`}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Resetting Password...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-6"
                >
                  <svg
                    className="w-16 h-16 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>

                <h3 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">
                  Password Reset Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You can now sign in with your new password
                </p>

                <Link
                  to="/login"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg transition-all"
                >
                  Go to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          {step < 4 && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
