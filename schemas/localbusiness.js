/**
 * LocalBusiness Schema Implementation
 * Highest priority schema for local SEO
 */

(function() {
  const config = window.SCHEMA_CONFIG || {};
  const utils = window.SchemaUtils || {};

  const LocalBusinessSchema = {
    name: 'Local Business',
    icon: 'fa-building',
    
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Business Name',
        required: true,
        placeholder: 'Enter business name'
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        required: false,
        placeholder: 'Brief description of your business',
        rows: 3
      },
      {
        name: 'streetAddress',
        type: 'text',
        label: 'Street Address',
        required: true,
        placeholder: '123 Main Street'
      },
      {
        name: 'addressLocality',
        type: 'text',
        label: 'City',
        required: true,
        placeholder: 'City name'
      },
      {
        name: 'addressRegion',
        type: 'text',
        label: 'State/Region',
        required: true,
        placeholder: 'State or region'
      },
      {
        name: 'postalCode',
        type: 'text',
        label: 'Postal Code',
        required: true,
        placeholder: '12345'
      },
      {
        name: 'addressCountry',
        type: 'select',
        label: 'Country',
        required: true,
        options: config.OPTIONS?.COUNTRIES || [
          { value: 'US', label: 'United States' },
          { value: 'CA', label: 'Canada' },
          { value: 'GB', label: 'United Kingdom' }
        ]
      },
      {
        name: 'telephone',
        type: 'tel',
        label: 'Phone Number',
        required: false,
        placeholder: '(555) 123-4567'
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        required: false,
        placeholder: 'contact@business.com'
      },
      {
        name: 'url',
        type: 'url',
        label: 'Website URL',
        required: false,
        placeholder: 'https://www.business.com'
      },
      {
        name: 'priceRange',
        type: 'select',
        label: 'Price Range',
        required: false,
        options: config.OPTIONS?.PRICE_RANGES || [
          { value: '$', label: '$ - Inexpensive' },
          { value: '$$', label: '$$ - Moderate' },
          { value: '$$$', label: '$$$ - Expensive' },
          { value: '$$$$', label: '$$$$ - Very Expensive' }
        ]
      },
      {
        name: 'openingHours',
        type: 'text',
        label: 'Opening Hours',
        required: false,
        placeholder: 'Mo-Fr 09:00-17:00',
        help: 'Format: Mo-Fr 09:00-17:00, Sa 09:00-12:00'
      }
    ],

    /**
     * Generate LocalBusiness JSON-LD
     */
    generator: function(data) {
      const schema = {
        "@context": config.SCHEMA_CONTEXT || "https://schema.org",
        "@type": "LocalBusiness"
      };

      // Required fields
      if (data.name) {
        schema.name = utils.cleanText ? utils.cleanText(data.name) : data.name;
      }

      // Address (required for LocalBusiness)
      if (data.streetAddress || data.addressLocality) {
        schema.address = {
          "@type": "PostalAddress"
        };
        
        if (data.streetAddress) schema.address.streetAddress = data.streetAddress;
        if (data.addressLocality) schema.address.addressLocality = data.addressLocality;
        if (data.addressRegion) schema.address.addressRegion = data.addressRegion;
        if (data.postalCode) schema.address.postalCode = data.postalCode;
        if (data.addressCountry) schema.address.addressCountry = data.addressCountry;
      }

      // Optional fields
      if (data.description) {
        schema.description = utils.cleanText ? utils.cleanText(data.description) : data.description;
      }

      if (data.telephone) {
        schema.telephone = data.telephone;
      }

      if (data.email && utils.validateEmail) {
        const emailResult = utils.validateEmail(data.email);
        if (emailResult.valid) {
          schema.email = emailResult.email;
        }
      } else if (data.email) {
        schema.email = data.email;
      }

      if (data.url && utils.validateUrl) {
        const urlResult = utils.validateUrl(data.url);
        if (urlResult.valid) {
          schema.url = urlResult.url;
        }
      } else if (data.url) {
        schema.url = data.url;
      }

      if (data.priceRange) {
        schema.priceRange = data.priceRange;
      }

      if (data.openingHours) {
        schema.openingHours = data.openingHours;
      }

      return schema;
    },

    /**
     * Extract LocalBusiness data from HTML
     */
    extractor: function(html, url) {
      const data = {};

      // Extract title as business name
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        data.name = utils.cleanText ? utils.cleanText(titleMatch[1]) : titleMatch[1].trim();
      }

      // Extract meta description
      const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      if (descMatch) {
        data.description = utils.cleanText ? utils.cleanText(descMatch[1]) : descMatch[1];
      }

      // Try to extract address from common patterns
      const addressPatterns = [
        // Pattern: 123 Main St, City, ST 12345
        /(\d+\s+[^,]+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})/i,
        // Pattern: 123 Main Street<br>City, State 12345
        /(\d+\s+[^<\n]+)(?:<br>|\n)\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})/i
      ];

      for (const pattern of addressPatterns) {
        const addressMatch = html.match(pattern);
        if (addressMatch) {
          data.streetAddress = addressMatch[1].trim();
          data.addressLocality = addressMatch[2].trim();
          data.addressRegion = addressMatch[3].trim();
          data.postalCode = addressMatch[4];
          data.addressCountry = 'US'; // Default assumption
          break;
        }
      }

      // Extract phone number
      const phonePatterns = [
        /(?:tel:|phone:|call:)\s*([+]?[\d\s\-\(\)]{10,})/i,
        /(\(\d{3}\)\s*\d{3}-\d{4})/,
        /(\d{3}-\d{3}-\d{4})/,
        /(\d{3}\.\d{3}\.\d{4})/
      ];

      for (const pattern of phonePatterns) {
        const phoneMatch = html.match(pattern);
        if (phoneMatch) {
          data.telephone = phoneMatch[1].trim();
          break;
        }
      }

      // Extract email
      const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        data.email = emailMatch[1];
      }

      // Extract website URL (if different from current)
      if (url) {
        try {
          const urlObj = new URL(url);
          data.url = urlObj.origin;
        } catch (e) {
          // Invalid URL
        }
      }

      // Try to extract hours
      const hoursPatterns = [
        /hours?:\s*([^<\n]+)/i,
        /open:\s*([^<\n]+)/i,
        /((?:mon|tue|wed|thu|fri|sat|sun)[^<\n]+)/i
      ];

      for (const pattern of hoursPatterns) {
        const hoursMatch = html.match(pattern);
        if (hoursMatch) {
          const hoursText = hoursMatch[1].trim();
          if (hoursText.length < 100) { // Reasonable length
            data.openingHours = hoursText;
            break;
          }
        }
      }

      return data;
    },

    /**
     * Validate LocalBusiness data
     */
    validator: function(data) {
      const errors = [];
      
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Business name is required');
      }

      if (!data.streetAddress && !data.addressLocality) {
        errors.push('At least street address or city is required');
      }

      if (data.email && utils.validateEmail) {
        const emailResult = utils.validateEmail(data.email);
        if (!emailResult.valid) {
          errors.push('Invalid email format');
        }
      }

      if (data.url && utils.validateUrl) {
        const urlResult = utils.validateUrl(data.url);
        if (!urlResult.valid) {
          errors.push('Invalid URL format');
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    }
  };

  // Register the schema when registry is available
  if (window.SchemaRegistry) {
    window.SchemaRegistry.register('localbusiness', LocalBusinessSchema);
  } else {
    // Wait for registry to load
    document.addEventListener('DOMContentLoaded', function() {
      if (window.SchemaRegistry) {
        window.SchemaRegistry.register('localbusiness', LocalBusinessSchema);
      }
    });
  }

  // Make available globally for debugging
  window.LocalBusinessSchema = LocalBusinessSchema;
})();