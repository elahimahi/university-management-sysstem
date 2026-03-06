/**
 * Storage Utility Module
 * Provides a type-safe wrapper around browser storage with automatic
 * serialization/deserialization and error handling
 */

/**
 * Storage manager with localStorage as default
 */
class StorageManager {
  constructor(type = "localStorage") {
    this.storage = type === "session" ? sessionStorage : localStorage;
    this.type = type;
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (auto-serialized)
   * @returns {boolean} Success status
   */
  set(key, value) {
    try {
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);
      this.storage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Storage error (${this.type}):`, error);
      return false;
    }
  }

  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(key);

      if (item === null) {
        return defaultValue;
      }

      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error(`Storage error (${this.type}):`, error);
      return defaultValue;
    }
  }

  /**
   * Get all items from storage
   * @returns {object} All stored items as key-value pairs
   */
  getAll() {
    const items = {};
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          items[key] = this.get(key);
        }
      }
    } catch (error) {
      console.error(`Storage error (${this.type}):`, error);
    }
    return items;
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage error (${this.type}):`, error);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Storage key
   * @returns {boolean}
   */
  has(key) {
    return this.storage.getItem(key) !== null;
  }

  /**
   * Clear all items from storage
   * @returns {boolean} Success status
   */
  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error(`Storage error (${this.type}):`, error);
      return false;
    }
  }

  /**
   * Get storage size in bytes
   * @returns {number} Size in bytes
   */
  getSize() {
    let size = 0;
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          size += key.length + (this.storage.getItem(key)?.length || 0);
        }
      }
    } catch (error) {
      console.error(`Storage error (${this.type}):`, error);
    }
    return size;
  }

  /**
   * Set item with expiration
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {number} expirationMs - Expiration time in milliseconds
   * @returns {boolean} Success status
   */
  setWithExpiry(key, value, expirationMs) {
    try {
      const item = {
        value: value,
        expiry: Date.now() + expirationMs,
      };
      this.set(key, item);
      return true;
    } catch (error) {
      console.error(`Storage error (${this.type}):`, error);
      return false;
    }
  }

  /**
   * Get item with expiry check
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found or expired
   * @returns {any} Stored value or default
   */
  getWithExpiry(key, defaultValue = null) {
    try {
      const item = this.get(key);

      if (!item || typeof item !== "object" || !item.expiry) {
        return defaultValue;
      }

      if (Date.now() > item.expiry) {
        this.remove(key);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      console.error(`Storage error (${this.type}):`, error);
      return defaultValue;
    }
  }

  /**
   * Watch for storage changes (cross-tab communication)
   * @param {string} key - Storage key to watch
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  watch(key, callback) {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        const newValue = this.get(key);
        callback(newValue, event.oldValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }

  /**
   * Clear expired items
   * @returns {number} Number of items removed
   */
  clearExpired() {
    let removed = 0;
    try {
      const keys = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          keys.push(key);
        }
      }

      keys.forEach((key) => {
        const item = this.get(key);
        if (
          item &&
          typeof item === "object" &&
          item.expiry &&
          Date.now() > item.expiry
        ) {
          this.remove(key);
          removed++;
        }
      });
    } catch (error) {
      console.error(`Storage error (${this.type}):`, error);
    }
    return removed;
  }
}

// Export instances
export const storage = new StorageManager("localStorage");
export const sessionStore = new StorageManager("session");

// Storage keys - centralized constant
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: "auth_token",
  USER: "user",
  REFRESH_TOKEN: "refresh_token",

  // UI State
  THEME: "theme",
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
  LANGUAGE: "language",

  // App Data
  RECENT_SEARCHES: "recent_searches",
  PREFERENCES: "preferences",
  FAVORITES: "favorites",

  // Cache
  CACHED_DATA: "cached_data",
};

export default storage;
