# 🎓 University Database Management System

A professional full-stack database management system built with **React** (frontend) and **PHP** (backend) using **MS SQL Server** for real user data management.

## 🚀 Features

- ⚡ **React 19** with **TypeScript** for type-safe development
- 🎨 **Tailwind CSS** with custom university theme (Navy & Gold)
- ✨ **Framer Motion** animations with 30+ variants
- 🌗 **Dark/Light Mode** with smooth transitions
- 🔄 **Redux Toolkit** for state management
- 📊 **React Query** for efficient data fetching and caching
- 🎭 **Comprehensive UI Component Library** (24 components)
- 📝 **React Hook Form** with **Zod** for form validation
- 🔔 **React Hot Toast** for notifications
- 📈 **Recharts** for data visualization
- 📱 **Fully Responsive** design
- ♿ **Accessibility** ready (WCAG AA)

## 📚 Component Library

This project includes a complete UI component library with **24 reusable components**:

- **Button Components**: AnimatedButton with ripple effects
- **Card Components**: Course, Faculty, Stats, Event cards
- **Input Components**: Text, Select, FileUpload, Checkbox, Radio
- **Modal Components**: Base Modal, Confirmation, Form modals
- **Navigation Components**: Navbar, Sidebar, Breadcrumbs, Tabs
- **Feedback Components**: Skeleton loaders, Progress bars, Tooltips, Toast notifications

📖 See [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) for full documentation  
🚀 See [COMPONENT_QUICKSTART.md](./COMPONENT_QUICKSTART.md) for quick reference  
📊 See [COMPONENT_SUMMARY.md](./COMPONENT_SUMMARY.md) for implementation details

## 🎨 Theming System

Custom theming with:
- 🎨 Custom colors (Navy #0A1929 & Gold #FFB347)
- 🌗 Dark/Light mode with CSS variables
- ✨ 30+ Framer Motion animation variants
- 🎭 Custom fonts (Poppins, Inter, Monaco)

📖 See [THEMING_GUIDE.md](./THEMING_GUIDE.md) for detailed theming documentation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd university-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
```

## 🏃 Running the Application

### Development Mode
```bash
npm start
```
Runs the app at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
```
Builds the app for production to the `build` folder.

### Run Tests
```bash
npm test
```

## 📁 Project Structure

```
src/
├── assets/              # Static assets (images, icons)
├── components/          # Reusable components
│   ├── common/         # Common UI components
│   ├── features/       # Feature-specific components
│   └── layout/         # Layout components
├── constants/          # Constants and configuration
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── routes/             # Routing configuration
├── services/           # API services and query client
├── store/              # Redux store and slices
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier

## 🔧 Configuration

### Absolute Imports
The project is configured with absolute imports using path aliases:

```typescript
import Button from '@components/common/Button';
import { useAppDispatch } from '@store/hooks';
import { API_BASE_URL } from '@constants/app.constants';
```

### Tailwind CSS
Tailwind is configured with custom theme extensions in `tailwind.config.js`:
- Custom color palette (primary, secondary)
- Custom fonts (Inter, Poppins)
- Custom shadows and utilities

### ESLint & Prettier
The project includes ESLint and Prettier configurations for consistent code formatting.

## 📦 Key Dependencies

### Production
- `react` & `react-dom` - UI library
- `@reduxjs/toolkit` & `react-redux` - State management
- `@tanstack/react-query` - Data fetching
- `react-router-dom` - Routing
- `framer-motion` - Animations
- `axios` - HTTP client
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `recharts` - Charts
- `react-hot-toast` - Notifications
- `tailwindcss` - Styling

### Development
- `typescript` - Type checking
- `prettier` & `eslint` - Code formatting
- `autoprefixer` & `postcss` - CSS processing

## 🌐 API Integration

The application uses Axios with interceptors for API calls. Configure your API base URL in the environment variables.

### Example API Service Usage:
```typescript
import { apiService } from '@services/api.service';

const fetchUsers = async () => {
  const data = await apiService.get('/users');
  return data;
};
```

## 🎯 Environment Variables

All environment variables must be prefixed with `REACT_APP_`:

- `REACT_APP_API_BASE_URL` - API base URL
- `REACT_APP_API_TIMEOUT` - API request timeout
- `REACT_APP_ENV` - Environment (development/production)
- `REACT_APP_ENABLE_ANALYTICS` - Enable/disable analytics
- `REACT_APP_ENABLE_DEBUG` - Enable/disable debug mode

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

Your Team Name

## 🙏 Acknowledgments

- React Team
- Tailwind CSS Team
- All open-source contributors
