/**
 * Organization Schema Implementation
 * Foundational schema for businesses, affects knowledge panels
 */

(function() {
  const config = window.SCHEMA_CONFIG || {};
  const utils = window.SchemaUtils || {};

  const OrganizationSchema = {
    name: 'Organization',
    icon: 'fa-sitemap',
    
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Organization Name',
        required: true,
        placeholder: 'Enter organization name'
      },
      {
        name: 'legalName',
        type: 'text',
        label: 'Legal Name',
        required: false,
        placeholder: 'Legal business name (if different)',
        help: 'Official legal name if different from common name'
      },
      {
        name: 'organizationType',
        type: 'select',
        label: 'Organization Type',
        required: false,
        options: config.OPTIONS?.ORGANIZATION_TYPES || [
          { value: 'Organization', label: 'General Organization' },
          { value: 'Corporation', label: 'Corporation' },
          { value: 'EducationalOrganization', label: 'Educational Organization' },
          { value: 'GovernmentOrganization', label: 'Government Organization' },
          { value: 'NGO', label: 'Non-Profit Organization' }
        ]
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        required: false,
        placeholder: 'Brief description of the organization',
        rows: 3
      },
      {
        name: 'url',
        type: 'url',
        label: 'Website URL',
        required: false,
        placeholder: 'https://www.organization.com'
      },
      {
        name: 'logo',
        type: 'url',
        label: 'Logo URL',
        required: false,
        placeholder: 'https://www.organization.com/logo.png',
        help: 'Direct link to organization logo image'
      },
      {
        name: 'foundingDate',
        type: 'date',
        label: 'Founding Date',
        required: false,
        help: 'When was the organization founded?'
      },
      {
        name: 'email',
        type: 'email',
        label: 'Contact Email',
        required: false,
        placeholder: 'contact@organization.com'
      },
      {
        name: 'telephone',
        type: 'tel',
        label: 'Phone Number',
        required: false,
        placeholder: '(555) 123-4567'
      },
      {
        name: 'streetAddress',
        type: 'text',
        label: 'Street Address',
        required: false,
        placeholder: '123 Business Street'
      },
      {
        name: 'addressLocality',
        type: 'text',
        label: 'City',
        required: false,
        placeholder: 'City name'
      },
      {
        name: 'addressRegion',
        type: 'text',
        label: 'State/Region',
        required: false,
        placeholder: 'State or region'
      },
      {
        name: 'postalCode',
        type: 'text',
        label: 'Postal Code',
        required: false,
        placeholder: '12345'
      },
      {
        name: 'addressCountry',
        type: 'select',
        label: 'Country',
        required: false,
        options: config.OPTIONS?.COUNTRIES || [
          { value: 'US', label: 'United States' },
          { value: 'CA', label: 'Canada' },
          { value: 'GB', label: 'United Kingdom' }
        ]
      },
      {
        name: 'numberOfEmployees',
        type: 'number',
        label: 'Number of Employees',
        required: false,
        placeholder: '50',
        min: 1,
        help: 'Approximate number of employees'
      },
      {
        name: 'sameAs',
        type: 'textarea',
        label: 'Social Media URLs',
        required: false,
        placeholder: 'https://facebook.com/org\nhttps://twitter.com/org\nhttps://linkedin.com/company/org',
        rows: 3,
        help: 'One URL per line (Facebook, Twitter, LinkedIn, etc.)'
      }
    ],

    /**
     * Generate Organization JSON-LD
     */
    generator: function(data) {
      const organizationType = data.organizationType || 'Organization';
      
      const schema = {
        "@context": config.SCHEMA_CONTEXT || "https://schema.org",
        "@type": organizationType
      };

      // Required field
      if (data.name) {
        schema.name = utils.cleanText ? utils.cleanText(data.name) : data.name;
      }

      // Optional fields
      if (data.legalName && data.legalName !== data.name) {
        schema.legalName = utils.cleanText ? utils.cleanText(data.legalName) : data.legalName;
      }

      if (data.description) {
        schema.description = utils.cleanText ? utils.cleanText(data.description) : data.description;
      }

      // URLs
      if (data.url && utils.validateUrl) {
        const urlResult = utils.validateUrl(data.url);
        if (urlResult.valid) {
          schema.url = urlResult.url;
        }
      } else if (data.url) {
        schema.url = data.url;
      }

      if (data.logo && utils.validateUrl) {
        const logoResult = utils.validateUrl(data.logo);
        if (logoResult.valid) {
          schema.logo = logoResult.url;
        }
      } else if (data.logo) {
        schema.logo = data.logo;
      }

      // Dates
      if (data.foundingDate) {
        const formattedDate = utils.formatDate ? utils.formatDate(data.foundingDate) : data.foundingDate;
        if (formattedDate) {
          schema.foundingDate = formattedDate.split('T')[0]; // Just the date part
        }
      }

      // Contact information
      if (data.email && utils.validateEmail) {
        const emailResult = utils.validateEmail(data.email);
        if (emailResult.valid) {
          schema.email = emailResult.email;
        }
      } else if (data.email) {
        schema.email = data.email;
      }

      if (data.telephone) {
        schema.telephone = data.telephone;
      }

      // Address
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

      // Employee count
      if (data.numberOfEmployees && !isNaN(parseInt(data.numberOfEmployees))) {
        schema.numberOfEmployees = parseInt(data.numberOfEmployees);
      }

      // Social media URLs (sameAs)
      if (data.sameAs) {
        const urls = data.sameAs.split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0);
        
        if (urls.length > 0) {
          const validUrls = [];
          urls.forEach(url => {
            if (utils.validateUrl) {
              const urlResult = utils.validateUrl(url);
              if (urlResult.valid) {
                validUrls.push(urlResult.url);
              }
            } else if (url.startsWith('http')) {
              validUrls.push(url);
            }
          });
          
          if (validUrls.length > 0) {
            schema.sameAs = validUrls.length === 1 ? validUrls[0] : validUrls;
          }
        }
      }

      return schema;
    },

    /**
     * Extract Organization data from HTML
     */
    extractor: function(html, url) {
      const data = {};

      // Extract organization name from title or h1
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        let title = utils.cleanText ? utils.cleanText(titleMatch[1]) : titleMatch[1].trim();
        // Clean up common title suffixes
        title = title.replace(/\s*[-|]\s*.*$/, '');
        data.name = title;
      }

      // Try h1 as alternative
      if (!data.name) {
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match) {
          data.name = utils.cleanText ? utils.cleanText(h1Match[1]) : h1Match[1].trim();
        }
      }

      // Extract meta description
      const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      if (descMatch) {
        data.description = utils.cleanText ? utils.cleanText(descMatch[1]) : descMatch[1];
      }

      // Extract logo from og:image or common logo selectors
      const logoPatterns = [
        /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
        /<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
        /<img[^>]*src=["']([^"']*logo[^"']*)["']/i
      ];

      for (const pattern of logoPatterns) {
        const logoMatch = html.match(pattern);
        if (logoMatch) {
          data.logo = logoMatch[1];
          break;
        }
      }

      // Extract contact information
      const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        data.email = emailMatch[1];
      }

      // Extract phone number
      const phonePatterns = [
        /(?:tel:|phone:|call:)\s*([+]?[\d\s\-\(\)]{10,})/i,
        /(\(\d{3}\)\s*\d{3}-\d{4})/,
        /(\d{3}-\d{3}-\d{4})/
      ];

      for (const pattern of phonePatterns) {
        const phoneMatch = html.match(pattern);
        if (phoneMatch) {
          data.telephone = phoneMatch[1].trim();
          break;
        }
      }

      // Extract address
      const addressMatch = html.match(/(\d+\s+[^,]+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})/i);
      if (addressMatch) {
        data.streetAddress = addressMatch[1].trim();
        data.addressLocality = addressMatch[2].trim();
        data.addressRegion = addressMatch[3].trim();
        data.postalCode = addressMatch[4];
        data.addressCountry = 'US';
      }

      // Set website URL
      if (url) {
        try {
          const urlObj = new URL(url);
          data.url = urlObj.origin;
        } catch (e) {
          // Invalid URL
        }
      }

      // Extract social media links
      const socialPatterns = [
        /https?:\/\/(?:www\.)?facebook\.com\/[^\s"'<>]+/gi,
        /https?:\/\/(?:www\.)?twitter\.com\/[^\s"'<>]+/gi,
        /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^\s"'<>]+/gi,
        /https?:\/\/(?:www\.)?instagram\.com\/[^\s"'<>]+/gi,
        /https?:\/\/(?:www\.)?youtube\.com\/[^\s"'<>]+/gi
      ];

      const socialUrls = [];
      socialPatterns.forEach(pattern => {
        const matches = html.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!socialUrls.includes(match)) {
              socialUrls.push(match);
            }
          });
        }
      });

      if (socialUrls.length > 0) {
        data.sameAs = socialUrls.join('\n');
      }

      // Try to extract founding year
      const foundingPatterns = [
        /(?:founded|established|since)\s*(?:in\s*)?(\d{4})/gi,
        /©\s*(\d{4})/gi
      ];

      for (const pattern of foundingPatterns) {
        const foundingMatch = html.match(pattern);
        if (foundingMatch) {
          const year = parseInt(foundingMatch[1]);
          if (year > 1800 && year <= new Date().getFullYear()) {
            data.foundingDate = `${year}-01-01`;
            break;
          }
        }
      }

      return data;
    },

    /**
     * Validate Organization data
     */
    validator: function(data) {
      const errors = [];
      
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Organization name is required');
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
          errors.push('Invalid website URL format');
        }
      }

      if (data.logo && utils.validateUrl) {
        const logoResult = utils.validateUrl(data.logo);
        if (!logoResult.valid) {
          errors.push('Invalid logo URL format');
        }
      }

      if (data.foundingDate) {
        try {
          const foundingDate = new Date(data.foundingDate);
          if (isNaN(foundingDate.getTime())) {
            errors.push('Invalid founding date format');
          } else if (foundingDate > new Date()) {
            errors.push('Founding date cannot be in the future');
          }
        } catch (e) {
          errors.push('Invalid founding date format');
        }
      }

      if (data.numberOfEmployees && (isNaN(parseInt(data.numberOfEmployees)) || parseInt(data.numberOfEmployees) < 1)) {
        errors.push('Number of employees must be a positive number');
      }

      // Validate social media URLs
      if (data.sameAs) {
        const urls = data.sameAs.split('\n').map(url => url.trim()).filter(url => url.length > 0);
        const invalidUrls = [];
        
        urls.forEach(url => {
          if (utils.validateUrl) {
            const urlResult = utils.validateUrl(url);
            if (!urlResult.valid) {
              invalidUrls.push(url);
            }
          }
        });
        
        if (invalidUrls.length > 0) {
          errors.push(`Invalid social media URLs: ${invalidUrls.join(', ')}`);
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
    window.SchemaRegistry.register('organization', OrganizationSchema);
  } else {
    // Wait for registry to load
    document.addEventListener('DOMContentLoaded', function() {
      if (window.SchemaRegistry) {
        window.SchemaRegistry.register('organization', OrganizationSchema);
      }
    });
  }

  // Make available globally for debugging
  window.OrganizationSchema = OrganizationSchema;
})();