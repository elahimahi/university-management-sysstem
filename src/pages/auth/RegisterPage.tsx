import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData, UserRole } from '../../types/auth.types';
import { calculatePasswordStrength } from '../../utils/auth.utils';

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.string().refine((val) => ['student', 'faculty', 'admin'].includes(val), {
      message: 'Invalid role selected',
    }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const STEPS = [
  { id: 1, title: 'Account', icon: '👤' },
  { id: 2, title: 'Role', icon: '🎓' },
  { id: 3, title: 'Photo', icon: '📸' },
  { id: 4, title: 'Verify', icon: '✅' },
];

const ROLES: { value: UserRole; label: string; description: string; icon: string }[] = [
  { value: 'student', label: 'Student', description: 'Access courses and grades', icon: '🎓' },
  { value: 'faculty', label: 'Faculty', description: 'Manage courses and records', icon: '👨‍🏫' },
  { value: 'admin', label: 'Admin', description: 'System management', icon: '⚙️' },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Redirection if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      let targetPath = '/student/dashboard';
      if (user.role === 'faculty') targetPath = '/faculty/dashboard';
      else if (user.role === 'admin') targetPath = '/admin/dashboard';
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      agreeToTerms: false,
    },
  });

  const password = watch('password');
  const role = watch('role');
  const passwordStrength = calculatePasswordStrength(password);

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) isValid = await trigger(['email', 'firstName', 'lastName', 'password', 'confirmPassword']);
    else if (currentStep === 2) isValid = await trigger(['role']);
    else if (currentStep === 3) isValid = true;
    else if (currentStep === 4) isValid = await trigger(['agreeToTerms']);

    if (isValid && currentStep < STEPS.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const registerData: RegisterData = { 
        ...data, 
        role: data.role as UserRole, 
        profilePicture: (data.role === 'admin' && profilePicture) ? profilePicture : undefined 
      };
      const response = await registerUser(registerData);

      // Small delay to ensure state propagation
      setTimeout(() => {
        const userRole = response.user.role?.toLowerCase();
        let targetPath = '/student/dashboard';
        if (userRole === 'faculty') targetPath = '/faculty/dashboard';
        else if (userRole === 'admin') targetPath = '/admin/dashboard';
        navigate(targetPath, { replace: true });
      }, 100);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">Create Account</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <input {...register('firstName')} placeholder="First Name" className={`w-full bg-white/5 border ${errors.firstName ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#FFB347] transition-all`} />
                {errors.firstName && <p className="text-red-500 text-[10px] ml-1">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1">
                <input {...register('lastName')} placeholder="Last Name" className={`w-full bg-white/5 border ${errors.lastName ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#FFB347] transition-all`} />
                {errors.lastName && <p className="text-red-500 text-[10px] ml-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <input {...register('email')} placeholder="Email" className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#FFB347] transition-all`} />
              {errors.email && <p className="text-red-500 text-[10px] ml-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <input {...register('password')} type="password" placeholder="Password" className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#FFB347] transition-all`} />
              {errors.password && <p className="text-red-500 text-[10px] ml-1">{errors.password.message}</p>}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Strength: {passwordStrength.label}</span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`flex-1 rounded-full ${i <= (passwordStrength.score || 0) ? passwordStrength.color : 'bg-white/5'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <input {...register('confirmPassword')} type="password" placeholder="Confirm Password" className={`w-full bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#FFB347] transition-all`} />
              {errors.confirmPassword && <p className="text-red-500 text-[10px] ml-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">Select Role</h3>
            {ROLES.map((r) => (
              <div
                key={r.value}
                onClick={() => setValue('role', r.value)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${role === r.value ? 'border-[#FFB347] bg-[#FFB347]/10' : 'border-white/10 hover:border-white/20'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <h4 className="font-bold text-white">{r.label}</h4>
                    <p className="text-xs text-gray-400">{r.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Upload Photo</h3>
            <p className="text-gray-400 text-sm mb-6">
              {role === 'admin' ? 'Add a professional photo for your admin profile' : 'Profile photo upload is only available for admin accounts'}
            </p>
            {role === 'admin' ? (
              <div className="relative group mx-auto w-32 h-32">
                <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-[#FFB347]/50 transition-all bg-white/5 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-gray-600">👤</span>
                  )}
                </div>
                <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="absolute -bottom-2 -right-2 bg-[#FFB347] p-2 rounded-lg shadow-lg">
                  <span className="text-xs">📸</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
                <span className="text-4xl text-gray-600">👤</span>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Verification</h3>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-start gap-4">
                <input {...register('agreeToTerms')} type="checkbox" className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5 text-[#FFB347] focus:ring-[#FFB347]" />
                <div className="text-sm text-gray-400">
                  <p className="text-white font-bold mb-1">Accept Terms & Conditions</p>
                  I agree to follow the university's academic code of conduct and privacy policy.
                </div>
              </div>
              {errors.agreeToTerms && <p className="text-red-500 text-xs mt-2">{errors.agreeToTerms.message}</p>}
            </div>
            {Object.keys(errors).length > 0 && currentStep === 4 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-500 text-xs font-bold">Please fix errors in previous steps before completing.</p>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b18] py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFB347]/10 blur-[120px] rounded-full"></div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-2xl w-full z-10">
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex justify-between mb-12">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${currentStep >= s.id ? 'border-[#FFB347] text-[#FFB347]' : 'border-white/10 text-gray-600'}`}>{s.icon}</div>
                <span className="text-[10px] mt-2 uppercase tracking-widest text-gray-500">{s.title}</span>
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-4 mt-12">
              {currentStep > 1 && (
                <button type="button" onClick={handleBack} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all">
                  Back
                </button>
              )}
              {currentStep < 4 ? (
                <button type="button" onClick={handleNext} className="flex-1 py-4 bg-[#FFB347] rounded-2xl text-[#050b18] font-black hover:scale-[1.02] transition-all">
                  Next
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-[#FFB347] rounded-2xl text-[#050b18] font-black hover:scale-[1.02] transition-all disabled:opacity-50">
                  {isLoading ? 'Processing...' : 'Complete Register'}
                </button>
              )}
            </div>
          </form>
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-white font-bold ml-1 hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
