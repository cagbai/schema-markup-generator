/**
 * Event Schema Implementation
 * High CTR impact schema for events, conferences, webinars
 */

(function() {
  const config = window.SCHEMA_CONFIG || {};
  const utils = window.SchemaUtils || {};

  const EventSchema = {
    name: 'Event',
    icon: 'fa-calendar-alt',
    
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Event Name',
        required: true,
        placeholder: 'Enter event name'
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Event Description',
        required: false,
        placeholder: 'Describe what the event is about',
        rows: 3
      },
      {
        name: 'startDate',
        type: 'datetime-local',
        label: 'Start Date & Time',
        required: true,
        help: 'When does the event start?'
      },
      {
        name: 'endDate',
        type: 'datetime-local',
        label: 'End Date & Time',
        required: false,
        help: 'When does the event end? (optional)'
      },
      {
        name: 'eventStatus',
        type: 'select',
        label: 'Event Status',
        required: false,
        options: config.OPTIONS?.EVENT_STATUS || [
          { value: 'https://schema.org/EventScheduled', label: 'Scheduled' },
          { value: 'https://schema.org/EventCancelled', label: 'Cancelled' },
          { value: 'https://schema.org/EventMovedOnline', label: 'Moved Online' },
          { value: 'https://schema.org/EventPostponed', label: 'Postponed' }
        ]
      },
      {
        name: 'eventAttendanceMode',
        type: 'select',
        label: 'Attendance Mode',
        required: false,
        options: config.OPTIONS?.EVENT_ATTENDANCE || [
          { value: 'https://schema.org/OfflineEventAttendanceMode', label: 'In Person' },
          { value: 'https://schema.org/OnlineEventAttendanceMode', label: 'Online' },
          { value: 'https://schema.org/MixedEventAttendanceMode', label: 'Hybrid' }
        ]
      },
      {
        name: 'locationName',
        type: 'text',
        label: 'Location Name',
        required: false,
        placeholder: 'Convention Center, Online, etc.'
      },
      {
        name: 'streetAddress',
        type: 'text',
        label: 'Street Address',
        required: false,
        placeholder: '123 Event Street'
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
        name: 'organizerName',
        type: 'text',
        label: 'Organizer Name',
        required: false,
        placeholder: 'Who is organizing this event?'
      },
      {
        name: 'organizerUrl',
        type: 'url',
        label: 'Organizer Website',
        required: false,
        placeholder: 'https://organizer.com'
      },
      {
        name: 'url',
        type: 'url',
        label: 'Event URL',
        required: false,
        placeholder: 'https://event-website.com'
      },
      {
        name: 'image',
        type: 'url',
        label: 'Event Image URL',
        required: false,
        placeholder: 'https://example.com/event-image.jpg'
      },
      {
        name: 'price',
        type: 'number',
        label: 'Ticket Price',
        required: false,
        placeholder: '0 for free events',
        min: 0,
        step: 0.01
      },
      {
        name: 'currency',
        type: 'select',
        label: 'Currency',
        required: false,
        options: config.OPTIONS?.CURRENCIES || [
          { value: 'USD', label: 'USD ($)' },
          { value: 'EUR', label: 'EUR (€)' },
          { value: 'GBP', label: 'GBP (£)' }
        ]
      }
    ],

    /**
     * Generate Event JSON-LD
     */
    generator: function(data) {
      const schema = {
        "@context": config.SCHEMA_CONTEXT || "https://schema.org",
        "@type": "Event"
      };

      // Required fields
      if (data.name) {
        schema.name = utils.cleanText ? utils.cleanText(data.name) : data.name;
      }

      if (data.startDate) {
        const formattedDate = utils.formatDate ? utils.formatDate(data.startDate) : data.startDate;
        if (formattedDate) {
          schema.startDate = formattedDate;
        }
      }

      // Optional fields
      if (data.description) {
        schema.description = utils.cleanText ? utils.cleanText(data.description) : data.description;
      }

      if (data.endDate) {
        const formattedEndDate = utils.formatDate ? utils.formatDate(data.endDate) : data.endDate;
        if (formattedEndDate) {
          schema.endDate = formattedEndDate;
        }
      }

      if (data.eventStatus) {
        schema.eventStatus = data.eventStatus;
      }

      if (data.eventAttendanceMode) {
        schema.eventAttendanceMode = data.eventAttendanceMode;
      }

      // Location
      if (data.locationName || data.streetAddress || data.addressLocality) {
        schema.location = {};

        if (data.locationName) {
          schema.location.name = data.locationName;
        }

        // Physical address
        if (data.streetAddress || data.addressLocality) {
          schema.location["@type"] = "Place";
          schema.location.address = {
            "@type": "PostalAddress"
          };

          if (data.streetAddress) schema.location.address.streetAddress = data.streetAddress;
          if (data.addressLocality) schema.location.address.addressLocality = data.addressLocality;
          if (data.addressRegion) schema.location.address.addressRegion = data.addressRegion;
          if (data.postalCode) schema.location.address.postalCode = data.postalCode;
          if (data.addressCountry) schema.location.address.addressCountry = data.addressCountry;
        } else if (data.locationName) {
          // Virtual location
          schema.location["@type"] = "VirtualLocation";
        }
      }

      // Organizer
      if (data.organizerName || data.organizerUrl) {
        schema.organizer = {
          "@type": "Organization"
        };

        if (data.organizerName) {
          schema.organizer.name = data.organizerName;
        }

        if (data.organizerUrl && utils.validateUrl) {
          const urlResult = utils.validateUrl(data.organizerUrl);
          if (urlResult.valid) {
            schema.organizer.url = urlResult.url;
          }
        } else if (data.organizerUrl) {
          schema.organizer.url = data.organizerUrl;
        }
      }

      // Event URL
      if (data.url && utils.validateUrl) {
        const urlResult = utils.validateUrl(data.url);
        if (urlResult.valid) {
          schema.url = urlResult.url;
        }
      } else if (data.url) {
        schema.url = data.url;
      }

      // Image
      if (data.image && utils.validateUrl) {
        const urlResult = utils.validateUrl(data.image);
        if (urlResult.valid) {
          schema.image = urlResult.url;
        }
      } else if (data.image) {
        schema.image = data.image;
      }

      // Offers (pricing)
      if (data.price !== undefined && data.price !== '') {
        schema.offers = {
          "@type": "Offer",
          "price": data.price,
          "priceCurrency": data.currency || "USD"
        };

        if (parseFloat(data.price) === 0) {
          schema.offers.availability = "https://schema.org/InStock";
        }
      }

      return schema;
    },

    /**
     * Extract Event data from HTML
     */
    extractor: function(html, url) {
      const data = {};

      // Extract title as event name
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        data.name = utils.cleanText ? utils.cleanText(titleMatch[1]) : titleMatch[1].trim();
      }

      // Extract meta description
      const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      if (descMatch) {
        data.description = utils.cleanText ? utils.cleanText(descMatch[1]) : descMatch[1];
      }

      // Try to extract date patterns
      const datePatterns = [
        // ISO date patterns
        /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/g,
        // Common date formats
        /(?:date|when|start):\s*([^<\n]+)/gi,
        // Event date patterns
        /((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/gi
      ];

      for (const pattern of datePatterns) {
        const dateMatch = html.match(pattern);
        if (dateMatch) {
          try {
            const eventDate = new Date(dateMatch[1]);
            if (!isNaN(eventDate.getTime())) {
              data.startDate = eventDate.toISOString().slice(0, 16); // Format for datetime-local
              break;
            }
          } catch (e) {
            // Invalid date
          }
        }
      }

      // Extract location information
      const locationPatterns = [
        /(?:location|venue|where):\s*([^<\n]+)/gi,
        /(?:held at|taking place at)\s*([^<\n]+)/gi
      ];

      for (const pattern of locationPatterns) {
        const locationMatch = html.match(pattern);
        if (locationMatch) {
          const location = locationMatch[1].trim();
          if (location.length < 100) {
            data.locationName = location;
            break;
          }
        }
      }

      // Try to extract address
      const addressMatch = html.match(/(\d+\s+[^,]+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})/i);
      if (addressMatch) {
        data.streetAddress = addressMatch[1].trim();
        data.addressLocality = addressMatch[2].trim();
        data.addressRegion = addressMatch[3].trim();
        data.postalCode = addressMatch[4];
        data.addressCountry = 'US';
      }

      // Extract organizer
      const organizerPatterns = [
        /(?:organized by|hosted by|presenter):\s*([^<\n]+)/gi,
        /(?:organizer|host):\s*([^<\n]+)/gi
      ];

      for (const pattern of organizerPatterns) {
        const organizerMatch = html.match(pattern);
        if (organizerMatch) {
          const organizer = organizerMatch[1].trim();
          if (organizer.length < 100) {
            data.organizerName = organizer;
            break;
          }
        }
      }

      // Extract pricing information
      const pricePatterns = [
        /(?:price|cost|fee):\s*\$?(\d+(?:\.\d{2})?)/gi,
        /\$(\d+(?:\.\d{2})?)/g,
        /free/gi
      ];

      for (const pattern of pricePatterns) {
        const priceMatch = html.match(pattern);
        if (priceMatch) {
          if (pattern.source.includes('free')) {
            data.price = '0';
            break;
          } else if (priceMatch[1]) {
            data.price = priceMatch[1];
            data.currency = 'USD';
            break;
          }
        }
      }

      // Extract event URL
      if (url) {
        data.url = url;
      }

      // Extract image
      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogImageMatch) {
        data.image = ogImageMatch[1];
      }

      return data;
    },

    /**
     * Validate Event data
     */
    validator: function(data) {
      const errors = [];
      
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Event name is required');
      }

      if (!data.startDate) {
        errors.push('Start date is required');
      } else {
        try {
          const startDate = new Date(data.startDate);
          if (isNaN(startDate.getTime())) {
            errors.push('Invalid start date format');
          }
        } catch (e) {
          errors.push('Invalid start date format');
        }
      }

      if (data.endDate && data.startDate) {
        try {
          const startDate = new Date(data.startDate);
          const endDate = new Date(data.endDate);
          if (endDate <= startDate) {
            errors.push('End date must be after start date');
          }
        } catch (e) {
          errors.push('Invalid date format');
        }
      }

      if (data.url && utils.validateUrl) {
        const urlResult = utils.validateUrl(data.url);
        if (!urlResult.valid) {
          errors.push('Invalid event URL format');
        }
      }

      if (data.organizerUrl && utils.validateUrl) {
        const urlResult = utils.validateUrl(data.organizerUrl);
        if (!urlResult.valid) {
          errors.push('Invalid organizer URL format');
        }
      }

      if (data.price && isNaN(parseFloat(data.price))) {
        errors.push('Price must be a valid number');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    }
  };

  // Register the schema when registry is available
  if (window.SchemaRegistry) {
    window.SchemaRegistry.register('event', EventSchema);
  } else {
    // Wait for registry to load
    document.addEventListener('DOMContentLoaded', function() {
      if (window.SchemaRegistry) {
        window.SchemaRegistry.register('event', EventSchema);
      }
    });
  }

  // Make available globally for debugging
  window.EventSchema = EventSchema;
})();