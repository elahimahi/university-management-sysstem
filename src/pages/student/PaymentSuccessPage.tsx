import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/app.constants';
import { getAccessToken } from '../../utils/auth.utils';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const tranId = searchParams.get('tran_id');
      const status = searchParams.get('status');

      if (!tranId) {
        setStatus('failed');
        setMessage('Transaction ID missing');
        setVerifying(false);
        return;
      }

      try {
        const token = getAccessToken();
        const response = await axios.post(
          `${API_BASE_URL}/payment/verify`,
          { transaction_id: tranId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setStatus('success');
          setMessage('Payment completed successfully!');
        } else {
          setStatus('failed');
          setMessage(response.data.error || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('failed');
        setMessage('Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/student/fees');
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full"
        >
          <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full"
      >
        {status === 'success' ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Fees
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;