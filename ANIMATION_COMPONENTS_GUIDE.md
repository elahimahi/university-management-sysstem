# Professional Animation Components - Complete Guide

## Overview
Your student portal now includes 7 advanced animated components that provide professional, aesthetic micro-interactions and visual effects throughout the interface.

---

## 1. Enhanced AnimatedButton (`src/components/ui/AnimatedButton.tsx`)

Enhanced button component with 4 animation types and multiple visual effects.

### Animation Types
- **ripple** (default): Classic ripple effect on click
- **glow**: Subtle glow effect with enhanced hover
- **gradient-pulse**: Animated gradient background
- **shake**: Horizontal shake animation on click

### Usage Examples

```tsx
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Save, Plus } from 'lucide-react';

// Default ripple effect
<AnimatedButton variant="primary" size="md">
  Save Changes
</AnimatedButton>

// Glow effect
<AnimatedButton 
  animationType="glow"
  variant="secondary"
  size="lg"
>
  Featured Button
</AnimatedButton>

// Gradient pulse
<AnimatedButton 
  animationType="gradient-pulse"
  variant="primary"
>
  Animation in Progress
</AnimatedButton>

// With icons
<AnimatedButton 
  leftIcon={<Plus className="w-4 h-4" />}
  animationType="ripple"
>
  Add Course
</AnimatedButton>

// Loading state
<AnimatedButton isLoading variant="primary">
  Submitting...
</AnimatedButton>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationType` | 'ripple' \| 'glow' \| 'gradient-pulse' \| 'shake' | 'ripple' | Animation effect style |
| `variant` | 'primary' \| 'secondary' \| 'outline' \| 'danger' \| 'success' | 'primary' | Button style |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| `isLoading` | boolean | false | Show spinner |
| `leftIcon` | ReactNode | - | Icon before text |
| `rightIcon` | ReactNode | - | Icon after text |
| `fullWidth` | boolean | false | Expand to full width |
| `disabled` | boolean | false | Disable button |

---

## 2. NotificationBar (`src/components/ui/NotificationBar.tsx`)

Beautiful toast-like notifications with slide animations and progress bar.

### Notification Types
- **success**: Green for successful operations
- **error**: Red for errors
- **warning**: Yellow/orange for warnings
- **info**: Blue for informational messages

### Usage Example

```tsx
import NotificationBar from '@/components/ui/NotificationBar';

// Direct usage with NotificationContainer
<NotificationBar
  id="1"
  type="success"
  title="Course Registered"
  message="You have successfully registered for MAT101"
  duration={5000}
  position="top-right"
  onClose={handleClose}
/>

// With action button
<NotificationBar
  id="2"
  type="warning"
  title="Fee Deadline Approaching"
  message="You have 3 days to pay your fees"
  action={{
    label: 'Pay Now',
    onClick: () => navigate('/payment')
  }}
  onClose={handleClose}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | - | Unique identifier |
| `type` | 'success' \| 'error' \| 'warning' \| 'info' | 'info' | Notification type |
| `title` | string | - | Main message |
| `message` | string | - | Secondary message |
| `duration` | number | 5000 | Auto-dismiss time (ms) |
| `position` | 'top-\*' \| 'bottom-\*' | 'top-right' | Screen position |
| `action` | {label, onClick} | - | Action button |

---

## 3. Notification System (useNotifications Hook + Container)

Complete notification management system.

### useNotifications Hook

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function StudentDashboard() {
  const { notifications, remove, success, error, warning, info } = useNotifications();

  const handleRegisterCourse = async () => {
    try {
      await registerCourse(courseId);
      success('Course registered successfully!', {
        message: 'You can now access course materials',
        duration: 4000
      });
    } catch (err) {
      error('Registration failed', {
        message: err.message,
        action: {
          label: 'Retry',
          onClick: () => handleRegisterCourse()
        }
      });
    }
  };

  return (
    <>
      <NotificationContainer
        notifications={notifications}
        onClose={remove}
        position="top-right"
        maxNotifications={5}
      />
      {/* Your components */}
    </>
  );
}
```

