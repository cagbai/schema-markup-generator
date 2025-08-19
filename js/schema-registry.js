/**
 * Schema Registry - Plugin system for schema types
 */

window.SchemaRegistry = (function() {
  const schemas = new Map();
  const config = window.SCHEMA_CONFIG || {};
  const utils = window.SchemaUtils || {};
  
  /**
   * Register legacy schema types (existing ones in app.js)
   */
  function registerLegacySchemas() {
    const legacyTypes = ['product', 'breadcrumb', 'faq', 'carousel', 'review'];
    legacyTypes.forEach(type => {
      schemas.set(type, {
        type: type,
        name: config.NAMES?.[type] || type,
        icon: config.ICONS?.[type] || 'fa-cog',
        legacy: true
      });
    });
  }

  /**
   * Add schema type button to UI
   */
  function addSchemaButtonToUI(type, schemaConfig) {
    const container = document.querySelector('.flex.flex-wrap.gap-2');
    if (!container) return;

    const button = document.createElement('button');
    button.className = 'schema-type-btn px-4 py-2 rounded-full text-sm font-medium transition-colors';
    button.setAttribute('data-type', type);
    button.setAttribute('onclick', 'toggleSchemaType(this)');
    button.innerHTML = `<i class="fas ${schemaConfig.icon} mr-1"></i> ${schemaConfig.name}`;
    
    container.appendChild(button);
    
    // Also add to dropdown
    const dropdown = document.getElementById('schemaTypeSelect');
    if (dropdown) {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = schemaConfig.name;
      dropdown.appendChild(option);
    }
  }

  /**
   * Generate form HTML for a schema
   */
  function generateFormHTML(schema, data = {}) {
    if (!schema.fields) return '<p>No form configuration available</p>';
    
    let html = '<div class="space-y-3">';
    
    schema.fields.forEach(field => {
      const value = data[field.name] || '';
      html += utils.createFormField ? 
        utils.createFormField(field, value) : 
        createBasicField(field, value);
    });
    
    html += '</div>';
    return html;
  }

  /**
   * Basic field creation fallback
   */
  function createBasicField(field, value) {
    const required = field.required ? 'required' : '';
    const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';
    
    return `
      <div>
        <label class="block text-sm font-medium text-purple-200 mb-1">
          ${field.label || field.name}${field.required ? ' *' : ''}
        </label>
        <input 
          type="${field.type || 'text'}" 
          name="${field.name}"
          value="${value}"
          class="w-full px-3 py-2 rounded-lg text-sm"
          ${placeholder}
          ${required}
          onchange="updateSchemaData('${field.name}', this.value)"
        >
      </div>
    `;
  }

  /**
   * Extract form data from DOM
   */
  function extractFormData(schemaType) {
    const schema = schemas.get(schemaType);
    if (!schema || schema.legacy) return {};

    const data = {};
    const form = document.getElementById('schemaForms');
    if (!form) return data;

    schema.fields.forEach(field => {
      const input = form.querySelector(`[name="${field.name}"]`);
      if (input) {
        data[field.name] = input.value;
      }
    });

    return data;
  }

  return {
    /**
     * Register a new schema type
     */
    register: function(type, schemaConfig) {
      // Validate required properties
      if (!type || !schemaConfig.name) {
        console.error('Schema registration requires type and name');
        return false;
      }

      const schema = {
        type: type,
        name: schemaConfig.name,
        icon: schemaConfig.icon || 'fa-cog',
        fields: schemaConfig.fields || [],
        generator: schemaConfig.generator,
        extractor: schemaConfig.extractor,
        validator: schemaConfig.validator,
        legacy: false
      };

      schemas.set(type, schema);
      
      // Add to UI if DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          addSchemaButtonToUI(type, schema);
        });
      } else {
        addSchemaButtonToUI(type, schema);
      }

      console.log(`Registered schema type: ${type}`);
      return true;
    },

    /**
     * Get schema configuration
     */
    get: function(type) {
      return schemas.get(type);
    },

    /**
     * Check if schema type is legacy
     */
    isLegacy: function(type) {
      const schema = schemas.get(type);
      return schema && schema.legacy;
    },

    /**
     * Get all registered schema types
     */
    getAll: function() {
      return Array.from(schemas.keys());
    },

    /**
     * Get all non-legacy schemas
     */
    getModern: function() {
      return Array.from(schemas.values()).filter(s => !s.legacy);
    },

    /**
     * Render form for a schema type
     */
    renderForm: function(type, data = {}) {
      const schema = schemas.get(type);
      if (!schema || schema.legacy) {
        return null; // Fall back to legacy form rendering
      }

      return generateFormHTML(schema, data);
    },

    /**
     * Generate schema JSON-LD
     */
    generateSchema: function(type, data) {
      const schema = schemas.get(type);
      if (!schema || schema.legacy || !schema.generator) {
        return null;
      }

      try {
        return schema.generator(data);
      } catch (error) {
        console.error(`Error generating ${type} schema:`, error);
        return null;
      }
    },

    /**
     * Extract data from HTML
     */
    extractData: function(type, html, url) {
      const schema = schemas.get(type);
      if (!schema || schema.legacy || !schema.extractor) {
        return {};
      }

      try {
        return schema.extractor(html, url);
      } catch (error) {
        console.error(`Error extracting ${type} data:`, error);
        return {};
      }
    },

    /**
     * Get form data for a schema type
     */
    getFormData: function(type) {
      return extractFormData(type);
    },

    /**
     * Initialize the registry
     */
    init: function() {
      registerLegacySchemas();
      console.log('Schema Registry initialized');
    }
  };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SchemaRegistry.init();
  });
} else {
  window.SchemaRegistry.init();
}