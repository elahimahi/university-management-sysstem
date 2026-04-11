import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Determine the correct API base URL (support both localhost:3000 and localhost:3001)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10);

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available (check both accessToken and authToken)
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.debug('[API] Token found, adding Authorization header');
        } else {
          console.debug('[API] No token found in storage');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          
          switch (status) {
            case 401:
              toast.error('Unauthorized. Please login again.');
              localStorage.removeItem('authToken');
              window.location.href = '/login';
              break;
            case 403:
              toast.error('Forbidden. You do not have permission.');
              break;
            case 404:
              toast.error('Resource not found.');
              break;
            case 500:
              toast.error('Server error. Please try again later.');
              break;
            default:
              toast.error(data?.message || 'An error occurred.');
          }
        } else if (error.request) {
          toast.error('Network error. Please check your connection.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();
