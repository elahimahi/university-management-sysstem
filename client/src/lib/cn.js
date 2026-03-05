/**
 * ClassName Utility Module
 * Provides utilities for combining, conditionally including, and managing
 * CSS class names efficiently
 */

/**
 * Merge class names - similar to clsx/classnames
 * Combines multiple class name arguments and removes duplicates
 *
 * @param {...any} classes - Class names to merge
 * @returns {string} Merged class names
 *
 * @example
 * cn('px-4 py-2', 'rounded-md', { 'bg-blue-500': isActive })
 * // => 'px-4 py-2 rounded-md bg-blue-500'
 */
export function cn(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === "string") {
        return cls.trim();
      }

      if (typeof cls === "object" && cls !== null) {
        return Object.entries(cls)
          .filter(([, value]) => value)
          .map(([key]) => key.trim())
          .join(" ");
      }

      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remove duplicate class names from a string
 * @param {string} classes - Class names string
 * @returns {string} Deduplicated class names
 *
 * @example
 * removeDuplicates('px-4 py-2 px-4 rounded-md')
 * // => 'px-4 py-2 rounded-md'
 */
export function removeDuplicates(classes) {
  if (!classes || typeof classes !== "string") {
    return "";
  }

  const classArray = classes.split(/\s+/).filter(Boolean);
  return [...new Set(classArray)].join(" ");
}

/**
 * Combine variant classes with base classes
 * Useful for managing multiple class variants
 *
 * @param {string} base - Base classes
 * @param {object} variants - Object with variant conditions
 * @param {object} modifiers - Additional modifiers
 * @returns {string} Combined classes
 *
 * @example
 * variantClasses('px-4 py-2', { 'bg-blue-500': isActive }, { disabled: isDisabled })
 * // => 'px-4 py-2 bg-blue-500' (if isActive is true)
 */
export function variantClasses(base = "", variants = {}, modifiers = {}) {
  let classes = base;

  Object.entries(variants).forEach(([variant, condition]) => {
    if (condition) {
      classes = `${classes} ${variant}`;
    }
  });

  Object.entries(modifiers).forEach(([modifier, condition]) => {
    if (condition) {
      classes = `${classes} ${modifier}`;
    }
  });

  return removeDuplicates(classes);
}

/**
 * TailwindCSS responsive classes generator
 * Creates responsive class combinations
 *
 * @param {object} config - Responsive configuration
 * @returns {string} Responsive classes
 *
 * @example
 * responsive({
 *   base: 'px-2',
 *   sm: 'px-4',
 *   md: 'px-6',
 *   lg: 'px-8'
 * })
 * // => 'px-2 sm:px-4 md:px-6 lg:px-8'
 */
export function responsive(config = {}) {
  const breakpoints = ["xs", "sm", "md", "lg", "xl", "2xl"];
  const classes = [];

  // Add base classes
  if (config.base) {
    classes.push(config.base);
  }

  // Add responsive breakpoint classes
  breakpoints.forEach((breakpoint) => {
    if (config[breakpoint]) {
      classes.push(`${breakpoint}:${config[breakpoint]}`);
    }
  });

  return classes.join(" ");
}

/**
 * TypeScript-friendly class builder for complex components
 * Allows easy composition of button, text, and other variants
 *
 * @param {object} options - Builder options
 * @returns {object} Builder object with methods
 *
 * @example
 * const buttonClasses = clsx()
 *   .add('px-4 py-2')
 *   .addIf(isPrimary, 'bg-blue-500')
 *   .addIf(isDisabled, 'opacity-50')
 *   .addResponsive({ base: 'text-sm', md: 'text-base' })
 *   .toString()
 */