### Hook Methods
```tsx
const {
  add(title, type, options),      // Add custom notification
  success(title, options),        // Success notification
  error(title, options),          // Error notification
  warning(title, options),        // Warning notification
  info(title, options),           // Info notification
  remove(id),                     // Remove by ID
  clear(),                        // Clear all
  notifications,                  // Current notifications array
} = useNotifications();
```

---

## 4. AnimatedInput (`src/components/ui/AnimatedInput.tsx`)

Beautiful form input with animated label, focus effects, and validation.

### Features
- Animated label on focus/fill
- Password visibility toggle
- Success/error states with icons
- Character count display
- Left and right icon support
- Smooth focus border animations

### Usage Examples

```tsx
import AnimatedInput from '@/components/ui/AnimatedInput';
import { Mail, Phone } from 'lucide-react';

// Basic text input
<AnimatedInput
  label="Full Name"
  placeholder="Enter your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Email with icon
<AnimatedInput
  type="email"
  label="Email Address"
  leftIcon={<Mail className="w-5 h-5" />}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Password input
<AnimatedInput
  type="password"
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// With validation states
<AnimatedInput
  type="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  success={emailValid && !emailError}
/>

// With character limit
<AnimatedInput
  label="Bio"
  placeholder="Tell us about yourself"
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  maxLength={200}
  showCharCount={true}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Animated label |
| `type` | 'text' \| 'email' \| 'password' \| 'number' \| 'search' | 'text' | Input type |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Input size |
| `error` | string | - | Error message |
| `success` | boolean | - | Show success checkmark |
| `showCharCount` | boolean | false | Display character count |
| `maxLength` | number | - | Max characters |
| `leftIcon` | ReactNode | - | Left side icon |
| `rightIcon` | ReactNode | - | Right side icon |

---

## 5. AnimatedProgress (`src/components/ui/AnimatedProgress.tsx`)

Circular and linear progress bars with smooth animations.

### Usage Examples

```tsx
import AnimatedProgress from '@/components/ui/AnimatedProgress';

// Linear progress (default)
<AnimatedProgress
  value={75}
  color="success"
  showLabel={true}
  showPercentage={true}
  animated={true}
/>

// Circular progress
<AnimatedProgress
  variant="circular"
  value={60}
  maximum={100}
  color="primary"
  size="md"
  showLabel={true}
  showPercentage={true}
/>

// Striped progress
<AnimatedProgress
  value={50}
  color="warning"
  striped={true}
/>

// Course completion
<AnimatedProgress
  value={courseProgress}
  color="gold"
  showLabel={false}
  className="mb-2"
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | 'circular' \| 'linear' | 'linear' | Progress style |
| `value` | number | - | Current value |
| `maximum` | number | 100 | Maximum value |
| `color` | 'primary' \| 'success' \| 'warning' \| 'error' \| 'gold' | 'primary' | Progress color |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size (circular only) |
| `showLabel` | boolean | true | Show label |
| `showPercentage` | boolean | true | Show percentage |
| `animated` | boolean | true | Animate on mount |
| `striped` | boolean | false | Striped pattern (linear) |

---

## 6. PageTransition (`src/components/ui/PageTransition.tsx`)

Elegant page transition wrapper for route changes.

### Transition Variants
- **fade**: Simple opacity fade
- **slide-up**: Slide up entrance effect
- **slide-left**: Slide left entrance effect
- **scale-fade**: Scale and fade combined
- **blur**: Blur effect entrance

### Usage Example

