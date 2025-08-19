# Phase 2 Plan - Utilities Extraction & New Schema Types

## Priority Schema Types (Research Results)

Based on 2024 SEO trends and user demand, prioritize adding these schema types:

### **Tier 1: High Demand** (Add Next)
1. **LocalBusiness** - Most requested for local SEO, brick-and-mortar businesses
2. **Event** - High CTR impact, widely used for conferences, webinars, concerts
3. **Organization** - Foundational for businesses, affects knowledge panels

### **Tier 2: Solid Demand** 
4. **Recipe** - Popular content type, good rich snippet potential
5. **HowTo** - Step-by-step guides, strong featured snippet potential  
6. **VideoObject** - Growing importance for video SEO

### **Tier 3: Specialized**
7. **Article** - News sites, blogs
8. **JobPosting** - HR/recruitment sites

## Phase 2A: Utilities Extraction (Low Risk)

### Goals
- Clean up code without changing functionality
- Make adding new schemas easier
- Improve maintainability

### Implementation

#### 1. Create `js/utils.js`
Extract reusable utilities from app.js:

```javascript
const SchemaUtils = {
  // Move from app.js line 91-108
  decodeHtmlEntities: function(text) {
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

  // New utilities
  formatPrice: function(price, currency = 'USD') {
    return {
      price: parseFloat(price),
      currency: currency.toUpperCase()
    };
  },

  validateUrl: function(url) {
    if (!url) return { valid: false, error: 'Empty URL' };
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { valid: true, url: 'https://' + url };
    }
    return { valid: true, url: url };
  },

  generateId: function() {
    return Math.random().toString(36).substr(2, 9);
  },

  cleanText: function(text) {
    if (!text) return '';
    return this.decodeHtmlEntities(text.trim());
  }
};
```

#### 2. Create `js/constants.js`
Centralize configuration:

```javascript
const SCHEMA_CONFIG = {
  TYPES: {
    PRODUCT: 'product',
    BREADCRUMB: 'breadcrumb', 
    FAQ: 'faq',
    CAROUSEL: 'carousel',
    REVIEW: 'review',
    // Ready for new types
    LOCAL_BUSINESS: 'localbusiness',
    EVENT: 'event',
    ORGANIZATION: 'organization'
  },

  API: {
    LOCAL: '/analyze',
    PRODUCTION: '/api/analyze'
  },

  TIMEOUTS: {
    ANALYSIS: 10000,
    COPY_NOTIFICATION: 5000
  },

  SCHEMA_CONTEXT: 'https://schema.org',

  AVAILABILITY_OPTIONS: [
    { value: 'https://schema.org/InStock', label: 'In Stock' },
    { value: 'https://schema.org/OutOfStock', label: 'Out of Stock' },
    { value: 'https://schema.org/PreOrder', label: 'Pre-Order' }
  ]
};
```

#### 3. Update app.js Integration
Add feature detection:

```javascript
// At top of app.js
const utils = window.SchemaUtils || {};
const config = window.SCHEMA_CONFIG || {};

// Replace inline decodeHtmlEntities calls with:
utils.decodeHtmlEntities ? utils.decodeHtmlEntities(text) : decodeHtmlEntities(text)
```

## Phase 2B: Plugin System Foundation

### Schema Registry Implementation
Create `js/schema-registry.js`:

```javascript
window.SchemaRegistry = (function() {
  const schemas = new Map();
  
  function registerLegacySchemas() {
    // Register existing schemas as "legacy" 
    const legacyTypes = ['product', 'breadcrumb', 'faq', 'carousel', 'review'];
    legacyTypes.forEach(type => {
      schemas.set(type, { 
        legacy: true,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        icon: getIconForType(type)
      });
    });
  }

  return {
    register: function(type, config) {
      schemas.set(type, {
        type: type,
        name: config.name,
        icon: config.icon,
        fields: config.fields,
        renderer: config.renderer,
        generator: config.generator,
        extractor: config.extractor,
        legacy: false
      });
      
      // Auto-add to UI
      addSchemaButtonToUI(type, config);
    },

    get: function(type) {
      return schemas.get(type);
    },

    isLegacy: function(type) {
      const schema = schemas.get(type);
      return schema && schema.legacy;
    },

    init: registerLegacySchemas
  };
})();
```

