# 🔧 Project Setup & Installation Guide

Complete step-by-step guide to set up and run the University Database Management System with real MS SQL Server database and user data.

## ✅ Prerequisites

### System Requirements
- **Windows 10/11** (for MS SQL Server and Windows Authentication)
- **MS SQL Server 2019 or later** (with `MAHI\SQLEXPRESS` instance)

## 📦 Installed Packages

### Core Dependencies
- **React 19.2.4** - Latest React with TypeScript
- **TypeScript 4.9.5** - Type safety and better DX
- **Tailwind CSS 4.1.18** - Utility-first CSS framework

### State Management
- **@reduxjs/toolkit 2.11.2** - Redux state management
- **react-redux 9.2.0** - React bindings for Redux

### Routing & Navigation
- **react-router-dom 7.13.0** - Client-side routing

### Data Fetching
- **@tanstack/react-query 5.90.21** - Data fetching and caching
- **axios 1.13.5** - HTTP client with interceptors

### Form Handling & Validation
- **react-hook-form 7.71.1** - Form state management
- **zod 4.3.6** - Schema validation
- **@hookform/resolvers 5.2.2** - Zod resolver for react-hook-form

### UI & Animations
- **framer-motion 12.34.0** - Animation library
- **react-hot-toast 2.6.0** - Toast notifications
- **recharts 3.7.0** - Charts and data visualization

### Development Tools
- **prettier 3.8.1** - Code formatter
- **eslint** - Code linting (with react-app config)
- **autoprefixer & postcss** - CSS processing

## 📁 Project Structure

```
university-management/
├── public/
├── src/
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── components/
│   │   ├── common/          # Button, Card, Input, Loading
│   │   ├── features/        # Feature-specific components
│   │   └── layout/          # Layout components
│   ├── constants/           # app.constants.ts
│   ├── hooks/              # Custom hooks
│   ├── pages/              # HomePage.tsx
│   ├── routes/             # AppRoutes.tsx
│   ├── services/           # api.service.ts, queryClient.ts
│   ├── store/              # Redux store and slices
│   │   ├── store.ts
│   │   └── hooks.ts
│   ├── styles/
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # helpers.ts, storage.ts, validations.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── .env.development
├── .env.production
├── .env.example
├── .prettierrc
├── .prettierignore
├── .gitignore
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## ⚙️ Configuration Files

### 1. Tailwind CSS (tailwind.config.js)
- ✅ Content paths configured for React components
- ✅ Custom color scheme (primary, secondary)
- ✅ Custom fonts (Inter, Poppins)
- ✅ Custom shadows and utilities

### 2. TypeScript (tsconfig.json)
- ✅ Absolute imports configured with path aliases
- ✅ Base URL set to 'src'
- ✅ Path aliases for all major folders (@components, @pages, etc.)

### 3. ESLint & Prettier
- ✅ ESLint configured with React App preset
- ✅ Prettier integration for code formatting
- ✅ Custom scripts for linting and formatting

### 4. Environment Variables
- ✅ .env.development for development
- ✅ .env.production for production
- ✅ .env.example as template
- ✅ Variables prefixed with REACT_APP_

## 🔧 Created Files & Features

### Services
- **api.service.ts** - Axios service with interceptors for auth and error handling
- **queryClient.ts** - React Query client with default options

### Store
- **store.ts** - Redux store configuration
- **hooks.ts** - Typed Redux hooks (useAppDispatch, useAppSelector)

### Components
- **Button.tsx** - Animated button with variants and loading state
- **Card.tsx** - Animated card component
- **Input.tsx** - Form input with label and error display
- **Loading.tsx** - Loading spinner component

### Pages
- **HomePage.tsx** - Welcome page with Framer Motion animations

### Utils
- **helpers.ts** - Common utility functions (formatDate, truncateText, etc.)
- **storage.ts** - LocalStorage wrapper service
- **validations.ts** - Zod validation schemas for forms

### Types
- **index.ts** - TypeScript interfaces for User, Student, Faculty, Course, etc.

### Constants
- **app.constants.ts** - Application constants (routes, storage keys, etc.)

## 🚀 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🎯 Next Steps

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Configure your backend API URL:**
   - Edit `.env.local` or `.env.development`
   - Set `REACT_APP_API_BASE_URL` to your API endpoint

3. **Add your features:**
   - Create pages in `src/pages/`
   - Add routes in `src/routes/AppRoutes.tsx`
   - Create Redux slices in `src/store/slices/`
   - Build reusable components in `src/components/`

4. **Customize the theme:**
   - Edit `tailwind.config.js` for colors, fonts, etc.
   - Update `src/index.css` for global styles

## 📝 Key Features Implemented

✅ Full TypeScript support with strict mode
✅ Tailwind CSS with custom theme
✅ Redux Toolkit for state management
✅ React Query for data fetching
✅ React Router for routing
✅ Axios with interceptors
✅ Form validation with Zod
✅ Framer Motion animations
✅ Toast notifications
✅ Absolute imports (@components, @pages, etc.)
✅ Environment variable configuration
✅ ESLint & Prettier setup
✅ Comprehensive folder structure
✅ Reusable UI components
✅ Type-safe API service
✅ LocalStorage utility
✅ Common helper functions

## 🔒 Security Notes

- Auth token stored in localStorage
- API interceptors handle 401/403 errors
- Environment variables for sensitive config
- CORS handling in API service

## 📚 Documentation

Comprehensive documentation available in README.md

---

**Project Status:** ✅ Ready for Development
**Last Updated:** February 16, 2026
