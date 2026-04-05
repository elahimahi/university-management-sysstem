import axios from 'axios';
import { getAccessToken } from '../utils/auth.utils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/Database_Project/Database-main/Database-main/backend';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
instance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Fee {
  id: number;
  student_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  current_status?: string;
  payment_count?: number;
  total_paid?: number;
  remaining_amount?: number;
}

export interface Payment {
  id: number;
  fee_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
}

export interface PaymentRequest {
  fee_id: number;
  student_id: number;
  amount_paid: number;
  payment_method: 'bkash' | 'nagad' | 'rocket' | 'card';
  transaction_id?: string;
  phone_number?: string;
}

class FeesService {
  // Admin operations
  async getAllFees(studentId?: number, status?: string, limit: number = 100) {
    try {
      const response = await instance.get('/admin/fees', {
        params: {
          ...(studentId && { student_id: studentId }),
          ...(status && { status }),
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching fees:', error);
      throw error;
    }
  }

  async createFee(studentIds: number[], description: string, amount: number, dueDate: string) {
    try {
      const response = await instance.post('/admin/create-fee', {
        student_ids: studentIds,
        description,
        amount,
        due_date: dueDate,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating fee:', error);
      throw error;
    }
  }

  async updateFee(feeId: number, updates: Partial<Fee>) {
    try {
      const response = await instance.put('/admin/update-fee', {
        fee_id: feeId,
        ...updates,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating fee:', error);
      throw error;
    }
  }

  // Student operations
  async getStudentFees(studentId: number) {
    try {
      const response = await instance.post('/student/fees', {
        student_id: studentId,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching student fees:', error);
      throw error;
    }
  }

  // Payment operations
  async processPayment(paymentRequest: PaymentRequest) {
    try {
      const response = await instance.post('/payment/process', paymentRequest);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async getPaymentHistory(studentId?: number, feeId?: number) {
    try {
      const response = await instance.get('/payment/history', {
        params: {
          ...(studentId && { student_id: studentId }),
          ...(feeId && { fee_id: feeId }),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
}

export default new FeesService();
