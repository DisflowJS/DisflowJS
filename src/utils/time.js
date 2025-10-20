/**
 * ⏰ Time Utilities
 * Under devolepment
 */

class Time {
  /**
   * Get a timestamp based on a relative offset or absolute time
   * 
   * Supports two formats:
   * - Relative: '+5' or '+30'
   * - Absolute: '17.30' or '09.15'
   * 
   * @param {string} input - Time pattern
   * @returns {Date} Date object representing the time
   */
  parse(input) {
    // Relative time: +N
    if (input.startsWith('+')) {
      const minutes = parseInt(input.substring(1), 10);
      if (isNaN(minutes)) {
        throw new Error('Invalid time format: expected +N where N is a number');
      }
      
      const date = new Date();
      date.setMinutes(date.getMinutes() + minutes);
      return date;
    }

    // Absolute time: HH.MM or H.MM
    const timeMatch = input.match(/^(\d{1,2})\.(\d{2})$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time: hours must be 0-23, minutes must be 0-59');
      }
      
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      if (date < new Date()) {
        date.setDate(date.getDate() + 1);
      }
      
      return date;
    }

    throw new Error('Invalid time format: use "+N" for relative or "HH.MM" for absolute');
  }

  /**
   * Format a date to a nice readable string
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  format(date) {
    return date.toLocaleString('tr-TR', { // I from türkiye sorry :D
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get current timestamp
   * @returns {Date} Current date
   */
  now() {
    return new Date();
  }

  /**
   * Get Unix timestamp
   * @param {Date} date - Date to convert
   * @returns {number} Unix timestamp
   */
  unix(date = new Date()) {
    return Math.floor(date.getTime() / 1000);
  }
}

export default new Time();
