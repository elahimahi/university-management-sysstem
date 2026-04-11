import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Loader, ShoppingCart, ArrowLeft } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface Fee {
  id: number;
  fee_name: string;
  amount: number;
  due_date: string;
}

interface PaymentFormData {
  card_holder_name: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  gateway: 'sslcommerz' | 'stripe';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const StudentPaymentPageProfessional: React.FC = () => {
  const { feeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [fee, setFee] = useState<Fee | null>(location.state?.fee || null);
  const [loading, setLoading] = useState(!fee);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'review' | 'payment'>('review');
  
  const [formData, setFormData] = useState<PaymentFormData>({
    card_holder_name: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    gateway: 'sslcommerz',
  });

  useEffect(() => {
    if (!fee) {
      fetchFeeDetails();
    }
  }, [feeId, fee]);

  const fetchFeeDetails = async () => {
    try {
      setLoading(true);
      if (!user?.id || !feeId) return;

      const response = await apiService.get(`/student/get_fee_detail.php?fee_id=${feeId}&student_id=${user.id}`) as any;
      const feeData = response?.data?.fee || null;
      
      if (feeData) {
        setFee(feeData);
      } else {
        showError('Fee not found');
        navigate('/student/fees');
      }
    } catch (error) {
      console.error('Failed to fetch fee:', error);
      showError('Failed to load fee details');
      navigate('/student/fees');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.card_holder_name || !formData.card_number || !formData.card_expiry || !formData.card_cvv) {
      showError('Please fill in all payment details');
      return;
    }

    try {
      setProcessing(true);

      const payload = {
        fee_id: feeId,
        student_id: user?.id,
        amount: fee?.amount,
        gateway: formData.gateway,
        card_holder_name: formData.card_holder_name,
        card_last_four: formData.card_number.slice(-4),
        transaction_id: `TXN-${Date.now()}`,
      };

      const response = await apiService.post('/student/process_payment.php', payload) as any;

      if (response?.success) {
        showSuccess('Payment processed successfully!');
        
        // Simulate payment redirect and return
        setTimeout(() => {
          navigate('/student/fees', { 
            state: { 
              paymentSuccess: true, 
              transactionId: payload.transaction_id 
            } 
          });
        }, 2000);
      } else {
        showError('Payment processing failed: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      showError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <PageTransition variant="fade">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 flex items-center justify-center p-4">
          <Loader className="text-cyan-400 animate-spin" size={48} />
        </div>
      </PageTransition>
    );
  }

  if (!fee) {
    return (
      <PageTransition variant="fade">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 flex items-center justify-center p-4">
          <motion.div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="text-2xl font-bold text-white mb-2">Fee Not Found</h3>
            <button
              onClick={() => navigate('/student/fees')}
              className="mt-6 px-6 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600"
            >
              Back to Fees
            </button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl mx-auto">
          {/* Back Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/student/fees')}
            className="mb-8 flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={18} />
            Back to Fees
          </motion.button>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-3 flex items-center gap-3">
              <CreditCard size={40} className="text-cyan-400" />
              Payment
            </h1>
            <p className="text-gray-400">Complete your fee payment securely</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Step Indicator */}
                <div className="flex gap-4 mb-8">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setPaymentStep('review')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      paymentStep === 'review'
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Review
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setPaymentStep('payment')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      paymentStep === 'payment'
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Payment
                  </motion.button>
                </div>

                {/* Review Step */}
                {paymentStep === 'review' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <h3 className="text-lg font-bold text-white">Payment Details</h3>
                      
                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-gray-300">Fee Name:</span>
                        <span className="font-semibold text-white">{fee.fee_name}</span>
                      </div>

                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-gray-300">Amount:</span>
                        <span className="text-2xl font-bold text-cyan-300">৳{fee.amount.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center py-4">
                        <span className="text-gray-300">Due Date:</span>
                        <span className="font-semibold text-white">{new Date(fee.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6">
                      <p className="text-green-200 flex items-center gap-2">
                        <CheckCircle size={20} />
                        Secure payment processing via SSL encrypted connection
                      </p>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentStep('payment')}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      Proceed to Payment
                    </motion.button>
                  </motion.div>
                )}

                {/* Payment Step */}
                {paymentStep === 'payment' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Payment Gateway Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Select Payment Method</label>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setFormData({ ...formData, gateway: 'sslcommerz' })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.gateway === 'sslcommerz'
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                          }`}
                        >
                          <CreditCard className="mx-auto mb-2" size={24} />
                          <p className="font-semibold text-sm">SSLCommerz</p>
                          <p className="text-xs text-gray-400 mt-1">Debit/Credit Card</p>
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setFormData({ ...formData, gateway: 'stripe' })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.gateway === 'stripe'
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                          }`}
                        >
                          <DollarSign className="mx-auto mb-2" size={24} />
                          <p className="font-semibold text-sm">Stripe</p>
                          <p className="text-xs text-gray-400 mt-1">International</p>
                        </motion.button>
                      </div>
                    </div>

                    {/* Card Holder Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Cardholder Name *</label>
                      <input
                        type="text"
                        value={formData.card_holder_name}
                        onChange={(e) => setFormData({ ...formData, card_holder_name: e.target.value })}
                        placeholder="Full name as on card"
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
                      />
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Card Number *</label>
                      <input
                        type="text"
                        value={formData.card_number}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').slice(0, 16);
                          const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                          setFormData({ ...formData, card_number: formatted });
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                      />
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          value={formData.card_expiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2);
                            }
                            setFormData({ ...formData, card_expiry: value });
                          }}
                          placeholder="MM/YY"
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">CVV *</label>
                        <input
                          type="password"
                          value={formData.card_cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setFormData({ ...formData, card_cvv: value });
                          }}
                          placeholder="123"
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
                        />
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                      <p className="text-blue-200 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        Your card information is secure and never stored on our servers.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={processing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          Pay ৳{fee.amount.toLocaleString()}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Fee Summary Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 sticky top-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <ShoppingCart size={20} className="text-cyan-400" />
                  Order Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Fee Type:</span>
                    <span className="text-white font-semibold">{fee.fee_name}</span>
                  </div>

                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-xl font-bold text-cyan-300">৳{fee.amount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Processing Fee:</span>
                    <span className="text-white">FREE</span>
                  </div>

                  <div className="flex justify-between py-4 bg-white/5 rounded-lg px-4 border border-white/10">
                    <span className="text-white font-bold">Total:</span>
                    <span className="text-2xl font-bold text-green-400">৳{fee.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    ⚠️ This is a demo payment. No actual charge will be made.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default StudentPaymentPageProfessional;
