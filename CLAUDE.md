# Schema Markup Generator - AI Assistant Context

## Project Overview
This is a **production web application** currently live at:
- Primary: https://ai-schema.azumo.com
- Secondary: https://schema-markup-generator-three.vercel.app

**CRITICAL**: Any changes must maintain backward compatibility and not break the production site.

## Current Architecture Summary
- **Hybrid Design**: Main app.js + modular schema system
- **Plugin Architecture**: Schema registry for extensible schema types
- **Enhanced Utilities**: Shared validation, form generation, constants
- **8 Schema Types**: Original 5 + LocalBusiness, Event, Organization
- **Zero Build Process**: Direct file serving, no compilation needed
- **Deployment**: Vercel with serverless functions

## Key Files and Their Purposes

### Core Application Files
- **app.js** (681 lines) - Contains ALL client-side logic:
  - Lines 1-9: Global state variables
  - Lines 11-27: Status message UI
  - Lines 29-41: Schema type toggle
  - Lines 43-117: Website analysis function
  - Lines 119-257: Form generation switch statement
  - Lines 259-343: Individual form renderers
  - Lines 346-390: Data update handlers
  - Lines 392-556: Schema generation logic
  - Lines 591-681: Existing schema detection and display

- **index.html** (265 lines) - Main UI structure
- **server.js** (546 lines) - Local development server with extraction logic
- **api/analyze.js** (218 lines) - Vercel serverless function for production

## Current Issues to Monitor

### 1. Deployment Sync Issue
**Location**: Production site (https://ai-schema.azumo.com)
**Issue**: New schema types (LocalBusiness, Event, Organization) not yet visible
**Cause**: GitHub-Vercel connection recently established
**Priority**: HIGH - Affects new feature availability
**Action**: Verify deployment, manually redeploy if needed

### 2. User Experience Clarity
**Location**: UI workflow
**Issue**: Users confused about analyze vs. generate workflow  
**Priority**: HIGH - Affects user understanding
**Planned Fix**: Priority 1 in FEATURE_ROADMAP.md

## Incremental Improvement Strategy

### Phase 1: Fix Critical Issues (DO FIRST)
1. **Fix JSON-LD Validator**
   - Create a new validation function
   - Test extensively before replacing
   - Keep old code commented for rollback

2. **Add Error Recovery**
   - Better error messages
   - Graceful fallbacks

### Phase 2: Add Plugin System (SAFE APPROACH)
```javascript
// Add to app.js without breaking existing code
window.SchemaRegistry = window.SchemaRegistry || {
  customSchemas: {},
  register: function(type, config) {
    this.customSchemas[type] = config;
  }
};
```

### Phase 3: Gradual Modularization
- Extract utilities first (low risk)
- Then extract validators
- Finally extract schema types

## Testing Checklist

Before deploying ANY changes, test:

### Functionality Tests
- [ ] Product schema generation
- [ ] Breadcrumb schema generation  
- [ ] FAQ schema generation
- [ ] Carousel schema generation
- [ ] Review schema generation
- [ ] Website URL analysis
- [ ] Manual data entry
- [ ] Schema copying to clipboard
- [ ] Existing schema detection

### Edge Cases
- [ ] Empty data handling
- [ ] Invalid URLs
- [ ] Sites that block requests
- [ ] Mixed schema types
- [ ] Large websites
- [ ] JavaScript-heavy sites

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## Development Commands

```bash
# Local development
node server.js
# Open http://localhost:3000

# No build process needed
# Direct file editing works

# Deployment (automatic via GitHub)
git push origin main
```

## Safe Modification Guidelines

### DO:
- Add new functions without modifying existing ones
- Test locally with `node server.js` first
- Keep backups of working code
- Add comments for complex logic
- Use feature flags for new features

### DON'T:
- Remove or rename existing functions
- Change function signatures
- Modify working extraction patterns without testing
- Add npm dependencies without discussion
- Deploy directly to production

## Current Working Features (DO NOT BREAK)

1. **URL Analysis**: Extracts data from any website
2. **Schema Generation**: Creates valid JSON-LD for 5 types
3. **Manual Editing**: Users can modify extracted data
4. **Existing Schema Detection**: Shows what's already on page
5. **Copy to Clipboard**: One-click copying
6. **Multi-Schema**: Can generate multiple types at once

## Recommended First Changes

1. **Create `js/validators.js`**:
```javascript
// Better JSON-LD validation
function validateJsonLd(content) {
  // Implementation here
}
```

2. **Create `js/utils.js`**:
```javascript
// Extract utility functions
function decodeHtmlEntities(text) {
  // Move from app.js
}
```

3. **Add to index.html**:
```html
<script src="js/utils.js"></script>
<script src="js/validators.js"></script>
<script src="app.js"></script>
```

## Performance Metrics

Current performance (maintain or improve):
- Page load: < 2 seconds
- Analysis time: < 5 seconds
- Schema generation: < 100ms
- Zero build time

## Contact & Support

- GitHub: https://github.com/cagbai/schema-markup-generator
- Production: https://ai-schema.azumo.com
- Company: Azumo.com

## Version History

- Current: 1.0.0 (Monolithic but stable)
- Goal: 1.1.0 (Modular with same features)

---

**Remember**: This is a WORKING production app. Every change should be incremental, tested, and reversible. The goal is to improve maintainability WITHOUT breaking existing functionality.