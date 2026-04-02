/**
 * Framer Motion Animation Variants
 * Reusable animation configurations for consistent motion design
 */

import { Variants, Transition } from 'framer-motion';

// Default transition configurations
export const TRANSITIONS: Record<string, Transition> = {
  spring: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
  },
  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
  springSmooth: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
  },
  ease: {
    duration: 0.3,
    ease: 'easeInOut',
  },
  easeFast: {
    duration: 0.2,
    ease: 'easeInOut',
  },
  easeSlow: {
    duration: 0.5,
    ease: 'easeInOut',
  },
};

// Fade In Variants
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: TRANSITIONS.ease,
  },
  exit: {
    opacity: 0,
    transition: TRANSITIONS.easeFast,
  },
};

// Fade In Up Variants
export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: TRANSITIONS.ease,
  },
};

// Fade In Down Variants
export const fadeInDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: TRANSITIONS.ease,
  },
};

// Slide In Left Variants
export const slideInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: TRANSITIONS.ease,
  },
};

// Slide In Right Variants
export const slideInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: TRANSITIONS.ease,
  },
};

// Scale In Variants
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.springSmooth,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: TRANSITIONS.ease,
  },
};

// Scale In Center Variants
export const scaleInCenterVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: TRANSITIONS.ease,
  },
};

// Rotate In Variants
export const rotateInVariants: Variants = {
  hidden: {
    opacity: 0,
    rotate: -180,
  },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    rotate: 180,
    transition: TRANSITIONS.ease,
  },
};

// Bounce Variants
export const bounceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.springBouncy,
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: TRANSITIONS.ease,
  },
};

// Stagger Container Variants
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Stagger Item Variants (use with staggerContainer)
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    y: 20,
  },
};

// Card Hover Variants
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -8,
    transition: TRANSITIONS.springSmooth,
  },
  tap: {
    scale: 0.98,
  },
};

// Button Hover Variants
export const buttonHoverVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: TRANSITIONS.springSmooth,
  },
  tap: {
    scale: 0.95,
  },
};

// Modal Variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: TRANSITIONS.ease,
  },
};

// Modal Backdrop Variants
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Drawer Variants (Slide from left)
export const drawerLeftVariants: Variants = {
  hidden: {
    x: '-100%',
  },
  visible: {
    x: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    x: '-100%',
    transition: TRANSITIONS.ease,
  },
};

// Drawer Variants (Slide from right)
export const drawerRightVariants: Variants = {
  hidden: {
    x: '100%',
  },
  visible: {
    x: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    x: '100%',
    transition: TRANSITIONS.ease,
  },
};

// Page Transition Variants
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.ease,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: TRANSITIONS.easeFast,
  },
};

// Floating Animation (Continuous)
export const floatingVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Pulse Animation (Continuous)
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Wiggle Animation
export const wiggleVariants: Variants = {
  animate: {
    rotate: [0, -3, 3, -3, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Shake Animation
export const shakeVariants: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Toast Notification Variants
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.3,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: TRANSITIONS.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: TRANSITIONS.easeFast,
  },
};

// Dropdown Menu Variants
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITIONS.easeFast,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: TRANSITIONS.easeFast,
  },
};

// Tab Switch Variants
export const tabVariants: Variants = {
  inactive: {
    opacity: 0.6,
    scale: 0.95,
  },
  active: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.ease,
  },
};

// Loading Spinner Variants
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Success Checkmark Animation
export const checkmarkVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeInOut' },
      opacity: { duration: 0.2 },
    },
  },
};

// Hover Glow Effect
export const glowVariants: Variants = {
  rest: {
    boxShadow: '0 0 0px rgba(255, 179, 71, 0)',
  },
  hover: {
    boxShadow: '0 0 20px rgba(255, 179, 71, 0.5)',
    transition: TRANSITIONS.ease,
  },
};

// Export all variants as a collection
export const ANIMATION_VARIANTS = {
  fadeIn: fadeInVariants,
  fadeInUp: fadeInUpVariants,
  fadeInDown: fadeInDownVariants,
  slideInLeft: slideInLeftVariants,
  slideInRight: slideInRightVariants,
  scaleIn: scaleInVariants,
  scaleInCenter: scaleInCenterVariants,
  rotateIn: rotateInVariants,
  bounce: bounceVariants,
  staggerContainer: staggerContainerVariants,
  staggerItem: staggerItemVariants,
  cardHover: cardHoverVariants,
  buttonHover: buttonHoverVariants,
  modal: modalVariants,
  backdrop: backdropVariants,
  drawerLeft: drawerLeftVariants,
  drawerRight: drawerRightVariants,
  pageTransition: pageTransitionVariants,
  floating: floatingVariants,
  pulse: pulseVariants,
  wiggle: wiggleVariants,
  shake: shakeVariants,
  toast: toastVariants,
  dropdown: dropdownVariants,
  tab: tabVariants,
  spinner: spinnerVariants,
  checkmark: checkmarkVariants,
  glow: glowVariants,
} as const;

export default ANIMATION_VARIANTS;
