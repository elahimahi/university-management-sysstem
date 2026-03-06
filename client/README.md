# AUST University Management System (UMS) - Frontend

An enterprise-level University Management System frontend built with **React**, **Vite**, **TailwindCSS**, and **TypeScript**. Features a complete design system with dark mode, role-based access control, and accessibility-first principles.

## 🎯 Features

✅ **Complete Design System** - Semantic design tokens, reusable UI components, dark mode  
✅ **Role-Based Dashboards** - Admin, Student, Teacher dashboards tailored to each role  
✅ **Authentication & RBAC** - JWT-based auth with route protection  
✅ **Form Management** - React Hook Form + Zod validation  
✅ **Data Fetching** - React Query with optimistic updates  
✅ **Responsive Design** - Mobile-first, accessible interface  
✅ **Dark Mode Parity** - Full dark mode support with localStorage persistence  
✅ **Subtle Animations** - Respect prefers-reduced-motion  
✅ **Enterprise Architecture** - Clean, modular folder structure  

## 📋 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI Framework |
| **Vite** | Build Tool & Dev Server |
| **TypeScript** | Type Safety |
| **TailwindCSS** | Styling (with custom design tokens) |
| **React Router v6** | Client-side Routing |
| **React Query** | Server State Management |
| **React Hook Form** | Form State Management |
| **Zod** | Schema Validation |
| **Axios** | HTTP Client |
| **Framer Motion** | Subtle Animations |
| **Lucide React** | Icons |

## 📁 Project Structure

```
src/
├── api.ts                    # Axios client & API endpoints
├── types.ts                  # TypeScript interfaces
├── main.tsx                  # Entry point
├── App.tsx                   # Root component & routing
├── index.css                 # Global styles
│
├── components/
│   ├── index.ts             # Component exports
│   ├── ProtectedRoute.tsx    # Route protection logic
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx       # 80+ variant combinations
│   │   ├── Card.tsx         # Card with header/body/footer
│   │   ├── Badge.tsx        # Status badges
│   │   ├── Input.tsx        # Form input with validation
│   │   ├── Select.tsx       # Dropdown select
│   │   ├── Textarea.tsx     # Multi-line input
│   │   ├── Modal.tsx        # Dialog modal
│   │   ├── Alert.tsx        # Toast alerts
│   │   ├── StatCard.tsx     # Stat displays
│   │   ├── EmptyState.tsx   # Empty state UI
│   │   ├── Skeleton.tsx     # Loading skeletons
│   │   ├── Tabs.tsx         # Tab interface
│   │   └── index.ts         # UI exports
│   │
│   └── layout/              # Layout components
│       ├── Navbar.tsx       # Top navigation bar
│       ├── Sidebar.tsx      # Role-based sidebar
│       ├── DashboardLayout.tsx
│       ├── PublicLayout.tsx
│       └── index.ts
│
├── context/
│   ├── AuthContext.tsx      # Authentication state
│   └── ThemeContext.tsx     # Dark mode toggle
│
├── pages/
│   ├── HomePage.tsx         # Landing page
│   ├── LoginPage.tsx        # Login with demo credentials
│   ├── RegisterPage.tsx     # Registration
│   ├── UnauthorizedPage.tsx # 403 Access Denied
│   ├── SettingsPage.tsx     # App settings
│   │
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminDepartments.tsx
│   │   ├── AdminCourses.tsx
│   │   ├── AdminSemesters.tsx
│   │   └── AdminAuditLogs.tsx
│   │
│   ├── student/
│   │   ├── StudentDashboard.tsx
│   │   ├── StudentProfile.tsx
│   │   ├── StudentEnrollments.tsx
│   │   └── StudentResults.tsx
│   │
│   └── teacher/
│       ├── TeacherDashboard.tsx
│       ├── TeacherProfile.tsx
│       └── TeacherOfferings.tsx
│
├── tailwind.config.js       # Design tokens & theme
├── index.html               # HTML entry point
└── vite.config.ts          # Vite configuration
```

## 🎨 Design Tokens

### Brand Colors
- **Primary**: University Blue (`#1e40af`)
- **Accent**: Academic Teal (`#0d9488`)
- **Highlight**: Amber (`#f59e0b`)

### Semantic Colors
- **Success**: Green (`#10b981`)
- **Warning**: Amber (`#f59e0b`)
- **Error**: Red (`#ef4444`)
- **Info**: Blue (`#3b82f6`)

### Spacing Grid
8px base unit: xs (0.5rem), sm (1rem), md (1.5rem), lg (2rem), xl (2.5rem)

### Radius
12px → 16px (smooth, modern feel)

### Typography
Semantic sizes from display (xs) to 4xl with consistent line heights

## 🔐 Authentication Flow

