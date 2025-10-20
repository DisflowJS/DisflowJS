/**
 * 🎲 Random Utilities
 *  Under devolepment
 */

class Random {
  /**
   * Generate a random number between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  number(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random string based on pattern
   * Supports two formats:
   * - Range: 'A to Z' or 'a to z' or '0 to 9'
   * - List: 'apple, banana, orange'
   * 
   * @param {string} pattern - The pattern to generate from
   * @returns {string} Random string or character
   */
  string(pattern) {
    // Check if it a range
    const rangeMatch = pattern.match(/^([a-zA-Z0-9])\s+to\s+([a-zA-Z0-9])$/i);
    
    if (rangeMatch) {
      const start = rangeMatch[1].charCodeAt(0);
      const end = rangeMatch[2].charCodeAt(0);
      const randomCode = this.number(Math.min(start, end), Math.max(start, end));
      return String.fromCharCode(randomCode);
    }

    const items = pattern.split(',').map(item => item.trim());
    
    if (items.length === 0) {
      throw new Error('Invalid pattern: must be a range (A to Z) or comma-separated list');
    }

    return items[this.number(0, items.length - 1)];
  }

  /**
   * Generate a random boolean (true/false)
   * 
   * @returns {boolean} Random true or false
   */
  bool() {
    return Math.random() < 0.5;
  }

  /**
   * Pick a random element from an array
   * @param {Array} array - Array to pick from
   * @returns {*} Random element
   */
  pick(array) {
    if (!Array.isArray(array) || array.length === 0) {
      throw new Error('Array must be non-empty');
    }
    return array[this.number(0, array.length - 1)];
  }
}

export default new Random();
