/**
 * 🎨 Disflow Logger
 * Better than console.log
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Regular colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class Logger {
  constructor() {
    this.prefix = `${colors.cyan}[Disflow]${colors.reset}`;
  }

  /**
   * General info log
   */
  info(message) {
    console.log(`${this.prefix} ${colors.blue}ℹ${colors.reset} ${message}`);
  }

  /**
   * Success log
   */
  success(message) {
    console.log(`${this.prefix} ${colors.green}✓${colors.reset} ${message}`);
  }

  /**
   * Warning log
   */
  warn(message) {
    console.log(`${this.prefix} ${colors.yellow}⚠${colors.reset} ${message}`);
  }

  /**
   * Error log
   */
  error(message, error = null) {
    console.log(`${this.prefix} ${colors.red}✖${colors.reset} ${message}`);
    if (error) {
      console.error(error);
    }
  }

  /**
   * Debug log
   */
  debug(message) {
    if (process.env.DEBUG) {
      console.log(`${this.prefix} ${colors.dim}[DEBUG]${colors.reset} ${message}`);
    }
  }

  /**
   * Command execution log
   */
  command(commandName, user) {
    console.log(
      `${this.prefix} ${colors.magenta}→${colors.reset} Command ${colors.bright}${commandName}${colors.reset} used by ${colors.dim}${user}${colors.reset}`
    );
  }

  /**
   * Framework banner (definalty bugy)
   */
  banner() {
    console.log(`
${colors.cyan}╔═══════════════════════════════════════╗
║                                       ║
║     ${colors.bright}🌊 Disflow v0.1.0 Beta${colors.reset}${colors.cyan}         ║
║                                       ║
║     ${colors.dim}Minimal Discord Framework${colors.reset}${colors.cyan}       ║
║     ${colors.dim}Just write commands ☕${colors.reset}${colors.cyan}            ║
║                                       ║
╚═══════════════════════════════════════╝${colors.reset}
    `);
  }
}

export default new Logger();
