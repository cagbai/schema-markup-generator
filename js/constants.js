/**
 * Schema Generator Constants
 */

const SCHEMA_CONFIG = {
  // Schema Types
  TYPES: {
    PRODUCT: 'product',
    BREADCRUMB: 'breadcrumb',
    FAQ: 'faq',
    CAROUSEL: 'carousel',
    REVIEW: 'review',
    LOCAL_BUSINESS: 'localbusiness',
    EVENT: 'event',
    ORGANIZATION: 'organization'
  },

  // API Endpoints
  API: {
    LOCAL: '/analyze',
    PRODUCTION: '/api/analyze'
  },

  // Timeouts
  TIMEOUTS: {
    ANALYSIS: 10000,
    COPY_NOTIFICATION: 5000
  },

  // Schema.org context
  SCHEMA_CONTEXT: 'https://schema.org',

  // Common options for dropdowns
  OPTIONS: {
    AVAILABILITY: [
      { value: 'https://schema.org/InStock', label: 'In Stock' },
      { value: 'https://schema.org/OutOfStock', label: 'Out of Stock' },
      { value: 'https://schema.org/PreOrder', label: 'Pre-Order' },
      { value: 'https://schema.org/LimitedAvailability', label: 'Limited Availability' }
    ],

    CURRENCIES: [
      { value: 'USD', label: 'USD ($)' },
      { value: 'EUR', label: 'EUR (€)' },
      { value: 'GBP', label: 'GBP (£)' },
      { value: 'CAD', label: 'CAD' },
      { value: 'AUD', label: 'AUD' }
    ],

    COUNTRIES: [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
      { value: 'GB', label: 'United Kingdom' },
      { value: 'AU', label: 'Australia' },
      { value: 'DE', label: 'Germany' },
      { value: 'FR', label: 'France' },
      { value: 'JP', label: 'Japan' }
    ],

    EVENT_STATUS: [
      { value: 'https://schema.org/EventScheduled', label: 'Scheduled' },
      { value: 'https://schema.org/EventCancelled', label: 'Cancelled' },
      { value: 'https://schema.org/EventMovedOnline', label: 'Moved Online' },
      { value: 'https://schema.org/EventPostponed', label: 'Postponed' },
      { value: 'https://schema.org/EventRescheduled', label: 'Rescheduled' }
    ],

    EVENT_ATTENDANCE: [
      { value: 'https://schema.org/OfflineEventAttendanceMode', label: 'In Person' },
      { value: 'https://schema.org/OnlineEventAttendanceMode', label: 'Online' },
      { value: 'https://schema.org/MixedEventAttendanceMode', label: 'Hybrid' }
    ],

    ORGANIZATION_TYPES: [
      { value: 'Organization', label: 'General Organization' },
      { value: 'Corporation', label: 'Corporation' },
      { value: 'EducationalOrganization', label: 'Educational Organization' },
      { value: 'GovernmentOrganization', label: 'Government Organization' },
      { value: 'NGO', label: 'Non-Profit Organization' },
      { value: 'SportsOrganization', label: 'Sports Organization' }
    ],

    PRICE_RANGES: [
      { value: '$', label: '$ - Inexpensive' },
      { value: '$$', label: '$$ - Moderate' },
      { value: '$$$', label: '$$$ - Expensive' },
      { value: '$$$$', label: '$$$$ - Very Expensive' }
    ]
  },

  // Icon mappings for schema types
  ICONS: {
    product: 'fa-shopping-bag',
    breadcrumb: 'fa-bread-slice',
    faq: 'fa-question-circle',
    carousel: 'fa-images',
    review: 'fa-star',
    localbusiness: 'fa-building',
    event: 'fa-calendar-alt',
    organization: 'fa-sitemap'
  },

  // Display names for schema types
  NAMES: {
    product: 'Product',
    breadcrumb: 'Breadcrumbs',
    faq: 'FAQ',
    carousel: 'Carousel',
    review: 'Reviews',
    localbusiness: 'Local Business',
    event: 'Event',
    organization: 'Organization'
  },

  // Field validation patterns
  PATTERNS: {
    PHONE: /^\+?[\d\s\-\(\)]+$/,
    URL: /^https?:\/\/.+/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

// Make available globally
window.SCHEMA_CONFIG = SCHEMA_CONFIG;