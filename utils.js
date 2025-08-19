/**
 * Schema Utilities - Shared helper functions
 */

const SchemaUtils = {
  /**
   * Decode HTML entities (moved from app.js)
   */
  decodeHtmlEntities: function(text) {
    if (!text) return '';
    const entities = {
      '&#x27;': "'",
      '&quot;': '"',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&#39;': "'",
      '&apos;': "'",
      '&#x2F;': '/',
      '&#x60;': '`',
      '&#x3D;': '='
    };
    
    return text.replace(/&#?\w+;/g, (entity) => {
      return entities[entity] || entity;
    });
  },

  /**
   * Format and validate price data
   */
  formatPrice: function(price, currency = 'USD') {
    if (!price) return null;
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return null;
    
    return {
      price: numPrice.toString(),
      currency: currency.toUpperCase()
    };
  },

  /**
   * Validate and normalize URLs
   */
  validateUrl: function(url) {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'Empty URL' };
    }
    
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    try {
      new URL(cleanUrl);
      return { valid: true, url: cleanUrl };
    } catch (e) {
      return { valid: false, error: 'Invalid URL format' };
    }
  },

  /**
   * Generate unique IDs for forms
   */
  generateId: function() {
    return 'schema_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Clean and normalize text
   */
  cleanText: function(text) {
    if (!text) return '';
    return this.decodeHtmlEntities(text.trim());
  },

  /**
   * Format phone numbers
   */
  formatPhone: function(phone) {
    if (!phone) return '';
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // Format as needed (basic formatting)
    if (digits.length === 10) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    return phone; // Return original if can't format
  },

  /**
   * Validate email format
   */
  validateEmail: function(email) {
    if (!email) return { valid: false, error: 'Empty email' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? 
      { valid: true, email: email } : 
      { valid: false, error: 'Invalid email format' };
  },

  /**
   * Format dates for schema (ISO 8601)
   */
  formatDate: function(dateInput) {
    if (!dateInput) return null;
    
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch (e) {
      return null;
    }
  },

  /**
   * Extract text content from HTML
   */
  extractTextFromHtml: function(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  },

  /**
   * Create form field HTML
   */
  createFormField: function(field, value = '', index = '') {
    const fieldId = this.generateId();
    const inputName = index ? `${field.name}_${index}` : field.name;
    
    let html = `<div class="form-field">`;
    html += `<label class="block text-sm font-medium text-purple-200 mb-1" for="${fieldId}">${field.label || field.name}</label>`;
    
    switch (field.type) {
      case 'textarea':
        html += `<textarea id="${fieldId}" name="${inputName}" 
                  class="w-full px-3 py-2 rounded-lg text-sm" 
                  rows="${field.rows || 3}" 
                  placeholder="${field.placeholder || ''}"
                  ${field.required ? 'required' : ''}>${value}</textarea>`;
        break;
        
      case 'select':
        html += `<select id="${fieldId}" name="${inputName}" 
                  class="w-full px-3 py-2 rounded-lg text-sm bg-black/30 text-white"
                  ${field.required ? 'required' : ''}>`;
        if (field.options) {
          field.options.forEach(option => {
            const selected = value === option.value ? 'selected' : '';
            html += `<option value="${option.value}" ${selected}>${option.label}</option>`;
          });
        }
        html += `</select>`;
        break;
        
      case 'date':
      case 'datetime-local':
      case 'time':
        html += `<input type="${field.type}" id="${fieldId}" name="${inputName}" 
                  value="${value}" 
                  class="w-full px-3 py-2 rounded-lg text-sm"
                  placeholder="${field.placeholder || ''}"
                  ${field.required ? 'required' : ''}>`;
        break;
        
      default: // text, email, tel, url, number
        html += `<input type="${field.type || 'text'}" id="${fieldId}" name="${inputName}" 
                  value="${value}" 
                  class="w-full px-3 py-2 rounded-lg text-sm"
                  placeholder="${field.placeholder || ''}"
                  ${field.step ? `step="${field.step}"` : ''}
                  ${field.min !== undefined ? `min="${field.min}"` : ''}
                  ${field.max !== undefined ? `max="${field.max}"` : ''}
                  ${field.required ? 'required' : ''}>`;
    }
    
    if (field.help) {
      html += `<small class="text-purple-300 text-xs">${field.help}</small>`;
    }
    
    html += `</div>`;
    return html;
  }
};

// Make available globally
window.SchemaUtils = SchemaUtils;