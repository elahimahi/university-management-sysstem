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
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const rawTranId =
        searchParams.get('tran_id') ||
        searchParams.get('transaction_id') ||
        searchParams.get('transactionId') ||
        searchParams.get('txnid');
      const pendingTranId = window.sessionStorage.getItem('pendingTransactionId');
      const status =
        searchParams.get('status') ||
        searchParams.get('payment_status') ||
        searchParams.get('paymentStatus') ||
        searchParams.get('status_code');

      const tranId = rawTranId || pendingTranId;

      if (!tranId) {
        setStatus('failed');
        setMessage('Transaction ID missing');
        setVerifying(false);
        return;
      }

      setTransactionId(tranId);

      const verifyAttempt = async (transactionIdToVerify: string) => {
        const token = getAccessToken();
        return axios.post(
          `${API_BASE_URL}/payment/verify`,
          { transaction_id: transactionIdToVerify, status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      };

      try {
        let response = await verifyAttempt(tranId);

        if (!response.data.success && response.data.error === 'Transaction not found' && pendingTranId && pendingTranId !== tranId) {
          console.warn('Primary transaction ID not found, retrying with pendingTransactionId:', pendingTranId);
          setTransactionId(pendingTranId);
          response = await verifyAttempt(pendingTranId);
        }

        if (response.data.success) {
          setStatus('success');
          setMessage('✓ Payment confirmed! Your fee has been updated.');
          window.sessionStorage.removeItem('pendingTransactionId');
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
            <p className="text-gray-600 mb-4">{message}</p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {transactionId && (
          <p className="text-sm text-gray-500 mb-4">Transaction ID: <span className="font-semibold text-gray-900">{transactionId}</span></p>
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