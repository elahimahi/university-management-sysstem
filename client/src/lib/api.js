/**
 * API Utility Module
 * Centralized axios instance with automatic interceptors for authentication,
 * error handling, and response normalization
 */

import axios from "axios";
import { storage, STORAGE_KEYS } from "./storage";

// Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Create axios instance with base configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Attaches authentication token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);

    // Attach bearer token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles success responses and error states
 */
api.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized - logout user
    if (error.response?.status === 401) {
      // Clear auth data
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);

      // Redirect to login
      window.location.href = "/login";

      const err = new Error("Unauthorized. Please login again.");
      err.status = 401;
      return Promise.reject(err);
    }

    // Handle other HTTP errors
    const err = error.response
      ? new Error(
          error.response.data?.message ||
            error.response.statusText ||
            "An error occurred"
        )
      : error;

    err.status = error.response?.status;
    err.data = error.response?.data;

    return Promise.reject(err);
  }
);

export default api;
