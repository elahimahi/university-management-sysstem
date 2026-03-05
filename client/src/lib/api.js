/**
 * API Utility Module
 * Handles all HTTP requests with automatic interceptors for authentication,
 * error handling, and response normalization
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Creates a cancelable fetch request
 * @param {string} url - The endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId)
  );
};

/**
 * Request interceptor - adds headers and auth token
 * @param {object} config - Request configuration
 * @returns {object} Modified configuration
 */
const requestInterceptor = (config) => {
  const token = localStorage.getItem("auth_token");

  config.headers = {
    "Content-Type": "application/json",
    ...config.headers,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

/**
 * Response interceptor - handles success responses
 * @param {Response} response - Fetch response
 * @returns {Promise<any>} Parsed response data
 */
const responseInterceptor = async (response) => {
  if (!response.ok) {
    const error = new Error(`HTTP Error: ${response.status}`);
    error.status = response.status;
    error.response = response;

    try {
      error.data = await response.json();
    } catch {
      error.data = { message: response.statusText };
    }

    throw error;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Error interceptor - handles and normalizes errors
 * @param {Error} error - Error object
 * @throws {Error} Normalized error
 */
const errorInterceptor = (error) => {
  // Handle authentication errors
  if (error.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  // Handle network errors
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    error.message = "Network error. Please check your connection.";
  }

  // Handle abort errors (timeout)
  if (error.name === "AbortError") {
    error.message = "Request timeout. Please try again.";
  }

  throw error;
};

/**
 * API class for making HTTP requests
 */
class API {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Build full URL
   * @param {string} endpoint - Endpoint path
   * @returns {string} Full URL
   */
  buildURL(endpoint) {
    if (endpoint.startsWith("http")) {
      return endpoint;
    }
    return `${this.baseURL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  }

  /**
   * GET request
   * @param {string} endpoint - Endpoint path
   * @param {object} options - Additional options
   * @returns {Promise<any>}
   */
  async get(endpoint, options = {}) {
    const config = {
      method: "GET",
      headers: {},
      ...options,
    };

    const requestConfig = requestInterceptor(config);
    const url = this.buildURL(endpoint);

    try {
      const response = await fetchWithTimeout(url, requestConfig);
      return await responseInterceptor(response);
    } catch (error) {
      return errorInterceptor(error);
    }
  }

  /**
   * POST request
   * @param {string} endpoint - Endpoint path
   * @param {any} data - Request body data
   * @param {object} options - Additional options
   * @returns {Promise<any>}
   */
  async post(endpoint, data = null, options = {}) {
    const config = {
      method: "POST",
      headers: {},
      ...options,
    };

    if (data && !(data instanceof FormData)) {
      config.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      config.body = data;
      delete config.headers["Content-Type"];
    }

    const requestConfig = requestInterceptor(config);
    const url = this.buildURL(endpoint);

    try {
      const response = await fetchWithTimeout(url, requestConfig);
      return await responseInterceptor(response);
    } catch (error) {
      return errorInterceptor(error);
    }
  }

  /**
   * PUT request
   * @param {string} endpoint - Endpoint path
   * @param {any} data - Request body data
   * @param {object} options - Additional options
   * @returns {Promise<any>}
   */
  async put(endpoint, data = null, options = {}) {
    const config = {
      method: "PUT",
      headers: {},
      ...options,
    };

    if (data && !(data instanceof FormData)) {
      config.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      config.body = data;
      delete config.headers["Content-Type"];
    }

    const requestConfig = requestInterceptor(config);
    const url = this.buildURL(endpoint);

    try {
      const response = await fetchWithTimeout(url, requestConfig);
      return await responseInterceptor(response);
    } catch (error) {
      return errorInterceptor(error);
    }
  }

  /**
   * PATCH request
   * @param {string} endpoint - Endpoint path
   * @param {any} data - Request body data
   * @param {object} options - Additional options
   * @returns {Promise<any>}
   */
  async patch(endpoint, data = null, options = {}) {
    const config = {
      method: "PATCH",
      headers: {},
      ...options,
    };

    if (data && !(data instanceof FormData)) {
      config.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      config.body = data;
      delete config.headers["Content-Type"];
    }

    const requestConfig = requestInterceptor(config);
    const url = this.buildURL(endpoint);

    try {
      const response = await fetchWithTimeout(url, requestConfig);
      return await responseInterceptor(response);
    } catch (error) {
      return errorInterceptor(error);
    }
  }

  /**
   * DELETE request
   * @param {string} endpoint - Endpoint path
   * @param {object} options - Additional options
   * @returns {Promise<any>}
   */
  async delete(endpoint, options = {}) {
    const config = {
      method: "DELETE",
      headers: {},
      ...options,
    };

    const requestConfig = requestInterceptor(config);
    const url = this.buildURL(endpoint);

    try {
      const response = await fetchWithTimeout(url, requestConfig);
      return await responseInterceptor(response);
    } catch (error) {
      return errorInterceptor(error);
    }
  }

  /**
   * Upload file
   * @param {string} endpoint - Endpoint path
   * @param {File} file - File to upload
   * @param {object} additionalData - Additional form data
   * @returns {Promise<any>}
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append("file", file);

    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return this.post(endpoint, formData);
  }

  /**
   * Download file
   * @param {string} endpoint - Endpoint path
   * @param {string} filename - File name to save as
   * @returns {Promise<void>}
   */
  async downloadFile(endpoint, filename = "download") {
    try {
      const response = await fetchWithTimeout(
        this.buildURL(endpoint),
        requestInterceptor({
          method: "GET",
          headers: {},
        })
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      errorInterceptor(error);
    }
  }
}

// Export singleton instance
export default new API();