## Phase 2C: First New Schema - LocalBusiness

### Why LocalBusiness First?
- **Highest demand** from research
- **High impact** for local SEO
- **Good complexity** - not too simple, not too complex
- **Clear validation** - easy to test

### LocalBusiness Schema Structure
```javascript
// js/schemas/localbusiness.js
const LocalBusinessSchema = {
  name: 'Local Business',
  icon: 'fa-building',
  
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Business Name' },
    { name: 'address', type: 'group', label: 'Address', fields: [
      { name: 'streetAddress', type: 'text', required: true },
      { name: 'addressLocality', type: 'text', required: true, label: 'City' },
      { name: 'addressRegion', type: 'text', required: true, label: 'State/Region' },
      { name: 'postalCode', type: 'text', required: true },
      { name: 'addressCountry', type: 'text', required: true, label: 'Country' }
    ]},
    { name: 'telephone', type: 'tel', required: false },
    { name: 'url', type: 'url', required: false, label: 'Website' },
    { name: 'priceRange', type: 'text', required: false, label: 'Price Range (e.g., $$)' },
    { name: 'openingHours', type: 'group', label: 'Hours', fields: [
      { name: 'monday', type: 'text', placeholder: 'Mo 09:00-17:00' },
      { name: 'tuesday', type: 'text', placeholder: 'Tu 09:00-17:00' },
      // ... other days
    ]}
  ],

  generator: function(data) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": data.name
    };

    if (data.address) {
      schema.address = {
        "@type": "PostalAddress",
        "streetAddress": data.address.streetAddress,
        "addressLocality": data.address.addressLocality,
        "addressRegion": data.address.addressRegion,
        "postalCode": data.address.postalCode,
        "addressCountry": data.address.addressCountry
      };
    }

    if (data.telephone) schema.telephone = data.telephone;
    if (data.url) schema.url = data.url;
    if (data.priceRange) schema.priceRange = data.priceRange;

    return schema;
  },

  extractor: function(html, url) {
    // Extract business data from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const data = {
      name: titleMatch ? titleMatch[1].trim() : ''
    };

    // Try to extract address from common patterns
    const addressPattern = /(\d+\s+[^,]+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})/i;
    const addressMatch = html.match(addressPattern);
    if (addressMatch) {
      data.address = {
        streetAddress: addressMatch[1],
        addressLocality: addressMatch[2],
        addressRegion: addressMatch[3],
        postalCode: addressMatch[4],
        addressCountry: 'US'
      };
    }

    return data;
  }
};
```

## Implementation Timeline

### Week 1: Utilities
- [ ] Create `js/utils.js`
- [ ] Create `js/constants.js`  
- [ ] Update `app.js` to use utilities
- [ ] Test all existing functionality
- [ ] Update automated tests

### Week 2: Registry System
- [ ] Create `js/schema-registry.js`
- [ ] Add integration points to `app.js`
- [ ] Test with existing schemas
- [ ] Document plugin API

### Week 3: LocalBusiness Schema
- [ ] Create `js/schemas/localbusiness.js`
- [ ] Add to schema type buttons
- [ ] Add extraction patterns
- [ ] Test generation and validation
- [ ] Update documentation

### Week 4: Testing & Polish
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Plan Phase 3 (Event schema)

## Success Metrics

- [ ] Zero breaking changes to existing functionality
- [ ] LocalBusiness schema generates valid JSON-LD
- [ ] Automated tests pass
- [ ] Page load time remains < 2s
- [ ] Easy to add next schema type

## Rollback Plan

Each week has independent rollback:
- Week 1: Remove utility scripts, revert function calls
- Week 2: Remove registry, revert integration points  
- Week 3: Remove LocalBusiness files, revert UI changes

---

**Next Steps**: Start with Week 1 (utilities extraction) as it's the lowest risk and provides immediate code quality benefits.