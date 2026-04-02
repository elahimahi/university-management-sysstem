export const APP_NAME = process.env.REACT_APP_NAME || 'University Management System';
export const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/Database_Project/Database-main/Database-main/backend';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  FACULTY: '/faculty',
  COURSES: '/courses',
  DEPARTMENTS: '/departments',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  THEME: 'theme',
} as const;