export function clsx() {
  const classes = [];

  return {
    add(cls) {
      if (cls && typeof cls === "string") {
        classes.push(cls.trim());
      }
      return this;
    },

    addIf(condition, cls) {
      if (condition && cls && typeof cls === "string") {
        classes.push(cls.trim());
      }
      return this;
    },

    addObject(obj) {
      Object.entries(obj).forEach(([key, value]) => {
        if (value && typeof key === "string") {
          classes.push(key.trim());
        }
      });
      return this;
    },

    addResponsive(config) {
      classes.push(responsive(config));
      return this;
    },

    addVariant(base, variants) {
      classes.push(variantClasses(base, variants));
      return this;
    },

    toString() {
      return removeDuplicates(classes.join(" "));
    },

    toArray() {
      return this.toString().split(/\s+/);
    },
  };
}

/**
 * Predefined class constants for common patterns
 */
export const CLASSES = {
  // Layout
  FLEX_CENTER: "flex items-center justify-center",
  FLEX_BETWEEN: "flex items-center justify-between",
  FLEX_COL: "flex flex-col",
  GRID_COLS_2: "grid grid-cols-2 gap-4",
  GRID_COLS_3: "grid grid-cols-3 gap-4",
  GRID_COLS_4: "grid grid-cols-4 gap-4",

  // Spacing
  PADDING_SM: "p-2",
  PADDING_MD: "p-4",
  PADDING_LG: "p-6",
  MARGIN_SM: "m-2",
  MARGIN_MD: "m-4",
  MARGIN_LG: "m-6",

  // Typography
  TEXT_BASE: "text-base text-text-primary",
  TEXT_SM: "text-sm text-text-secondary",
  TEXT_LG: "text-lg font-semibold",
  TEXT_XL: "text-xl font-bold",

  // Buttons
  BTN_BASE: "px-4 py-2 rounded-md font-medium transition-all duration-200",
  BTN_PRIMARY: "bg-brand-primary text-white hover:opacity-90",
  BTN_SECONDARY: "bg-surface-card text-text-primary border border-border-light",
  BTN_DANGER: "bg-semantic-error text-white hover:opacity-90",

  // Cards
  CARD_BASE: "bg-surface-card rounded-lg p-4 shadow-sm border border-border-light",
  CARD_ELEVATED:
    "bg-surface-elevated rounded-lg p-4 shadow-base border border-border-light",

  // Inputs
  INPUT_BASE:
    "w-full px-3 py-2 rounded-md bg-surface-base text-text-primary border border-border-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent",

  // Badges
  BADGE_BASE: "inline-block px-2.5 py-1 rounded-full text-sm font-medium",
  BADGE_PRIMARY: "bg-brand-primary/10 text-brand-primary",
  BADGE_SUCCESS: "bg-semantic-success/10 text-semantic-success",
  BADGE_WARNING: "bg-semantic-warning/10 text-semantic-warning",

  // Alerts
  ALERT_BASE: "rounded-md border p-4 text-sm font-medium",
  ALERT_SUCCESS: "bg-semantic-success/10 border-semantic-success text-semantic-success",
  ALERT_ERROR: "bg-semantic-error/10 border-semantic-error text-semantic-error",

  // Utilities
  SR_ONLY: "absolute w-1 h-1 p-0 -m-1 overflow-hidden whitespace-nowrap border-0",
  DISABLED: "opacity-50 cursor-not-allowed",
  TRUNCATE: "truncate",
  TRUNCATE_2: "line-clamp-2",
  TRUNCATE_3: "line-clamp-3",
};

/**
 * Get predefined class by key
 * @param {string} key - Class key
 * @returns {string} Class names
 */
export function getClass(key) {
  return CLASSES[key] || "";
}

/**
 * Merge predefined classes
 * @param {...string} keys - Class keys
 * @returns {string} Merged class names
 *
 * @example
 * mergeClasses('BTN_BASE', 'BTN_PRIMARY')
 * // => 'px-4 py-2 rounded-md font-medium transition-all duration-200 bg-brand-primary text-white hover:opacity-90'
 */
export function mergeClasses(...keys) {
  const classes = keys.map((key) => getClass(key)).filter(Boolean);
  return cn(...classes);
}

// Default export - main cn function
export default cn;
