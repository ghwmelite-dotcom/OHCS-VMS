// Centralized Framer Motion configuration
// Spring physics configs
export const spring = {
  gentle: { type: 'spring', stiffness: 120, damping: 14, mass: 0.8 },
  snappy: { type: 'spring', stiffness: 300, damping: 20, mass: 0.6 },
  bouncy: { type: 'spring', stiffness: 400, damping: 15, mass: 0.5 },
  smooth: { type: 'spring', stiffness: 200, damping: 25, mass: 1 },
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)' },
};

export const pageTransitionConfig = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
  mass: 0.8,
};

// Fade in up - most common entrance
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Scale in - for modals, cards
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

// Slide in from right - for panels
export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
};

// Slide in from left - for sidebar
export const slideInLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

// Stagger container variant
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// Stagger item variant
export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: spring.gentle,
  },
};

// Table row stagger
export const tableStagger = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const tableRow = {
  initial: { opacity: 0, x: -8 },
  animate: {
    opacity: 1,
    x: 0,
    transition: spring.gentle,
  },
};

// Modal backdrop
export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Modal content
export const modalContent = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 4,
    transition: { duration: 0.15 },
  },
};

// Notification slide
export const notificationSlide = {
  initial: { opacity: 0, x: 50, scale: 0.9 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 50, scale: 0.9 },
};

// Stat card hover
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -2,
    transition: spring.snappy,
  },
  tap: { scale: 0.98 },
};

// Button press
export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: spring.snappy,
};
