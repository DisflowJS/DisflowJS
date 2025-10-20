/**
 * 🎨 Button Template System
 */

class ButtonTemplate {
  constructor(id) {
    this.id = id;
    this.config = {
      title: '',
      emoji: '',
      color: 'Primary',
      clickEvent: null,
      disabled: false
    };
  }

  /**
   * Set button title/label
   */
  title(text) {
    this.config.title = text;
    return this;
  }

  /**
   * Set button emoji
   */
  emoji(emoji) {
    this.config.emoji = emoji;
    return this;
  }

  /**
   * Set button color/style
   */
  color(color) {
    const colorMap = {
      'Primary': 1,
      'Secondary': 2,
      'Success': 3,
      'Danger': 4,
      'Link': 5,
      // Hex color support 
      // TODO: More colors
      'FFFFFF': 2, // White -> Secondary
      'FF0000': 4, // Red -> Danger
      '00FF00': 3, // Green -> Success
      '0000FF': 1, // Blue -> Primary
    };
    
    this.config.color = colorMap[color] || color;
    return this;
  }

  /**
   * Set click event handler
   */
  clickEvent(handler) {
    this.config.clickEvent = handler;
    return this;
  }

  /**
   * Set disabled state
   */
  disabled(state = true) {
    this.config.disabled = state;
    return this;
  }

  /**
   * Build the button component
   */
  build() {
    const label = this.config.emoji 
      ? `${this.config.emoji} ${this.config.title}`.trim()
      : this.config.title;

    return {
      type: 2,
      style: typeof this.config.color === 'number' ? this.config.color : 1,
      label: label || 'Button',
      custom_id: this.id,
      disabled: this.config.disabled
    };
  }

  register(onButton) {
    if (this.config.clickEvent) {
      onButton(this.id, this.config.clickEvent);
    }
  }
}

class ButtonTemplateManager {
  constructor() {
    this.templates = new Map();
  }

  /**
   * Create a new button template
   */
  create(id) {
    const template = new ButtonTemplate(id);
    this.templates.set(id, template);
    return template;
  }

  /**
   * Get existing template
   */
  get(id) {
    return this.templates.get(id);
  }

  /**
   * Build button from template
   */
  build(id) {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Button template '${id}' not found`);
    }
    return template.build();
  }

  registerAll(onButton) {
    for (const template of this.templates.values()) {
      template.register(onButton);
    }
  }
}

const buttonTemplates = new ButtonTemplateManager();

export default buttonTemplates;
export { ButtonTemplate, ButtonTemplateManager };