```tsx
import PageTransition from '@/components/ui/PageTransition';

// In a page component
<PageTransition variant="slide-up" duration={0.4}>
  <div className="space-y-6">
    <header>
      <h1>Student Dashboard</h1>
    </header>
    {/* Page content */}
  </div>
</PageTransition>

// With delayed children stagger
<PageTransition variant="fade">
  <motion.div
    initial="hidden"
    animate="visible"
    variants={containerVariants}
  >
    {/* Staggered content */}
  </motion.div>
</PageTransition>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | 'fade' \| 'slide-up' \| 'slide-left' \| 'scale-fade' \| 'blur' | 'fade' | Transition style |
| `duration` | number | 0.4 | Animation duration |
| `delay` | number | 0 | Delay before start |
| `children` | ReactNode | - | Content to animate |

---

## 7. FloatingBadge (`src/components/ui/FloatingBadge.tsx`)

Floating animated badges with optional parallax and hover effects.

### Features
- Multiple color variants
- Optional parallax scroll effect
- Show on hover mode
- Icon rotation animation
- Pulse effect

### Usage Examples

```tsx
import FloatingBadge from '@/components/ui/FloatingBadge';
import { Zap, Award, Sparkles } from 'lucide-react';

// Featured badge
<FloatingBadge
  label="Top Performer"
  variant="gold"
  icon={<Award className="w-4 h-4" />}
  floating={true}
/>

// Success badge
<FloatingBadge
  label="All Payments Complete"
  variant="success"
/>

// Show on hover
<FloatingBadge
  label="Limited Time"
  variant="warning"
  showOnHover={false}
/>

// With parallax
<FloatingBadge
  label="Featured Course"
  variant="primary"
  useParallax={true}
  icon={<Sparkles className="w-4 h-4" />}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Badge text |
| `variant` | 'primary' \| 'success' \| 'warning' \| 'error' \| 'gold' \| 'info' | 'primary' | Badge color |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Badge size |
| `icon` | ReactNode | - | Icon element |
| `showOnHover` | boolean | false | Only show on hover |
| `floating` | boolean | true | Floating pulse effect |
| `useParallax` | boolean | false | Parallax scroll effect |

---

## Integration Examples

### Complete Student Form with All Components

```tsx
import { useState } from 'react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import AnimatedInput from '@/components/ui/AnimatedInput';
import PageTransition from '@/components/ui/PageTransition';
import { useNotifications } from '@/hooks/useNotifications';

export function StudentRegistrationForm() {
  const { success, error } = useNotifications();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit registration
      await registerStudent(formData);
      success('Registration successful!', {
        message: 'Welcome to the student portal'
      });
    } catch (err) {
      error('Registration failed', {
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition variant="slide-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatedInput
          label="Full Name"
          type="text"
          value={formData.fullName}
          onChange={(e) => 
            setFormData({ ...formData, fullName: e.target.value })
          }
        />

        <AnimatedInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => 
            setFormData({ ...formData, email: e.target.value })
          }
        />

        <AnimatedInput
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => 
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <AnimatedButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loading}
        >
          Create Account
        </AnimatedButton>
      </form>
    </PageTransition>
  );
}
```

---

## Animation Performance Tips

1. **Use `animated={false}` for AnimatedProgress when rendering many simultaneously**
2. **Limit NotificationContainer to 5-6 notifications max**
3. **Use PageTransition at page level only, not component level**
4. **Lazy load FloatingBadges if there are many on screen**
5. **Use AnimatedInput's ref forwarding for form libraries integration**

---

## Color Scheme

All components use your existing design system:
- **Primary**: Navy 900/700
- **Success**: Success 500/600
- **Warning**: Warning 500/600
- **Error**: Error 500/600
- **Gold**: Gold 500/600
- **Info**: Blue 500/600

---

## Next Steps

1. **Integrate useNotifications** into your primary layout
2. **Replace react-hot-toast** with NotificationContainer for consistent styling
3. **Update StudentRegistrationPage** to use AnimatedInput instead of basic inputs
4. **Add PageTransition** wrappers to all student pages
5. **Add AnimatedProgress** to course cards for attendance/grade tracking
6. **Use FloatingBadges** for course highlights or achievement badges

All components are production-ready and fully typed with TypeScript!