1. **User logs in** → POST `/auth/login`
2. **Token stored** → localStorage (auth_token)
3. **Token attached** → Axios interceptor on every request
4. **401 Error** → Auto logout & redirect to /login
5. **ProtectedRoute** → Checks user role before rendering

### Demo Credentials

```
Admin:    admin@test.com / password123
Teacher:  teacher@test.com / password123
Student:  student@test.com / password123
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

```bash
# Navigate to frontend folder
cd university-management-system-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Environment Variables

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=AUST University Management System
```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📡 API Integration

The app assumes a REST API with these endpoints:

### Auth
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token
- `GET /auth/me` - Current user
- `POST /auth/logout` - Logout

### Admin
- `GET /admin/users` - List all users
- `GET /admin/departments` - List departments
- `POST /admin/departments` - Create department
- `GET /admin/semesters` - List semesters
- `POST /admin/semesters` - Create semester
- `GET /admin/audit-logs` - View system activity
- `GET /admin/stats` - Dashboard statistics

### Student
- `GET /students/profile` - Get student profile
- `PUT /students/profile` - Update profile
- `GET /students/enrollments` - List enrollments
- `GET /offerings` - Available courses
- `POST /students/enroll/:offering_id` - Enroll in course
- `GET /students/results` - View grades

### Teacher
- `GET /teachers/profile` - Get teacher profile
- `GET /teachers/offerings` - Assigned courses
- `POST /teachers/offerings` - Create offering
- `GET /offerings/:id/enrollments` - Enrolled students
- `POST /teachers/results/:enrollment_id` - Submit marks

### General
- `GET /departments` - List departments
- `POST /departments` - Create department
- `GET /courses` - List courses
- `POST /courses` - Create course
- `GET /offerings` - List offerings
- `POST /offerings` - Create offering

## 🎮 Usage Examples

### Protected Route
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### Form with Validation
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { register, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

### Data Fetching
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['students'],
  queryFn: async () => {
    const response = await studentAPI.getProfile()
    return response.data
  }
})
```

### Dark Mode Toggle
```tsx
import { useTheme } from '@/context/ThemeContext'

const { theme, toggleTheme } = useTheme()
```

## 🌐 Dark Mode

- **Persisted** in localStorage
- **Automatic Detection** of system preference
- **Full Parity** - all components adapted for dark mode
- **Toggle** in navbar for manual control

## ♿ Accessibility

- ✅ Only one h1 per page
- ✅ Proper heading hierarchy (h2-h6)
- ✅ ARIA labels & descriptions
- ✅ Focus rings on interactive elements
- ✅ Respects prefers-reduced-motion
- ✅ Keyboard navigable
- ✅ Semantic HTML

## 📦 Component Library

### UI Components
All components are in `src/components/ui/` and exported via `index.ts`

```tsx
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Modal,
  Alert,
  StatCard,
} from '@/components/ui'
```

### Layout Components
```tsx
import {
  Navbar,
  Sidebar,
  DashboardLayout,
  PublicLayout,
} from '@/components/layout'
```

## 🔧 Configuration

### Tailwind Config
Located in `tailwind.config.js` - customize colors, spacing, and animations

### Vite Config
Located in `vite.config.ts` - adjust build settings and aliases

### TypeScript
Located in `tsconfig.json` - compiler options with path aliases (@/*)

## 📝 Best Practices

1. **Component Reusability** - Use UI components from library
2. **API Integration** - Use queries/mutations from React Query
3. **Form Handling** - Use React Hook Form + Zod
4. **State Management** - Use React Query for server state, Context for auth
5. **Styling** - Use Tailwind classes, avoid inline styles
6. **Type Safety** - Always type props and responses
7. **Error Handling** - Display user-friendly error messages

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Output
- `dist/` folder contains optimized build
- Ready for deployment to any static hosting

### Deployment Checklist
- [ ] Update `VITE_API_URL` in .env
- [ ] Test all authentication flows
- [ ] Verify dark mode works correctly
- [ ] Test responsive design on mobile
- [ ] Check accessibility with screen reader
- [ ] Run production build locally

## 🐛 Troubleshooting

**Build fails with module errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear dist: `rm -rf dist && npm run build`

**Styles not applying:**
- Restart dev server: `npm run dev`
- Clear browser cache: Ctrl+Shift+Delete (Chrome)

**Auth not working:**
- Check `VITE_API_URL` in .env
- Verify backend is running
- Check browser console for CORS errors

**Dark mode not persisting:**
- Check localStorage is enabled
- Browser might be in private mode

## 📄 License

ISC

## 👨‍💻 Author

Ali Ahnaf

## 🙋 Support

For issues and feature requests, please contact the development team or create an issue in the repository.

---

**Happy Coding! 🎉**
